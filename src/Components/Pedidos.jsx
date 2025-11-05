import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PedidosActivos.css";

const PedidosActivos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);

  // Cargar pedidos simulados o de localStorage
  useEffect(() => {
    const guardados = localStorage.getItem("pedidos");
    if (guardados) {
      setPedidos(JSON.parse(guardados));
    } else {
      // Datos simulados de prueba
      const pedidosEjemplo = [
        {
          id: 1,
          mesa: 3,
          mesero: "Carlos R.",
          estado: "En preparación",
          hora: "12:45 PM",
          total: 280.5,
        },
        {
          id: 2,
          mesa: 5,
          mesero: "Ana M.",
          estado: "Listo para servir",
          hora: "12:52 PM",
          total: 350,
        },
        {
          id: 3,
          mesa: 7,
          mesero: "Luis P.",
          estado: "Entregado",
          hora: "1:05 PM",
          total: 190,
        },
      ];
      setPedidos(pedidosEjemplo);
      localStorage.setItem("pedidos", JSON.stringify(pedidosEjemplo));
    }
  }, []);

  const irADetalle = (id) => {
    navigate(`/pedido/${id}`);
  };

  return (
    <div className="pedidos-page">
      <header className="pedidos-header">
        <h1 className="logo">🍽️ Pedidos Activos</h1>
        <button
          // --- 👇 CAMBIO AQUÍ ---
          className="btn btn-volver" 
          onClick={() => navigate("/")}
        >
          ← Volver a Mesas
        </button>
      </header>

      <div className="pedidos-container">
        {pedidos.length === 0 ? (
          <p className="sin-pedidos">No hay pedidos activos por ahora.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidos.map((p) => (
              <div
                key={p.id}
                className={`pedido-card ${
                  p.estado === "Entregado"
                    ? "verde"
                    : p.estado === "Listo para servir"
                    ? "azul"
                    : "naranja"
                }`}
              >
                <h2>Mesa {p.mesa}</h2>
                <p>Mesero: {p.mesero}</p>
                <p>Hora: {p.hora}</p>
                <p>
                  Estado: <b>{p.estado}</b>
                </p>
                <p>Total: ${p.total.toFixed(2)}</p>

                <button
                  // --- 👇 CAMBIO AQUÍ ---
                  className="btn btn-detalle"
                  onClick={() => irADetalle(p.id)}
                >
                  Ver Detalle
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PedidosActivos;