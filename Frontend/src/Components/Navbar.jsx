import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

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
    <nav className="navbar-admin">
      <div className="nav-left">
        <span className="nav-title">Panel Administrador</span>
      </div>

      <div className="nav-links">
        <Link to="/CRUDPlatillos" className="nav-btn">Platillos</Link>
        <Link to="/filtroReportes" className="nav-btn">Reportes</Link>
        <Link to="/gestion-usuarios" className="nav-btn">Usuarios</Link>
        <Link to="/registro-admin" className="nav-btn">Cuentas</Link>
      </div>

      <div className="nav-right">
        <button className="btn-logout" onClick={cerrarSesion}>Salir</button>
      </div>
    </nav>
  );
}

export default Navbar;
