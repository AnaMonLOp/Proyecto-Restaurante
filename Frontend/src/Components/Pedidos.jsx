import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PedidosActivos.css";
import api from "../api/axios";

const PedidosActivos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacion, setNotificacion] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pedidosRes = await api.get("/pedidos");
        const meserosRes = await api.get("/usuarios/meseros");
        const mesaRes = await api.get("/mesas");

        const pedidosData = pedidosRes.data;
        const meserosData = meserosRes.data;
        const mesasData = mesaRes.data;

        const pedidosFiltrados = pedidosData.filter(
          (p) => p.estado.toLowerCase() !== "entregado"
        );

        const pedidosConDatos = pedidosFiltrados.map((p) => {
          const mesero = meserosData.find((m) => m.id === p.mesero_id);
          const mesa = mesasData.find((m) => m.id === p.mesa_id);
          const fecha = new Date(p.fecha_pedido);
          const hora = fecha.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return {
            ...p,
            meseroNombre: mesero ? mesero.nombre : "Desconocido",
            mesaNumero: mesa ? mesa.numero : p.mesa_id,
            horaPedido: hora,
          };
        });

        pedidosConDatos.sort((a, b) => a.mesaNumero - b.mesaNumero);
        setPedidos(pedidosConDatos);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const mostrarNotificacion = (mensaje) => {
    setNotificacion(mensaje);
    setTimeout(() => setNotificacion(null), 4000);
  };

  const cancelarPedido = async (id) => {
    try {
      const res = await api.put(`/pedidos/${id}`, { estado: "cancelado" });

      if (res.status === 200) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((p) =>
            p.id === id ? { ...p, estado: "cancelado" } : p
          )
        );
        mostrarNotificacion("Pedido cancelado correctamente");
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      mostrarNotificacion("Error al cancelar el pedido");
    }
  };

  const irADetalle = (id) => {
    navigate(`/pedido/${id}`);
  };

  const getEstadoVisuals = (estado) => {
    const est = estado.toLowerCase();
    switch (est) {
      case "listo":
        return { clase: "verde", icono: "✅", animacion: "latido" };
      case "pendiente":
        return { clase: "azul", icono: "⏳", animacion: "" };
      case "cancelado":
        return { clase: "naranja", icono: "🚫", animacion: "" };
      default:
        return { clase: "azul", icono: "📝", animacion: "" };
    }
  };

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

      <div className="pedidos-container">
        {pedidos.length === 0 ? (
          <p className="sin-pedidos">No hay pedidos activos.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map((p) => {
              const { clase, icono, animacion } = getEstadoVisuals(p.estado);

              return (
                <div key={p.id} className={`pedido-card ${clase} ${animacion}`}>
                  <h2>Mesa {p.mesaNumero}</h2>
                  <p>Mesero: {p.meseroNombre}</p>
                  <p>Hora: {p.horaPedido}</p>
                  <p className="estado-texto">
                    Estado: <b>{icono} {p.estado}</b>
                  </p>
                  <p>Total: ${p.total.toFixed(2)}</p>

                  <button
                    className="btn btn-detalle"
                    onClick={() => irADetalle(p.id)}
                  >
                    Ver Detalle
                  </button>

                  {p.estado.toLowerCase() !== "cancelado" && (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        className="btn-simular cancelar"
                        onClick={() => cancelarPedido(p.id)}
                      >
                        Cancelar Pedido
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosActivos;