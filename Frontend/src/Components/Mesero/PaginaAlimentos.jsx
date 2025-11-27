import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./styles/PaginaAlimentos.css"; 
import api from "../../api/axios.js"

const PaginaAlimentos = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState([]);
  const [pedidoActual, setPedidoActual] = useState({});
  const [confirmacion, setConfirmacion] = useState(false);
  const [mesaIndexMap, setMesaIndexMap] = useState({});

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    const fetchPlatillos = async () => {
      try {
        const response = await api.get("/platillos");
        setMenuData(response.data);
      } catch (error) {
        console.error("Error al obtener platillos:", error);
      }
    };
    fetchPlatillos();
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

  const agregarAlPedido = (platillo) => {
    setPedidoActual((prev) => {
      if (prev[platillo.id]) {
        return {
          ...prev,
          [platillo.id]: {
            ...prev[platillo.id],
            cantidad: prev[platillo.id].cantidad + 1,
          },
        };
      }
      return {
        ...prev,
        [platillo.id]: { ...platillo, cantidad: 1, comentarios: "" },
      };
    });
  };

  const eliminarDelPedido = (platilloId) => {
    setPedidoActual((prev) => {
      const nuevoPedido = { ...prev };
      delete nuevoPedido[platilloId];
      return nuevoPedido;
    });
  };

  const actualizarCantidad = (platilloId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelPedido(platilloId);
      return;
    }
    setPedidoActual((prev) => ({
      ...prev,
      [platilloId]: { ...prev[platilloId], cantidad },
    }));
  };

  const actualizarComentarios = (platilloId, comentarios) => {
    setPedidoActual((prev) => ({
      ...prev,
      [platilloId]: { ...prev[platilloId], comentarios },
    }));
  };

  const calcularTotal = () => {
    return Object.values(pedidoActual).reduce(
      (total, item) => total + item.precio * item.cantidad,
      0
    );
  };

  const handleEnviarPedido = async () => {
    if (!usuario || !usuario.id) {
      alert("Error: No se identifica al mesero. Inicia sesión de nuevo.");
      return;
    }

      const platillos = Object.values(pedidoActual).map((item) => ({
        item_menu_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio),
        notas_item: item.comentarios?.trim() !== "" ? item.comentarios : null
      }));

    const nuevoPedido = {
      mesa_id: Number(id),
      mesero_id: usuario.id,
      platillos,
    };

    try {
      const res = await api.post("/pedidos", nuevoPedido);
      console.log("Pedido enviado:", res.data);
      setConfirmacion(true);
      setPedidoActual({});
      
      const ocupacion = JSON.parse(localStorage.getItem("ocupacionMesas")) || {};
      ocupacion[id] = { estado: "ocupada", mesero: usuario.nombre };
      localStorage.setItem("ocupacionMesas", JSON.stringify(ocupacion));

      setTimeout(() => navigate("/"), 2000);
    } catch (error){
      console.error("Error al enviar el pedido:", error);
      if(error.response){
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      }
    }
  };
  const itemsEnPedido = Object.values(pedidoActual);

  return (
    <div className="alimentos-page">
      {confirmacion && (
        <div className="alimentos-modal">
          <h2>✅ ¡Pedido enviado correctamente!</h2>
        </div>
      )}

      <header className="alimentos-header">
        <h1>Menú de la Mesa {mesaIndexMap[id] || id}</h1>
        <button onClick={() => navigate("/")} className="alimentos-btn-back">
          ← Volver a mesas
        </button>
      </header>

      <div className="alimentos-container">
        <div className="alimentos-menu-col">
          <h2 className="alimentos-section-title">Platillos Disponibles</h2>
          <div className="alimentos-grid">
            {menuData.map((platillo) => (
              <div key={platillo.id} className="alimentos-card">
                <div>
                  <h3>{platillo.nombre}</h3>
                  <p className="alimentos-desc">{platillo.descripcion}</p>
                  <p className="alimentos-price">${Number(platillo.precio).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => agregarAlPedido(platillo)}
                  className="alimentos-btn-add"
                >
                  Agregar al pedido
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="alimentos-order-col">
          <div className="alimentos-order-card">
            <h2 className="alimentos-section-title">Tu Pedido</h2>
            
            {itemsEnPedido.length === 0 ? (
              <p className="alimentos-empty">Selecciona platillos para comenzar.</p>
            ) : (
              <div className="alimentos-list">
                {itemsEnPedido.map((item) => (
                  <div key={item.id} className="alimentos-item">
                    <div className="alimentos-item-header">
                      <span className="alimentos-item-name">{item.nombre}</span>
                      <button
                        onClick={() => eliminarDelPedido(item.id)}
                        className="alimentos-btn-remove"
                      >
                        Eliminar
                      </button>
                    </div>
                    <p className="alimentos-item-price">${Number(item.precio).toFixed(2)} c/u</p>
                    
                    <div className="alimentos-controls">
                      <span className="alimentos-label">Cant:</span>
                      <button
                        onClick={() =>
                          actualizarCantidad(item.id, item.cantidad - 1)
                        }
                        className="alimentos-btn-qty"
                      >
                        -
                      </button>
                      <span className="alimentos-qty-num">{item.cantidad}</span>
                      <button
                        onClick={() =>
                          actualizarCantidad(item.id, item.cantidad + 1)
                        }
                        className="alimentos-btn-qty"
                      >
                        +
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Notas (ej. sin cebolla)"
                      value={item.comentarios}
                      onChange={(e) =>
                        actualizarComentarios(item.id, e.target.value)
                      }
                      className="alimentos-input-note"
                    />
                  </div>
                ))}
              </div>
            )}

            {itemsEnPedido.length > 0 && (
              <div className="alimentos-summary">
                <h3 className="alimentos-total">
                  <span>Total:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </h3>
                <button
                  onClick={handleEnviarPedido}
                  disabled={itemsEnPedido.length === 0}
                  className="alimentos-btn-submit"
                >
                  Enviar Pedido a Cocina
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PaginaAlimentos;