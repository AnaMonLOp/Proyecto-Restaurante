import React, { useState, useEffect } from "react";
import "./SelectorMesa.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

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

  // Cargar mesas activas desde backend
  useEffect(() => {
    const cargarMesas = async () => {
      try {
        const res = await api.get("/mesas");
        // Ordenamos por id para tener orden estable
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
        <h1 className="logo">🍴 Restaurante</h1>
        <div className="header-right">
          <span className="pedidos" onClick={() => navigate("/pedidos")} style={{ cursor: "pointer" }}>
            Pedidos Activos
          </span>
          <span onClick={() => navigate("/logout")} style={{ cursor: "pointer" }}>Cerrar sesión</span>
          <div className="usuario">
            <span className="nombre">{usuario.nombre}</span>
            <span className="rol">{usuario.rol}</span>
          </div>
        </div>
      </header>

      <div className="selector-mesa-container">
        <h2 className="selector-titulo">Selección de Mesa</h2>
        <div className="mesas-grid">
          {mesas.map((mesa, idx) => {
            const estadoMesa = ocupacion[mesa.id]?.estado || "disponible";
            const meseroMesa = ocupacion[mesa.id]?.mesero || null;
            const estadoClase =
              estadoMesa === "disponible"
                ? "verde"
                : meseroMesa === usuario.nombre
                ? "azul"
                : "naranja";

            return (
              <div key={mesa.id} className="mesa-card">
                
                <div className="mesa-imagen-container">
                  <img
                    src="./public/images/mesa-icon.webp"
                    alt="Icono de mesa"
                    className="mesa-imagen"
                  />
                </div>

                <div className="mesa-info">
                  <p className="mesa-nombre">Mesa {idx + 1}</p>
                  <p className={`estado ${estadoClase}`}>
                    {estadoMesa === "disponible"
                      ? "Disponible"
                      : meseroMesa === usuario.nombre
                      ? "Asignada a mí"
                      : meseroMesa
                      ? `Atendida por ${meseroMesa}`
                      : "Sin mesero"}
                  </p>
                </div>

                <div className="mesa-botones">
                  {estadoMesa === "disponible" && (
                    <button
                      className="btn verde"
                      onClick={() => tomarMesa(mesa.id)}
                    >
                      Tomar mesa
                    </button>
                  )}
                  {estadoMesa === "ocupada" &&
                    meseroMesa === usuario.nombre && (
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