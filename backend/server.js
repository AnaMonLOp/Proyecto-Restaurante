import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import supabase from "./config/dataBase.js";

const app = express();
const puerto = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Creamos el servidor HTTP y lo conectamos con express
const httpServer = createServer(app);

// Configuración socket.io sobre el servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Socket.io base (Parte en tiempo real)
io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Evento de ejemplo, por lo mientras
  socket.on("mensaje", (data) => {
    console.log("Mensaje recibido:", data);
    // Reenviamos a todos los clientes conectados
    io.emit("mensaje", data);
  });

  // Cuando un cliente se desconecta
  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});

//-----------------------------------
//-------- Platillos APIs
//-----------------------------------

// obtener todos los platillos
app.get("/api/platillos", async (req, res) => {
  try {
    const { data, error } = await supabase.from("items_menu").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// crear platillo
app.post("/api/platillos", async (req, res) => {
  const { nombre, descripcion, precio, categoria_id } = req.body;
  if (!nombre || !precio) {
    return res
      .status(400)
      .json({ mensaje: "Nombre y precio son obligatorios" });
  }
  try {
    const { data, error } = await supabase
      .from("items_menu")
      .insert([{ nombre, descripcion, precio, categoria_id }])
      .select();

    if (error) throw error;
    res.status(201).json({ mensaje: "Platillo creado", platillo: data[0] });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// actualizar platillo
app.put("/api/platillos/:id", async (req, res) => {
  const idPlatillo = req.params.id;
  const { nombre, descripcion, precio, categoria_id } = req.body;

  if (!nombre || !precio) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }
  try {
    const { data, error } = await supabase
      .from("items_menu")
      .update({ nombre, descripcion, precio, categoria_id })
      .eq("id", idPlatillo);

    if (error) throw error;
    res.status(200).json({ mensaje: "Platillo actualizado" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// eliminar platillo
app.delete("/api/platillos/:id", async (req, res) => {
  const idPlatillo = req.params.id;
  try {
    const { data, error } = await supabase
      .from("items_menu")
      .delete()
      .eq("id", idPlatillo);

    if (error) throw error;
    res.status(200).json({ mensaje: "Platillo eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- Categorías APIs
//-----------------------------------

// obtener categorias
app.get("/api/categorias", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categorias_menu").select("*");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al consultar categorías:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// crear categoria
app.post("/api/categorias", async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ mensaje: "El nombre es obligatorio" });
  }
  try {
    const { data, error } = await supabase
      .from("categorias_menu")
      .insert([{ nombre, descripcion }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ mensaje: "Categoría creada", categoria: data });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// editar categoria ::: ya tiene estado activo o inactivo
app.put("/api/categorias/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, orden, activa } = req.body;

  if (
    !nombre &&
    descripcion === undefined &&
    orden === undefined &&
    activa === undefined
  ) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  try {
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (orden !== undefined) updateData.orden = orden;
    if (activa !== undefined) updateData.activa = activa;

    const { data, error } = await supabase
      .from("categorias_menu")
      .update(nombre, descripcion, orden, activa)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    res.status(200).json({ mensaje: "Categoría actualizada", categoria: data });
  } catch (error) {
    console.error("Error al actualizar categoría:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- Pedidos APIs
//-----------------------------------

// obtener pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("fecha_pedido", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// crear pedido
app.post("/api/pedidos", async (req, res) => {
  const { mesa_id, mesero_id, platillos } = req.body;

  if (!mesa_id || !platillos || platillos.length === 0) {
    return res.status(400).json({ mensaje: "Faltan mesa_id o platillos" });
  }

  try {
    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([{ mesa_id: mesa_id, mesero_id: mesero_id, estado: "pendiente" }])
      .select()
      .single();

    if (pedidoError) throw pedidoError;
    const nuevoPedidoId = pedidoData.id;

    const itemsParaInsertar = platillos.map((item) => ({
      pedido_id: nuevoPedidoId,
      item_menu_id: item.item_menu_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedido")
      .insert(itemsParaInsertar);

    req.io.emit("nuevo_pedido", pedidoData[0]);

    if (detalleError) throw detalleError;

    res.status(201).json({ mensaje: "Pedido creado", pedido: pedidoData });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// actualizar pedido (solo estado y notas)
app.put("/api/pedidos/:id", async (req, res) => {
  const { id } = req.params;
  const { estado, notas } = req.body;

  if (estado === undefined && notas === undefined) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  const estadosValidos = [
    "pendiente",
    "en_preparacion",
    "listo",
    "entregado",
    "cancelado",
  ];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje:
        "Estado inválido. Debe ser: pendiente, en_preparacion, listo, entregado o cancelado",
    });
  }

  try {
    const updateData = {};
    if (estado !== undefined) updateData.estado = estado;
    if (notas !== undefined) updateData.notas = notas;

    if (estado === "listo") {
      updateData.fecha_listo = new Date().toISOString();
    }
    if (estado === "entregado") {
      updateData.fecha_entregado = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("pedidos")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    res.status(200).json({
      mensaje: "Pedido actualizado",
      pedido: data[0],
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- Mesas APIs
//-----------------------------------

//Obtener mesas
app.get("/api/mesas", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("mesas")
      .select("*")
      .eq("activa", true);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// crear mesa
app.post("/api/mesas", async (req, res) => {
  const { numero, capacidad, estado } = req.body;

  if (!numero || !capacidad) {
    return res
      .status(400)
      .json({ mensaje: "Número y capacidad son obligatorios" });
  }

  const estadosValidos = ["disponible", "ocupada", "reservada"];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "Estado inválido. Debe ser: disponible, ocupada o reservada",
    });
  }

  try {
    const { data, error } = await supabase
      .from("mesas")
      .insert([
        {
          numero,
          capacidad,
          estado: estado || "disponible", // Por defecto disponible
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      mensaje: "Mesa creada",
      mesa: data[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe una mesa con ese número",
      });
    }
    console.error("Error al crear mesa:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// editar mesa (capacidad, estado y activa)
app.put("/api/mesas/:id", async (req, res) => {
  const { id } = req.params;
  const { capacidad, estado, activa } = req.body;

  if (capacidad === undefined && estado === undefined && activa === undefined) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  const estadosValidos = ["disponible", "ocupada", "reservada"];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "Estado inválido. Debe ser: disponible, ocupada o reservada",
    });
  }

  try {
    const updateData = {};
    if (capacidad !== undefined) updateData.capacidad = capacidad;
    if (estado !== undefined) updateData.estado = estado;
    if (activa !== undefined) updateData.activa = activa;

    const { data, error } = await supabase
      .from("mesas")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Mesa no encontrada" });
    }

    res.status(200).json({
      mensaje: "Mesa actualizada",
      mesa: data[0],
    });
  } catch (error) {
    console.error("Error al actualizar mesa:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- Usuarios APIs
//-----------------------------------

// Obtener TODOS los usuarios
app.get("/api/usuarios", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, identificador, nombre, rol, activo, created_at, updated_at");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al consultar usuarios:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener solo meseros
app.get("/api/usuarios/meseros", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "mesero");
    //.eq("activo", true);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener solo cocina
app.get("/api/usuarios/cocina", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "cocina");
    //.eq("activo", true);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Obtener solo administradores
app.get("/api/usuarios/administradores", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "administrador");
    //.eq("activo", true);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// Crear usuario
app.post("/api/usuarios", async (req, res) => {
  const { identificador, password, nombre, rol } = req.body;

  if (!identificador || !password || !nombre || !rol) {
    return res.status(400).json({
      mensaje: "Identificador, password, nombre y rol son obligatorios",
    });
  }

  const rolesValidos = ["administrador", "mesero", "cocina"];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({
      mensaje: "Rol inválido. Debe ser: administrador, mesero o cocina",
    });
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ identificador, password, nombre, rol }])
      .select("id, identificador, nombre, rol, activo, created_at");

    if (error) throw error;

    res.status(201).json({
      mensaje: "Usuario creado",
      usuario: data[0],
    });
  } catch (error) {
    // Error específico si el identificador ya existe
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese identificador",
      });
    }
    console.error("Error al crear usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//Editar usuario
app.put("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { identificador, password, nombre, rol, activo } = req.body;

  if (
    identificador === undefined &&
    password === undefined &&
    nombre === undefined &&
    rol === undefined &&
    activo === undefined
  ) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  const rolesValidos = ["administrador", "mesero", "cocina"];
  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({
      mensaje: "Rol inválido. Debe ser: administrador, mesero o cocina",
    });
  }

  try {
    const updateData = {};
    if (identificador !== undefined) updateData.identificador = identificador;
    if (password !== undefined) updateData.password = password;
    if (nombre !== undefined) updateData.nombre = nombre;
    if (rol !== undefined) updateData.rol = rol;
    if (activo !== undefined) updateData.activo = activo;

    // Actualizar timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("usuarios")
      .update(updateData)
      .eq("id", id)
      .select("id, identificador, nombre, rol, activo, created_at, updated_at");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Usuario actualizado",
      usuario: data[0],
    });
  } catch (error) {
    // Error específico si el identificador ya existe
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese identificador",
      });
    }
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// Eliminar usuario (borrado lógico)
app.delete("/api/usuarios/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, identificador, nombre, rol, activo");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      mensaje: "Usuario desactivado",
      usuario: data[0],
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

httpServer.listen(puerto, () => {
  console.log(`Servidor corriendo en puerto ${puerto}`);
});
