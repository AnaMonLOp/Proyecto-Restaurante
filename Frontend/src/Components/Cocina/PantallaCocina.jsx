import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import "./styles/PantallaCocina.css";

const PantallaCocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate();

  const fetchPedidos = async () => {
    try {
      const response = await api.get("/pedidos");
      setPedidos(response.data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  const fetchMesas = async () => {
    try {
      const res = await api.get("/mesas");
      const listaOrdenada = res.data.sort((a, b) => a.numero - b.numero);
      setMesas(listaOrdenada);
    } catch (error) {
      console.error("Error al obtener mesas:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
    fetchMesas();

    const interval = setInterval(fetchPedidos, 8000);
    return () => clearInterval(interval);
  }, []);

  const obtenerNumeroMesa = (idMesa) => {
    const mesa = mesas.find((m) => m.id === idMesa);
    return mesa ? mesa.numero : idMesa;
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}`, { estado: nuevoEstado });
      fetchPedidos();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const marcarMesaComoLista = async (numeroMesa) => {
    try {
      await api.put(`/pedidos/mesa/${numeroMesa}/estado`, { estado: "listo" });
      fetchPedidos();
    } catch (error) {
      console.error("Error mesa:", error);
    }
  };

  const estados = [
    { id: "pendiente", titulo: "Pendientes", colorClass: "cocina-status-gray" },
    { id: "en_preparacion", titulo: "En preparación", colorClass: "cocina-status-yellow" },
    { id: "listo", titulo: "Listos para Servir", colorClass: "cocina-status-green" },
  ];

  return (
    <div className="cocina-page">
      {/* HEADER */}
      <header className="cocina-header">
        <h1 className="cocina-logo">👨‍🍳 Cocina</h1>
        <span className="cocina-logout" onClick={() => navigate("/logout")}>
          Cerrar sesión
        </span>
      </header>

      <main className="cocina-main">
        {/* COLUMNAS KANBAN */}
        <div className="cocina-columns-container">
          {estados.map((estado) => (
            <div key={estado.id} className="cocina-lane">
              <h2 className={`cocina-lane-title ${estado.colorClass}`}>
                {estado.titulo}
              </h2>

              {pedidos
                .filter((p) => p.estado === estado.id)
                .map((pedido) => (
                  <div key={pedido.id} className="cocina-card">
                    <div className="cocina-card-header">
                      <h3>#{pedido.id}</h3>
                      <span className="cocina-time">
                        {new Date(pedido.fecha_pedido).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div style={{ textAlign: "center" }}>
                        <span className="cocina-table-badge">
                        Mesa {obtenerNumeroMesa(pedido.mesa_id)}
                        </span>
                    </div>

                    <div className="cocina-items-list">
                      {pedido.detalle_pedido?.map((item, idx) => (
                        <div key={idx} className="cocina-item">
                          <span>
                            <strong>{item.cantidad}x</strong> {item.items_menu?.nombre}
                          </span>
                          {item.notas_item && (
                            <span className="cocina-note">{item.notas_item}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="cocina-card-footer">
                      {estado.id === "pendiente" && (
                        <button 
                            className="cocina-btn-advance"
                            onClick={() => cambiarEstado(pedido.id, "en_preparacion")}
                        >
                          Empezar Preparación
                        </button>
                      )}
                      {estado.id === "en_preparacion" && (
                        <button 
                            className="cocina-btn-finish"
                            onClick={() => cambiarEstado(pedido.id, "listo")}
                        >
                          Marcar Listo ✅
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* PANEL DERECHA (Atajo Mesas) */}
        <aside className="cocina-side-panel">
          <h3 className="cocina-side-title">Mesa Lista (Atajo)</h3>
          <div className="cocina-mesas-grid">
            {mesas.map((mesa) => (
              <button
                key={mesa.id}
                className="cocina-btn-mesa"
                onClick={() => marcarMesaComoLista(mesa.numero)}
                title={`Marcar todos los pedidos de la Mesa ${mesa.numero} como LISTOS`}
              >
                {mesa.numero}
              </button>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PantallaCocina;