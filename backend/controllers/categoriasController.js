import supabase from "../config/dataBase.js";

export const obtenerCategorias = async (req, res) => {
  try {
    const { data, error } = await supabase.from("categorias_menu").select("*");

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const crearCategoria = async (req, res) => {
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
};

export const actualizarCategoria = async (req, res) => {
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
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    res
      .status(200)
      .json({ mensaje: "Categoría actualizada", categoria: data[0] });
  } catch (error) {
    console.error("Error al actualizar categoría:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
};
