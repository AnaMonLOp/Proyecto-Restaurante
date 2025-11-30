import supabase from "../config/dataBase.js";

export const generarReporte = async (req, res) => {
  const { fecha } = req.query;

  if (!fecha) {
    return res
      .status(400)
      .json({ mensaje: "La fecha es obligatoria (YYYY-MM-DD)" });
  }

  try {
    const fechaObj = new Date(fecha);
    
    const inicio = new Date(fechaObj);
    inicio.setUTCHours(6, 0, 0, 0);
    const inicioDia = inicio.toISOString();

    const fin = new Date(fechaObj);
    fin.setDate(fin.getDate() + 1);
    fin.setUTCHours(5, 59, 59, 999);
    const finDia = fin.toISOString();

    const { data: cuentas, error: errorCuentas } = await supabase
      .from("cuentas")
      .select("id, total")
      .gte("fecha_pago", inicioDia)
      .lte("fecha_pago", finDia);

    if (errorCuentas) throw errorCuentas;

    const total_pedidos = cuentas.length;
    const monto_total = cuentas.reduce(
      (acumulador, dato) => acumulador + Number(dato.total),
      0
    );
    const promedio = total_pedidos > 0 ? monto_total / total_pedidos : 0;

    const { data: cancelados, error: errorCancelados } = await supabase
      .from("pedidos")
      .select("id")
      .eq("estado", "cancelado")
      .gte("updated_at", inicioDia)
      .lte("updated_at", finDia);

    if (errorCancelados) throw errorCancelados;
    const total_cancelados = cancelados.length;

    res.status(200).json({
      fecha,
      total_pedidos,
      monto_total_vendido: Number(monto_total.toFixed(2)),
      promedio_por_pedido: Number(promedio.toFixed(2)),
      total_cancelados,
    });
  } catch (err) {
    console.error("Error al generar reporte:", err.message);
    res.status(500).json({ mensaje: err.message });
  }
};
