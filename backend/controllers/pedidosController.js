import supabase from "../config/dataBase.js";

export const obtenerPedidos = async (req, res) => {
  try {
    const { incluir_cancelados } = req.query;

    let query = supabase.from("pedidos").select(`
        *,
        detalle_pedido (
          *,
          items_menu!inner (*)
        )
      `);

    if (incluir_cancelados !== "true") {
      query = query.neq("estado", "cancelado");
    }

    const { data, error } = await query
      .eq("detalle_pedido.items_menu.disponible", true)
      .order("fecha_pedido", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const crearPedido = async (req, res) => {
  const { mesa_id, mesero_id, platillos } = req.body;

  if (!mesa_id || !platillos || platillos.length === 0) {
    return res.status(400).json({ mensaje: "Faltan mesa_id o platillos" });
  }

  try {
    const { data: pedidoData, error: pedidoError } = await supabase
      .from("pedidos")
      .insert([{ mesa_id, mesero_id, estado: "pendiente" }])
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
      notas_item: item.notas_item || null,
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedido")
      .insert(itemsParaInsertar);

    if (detalleError) throw detalleError;

    res.status(201).json({ mensaje: "Pedido creado", pedido: pedidoData });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const actualizarPedido = async (req, res) => {
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
};

export const obtenerDetallesPedidos = async (req, res) => {
  try {
    const { data, error } = await supabase.from("detalle_pedido").select("*");
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const obtenerDetallePorId = async (req, res) => {
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
};

export const obtenerDetallePorPedidoId = async (req, res) => {
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
};

export const obtenerPedidosPorMesa = async (req, res) => {
  const { numero } = req.params;

  try {
    const { data: mesa } = await supabase
      .from("mesas")
      .select("id, numero")
      .eq("numero", numero)
      .eq("activa", true)
      .single();

    if (!mesa) {
      return res.status(404).json({
        mensaje: `La mesa con número ${numero} no existe o no está activa`,
      });
    }

    const { data: pedidos, error: errorPedidos } = await supabase
      .from("pedidos")
      .select(
        `
        *,
        detalle_pedido (
          *,
          items_menu!inner (*)
        )
      `
      )
      .eq("mesa_id", mesa.id)
      .in("estado", ["pendiente", "en_preparacion"])
      .order("fecha_pedido", { ascending: true });

    if (errorPedidos) throw errorPedidos;

    if (pedidos.length === 0) {
      return res.status(200).json({
        mensaje: `Mesa ${mesa.numero} encontrada, pero no tiene pedidos pendientes o en preparación.`,
        mesa: mesa.numero,
        pedidos: [],
      });
    }

    res.status(200).json({
      mesa: mesa.numero,
      pedidos,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

export const actualizarEstadoPedidosPorMesa = async (req, res) => {
  const { numero } = req.params;
  const { estado } = req.body;

  const estadosPermitidos = ["listo"];
  if (!estado || !estadosPermitidos.includes(estado)) {
    return res.status(400).json({
      mensaje: `Estado inválido. Solo se permite: ${estadosPermitidos.join(
        ", "
      )}`,
    });
  }

  try {
    const { data: mesa, error: errorMesa } = await supabase
      .from("mesas")
      .select("id, numero")
      .eq("numero", numero)
      .eq("activa", true)
      .single();

    if (!mesa) {
      return res.status(404).json({
        mensaje: `La mesa con número ${numero} no existe o no está activa`,
      });
    }

    const { data, error: errorUpdate } = await supabase
      .from("pedidos")
      .update({
        estado,
        fecha_listo: estado === "listo" ? new Date().toISOString() : null,
      })
      .eq("mesa_id", mesa.id)
      .in("estado", ["pendiente", "en_preparacion"])
      .select();

    if (errorUpdate) throw errorUpdate;

    res.status(200).json({
      mensaje: "Estado de pedidos actualizado correctamente",
      mesa: mesa.numero,
      pedidos_actualizados: data.length,
      pedidos: data,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
