import supabase from "../config/dataBase.js";

export const obtenerUsuarios = async (req, res) => {
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
};

export const obtenerMeseros = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "mesero");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const obtenerCocina = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "cocina");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const obtenerAdministradores = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre")
      .eq("rol", "administrador");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const crearUsuario = async (req, res) => {
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
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese identificador",
      });
    }
    console.error("Error al crear usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
};

export const actualizarUsuario = async (req, res) => {
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
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese identificador",
      });
    }
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
};

export const eliminarUsuario = async (req, res) => {
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
};
