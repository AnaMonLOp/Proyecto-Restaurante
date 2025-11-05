import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./PaginaAlimentos.css"; // <- Importamos el CSS

// --- DATOS DE EJEMPLO DEL MENÚ ---
const menuData = [
  {
    id: 1,
    nombre: "Tacos al Pastor",
    precio: 18.0,
    descripcion: "Tacos de cerdo marinado con piña, cilantro y cebolla.",
    categoria: "Tacos",
  },
  {
    id: 2,
    nombre: "Guacamole",
    precio: 85.0,
    descripcion: "Aguacate fresco machacado con cebolla, cilantro, tomate y chile.",
    categoria: "Entradas",
  },
  {
    id: 3,
    nombre: "Sopa de Tortilla",
    precio: 75.0,
    descripcion: "Caldo de jitomate con tiras de tortilla frita, aguacate, crema y queso.",
    categoria: "Sopas",
  },
  {
    id: 4,
    nombre: "Agua de Horchata",
    precio: 30.0,
    descripcion: "Bebida refrescante de arroz, canela y vainilla.",
    categoria: "Bebidas",
  },
];
// ---------------------------------

const PaginaAlimentos = () => {
  const { id } = useParams(); // ID de la mesa
  const navigate = useNavigate();

  const [pedidoActual, setPedidoActual] = useState({});
  const [confirmacion, setConfirmacion] = useState(false);

  // --- FUNCIONES DEL PEDIDO ---

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

  // --- FUNCIÓN PARA ENVIAR EL PEDIDO ---

  const handleEnviarPedido = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const nuevoPedido = {
      id: Date.now(),
      mesa: parseInt(id),
      mesero: usuario?.nombre || "Desconocido",
      estado: "En preparación",
      hora: new Date().toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: calcularTotal(),
      items: Object.values(pedidoActual),
    };

    const pedidosGuardados = JSON.parse(localStorage.getItem("pedidos") || "[]");
    localStorage.setItem(
      "pedidos",
      JSON.stringify([...pedidosGuardados, nuevoPedido])
    );

    setConfirmacion(true);
    setPedidoActual({});

    setTimeout(() => {
      navigate("/");
    }, 2000);
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

      {/* --- CONTENEDOR PRINCIPAL (MENÚ Y PEDIDO) --- */}
      <div className="menu-pedido-container">
        
        {/* === COLUMNA IZQUIERDA: MENÚ === */}
        <div className="menu-columna">
          <h2 className="columna-titulo">Platillos</h2>
          <div className="menu-grid">
            {menuData.map((platillo) => (
              <div key={platillo.id} className="menu-card">
                <div>
                  <h3>{platillo.nombre}</h3>
                  <p className="descripcion">{platillo.descripcion}</p>
                  <p className="precio">${platillo.precio.toFixed(2)}</p>
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

        {/* === COLUMNA DERECHA: TU PEDIDO === */}
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
                  <p className="item-precio">${item.precio.toFixed(2)} c/u</p>
                  
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