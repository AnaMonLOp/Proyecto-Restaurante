import React, { useEffect, useState } from "react";
import api from "../api/axios.js";
import "./PantallaCocina.css";

const PantallaCocina = () => {
  const [pedidos, setPedidos] = useState([]);
  const [mesaIndexMap, setMesaIndexMap] = useState({});

  // Cargar pedidos al iniciar
  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await api.get("/pedidos");
        setPedidos(response.data);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };

    fetchPedidos();

    // Puedes actualizar cada 10 segundos para simular “tiempo real”
    const interval = setInterval(fetchPedidos, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMesas = async () => {
      try {
        const res = await api.get("/mesas");
        const lista = (res.data || []).slice().sort((a, b) => a.id - b.id);
        const map = {};
        lista.forEach((m, idx) => (map[m.id] = idx + 1));
        setMesaIndexMap(map);
      } catch (error) {
        console.error("Error al obtener mesas:", error);
      }
    };
    fetchMesas();
  }, []);

  // Cambiar estado del pedido
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${id}`, { estado: nuevoEstado });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const estados = [
    { id: "pendiente", titulo: "Pendientes", color: "gray" },
    { id: "en_preparacion", titulo: "En preparación", color: "yellow" },
    { id: "listo", titulo: "Listos", color: "green" },
    { id: "entregado", titulo: "Entregados", color: "blue" },
  ];

  const cancelados = pedidos.filter((p) => p.estado === "cancelado");

  return (
    <div className="pantalla-cocina">
      <header className="top-bar">
        <div className="header-left">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#13ec13"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon"
          >
            <path d="M3 14v1a6 6 0 1 0 12 0v-9a3 3 0 0 1 6 0" />
            <path d="M9 16c-.7 0-1.3 0-1.9-.1l-.5-.1c-2.1-.3-3.6-1-3.6-1.8s1.5-1.5 3.6-1.8l.5-.1c.6-.1 1.2-.1 1.9-.1s1.3 0 1.9.1l.5.1c2.1.3 3.6 1 3.6 1.8s-1.5 1.5-3.6 1.8l-.5.1c-.6.1-1.2.1-1.9.1z" />
          </svg>
          <h1>Órdenes de Cocina</h1>
        </div>
        <nav>
          <button className="btn-menu activo">Todos</button>
          <button className="btn-menu">Para llevar</button>
          <button className="btn-menu">Salón</button>
        </nav>
      </header>

      <main className="main-content">
        <div className="columns-container">
          {estados.map((estado) => (
            <div key={estado.id} className="estado-columna">
              <h2 className={`titulo-estado ${estado.color}`}>
                {estado.titulo}
              </h2>
              {pedidos
                .filter((p) => p.estado === estado.id)
                .map((pedido) => (
                  <div key={pedido.id} className={`pedido-card ${estado.color}`}>
                    <div className={`pedido-header ${estado.color}`}>
                      <div>
                        <h3>Orden #{pedido.id}</h3>
                        <p>Mesa {mesaIndexMap[pedido.mesa_id] || pedido.mesa_id || "-"}</p>
                      </div>
                      <p>
                        {new Date(pedido.fecha_pedido).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="pedido-body">
                      {pedido.detalle_pedido?.length ? (
                        pedido.detalle_pedido.map((item, index) => (
                          <p key={index}>
                            {item.cantidad}x {item.item_menu_id}
                          </p>
                        ))
                      ) : (
                        <p>Sin detalles</p>
                      )}
                    </div>

                    <div className="pedido-footer">
                      {estado.id === "pendiente" && (
                        <button
                          onClick={() =>
                            cambiarEstado(pedido.id, "en_preparacion")
                          }
                        >
                          Marcar como En preparación
                        </button>
                      )}
                      {estado.id === "en_preparacion" && (
                        <button
                          onClick={() => cambiarEstado(pedido.id, "listo")}
                        >
                          Marcar como Listo
                        </button>
                      )}
                      {estado.id === "listo" && (
                        <button
                          onClick={() => cambiarEstado(pedido.id, "entregado")}
                        >
                          Marcar como Entregado
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        <div className="cancelados">
          <h2 className="titulo-estado rojo">Cancelados</h2>
          <div className="cancelados-grid">
            {cancelados.length > 0 ? (
              cancelados.map((pedido) => (
                <div key={pedido.id} className="pedido-card rojo">
                  <div className="pedido-header rojo">
                    <div>
                      <h3>Orden #{pedido.id}</h3>
                      <p>Mesa {mesaIndexMap[pedido.mesa_id] || pedido.mesa_id || "-"}</p>
                    </div>
                  </div>
                  <div className="pedido-body">
                    <p>Pedido cancelado</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="sin-cancelados">No hay pedidos cancelados</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PantallaCocina;