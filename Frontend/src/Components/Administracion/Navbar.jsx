import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

function Navbar() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  // Si no es administrador, no muestra navbar
  if (!usuario || usuario.rol !== "administrador") {
    return null;
  }

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-nav-left">
        <span className="admin-nav-title">Panel Admin</span>
      </div>

      <div className="admin-nav-links">
        <Link to="/CRUDPlatillos" className="admin-nav-btn">Platillos</Link>
        <Link to="/reportes" className="admin-nav-btn">Reportes</Link>
        <Link to="/gestion-usuarios" className="admin-nav-btn">Usuarios</Link>
        <Link to="/cuenta" className="admin-nav-btn">Cuentas</Link>
      </div>

      <div className="admin-nav-right">
        <button className="admin-btn-logout" onClick={cerrarSesion}>
            <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;