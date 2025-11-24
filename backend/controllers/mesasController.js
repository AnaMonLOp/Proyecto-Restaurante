import supabase from "../config/dataBase.js";

export const obtenerMesas = async (req, res) => {
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
};

export const crearMesa = async (req, res) => {
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
          estado: estado || "disponible",
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
};

export const actualizarMesa = async (req, res) => {
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
};
