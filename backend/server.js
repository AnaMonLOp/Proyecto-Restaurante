import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import supabase from "./config/dataBase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const puerto = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

//-----------------------------------
//-------- Middleware de autenticación JWT
//-----------------------------------
const verificarToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ mensaje: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded; // Agregar info del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

// Middleware para verificar roles específicos
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(403).json({ mensaje: "No autenticado" });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para esta acción" });
    }

    next();
  };
};


//-----------------------------------
//-------- Platillos APIs
//-----------------------------------

// obtener todos los platillos
app.get("/api/platillos", verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("items_menu").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// crear platillo
app.post("/api/platillos", verificarToken, async (req, res) => {
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
app.put("/api/platillos/:id", verificarToken, async (req, res) => {
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
app.delete("/api/platillos/:id", verificarToken, async (req, res) => {
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
app.get("/api/categorias", verificarToken, async (req, res) => {
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
app.post("/api/categorias", verificarToken, async (req, res) => {
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
app.put("/api/categorias/:id", verificarToken, async (req, res) => {
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
app.get("/api/pedidos", verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        *,
        detalle_pedido (
          *,
          items_menu (*)
        )
      `)
      .neq("estado", "cancelado")
      .order("fecha_pedido", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// crear pedido
app.post("/api/pedidos", verificarToken, async (req, res) => {
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

//-----------------------------------
//-------- Detalles Pedidos APIs
//-----------------------------------

// todos los detalles de pedidos
app.get("/api/pedidos/detalles", verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase.from("detalle_pedido").select("*");
    //.order("fecha_pedido", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// detalles por id
app.get("/api/pedidos/detalles/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("detalle_pedido")
      .select("*")
      .eq("id", id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// detalles por pedido_id
app.get("/api/pedidos/detallespedido/:id", verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("detalle_pedido")
      .select("*")
      .eq("pedido_id", id);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// actualizar estado del pedido
app.put("/api/pedidos/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const { data: pedidoActual, error: errorPedido } = await supabase
      .from("pedidos")
      .select("estado")
      .eq("id", id)
      .single();

    if (errorPedido) throw errorPedido;
    if (!pedidoActual) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    const estadoActual = pedidoActual.estado;
    const transicionesValidas = {
      pendiente: ["en_preparacion", "cancelado"],
      en_preparacion: ["listo", "cancelado"],
      listo: ["entregado", "cancelado"],
      entregado: [],
      cancelado: [],
    };

    if (!transicionesValidas[estadoActual].includes(estado)) {
      return res.status(400).json({
        mensaje: `Transición no válida de '${estadoActual}' a '${estado}'`,
      });
    }

    const camposActualizar = {
      estado,
      updated_at: new Date().toISOString(),
    };

    if (estado === "listo") {
      camposActualizar.fecha_listo = new Date().toISOString();
    } else if (estado === "entregado") {
      camposActualizar.fecha_entregado = new Date().toISOString();
    }

    const { data: pedidoActualizado, error: errorUpdate } = await supabase
      .from("pedidos")
      .update(camposActualizar)
      .eq("id", id)
      .select()
      .single();

    if (errorUpdate) throw errorUpdate;

    res.status(200).json({
      mensaje: "Estado actualizado correctamente",
      pedido: pedidoActualizado,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- Mesas APIs
//-----------------------------------

//Obtener mesas
app.get("/api/mesas", verificarToken, async (req, res) => {
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
app.post("/api/mesas", verificarToken, async (req, res) => {
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
app.put("/api/mesas/:id", verificarToken, async (req, res) => {
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
app.get("/api/usuarios", verificarToken, async (req, res) => {
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
app.get("/api/usuarios/meseros", verificarToken, async (req, res) => {
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
app.get("/api/usuarios/cocina", verificarToken, async (req, res) => {
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
app.get("/api/usuarios/administradores", verificarToken, async (req, res) => {
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
app.post(
  "/api/usuarios",
  verificarToken,
  verificarRol("administrador"),
  async (req, res) => {
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
  }
);

//Editar usuario
app.put(
  "/api/usuarios/:id",
  verificarToken,
  verificarRol("administrador"),
  async (req, res) => {
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
        .select(
          "id, identificador, nombre, rol, activo, created_at, updated_at"
        );

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
  }
);

// Eliminar usuario (borrado lógico)
app.delete(
  "/api/usuarios/:id",
  verificarToken,
  verificarRol("administrador"),
  async (req, res) => {
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
  }
);

//-----------------------------------
//-------- Cuentas APIs
//-----------------------------------

//Obtener todas las cuentas
app.get("/api/cuentas", verificarToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cuentas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Error al consultar cuentas:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//Obtener cuenta por pedido_id
app.get("/api/cuentas/pedido/:pedido_id", verificarToken, async (req, res) => {
  const { pedido_id } = req.params;

  try {
    const { data, error } = await supabase
      .from("cuentas")
      .select("*")
      .eq("pedido_id", pedido_id);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "No hay cuenta para este pedido" });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error("Error al consultar cuenta:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// Crear cuenta
app.post("/api/cuentas", verificarToken, async (req, res) => {
  const { pedido_id, mesa_id, mesero_id, subtotal, propina } = req.body;

  if (!pedido_id || !mesa_id || !mesero_id || subtotal === undefined) {
    return res.status(400).json({
      mensaje: "pedido_id, mesa_id, mesero_id y subtotal son obligatorios",
    });
  }

  try {
    const propinaFinal = propina || 0;
    const total = parseFloat(subtotal) + parseFloat(propinaFinal);

    const { data, error } = await supabase
      .from("cuentas")
      .insert([
        {
          pedido_id,
          mesa_id,
          mesero_id,
          subtotal,
          propina: propinaFinal,
          total,
          estado: "pendiente",
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      mensaje: "Cuenta creada",
      cuenta: data[0],
    });
  } catch (error) {
    console.error("Error al crear cuenta:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// Editar cuenta (propina, método de pago, estado)
app.put("/api/cuentas/:id", verificarToken, async (req, res) => {
  const { id } = req.params;
  const { propina, metodo_pago, estado } = req.body;

  if (
    propina === undefined &&
    metodo_pago === undefined &&
    estado === undefined
  ) {
    return res.status(400).json({ mensaje: "No hay datos para actualizar" });
  }

  const metodosValidos = ["efectivo", "tarjeta", "transferencia", "mixto"];
  if (metodo_pago && !metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({
      mensaje:
        "Método de pago inválido. Debe ser: efectivo, tarjeta, transferencia o mixto",
    });
  }

  const estadosValidos = ["pendiente", "pagada", "cancelada"];
  if (estado && !estadosValidos.includes(estado)) {
    return res.status(400).json({
      mensaje: "Estado inválido. Debe ser: pendiente, pagada o cancelada",
    });
  }

  try {
    const { data: cuentaActual, error: errorConsulta } = await supabase
      .from("cuentas")
      .select("subtotal, propina")
      .eq("id", id);

    if (errorConsulta) throw errorConsulta;

    if (!cuentaActual || cuentaActual.length === 0) {
      return res.status(404).json({ mensaje: "Cuenta no encontrada" });
    }

    const updateData = {};

    if (propina !== undefined) {
      updateData.propina = propina;
      updateData.total =
        parseFloat(cuentaActual[0].subtotal) + parseFloat(propina);
    }

    if (metodo_pago !== undefined) updateData.metodo_pago = metodo_pago;

    if (estado !== undefined) {
      updateData.estado = estado;

      if (estado === "pagada") {
        updateData.fecha_pago = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from("cuentas")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Cuenta no encontrada" });
    }

    res.status(200).json({
      mensaje: "Cuenta actualizada",
      cuenta: data[0],
    });
  } catch (error) {
    console.error("Error al actualizar cuenta:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- LOGIN & REGISTRO
//-----------------------------------

// Login
app.post("/api/auth/login", async (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({
      mensaje: "Identificador y contraseña son obligatorios",
    });
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("identificador", identificador)
      .eq("activo", true);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const usuario = data[0];

    if (usuario.password !== password) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const { password: _, ...usuarioSinPassword } = usuario;

    // GENERAR TOKEN JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        identificador: usuario.identificador,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" } // Token expira en 8 horas
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: usuarioSinPassword,
      token: token,
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

// Registro
app.post("/api/auth/registro", async (req, res) => {
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
      mensaje: "Usuario registrado exitosamente",
      usuario: data[0],
    });
  } catch (error) {
    // Error específico si el identificador ya existe
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "El identificador ya existe",
      });
    }
    console.error("Error al registrar usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
});

//-----------------------------------
//-------- REPORTES APIs
//-----------------------------------
app.get("/api/reportes", verificarToken, async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res
      .status(400)
      .json({ mensaje: "La fecha es obligatoria (YYYY-MM-DD)" });
  }

  try {
    // Obtener cuentas pagadas del día
    const { data: cuentas, error } = await supabase
      .from("cuentas")
      .select("id, total")
      .eq("estado", "pagada")
      .gte("fecha_pago", `${fecha} 00:00:00`)
      .lte("fecha_pago", `${fecha} 23:59:59`);

    if (error) throw error;

    const total_pedidos = cuentas.length;
    const monto_total = cuentas.reduce(
      (acumulador, dato) => acumulador + Number(dato.total),
      0
    );
    const promedio = total_pedidos > 0 ? monto_total / total_pedidos : 0;

    res.status(200).json({
      fecha,
      total_pedidos,
      monto_total_vendido: Number(monto_total.toFixed(2)),
      promedio_por_pedido: Number(promedio.toFixed(2)),
    });
  } catch (err) {
    res.status(500).json({ mensaje: err.message });
  }
});

app.listen(puerto, () => {
    console.log(`Servidor corriendo en puerto ${puerto}`);
}); 