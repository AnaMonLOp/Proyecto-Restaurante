import React, { useState, useEffect } from "react";
import "./SelectorMesa.css";
import { useNavigate } from "react-router-dom";

const SelectorMesa = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem("usuario"));
    if (guardado) return guardado;

    const nuevoUsuario = { nombre: "Carlos R.", rol: "mesero" };
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    return nuevoUsuario;
  });

  // Estado de mesas
  const [mesas, setMesas] = useState(() => {
    const guardadas = localStorage.getItem("mesas");
    return guardadas
      ? JSON.parse(guardadas)
      : Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          estado: "disponible",
          mesero: null,
        }));
  });

  useEffect(() => {
    localStorage.setItem("mesas", JSON.stringify(mesas));
  }, [mesas]);

  // Funciones (sin cambios)
  const tomarMesa = (id) => {
    setMesas((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, estado: "ocupada", mesero: usuario.nombre } : m
      )
    );
    navigate(`/alimentos/${id}`);
  };

  const liberarMesa = (id) => {
    setMesas((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, estado: "disponible", mesero: null } : m
      )
    );
  };

  const irAlMenu = (id) => {
    navigate(`/alimentos/${id}`);
  };

  // Renderizado
  return (
    <div className="selector-page">
      {/* Barra superior (sin cambios) */}
      <header className="selector-header">
        <h1 className="logo">🍴 Restaurante</h1>
        <div className="header-right">
          <span
            className="pedidos"
            onClick={() => navigate("/pedidos")}
            style={{ cursor: "pointer" }}
          >
            Pedidos Activos
          </span>
          <div className="usuario">
            <span className="nombre">{usuario.nombre}</span>
            <span className="rol">{usuario.rol}</span>
          </div>
        </div>
      </header>

      {/* Contenedor de mesas */}
      <div className="selector-mesa-container">
        <h2 className="selector-titulo">Selección de Mesa</h2>
        <div className="mesas-grid">
          {mesas.map((mesa) => {
            const estadoClase =
              mesa.estado === "disponible"
                ? "verde"
                : mesa.mesero === usuario.nombre
                ? "azul"
                : "naranja";

            return (
              <div key={mesa.id} className="mesa-card">
                
                {/* --- NUEVO: Contenedor con imagen .webp --- */}
                <div className="mesa-imagen-container">
                  <img
                    // Esta ruta apunta a 'public/images/mesa-icon.webp'
                    src="./public/images/mesa-icon.webp"
                    alt="Icono de mesa"
                    className="mesa-imagen"
                  />
                </div>
                {/* --- FIN DEL CONTENEDOR DE IMAGEN --- */}

                <div className="mesa-info">
                  <p className="mesa-nombre">Mesa {mesa.id}</p>
                  <p className={`estado ${estadoClase}`}>
                    {mesa.estado === "disponible"
                      ? "Disponible"
                      : mesa.mesero === usuario.nombre
                      ? "Asignada a mí"
                      : mesa.mesero
                      ? `Atendida por ${mesa.mesero}`
                      : "Sin mesero"}
                  </p>
                </div>

                <div className="mesa-botones">
                  {/* Botones (sin cambios) */}
                  {mesa.estado === "disponible" && (
                    <button
                      className="btn verde"
                      onClick={() => tomarMesa(mesa.id)}
                    >
                      Tomar mesa
                    </button>
                  )}
                  {mesa.estado === "ocupada" &&
                    mesa.mesero === usuario.nombre && (
                      <>
                        <button
                          className="btn azul"
                          onClick={() => irAlMenu(mesa.id)}
                        >
                          Ir al menú
                        </button>
                        <button
                          className="btn rojo"
                          onClick={() => liberarMesa(mesa.id)}
                        >
                          Liberar
                        </button>
                      </>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SelectorMesa;