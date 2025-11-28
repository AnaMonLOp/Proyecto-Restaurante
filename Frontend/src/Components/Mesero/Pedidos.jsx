import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/PedidosActivos.css";
import api from "../../api/axios";

const PedidosActivos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacion, setNotificacion] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const ESTADOS_VALIDOS = ["pendiente", "en_preparacion", "listo"];

  const normalizarEstado = (estado) =>
    (estado || "").toString().toLowerCase().trim();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pedidosRes = await api.get("/pedidos?incluir_cancelados=true");
        const meserosRes = await api.get("/usuarios/meseros");
        const mesasRes = await api.get("/mesas");
        const menuRes = await api.get("/platillos");

        setMenuItems(menuRes.data);

        const pedidosData = Array.isArray(pedidosRes.data) ? pedidosRes.data : [];
        const meserosData = Array.isArray(meserosRes.data) ? meserosRes.data : [];
        const mesasData = Array.isArray(mesasRes.data) ? mesasRes.data : [];

        const pedidosActivos = pedidosData.filter((p) => {
          const estadoNorm = normalizarEstado(p.estado);
          return ESTADOS_VALIDOS.includes(estadoNorm);
        });

        const pedidosConDatos = pedidosActivos.map((p) => {
          const mesero = meserosData.find((m) => m.id === p.mesero_id);
          const mesa = mesasData.find((m) => m.id === p.mesa_id);

          const fecha = p.fecha_pedido ? new Date(p.fecha_pedido) : new Date();
          const hora = fecha.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            ...p,
            meseroNombre: mesero ? mesero.nombre : "Desconocido",
            mesaNumero: mesa ? mesa.numero : p.mesa_id,
            horaPedido: hora,
            estadoNorm: normalizarEstado(p.estado),
          };
        });

        pedidosConDatos.sort((a, b) => {
          const na = Number(a.mesaNumero) || 0;
          const nb = Number(b.mesaNumero) || 0;
          return na - nb;
        });

        setPedidos(pedidosConDatos);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const pedidosRes = await api.get("/pedidos?incluir_cancelados=true");
        const meserosRes = await api.get("/usuarios/meseros");
        const mesasRes = await api.get("/mesas");

        const pedidosData = Array.isArray(pedidosRes.data) ? pedidosRes.data : [];
        const meserosData = Array.isArray(meserosRes.data) ? meserosRes.data : [];
        const mesasData = Array.isArray(mesasRes.data) ? mesasRes.data : [];

        const pedidosActivos = pedidosData.filter((p) => {
          const estadoNorm = normalizarEstado(p.estado);
          return ESTADOS_VALIDOS.includes(estadoNorm);
        });

        const pedidosConDatos = pedidosActivos.map((p) => {
          const mesero = meserosData.find((m) => m.id === p.mesero_id);
          const mesa = mesasData.find((m) => m.id === p.mesa_id);

          const fecha = p.fecha_pedido ? new Date(p.fecha_pedido) : new Date();
          const hora = fecha.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            ...p,
            meseroNombre: mesero ? mesero.nombre : "Desconocido",
            mesaNumero: mesa ? mesa.numero : p.mesa_id,
            horaPedido: hora,
            estadoNorm: normalizarEstado(p.estado),
          };
        });

        pedidosConDatos.sort((a, b) => {
          const na = Number(a.mesaNumero) || 0;
          const nb = Number(b.mesaNumero) || 0;
          return na - nb;
        });

        setPedidos(pedidosConDatos);
      } catch (error) {
        console.error("Error en polling:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 4000);
  };

  const entregarPedido = async (id) => {
    try {
      const res = await api.put(`/pedidos/${id}`, { estado: "entregado" });
      if (res.status === 200) {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
        mostrarNotificacion("Pedido entregado correctamente ✅");
      }
    } catch (error) {
      console.error("Error al entregar pedido:", error);
      mostrarNotificacion("Error al entregar el pedido");
    }
  };

  const cancelarPedido = async (id) => {
    try {
      const res = await api.put(`/pedidos/${id}`, { estado: "cancelado" });
      if (res.status === 200) {
        setPedidos((prev) => prev.filter((p) => p.id !== id));
        mostrarNotificacion("Pedido cancelado correctamente");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarNotificacion("Error al cancelar el pedido");
    }
  };

  const verDetalles = async (pedido) => {
    try {
      const res = await api.get(`/pedidos/detallespedido/${pedido.id}`);
      const items = Array.isArray(res.data) ? res.data : [];
      setPedidoSeleccionado({ ...pedido, items: items });
    } catch (error) {
      console.error("Error cargando detalles:", error);
      setPedidoSeleccionado({ ...pedido, items: [] });
    }
  };

  const getEstadoVisuals = (estado) => {
    const est = normalizarEstado(estado);
    switch (est) {
      case "listo":
        return { clase: "verde", icono: "✅", animacion: "latido" };
      case "pendiente":
        return { clase: "azul", icono: "⏳", animacion: "" };
      case "en_preparacion":
        return { clase: "azul", icono: "🔥", animacion: "" };
      default:
        return { clase: "azul", icono: "📝", animacion: "" };
    }
  };

  const pedidosFiltrados =
    filtroEstado === "todos"
      ? pedidos
      : pedidos.filter(
          (p) => normalizarEstado(p.estado) === filtroEstado.toLowerCase().trim()
        );

  if (loading) return <p className="pedidos-active-empty">Cargando pedidos...</p>;

  return (
    <div className="pedidos-active-page">
      {notificacion && <div className="pedidos-toast">{notificacion}</div>}

      <header className="pedidos-active-header">
        <h1 className="pedidos-active-logo">🍽️ Pedidos Activos</h1>
        {/* CORREGIDO: Clase única para este botón para que no se estire */}
        <button className="pedidos-header-btn-volver" onClick={() => navigate("/")}>
          ← Volver a Mesas
        </button>
      </header>

      <div className="pedidos-active-filter-container">
        <select
          className="pedidos-active-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los activos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_preparacion">En Preparación</option>
          <option value="listo">Listos para entregar</option>
        </select>
      </div>

      <div className="pedidos-active-container">
        {pedidosFiltrados.length === 0 ? (
          <p className="pedidos-active-empty">No hay pedidos activos.</p>
        ) : (
          <div className="pedidos-active-grid">
            {pedidosFiltrados.map((p) => {
              const { clase, icono, animacion } = getEstadoVisuals(p.estado);

              return (
                <div key={p.id} className={`pedidos-active-card ${clase} ${animacion}`}>
                  <div className="pedidos-active-content">
                    <h2>Mesa {p.mesaNumero}</h2>
                    
                    {/* CORREGIDO: Divs separados para evitar que el texto se junte */}
                    <div className="pedidos-info-row">
                      <span className="pedidos-label">Mesero:</span>
                      <span className="pedidos-value">{p.meseroNombre}</span>
                    </div>
                    
                    <div className="pedidos-info-row">
                      <span className="pedidos-label">Hora:</span>
                      <span className="pedidos-value">{p.horaPedido}</span>
                    </div>

                    <div className="pedidos-active-status-text">
                      <b>{icono} {String(p.estado).replace("_", " ")}</b>
                    </div>
                    
                    <p className="pedidos-total">Total: ${Number(p.total || 0).toFixed(2)}</p>
                  </div>

                  <div className="pedidos-active-actions">
                    <button
                      className="pedidos-card-btn pedidos-btn-detail"
                      onClick={() => verDetalles(p)}
                    >
                      Detalle
                    </button>

                    {normalizarEstado(p.estado) === "listo" && (
                      <button
                        className="pedidos-card-btn pedidos-btn-deliver"
                        onClick={() => entregarPedido(p.id)}
                      >
                        Entregar
                      </button>
                    )}

                    {/* El botón cancelar ocupa todo el ancho si está abajo */}
                    <button
                      className="pedidos-card-btn pedidos-btn-cancel"
                      onClick={() => cancelarPedido(p.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pedidoSeleccionado && (
        <div className="pedidos-overlay" onClick={() => setPedidoSeleccionado(null)}>
          <div className="pedidos-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Pedido Mesa {pedidoSeleccionado.mesaNumero}</h2>
            <p><b>Mesero:</b> {pedidoSeleccionado.meseroNombre}</p>
            <p><b>Hora:</b> {pedidoSeleccionado.horaPedido}</p>
            <p><b>Estado:</b> {String(pedidoSeleccionado.estado).replace("_", " ")}</p>

            <h3>Platillos</h3>

            {(!pedidoSeleccionado.items || pedidoSeleccionado.items.length === 0) ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <p>⚠️ <b>No se encontraron platillos.</b></p>
              </div>
            ) : (
              <ul>
                {pedidoSeleccionado.items.map((item) => {
                  const productoInfo = menuItems.find((m) => m.id === item.item_menu_id);
                  const nombreMostrar = productoInfo ? productoInfo.nombre : "Platillo desconocido";

                  return (
                    <li key={item.id}>
                      {nombreMostrar} – x{item.cantidad} – ${Number(item.precio_unitario || 0).toFixed(2)}
                      {item.notas_item && (
                        <p className="pedidos-modal-note">📝 {item.notas_item}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <h3 style={{ textAlign: "right", marginTop: "20px" }}>Total: ${Number(pedidoSeleccionado.total || 0).toFixed(2)}</h3>

            <div className="pedidos-modal-actions">
              <button
                className="pedidos-btn-close"
                onClick={() => setPedidoSeleccionado(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosActivos;