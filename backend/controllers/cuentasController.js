import supabase from "../config/dataBase.js";

export const obtenerCuentas = async (req, res) => {
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
};

export const obtenerCuentaPorPedido = async (req, res) => {
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
};

export const crearCuenta = async (req, res) => {
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
          fecha_pago: new Date().toISOString(),
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
};

export const actualizarCuenta = async (req, res) => {
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
};
