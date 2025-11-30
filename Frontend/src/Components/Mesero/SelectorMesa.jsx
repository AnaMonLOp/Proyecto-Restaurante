import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import "./styles/SelectorMesa.css";

const SelectorMesa = () => {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(() => {
    const guardado = JSON.parse(localStorage.getItem("usuario"));
    if (guardado) return guardado;

    const nuevoUsuario = { nombre: "Carlos R.", rol: "mesero" };
    localStorage.setItem("usuario", JSON.stringify(nuevoUsuario));
    return nuevoUsuario;
  });

  const [mesas, setMesas] = useState([]);
  const [ocupacion, setOcupacion] = useState(() => {
    const guardado = localStorage.getItem("ocupacionMesas");
    return guardado ? JSON.parse(guardado) : {};
  });

  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const res = await api.get("/mesas");
        const lista = (res.data || []).slice().sort((a, b) => a.id - b.id);
        setMesas(lista);
      } catch (err) {
        console.error("Error al cargar mesas:", err);
      }
    };
    cargarMesas();
  }, []);

  useEffect(() => {
    localStorage.setItem("ocupacionMesas", JSON.stringify(ocupacion));
  }, [ocupacion]);

  const tomarMesa = (id) => {
    setOcupacion((prev) => ({
      ...prev,
      [id]: { estado: "ocupada", mesero: usuario.nombre },
    }));
    navigate(`/alimentos/${id}`);
  };

  const liberarMesa = (id) => {
    setOcupacion((prev) => ({
      ...prev,
      [id]: { estado: "disponible", mesero: null },
    }));
  };

  const irAlMenu = (id) => {
    navigate(`/alimentos/${id}`);
  };

  return (
    <div className="selector-page">
      <header className="selector-header">
        <h1 className="selector-logo">🍴 Restaurante</h1>
        <div className="selector-header-right">
          <span 
            className="selector-link" 
            onClick={() => navigate("/pedidos")} 
          >
            Pedidos Activos
          </span>
          <span 
            className="selector-link"
            onClick={() => navigate("/logout")} 
          >
            Cerrar sesión
          </span>
          <div className="selector-user-card">
            <span className="selector-user-name">{usuario.nombre}</span>
            <span className="selector-user-role">{usuario.rol}</span>
          </div>
        </div>
      </header>

      <div className="selector-main-container">
        <h2 className="selector-title">Selección de Mesa</h2>
        <div className="selector-grid">
          {mesas.map((mesa, idx) => {
            const estadoMesa = ocupacion[mesa.id]?.estado || "disponible";
            const meseroMesa = ocupacion[mesa.id]?.mesero || null;
            
            let statusClass = "selector-status-available";
            if (estadoMesa !== "disponible") {
                if (meseroMesa === usuario.nombre) {
                    statusClass = "selector-status-mine"; 
                } else {
                    statusClass = "selector-status-busy";
                }
            }

            return (
              <div key={mesa.id} className="selector-card">
                
                <div className="selector-img-container">
                  <img
                    src="./public/images/mesa-icon.webp"
                    alt="Icono de mesa"
                    className="selector-img"
                  />
                </div>

                <div className="selector-info">
                  <p className="selector-mesa-name">Mesa {idx + 1}</p>
                  <p className={`selector-status ${statusClass}`}>
                    {estadoMesa === "disponible"
                      ? "Disponible"
                      : meseroMesa === usuario.nombre
                      ? "Asignada a mí"
                      : meseroMesa
                      ? `Atendida por ${meseroMesa}`
                      : "Sin mesero"}
                  </p>
                </div>

                <div className="selector-actions">
                  {estadoMesa === "disponible" && (
                    <button
                      className="selector-btn selector-btn-take"
                      onClick={() => tomarMesa(mesa.id)}
                    >
                      Tomar mesa
                    </button>
                  )}
                  {estadoMesa === "ocupada" &&
                    meseroMesa === usuario.nombre && (
                      <>
                        <button
                          className="selector-btn selector-btn-menu"
                          onClick={() => irAlMenu(mesa.id)}
                        >
                          Ir al menú
                        </button>
                        <button
                          className="selector-btn selector-btn-release"
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