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

  // Mapear ID de mesa → número real
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
    { id: "pendiente", titulo: "Pendientes", color: "gray" },
    { id: "en_preparacion", titulo: "En preparación", color: "yellow" },
    { id: "listo", titulo: "Listos", color: "green" },
  ];

  return (
    <div className="pantalla-cocina">
      {/* HEADER */}
      <header className="header">
        <h1>Órdenes de Cocina</h1>
        <span className="logout" onClick={() => navigate("/logout")}>
          Cerrar sesión
        </span>
      </header>

      <main className="main-container">
        {/* COLUMNA DE ESTADOS */}
        <div className="columns-container">
          {estados.map((estado) => (
            <div key={estado.id} className="estado-columna">
              <h2 className={`titulo-estado ${estado.color}`}>
                {estado.titulo}
              </h2>

              {pedidos
                .filter((p) => p.estado === estado.id)
                .map((pedido) => (
                  <div key={pedido.id} className="pedido-card">
                    <div className="pedido-header">
                      <h3>Orden #{pedido.id}</h3>
                      <p className="hora">
                        {new Date(pedido.fecha_pedido).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <p className="mesa-texto">
                      Mesa {obtenerNumeroMesa(pedido.mesa_id)}
                    </p>

                    <div className="pedido-body">
                      {pedido.detalle_pedido?.map((item, idx) => (
                        <div key={idx} className="item-pedido">
                          <p>
                            {item.cantidad}x {item.items_menu?.nombre}
                          </p>
                          {item.notas_item && (
                            <p className="item-nota">→ {item.notas_item}</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pedido-footer">
                      {estado.id === "pendiente" && (
                        <button onClick={() => cambiarEstado(pedido.id, "en_preparacion")}>
                          Marcar como En preparación
                        </button>
                      )}
                      {estado.id === "en_preparacion" && (
                        <button onClick={() => cambiarEstado(pedido.id, "listo")}>
                          Marcar como Listo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* PANEL DERECHA */}
        <div className="mesas-panel">
          <h3 className="titulo-mesas">Marcar mesas como listas</h3>
          <div className="botones-mesas">
            {mesas.map((mesa) => (
              <button
                key={mesa.id}
                className="boton-mesa"
                onClick={() => marcarMesaComoLista(mesa.numero)}
              >
                {mesa.numero}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PantallaCocina;
