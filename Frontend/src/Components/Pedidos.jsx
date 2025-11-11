import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PedidosActivos.css";
import api from "../api/axios.js";

const PedidosActivos = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async() => {
      try{
        const pedidosRes = await api.get("/pedidos");
        const meserosRes = await api.get("/usuarios/meseros");
        const mesaRes = await api.get("/mesas");

        const pedidosData = pedidosRes.data;
        const meserosData = meserosRes.data;
        const mesasData = mesaRes.data;

        // Filtrar pedidos no entregados
        const pedidosFiltrados = pedidosData.filter(
          (p) =>
            p.estado.toLowerCase() !== "entregado" &&
            p.estado.toLowerCase() !== "entregados"
        );

        // Agregar nombre del mesero usando su id y mesas
        const pedidosConDatos = pedidosFiltrados.map((p) => {
          const mesero = meserosData.find((m) => m.id === p.mesero_id);
          const mesa = mesasData.find((m) => m.id === p.mesa_id);
          const fecha = new Date(p.fecha_pedido);
          const hora = fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

          return {
            ...p,
            meseroNombre: mesero ? mesero.nombre : "Desconocido",
            mesaNumero: mesa ? mesa.numero : p.mesa_id,
            horaPedido: hora,
          };
        });

        // Ordenar por número de mesa
        pedidosConDatos.sort((a,b) => a.mesaNumero - b.mesaNumero);

        setPedidos(pedidosConDatos);
      } catch(error) {
        console.error("Error al obtener pedidos o meseros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const irADetalle = (id) => {
    navigate(`/pedido/${id}`);
  };

  if (loading) return <p className="cargando">Cargando pedidos...</p>;

  return (
    <div className="pedidos-page">
      <header className="pedidos-header">
        <h1 className="logo">🍽️ Pedidos Activos</h1>
        <button
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
                <h2>Mesa {p.mesaNumero}</h2>
                <p>Mesero: {p.meseroNombre}</p>
                <p>Hora: {p.horaPedido}</p>
                <p>
                  Estado: <b>{p.estado}</b>
                </p>
                <p>Total: ${p.total.toFixed(2)}</p>

                <button
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