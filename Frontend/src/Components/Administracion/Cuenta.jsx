import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./styles/Cuenta.css"; // Asegúrate que el nombre del CSS coincida

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
  const [meserosMap, setMeserosMap] = useState({});
  const [propinaType, setPropinaType] = useState("amount");
  const [propinaValue, setPropinaValue] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/mesas")
      .then((res) => {
        const mesasOrdenadas = (res.data || []).slice().sort((a, b) => a.id - b.id);
        setMesas(mesasOrdenadas);
        const map = {};
        mesasOrdenadas.forEach((m, idx) => (map[m.id] = idx + 1));
        setMesaIndexMap(map);
      })
      .catch(() => setMesas([]));
  }, []);

  useEffect(() => {
    const cargarResumenMesas = async () => {
      try {
        const [pedRes, cuentasRes, userRes] = await Promise.all([
            api.get("/pedidos?incluir_cancelados=true"), 
            api.get("/cuentas"),
            api.get("/usuarios")
        ]);
        
        const pedidos = pedRes.data || [];
        const cuentas = cuentasRes.data || [];
        const usuarios = userRes.data || [];
        const pedidosConCuenta = new Set(cuentas.map(c => c.pedido_id));

        const nombresUsuarios = {};
        usuarios.forEach(u => nombresUsuarios[u.id] = u.nombre);

        const pendientes = {};
        const totales = {};
        const mapMeseros = {};

        pedidos.forEach(p => {
          if (p.estado === 'cancelado') return;

          const mid = p.mesa_id;
          const tieneCuenta = pedidosConCuenta.has(p.id);

          if (!tieneCuenta) {
            totales[mid] = (totales[mid] || 0) + 1;
            
            if (p.mesero_id && nombresUsuarios[p.mesero_id]) {
                mapMeseros[mid] = nombresUsuarios[p.mesero_id];
            }

            if (p.estado === 'entregado') {
                pendientes[mid] = (pendientes[mid] || 0) + 1;
            }
          }
        });

        setPedidoCounts(totales);
        setPendingCounts(pendientes);
        setMeserosMap(mapMeseros);
      } catch (error) {
        console.error("Error polling:", error);
      }
    };
    
    cargarResumenMesas();
    const interval = setInterval(cargarResumenMesas, 3000); 
    return () => clearInterval(interval);
  }, [mesas]);

  const cargarPedidosMesa = async (mesa) => {
    setLoadingDetail(true);
    setMesaSeleccionada(mesa);
    setPedidosMesa([]);
    setTotal(0);
    setTotalFinal(0);
    setPropinaValue(0);

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
        return acc + pedido.detalle_pedido.reduce((sub, item) => sub + Number(item.subtotal || 0), 0);
      }, 0);

      setTotal(totalCalc);
      calcularTotalFinal(totalCalc, 0, propinaType);

    } catch (error) {
      console.error("Error detalle:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const calcularTotalFinal = (subtotal, valorPropina, tipo) => {
    let extra = 0;
    const valor = Number(valorPropina) || 0;
    extra = tipo === "amount" ? valor : subtotal * (valor / 100);
    setTotalFinal(subtotal + extra);
  };

  const handlePropinaChange = (e) => {
    setPropinaValue(e.target.value);
    calcularTotalFinal(total, e.target.value, propinaType);
  };

  const marcarPagada = async () => {
    if (!pedidosMesa.length) return;
    
    const btn = document.querySelector('.cuentas-btn-pay');
    if(btn) btn.disabled = true;

    try {
      const propinaTotal = propinaType === "amount" 
          ? Number(propinaValue || 0) 
          : Number(((total * (propinaValue || 0)) / 100).toFixed(2));

      const cobros = pedidosMesa.map((pedido, index) => {
          const propinaAsignada = index === 0 ? propinaTotal : 0;
          
          const subtotalPedido = pedido.detalle_pedido 
            ? pedido.detalle_pedido.reduce((acc, item) => acc + Number(item.subtotal), 0)
            : 0;
          
          const totalPedido = subtotalPedido + propinaAsignada;

          return api.post("/cuentas", {
            pedido_id: pedido.id,
            mesa_id: mesaSeleccionada.id,
            mesero_id: pedido.mesero_id,
            subtotal: subtotalPedido,
            propina: propinaAsignada,
            total: totalPedido,
            metodo_pago: "efectivo",
            estado: "pagada",
            fecha_pago: new Date().toISOString()
          });
      });

      await Promise.all(cobros);

      setShowModal(true);
    
      setTimeout(() => {
        setShowModal(false);
        setMesaSeleccionada(null);
        setPedidosMesa([]);
        setPropinaValue(0);
        setTotal(0);
        setTotalFinal(0);
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error(error);
      alert("Error al cobrar: " + (error.response?.data?.mensaje || error.message));
      if(btn) btn.disabled = false;
    }
  };

  if (cargando) return <div className="cuentas-page"><div className="cuentas-loading">Cargando...</div></div>;

  return (
    <div className="cuentas-page">
      {showModal && (
        <div className="cuentas-modal-overlay">
          <div className="cuentas-modal-success">
            <div className="cuentas-modal-icon">✅</div>
            <h2>¡Cobro Exitoso!</h2>
            <p>La mesa ha sido liberada.</p>
          </div>
        </div>
      )}
      <aside className="cuentas-sidebar">
        <div className="cuentas-sidebar-header">
          <h2 className="cuentas-sidebar-title">Mesas</h2>
          <span className="cuentas-badge-count">{mesas.length}</span>
        </div>
        <div className="cuentas-list">
          {mesas.length > 0 ? (
            mesas.map((m) => {
              const numero = mesaIndexMap[m.id] || m.id;
              const activos = pedidoCounts[m.id] || 0;
              const cobrables = pendingCounts[m.id] || 0;
              const isSelected = mesaSeleccionada?.id === m.id;
              
              let statusClass = "";
              if (activos > 0) statusClass = "cuentas-status-occupied";
              if (cobrables > 0) statusClass += " cuentas-status-pending";
              if (isSelected) statusClass += " cuentas-selected";

              return (
                <div key={m.id} className={`cuentas-table-card ${statusClass}`} onClick={() => cargarPedidosMesa(m)}>
                  <div className="cuentas-icon-wrapper">{activos > 0 ? "👤" : "🍽️"}</div>
                  <div className="cuentas-info">
                    <span className="cuentas-table-name">Mesa {numero}</span>
                    <span className="cuentas-table-waiter">
                      {activos > 0 
                        ? `Atiende: ${meserosMap[m.id] || 'Staff'}` 
                        : "Disponible"}
                    </span>
                  </div>
                  {cobrables > 0 && <div className="cuentas-alert-icon">$</div>}
                </div>
              );
            })
          ) : <p className="cuentas-empty-msg">No hay mesas registradas</p>}
        </div>
      </aside>

      <main className="cuentas-main-panel">
        {mesaSeleccionada ? (
          <div className="cuentas-receipt">
            <div className="cuentas-receipt-header">
              <div>
                <h1 className="cuentas-receipt-title">Mesa {mesaIndexMap[mesaSeleccionada.id]}</h1>
                <p className="cuentas-receipt-meta">Mesero: {meserosMap[mesaSeleccionada.id] || "..."}</p>
              </div>
              <button className="cuentas-btn-close" onClick={() => setMesaSeleccionada(null)}>✕</button>
            </div>

            {loadingDetail ? <div className="cuentas-loading">Cargando detalle...</div> : (
              <>
                <div className="cuentas-receipt-body">
                  {pedidosMesa.length > 0 ? (
                    <table className="cuentas-receipt-table">
                      <thead>
                        <tr>
                            <th className="cuentas-col-qty">#</th>
                            <th>Descripción</th>
                            <th className="cuentas-col-price">Precio</th>
                            <th className="cuentas-col-total">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosMesa.flatMap(p => (p.detalle_pedido || []).map((item, i) => (
                          <tr key={i}>
                            <td className="cuentas-col-qty">{item.cantidad}</td>
                            <td>
                                {item.items_menu?.nombre || "..."} 
                                {item.notas_item && <span className="cuentas-item-note">({item.notas_item})</span>}
                            </td>
                            <td className="cuentas-col-price">${item.precio_unitario}</td>
                            <td className="cuentas-col-total">${item.subtotal}</td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="cuentas-state-empty">
                      <span className="cuentas-icon-large">🧾</span>
                      <p>La mesa está ocupada pero aún no hay pedidos listos para cobrar.</p>
                    </div>
                  )}
                </div>
                
                {pedidosMesa.length > 0 && (
                  <div className="cuentas-receipt-footer">
                    <div className="cuentas-summary-row">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    
                    <div className="cuentas-summary-row">
                        <label>Propina</label>
                        <div className="cuentas-tip-control">
                            <button 
                                className={`cuentas-tip-btn ${propinaType === 'amount'?'cuentas-active':''}`} 
                                onClick={()=>setPropinaType('amount')}
                            >
                                $
                            </button>
                            <button 
                                className={`cuentas-tip-btn ${propinaType === 'percent'?'cuentas-active':''}`} 
                                onClick={()=>setPropinaType('percent')}
                            >
                                %
                            </button>
                            <input 
                                className="cuentas-tip-input"
                                type="number" 
                                min="0" 
                                value={propinaValue} 
                                onChange={handlePropinaChange}
                            />
                        </div>
                    </div>

                    <div className="cuentas-summary-row cuentas-total-final">
                        <span>Total a Pagar</span>
                        <span className="cuentas-total-amount">${totalFinal.toFixed(2)}</span>
                    </div>
                    
                    <button className="cuentas-btn-pay" onClick={marcarPagada}>
                        Confirmar Cobro
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="cuentas-placeholder">
            <span className="cuentas-placeholder-icon">👈</span>
            <h2>Selecciona una mesa para ver la cuenta</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cuentas;