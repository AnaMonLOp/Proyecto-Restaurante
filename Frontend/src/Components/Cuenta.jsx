import { useState, useEffect, use } from "react";
import api from "../api/axios";
// import "./Cuenta.css";

function Cuentas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const [propina, setPropina] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [mesaIndexMap, setMesaIndexMap] = useState({});
  const [cargando, setCargando] = useState(false);

  // Obtener mesas activas
  useEffect(() => {
    api
      .get("/mesas")
      .then((res) => {
        const mesasOrdenadas = (res.data || []).slice().sort((a, b) => a.id - b.id);
        setMesas(mesasOrdenadas);
      })
      .catch(() => setMesas([]));
  }, []);

  useEffect(() => {
    if(mesas.length > 0) {
      const map = {};
      mesas.forEach((mesa, index) => {
        map[mesa.id] = index + 1;
    });
    setMesaIndexMap(map);
    }
  }, [mesas]);

  // Obtener pedidos de la mesa seleccionada
  const cargarPedidosMesa = async (mesa) => {
    setCargando(true);
    setMesaSeleccionada(mesa);

    try {
      console.log("Cargando pedidos para mesa:", mesa);
      const res = await api.get("/pedidos");
      console.log("Respuesta de pedidos:", res.data);
      
      // Obtener todas las cuentas para saber qué pedidos ya fueron cobrados
      const cuentasRes = await api.get("/cuentas");
      const pedidosConCuenta = new Set(cuentasRes.data.map(c => c.pedido_id));
      
      const pedidosFiltrados = res.data.filter(
        (p) => p.mesa_id === mesa.id && p.estado === "entregado" && !pedidosConCuenta.has(p.id)
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
      console.error("Detalles del error:", error.response?.data || error.message);
      setPedidosMesa([]);
      alert("Error al cargar pedidos: " + (error.response?.data?.message || error.message));
    } finally {
      setCargando(false);
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

    if (!mesaSeleccionada) {
      alert("No hay mesa seleccionada.");
      return;
    }

    const pedido = pedidosMesa[0]; // Tomamos el pedido principal

    try {
      // Crear la cuenta
      await api.post("/cuentas", {
        pedido_id: pedido.id,
        mesa_id: mesaSeleccionada.id,
        mesero_id: pedido.mesero_id,
        subtotal: total,
        propina: propina,
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
      console.error("Detalles:", error.response?.data);
      alert("Error al marcar la cuenta como pagada: " + (error.response?.data?.mensaje || error.message));
    }
  };

  // --- UI ---

  if (cargando) {
    return (
      <div className="cuentas-container">
        <div className="cuentas-header">
          <h1>Cargando...</h1>
          <p className="cuentas-subtitle">Obteniendo información de la mesa</p>
        </div>
      </div>
    );
  }

  if (!mesaSeleccionada) {
    return (
      <div className="cuentas-container">
        <div className="cuentas-header">
          <h1>Gestión de Cuentas</h1>
          <p className="cuentas-subtitle">Selecciona una mesa para ver su cuenta</p>
        </div>

        <div className="mesas-lista">
          {mesas.length > 0 ? (
            mesas.map((m) => (
              <button key={m.id} className="mesa-btn" onClick={() => cargarPedidosMesa(m)}>
                Mesa {mesaIndexMap[m.id] || m.id}
              </button>
            ))
          ) : (
            <p className="sin-datos">No hay mesas activas.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cuentas-container">
      <div className="cuentas-header">
        <h1>Cuenta de Mesa {mesaIndexMap[mesaSeleccionada.id] || mesaSeleccionada.id}</h1>
        <button className="btn-volver" onClick={() => setMesaSeleccionada(null)}>
          ← Volver
        </button>
      </div>

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
              (pedido.detalle_pedido || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.items_menu?.nombre || "Sin nombre"}</td>
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
        <div className="total-item">
          <span className="total-label">Subtotal:</span>
          <span className="total-valor">${total.toFixed(2)}</span>
        </div>

        <div className="total-item propina-input">
          <label className="total-label">Propina:</label>
          <input type="number" value={propina} onChange={handlePropinaChange} min="0" placeholder="0.00" />
        </div>

        <div className="total-item total-final">
          <span className="total-label">Total Final:</span>
          <span className="total-valor">${totalFinal.toFixed(2)}</span>
        </div>
      </div>

      <div className="acciones-cuenta">
        <button className="btn-pagada" onClick={marcarPagada}>
          ✓ Marcar como Pagada
        </button>
      </div>
    </div>
  );
}

export default Cuentas;
