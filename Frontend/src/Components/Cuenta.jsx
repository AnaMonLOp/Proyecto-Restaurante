import { useState, useEffect } from "react";
import api from "../api/axios";

function Cuentas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const [propina, setPropina] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  // Obtener mesas activas
  useEffect(() => {
    api
      .get("/mesas")
      .then((res) => setMesas(res.data || []))
      .catch(() => setMesas([]));
  }, []);

  // Obtener pedidos de la mesa seleccionada
  const cargarPedidosMesa = async (mesa) => {
    setMesaSeleccionada(mesa);

    try {
      const res = await api.get("/pedidos");
      const pedidosFiltrados = res.data.filter(
        (p) => p.mesa_id === mesa.id && p.estado === "entregado"
      );

      setPedidosMesa(pedidosFiltrados);

      const totalCalc = pedidosFiltrados.reduce((acc, pedido) => {
        if (!pedido.detalle_pedido) return acc;

        const subtotalPedido = pedido.detalle_pedido.reduce(
          (sub, item) => sub + Number(item.subtotal || 0),
          0
        );

        return acc + subtotalPedido;
      }, 0);

      setTotal(totalCalc);
      setTotalFinal(totalCalc + propina);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setPedidosMesa([]);
    }
  };

  // Calcular propina
  const handlePropinaChange = (e) => {
    const valor = Number(e.target.value) || 0;
    setPropina(valor);
    setTotalFinal(total + valor);
  };

  // Marcar como pagada → crea cuenta en backend
  const marcarPagada = async () => {
    if (!pedidosMesa.length) {
      alert("No hay pedidos para esta mesa.");
      return;
    }

    const pedido = pedidosMesa[0]; // Tomamos el pedido principal

    try {
      await api.post("/cuentas", {
        pedido_id: pedido.id,
        porcentaje_propina: 0,
        metodo_pago: "efectivo",
      });

      alert("Cuenta marcada como pagada.");

      // Recargar pantalla
      setMesaSeleccionada(null);
      setPedidosMesa([]);
      setPropina(0);
      setTotal(0);
      setTotalFinal(0);
    } catch (error) {
      console.error("Error al marcar pagada:", error);
      alert("Error al marcar la cuenta como pagada.");
    }
  };

  // --- UI ---

  if (!mesaSeleccionada) {
    return (
      <div className="cuentas-container">
        <h1>Selecciona una mesa</h1>

        <div className="mesas-lista">
          {mesas.length > 0 ? (
            mesas.map((m) => (
              <button key={m.id} className="mesa-btn" onClick={() => cargarPedidosMesa(m)}>
                {m.nombre || `Mesa ${m.id}`}
              </button>
            ))
          ) : (
            <p>No hay mesas activas.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cuentas-container">
      <button className="volver" onClick={() => setMesaSeleccionada(null)}>
        Volver
      </button>

      <h1>Cuenta de {mesaSeleccionada.nombre}</h1>

      <table>
        <thead>
          <tr>
            <th>Platillo</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedidosMesa.length ? (
            pedidosMesa.flatMap((pedido) =>
              pedido.detalle_pedido.map((item) => (
                <tr key={item.id}>
                  <td>{item.items_menu.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td>${item.precio_unitario}</td>
                  <td>${item.subtotal}</td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay pedidos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="totales">
        <p>
          <strong>Total:</strong> ${total.toFixed(2)}
        </p>

        <label>
          Propina:
          <input type="number" value={propina} onChange={handlePropinaChange} min="0" />
        </label>

        <p>
          <strong>Total Final:</strong> ${totalFinal.toFixed(2)}
        </p>
      </div>

      <button className="btn-pagada" onClick={marcarPagada}>
        Marcar como Pagada
      </button>
    </div>
  );
}

export default Cuentas;
