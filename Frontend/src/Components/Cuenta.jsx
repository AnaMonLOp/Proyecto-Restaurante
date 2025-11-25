import { useState, useEffect, use } from "react";
import api from "../api/axios";
import "./Cuenta.css";

function Cuentas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [pedidosMesa, setPedidosMesa] = useState([]);
  
  const [total, setTotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);
  const [mesaIndexMap, setMesaIndexMap] = useState({});
  const [cargando, setCargando] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({});
  const [pedidoCounts, setPedidoCounts] = useState({});
  const [ocupacionMesas, setOcupacionMesas] = useState({});
  const [propinaType, setPropinaType] = useState("amount");
  const [propinaValue, setPropinaValue] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const getInitials = (name) => {
    if (!name) return "-";
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
  };

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

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("ocupacionMesas");
      setOcupacionMesas(guardado ? JSON.parse(guardado) : {});
    } catch (e) {
      setOcupacionMesas({});
    }
  }, []);

  useEffect(() => {
    const cargarResumenMesas = async () => {
      try {
        const [pedRes, cuentasRes] = await Promise.all([api.get("/pedidos"), api.get("/cuentas")]);
        const pedidos = pedRes.data || [];
        const cuentas = cuentasRes.data || [];
        const pedidosConCuenta = new Set(cuentas.map(c => c.pedido_id));

        const pendientes = {};
        const totales = {};

        pedidos.forEach(p => {
          const mid = p.mesa_id;
          totales[mid] = (totales[mid] || 0) + 1;

          if (!pedidosConCuenta.has(p.id)) {
            pendientes[mid] = (pendientes[mid] || 0) + 1;
          }
        });

        setPedidoCounts(totales);
        setPendingCounts(pendientes);
      } catch (error) {
        console.error("Error cargando resumen de mesas:", error);
        setPendingCounts({});
        setPedidoCounts({});
      }
    };

    cargarResumenMesas();
  }, [mesas]);

  // Obtener pedidos de la mesa seleccionada
  const cargarPedidosMesa = async (mesa) => {
    setLoadingDetail(true);
    setMesaSeleccionada(mesa);
    try {
      const res = await api.get("/pedidos");
      const cuentasRes = await api.get("/cuentas");
      const pedidosConCuenta = new Set(cuentasRes.data.map((c) => c.pedido_id));

      const pedidosFiltrados = (res.data || []).filter(
        (p) => p.mesa_id === mesa.id && p.estado === "entregado" && !pedidosConCuenta.has(p.id)
      );

      setPedidosMesa(pedidosFiltrados);

      const totalCalc = pedidosFiltrados.reduce((acc, pedido) => {
        if (!pedido.detalle_pedido) return acc;
        const subtotalPedido = pedido.detalle_pedido.reduce((sub, item) => sub + Number(item.subtotal || 0), 0);
        return acc + subtotalPedido;
      }, 0);

      setTotal(totalCalc);
      if (propinaType === "amount") {
        setTotalFinal(totalCalc + Number(propinaValue || 0));
      } else {
        setTotalFinal(totalCalc + totalCalc * (Number(propinaValue || 0) / 100));
      }
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      setPedidosMesa([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Calcular propina
  const handlePropinaChange = (e) => {
    const valor = Number(e.target.value) || 0;
    setPropinaValue(valor);

    if (propinaType === "amount") {
      setTotalFinal(total + valor);
    } else {
      setTotalFinal(total + total * (valor / 100));
    }
  };

  const marcarPagada = async () => {
    if (!pedidosMesa.length) {
      alert("No hay pedidos para esta mesa.");
      return;
    }

    if (!mesaSeleccionada) {
      alert("No hay mesa seleccionada.");

      return;
    }

    const pedido = pedidosMesa[0];

    try {
      await api.post("/cuentas", {
        pedido_id: pedido.id,
        mesa_id: mesaSeleccionada.id,
        mesero_id: pedido.mesero_id,
        subtotal: total,
        propina: propinaType === "amount" ? Number(propinaValue || 0) : Number(((total * (propinaValue || 0)) / 100).toFixed(2)),
      });

      alert("Cuenta marcada como pagada.");

      setMesaSeleccionada(null);
      setPedidosMesa([]);
      setPropinaValue(0);
      setTotal(0);
      setTotalFinal(0);
    } catch (error) {
      console.error("Error al marcar pagada:", error);
      console.error("Detalles:", error.response?.data);
      alert("Error al marcar la cuenta como pagada: " + (error.response?.data?.mensaje || error.message));
    }
  };

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

  return (
    <div className="cuentas-container">
      <div className="cuentas-header">
        <div>
          <h1>Gestión de Cuentas</h1>
          <p className="cuentas-subtitle">Administra cobros y revisa cuentas pendientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-volver" onClick={() => setMesaSeleccionada(null)}>
            ← Volver
          </button>
        </div>
      </div>

      <div className="cuentas-grid">
        <aside className="cuentas-list-left">
          <h3 className="left-title">Mesas</h3>
          <div className="cuenta-mesas-grid">
            {mesas.length > 0 ? (
              mesas.map((m) => {
                const numero = mesaIndexMap[m.id] || m.id;
                const pedidosTot = pedidoCounts[m.id] || 0;
                const pendientes = pendingCounts[m.id] || 0;
                const estado = ocupacionMesas[m.id]?.estado === 'ocupada' ? 'toma' : (pedidosTot > 0 ? 'con_pedidos' : 'libre');

                return (
                  <div key={m.id} className={`cuenta-mesa-card ${estado} ${mesaSeleccionada?.id === m.id ? 'selected' : ''}`} onClick={() => cargarPedidosMesa(m)}>
                    <div className="card-row">
                      <div className="avatar">{getInitials(ocupacionMesas[m.id]?.mesero || 'M')}</div>

                      <div className="card-content">
                        <div className="mesa-numero">Mesa {numero}</div>
                        <div className="info-row"><strong>Mesero:</strong> <span className="mesero-nombre">{ocupacionMesas[m.id]?.mesero || '-'}</span></div>
                      </div>

                      <div className="badges">
                        <span className={`badge estado ${estado}`}>{estado === 'toma' ? 'Tomada' : estado === 'con_pedidos' ? 'Con pedidos' : 'Libre'}</span>
                        {pendientes > 0 && (
                          <span className="badge pendiente"><span className="badge-icon">💳</span>Cuenta pendiente</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="sin-datos">No hay mesas activas.</p>
            )}
          </div>
        </aside>

        <main className="cuenta-detail-right">
          {mesaSeleccionada ? (
            <div>
                <div className="detail-top">
                <h2>Cuenta — Mesa {mesaIndexMap[mesaSeleccionada.id] || mesaSeleccionada.id}</h2>
                <p className="cuentas-subtitle">Mesero: <span className="mesero-nombre">{ocupacionMesas[mesaSeleccionada.id]?.mesero || pedidosMesa[0]?.mesero_nombre || '-'}</span> · Pedidos: {pedidoCounts[mesaSeleccionada.id] || 0}</p>
              </div>

              {loadingDetail ? (
                <div className="loading-detail">
                  <div className="spinner" aria-hidden="true"></div>
                  <div className="loading-text">Cargando detalles...</div>
                </div>
              ) : (
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
                pedidosMesa.flatMap((pedido) => {
                  return (pedido.detalle_pedido || []).map((item) => (
                    <tr key={item.id}>
                      <td>{item.items_menu?.nombre || "Sin nombre"}</td>
                      <td>{item.cantidad}</td>
                      <td>${Number(item.precio_unitario).toFixed(2)}</td>
                      <td>${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ));
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No hay pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
              )}
            </div>
          ) : (
            <p className="hint">Selecciona una mesa a la izquierda para ver su cuenta aquí.</p>
          )}

          <div className="totales">
            <div className="total-item">
              <span className="total-label">Subtotal:</span>
              <span className="total-valor">${total.toFixed(2)}</span>
            </div>

            <div className="total-item propina-input">
              <label className="total-label">Propina:</label>
              <div className="propina-controls">
                <div className="propina-type">
                  <button className={`type-btn ${propinaType === 'amount' ? 'active' : ''}`} onClick={() => setPropinaType('amount')}>Monto</button>
                  <button className={`type-btn ${propinaType === 'percent' ? 'active' : ''}`} onClick={() => setPropinaType('percent')}>%</button>
                </div>
                <input type="number" value={propinaValue} onChange={handlePropinaChange} min="0" placeholder={propinaType === 'percent' ? '0 (%)' : '0.00'} />
                <span className="propina-suffix">{propinaType === 'percent' ? '%' : ''}</span>
              </div>
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
        </main>
      </div>
    </div>
  );
}

export default Cuentas;
