import { useState, useEffect } from "react";
import api from "../../api/axios";
import "./styles/Cuenta.css";

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
    const pedidoRef = pedidosMesa[0]; 

    try {
      await api.post("/cuentas", {
        pedido_id: pedidoRef.id,
        mesa_id: mesaSeleccionada.id,
        mesero_id: pedidoRef.mesero_id,
        subtotal: total,
        propina: propinaType === "amount" ? Number(propinaValue || 0) : Number(((total * (propinaValue || 0)) / 100).toFixed(2)),
      });

      alert("✅ Cobrado exitosamente");
      setMesaSeleccionada(null);
      setPedidosMesa([]);
      window.location.reload();
    } catch (error) {
      alert("Error al cobrar: " + error.message);
    }
  };

  if (cargando) return <div className="cuentas-container"><div className="cargando">Cargando...</div></div>;

  return (
    <div className="cuentas-container">
      
      <aside className="panel-izquierdo">
        <div className="panel-header">
          <h2>Mesas</h2>
          <span className="badge-count">{mesas.length}</span>
        </div>
        <div className="lista-mesas">
          {mesas.length > 0 ? (
            mesas.map((m) => {
              const numero = mesaIndexMap[m.id] || m.id;
              const activos = pedidoCounts[m.id] || 0;
              const cobrables = pendingCounts[m.id] || 0;
              const isSelected = mesaSeleccionada?.id === m.id;
              
              let clase = "libre";
              if (activos > 0) clase = "ocupada";
              if (cobrables > 0) clase = "por-cobrar";

              return (
                <div key={m.id} className={`tarjeta-mesa ${clase} ${isSelected ? 'seleccionada' : ''}`} onClick={() => cargarPedidosMesa(m)}>
                  <div className="mesa-icono">{activos > 0 ? "👤" : "🍽️"}</div>
                  <div className="mesa-info">
                    <span className="mesa-titulo">Mesa {numero}</span>
                    <span className="mesa-subtitulo">
                      {activos > 0 
                        ? `Atiende: ${meserosMap[m.id] || 'Staff'}` 
                        : "Disponible"}
                    </span>
                  </div>
                  {cobrables > 0 && <div className="mesa-alerta"><span>$</span></div>}
                </div>
              );
            })
          ) : <p className="sin-datos">Sin mesas</p>}
        </div>
      </aside>

      <main className="panel-derecho">
        {mesaSeleccionada ? (
          <div className="recibo-contenedor">
            <div className="recibo-header">
              <div>
                <h1>Mesa {mesaIndexMap[mesaSeleccionada.id]}</h1>
                <p>Mesero: {meserosMap[mesaSeleccionada.id] || "..."}</p>
              </div>
              <button className="btn-cerrar-detalle" onClick={() => setMesaSeleccionada(null)}>✕</button>
            </div>

            {loadingDetail ? <div className="recibo-body cargando-detalle">Cargando...</div> : (
              <>
                <div className="recibo-body">
                  {pedidosMesa.length > 0 ? (
                    <table className="tabla-recibo">
                      <thead>
                        <tr><th>#</th><th className="text-left">Item</th><th className="text-right">$$</th><th className="text-right">Tot</th></tr>
                      </thead>
                      <tbody>
                        {pedidosMesa.flatMap(p => (p.detalle_pedido || []).map((item, i) => (
                          <tr key={i}>
                            <td className="text-center font-mono">{item.cantidad}</td>
                            <td>{item.items_menu?.nombre || "..."} {item.notas_item && `(${item.notas_item})`}</td>
                            <td className="text-right">{item.precio_unitario}</td>
                            <td className="text-right font-bold">{item.subtotal}</td>
                          </tr>
                        )))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="estado-vacio">
                      <span className="icono-vacio">👨‍🍳</span>
                      <p>En preparación o sin pedidos entregados.</p>
                    </div>
                  )}
                </div>
                
                {pedidosMesa.length > 0 && (
                  <div className="recibo-footer">
                    <div className="fila-resumen"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                    <div className="fila-resumen input-row">
                        <label>Propina</label>
                        <div className="input-grupo">
                            <button className={propinaType === 'amount'?'activo':''} onClick={()=>setPropinaType('amount')}>$</button>
                            <button className={propinaType === 'percent'?'activo':''} onClick={()=>setPropinaType('percent')}>%</button>
                            <input type="number" min="0" value={propinaValue} onChange={handlePropinaChange}/>
                        </div>
                    </div>
                    <div className="fila-resumen total-final"><span>Total</span><span>${totalFinal.toFixed(2)}</span></div>
                    <button className="btn-cobrar" onClick={marcarPagada}>Cobrar</button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mensaje-inicial">
            <div className="icono-grande">👈</div>
            <h2>Selecciona una mesa</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cuentas;