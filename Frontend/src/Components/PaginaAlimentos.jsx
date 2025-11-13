import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PaginaAlimentos.css"; // <- Importamos el CSS
import api from "../api/axios.js"

const PaginaAlimentos = () => {
  const { id } = useParams(); // ID de la mesa
  const navigate = useNavigate();

  const [menuData, setMenuData] = useState([]);
  const [pedidoActual, setPedidoActual] = useState({});
  const [confirmacion, setConfirmacion] = useState(false);

  // Cargar platillos desde backend
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
    const meseroId = "2fa2c8bb-7386-49cf-bdfc-7833443a97ff"; 

      const platillos = Object.values(pedidoActual).map((item) => ({
        platillo_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: Number(item.precio),
        notas_item: item.comentarios?.trim() !== "" ? item.comentarios : null
      }));

    const nuevoPedido = {
      mesa_id: 14,
      mesero_id: meseroId,
      platillos,
    };

    try {
      const res = await api.post("/pedidos", nuevoPedido);
      console.log("Pedido enviado:", res.data);
      setConfirmacion(true);
      setPedidoActual({});
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
    <div className="pagina-alimentos">
      {/* --- MENSAJE DE CONFIRMACIÓN --- */}
      {confirmacion && (
        <div className="confirmacion-modal">
          <h2>✅ ¡Pedido enviado correctamente!</h2>
        </div>
      )}

      {/* --- CABECERA --- */}
      <header className="alimentos-header">
        <h1>Menú de la Mesa {id}</h1>
        <button onClick={() => navigate("/")} className="btn-volver">
          ← Volver al selector
        </button>
      </header>

      <div className="menu-pedido-container">
        
        <div className="menu-columna">
          <h2 className="columna-titulo">Platillos</h2>
          <div className="menu-grid">
            {menuData.map((platillo) => (
              <div key={platillo.id} className="menu-card">
                <div>
                  <h3>{platillo.nombre}</h3>
                  <p className="descripcion">{platillo.descripcion}</p>
                  <p className="precio">${Number(platillo.precio).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => agregarAlPedido(platillo)}
                  className="btn-agregar"
                >
                  Agregar al pedido
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="pedido-columna">
          <h2 className="columna-titulo">Tu Pedido</h2>
          
          {itemsEnPedido.length === 0 ? (
            <p className="pedido-vacio">Aún no has agregado platillos.</p>
          ) : (
            <div className="pedido-lista">
              {itemsEnPedido.map((item) => (
                <div key={item.id} className="pedido-item">
                  <div className="item-header">
                    <span>{item.nombre}</span>
                    <button
                      onClick={() => eliminarDelPedido(item.id)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                  <p className="item-precio">${Number(item.precio).toFixed(2)} c/u</p>
                  
                  <div className="cantidad-controles">
                    <label>Cant:</label>
                    <button
                      onClick={() =>
                        actualizarCantidad(item.id, item.cantidad - 1)
                      }
                      className="btn-cantidad"
                    >
                      -
                    </button>
                    <span className="cantidad-numero">{item.cantidad}</span>
                    <button
                      onClick={() =>
                        actualizarCantidad(item.id, item.cantidad + 1)
                      }
                      className="btn-cantidad"
                    >
                      +
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Comentarios (ej. sin cebolla)"
                    value={item.comentarios}
                    onChange={(e) =>
                      actualizarComentarios(item.id, e.target.value)
                    }
                    className="input-comentarios"
                  />
                </div>
              ))}
            </div>
          )}

          {itemsEnPedido.length > 0 && (
            <div className="pedido-total-seccion">
              <h3 className="total-precio">
                <span>Total:</span>
                <span>${calcularTotal().toFixed(2)}</span>
              </h3>
              <button
                onClick={handleEnviarPedido}
                disabled={itemsEnPedido.length === 0}
                className="btn-enviar-pedido"
              >
                Enviar Pedido a Cocina
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PaginaAlimentos;