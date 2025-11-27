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

  // Estados válidos mostrables (normalizados)
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

        // Filtrado: solo estados válidos (normalizados)
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

  // Polling cada 5 segundos (misma normalización)
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

      setPedidoSeleccionado({
        ...pedido,
        items: items,
      });
    } catch (error) {
      console.error("Error cargando detalles:", error);
      setPedidoSeleccionado({
        ...pedido,
        items: [],
      });
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

  if (loading) return <p className="cargando">Cargando pedidos...</p>;

  return (
    <div className="pedidos-page">
      {notificacion && <div className="notificacion-toast">{notificacion}</div>}

      <header className="pedidos-header">
        <h1 className="logo">🍽️ Pedidos Activos</h1>
        <button className="btn btn-volver" onClick={() => navigate("/")}>
          ← Volver a Mesas
        </button>
      </header>

      <div className="filtro-contenedor">
        <select
          className="filtro-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos los activos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_preparacion">En Preparación</option>
          <option value="listo">Listos para entregar</option>
        </select>
      </div>

      <div className="pedidos-container">
        {pedidosFiltrados.length === 0 ? (
          <p className="sin-pedidos">No hay pedidos activos.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidosFiltrados.map((p) => {
              const { clase, icono, animacion } = getEstadoVisuals(p.estado);

              return (
                <div key={p.id} className={`pedido-card ${clase} ${animacion}`}>
                  <div className="pedido-card-content">
                    <h2>Mesa {p.mesaNumero}</h2>
                    <p>Mesero: {p.meseroNombre}</p>
                    <p>Hora: {p.horaPedido}</p>
                    <p className="estado-texto">
                      Estado: <b>{icono} {String(p.estado).replace("_", " ")}</b>
                    </p>
                    <p>Total: ${Number(p.total || 0).toFixed(2)}</p>
                  </div>

                  <div className="pedido-card-actions">
                    <button
                      className="btn btn-detalle"
                      onClick={() => verDetalles(p)}
                    >
                      Ver Detalle
                    </button>

                    {normalizarEstado(p.estado) === "listo" && (
                      <button
                        className="btn-entregar"
                        style={{ backgroundColor: "#28a745", color: "white", marginLeft: "5px" }}
                        onClick={() => entregarPedido(p.id)}
                      >
                        Entregar
                      </button>
                    )}

                    <button
                      className="btn-simular cancelar"
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
        <div className="modal-overlay" onClick={() => setPedidoSeleccionado(null)}>
          <div className="modal-detalle" onClick={(e) => e.stopPropagation()}>
            <h2>Pedido Mesa {pedidoSeleccionado.mesaNumero}</h2>
            <p><b>Mesero:</b> {pedidoSeleccionado.meseroNombre}</p>
            <p><b>Hora:</b> {pedidoSeleccionado.horaPedido}</p>
            <p><b>Estado:</b> {String(pedidoSeleccionado.estado).replace("_", " ")}</p>

            <h3>Platillos</h3>

            {(!pedidoSeleccionado.items || pedidoSeleccionado.items.length === 0) ? (
              <div className="error-vacio">
                <p>⚠️ <b>No se encontraron platillos.</b></p>
                <small style={{ color: "#888" }}>Es posible que hubo un error al guardar el pedido.</small>
              </div>
            ) : (
              <ul>
                {pedidoSeleccionado.items.map((item) => {
                  const productoInfo = menuItems.find((m) => m.id === item.platillo_id);
                  const nombreMostrar = productoInfo ? productoInfo.nombre : "Platillo desconocido";

                  return (
                    <li key={item.id}>
                      {nombreMostrar} – x{item.cantidad} – ${Number(item.precio_unitario || 0).toFixed(2)}
                      {item.notas_item && (
                        <p className="comentario-item">📝 {item.notas_item}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <h3>Total: ${Number(pedidoSeleccionado.total || 0).toFixed(2)}</h3>

            <div className="modal-actions">
              <button
                className="btn-cerrar"
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
