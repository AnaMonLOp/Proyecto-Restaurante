import supabase from "../config/dataBase.js";

export const obtenerPlatillos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("items_menu")
      .select("*")
      .eq("disponible", true);
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const crearPlatillo = async (req, res) => {
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
};

export const actualizarPlatillo = async (req, res) => {
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
};

export const eliminarPlatillo = async (req, res) => {
  const idPlatillo = req.params.id;
  try {
    const { data, error } = await supabase
      .from("items_menu")
      .update({ disponible: false })
      .eq("id", idPlatillo)
      .select();

    if (error) throw error;
    res.status(200).json({ mensaje: "Platillo desactivado", data });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
