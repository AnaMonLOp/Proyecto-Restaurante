import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./Components/Login/Login";
import CRUDPlatillos from "./Components/Administracion/CRUDPlatillos";
import Cuentas from "./Components/Administracion/Cuenta";
import FiltroReporte from "./Components/Administracion/FiltroReporte";
import GestionUsuarios from "./Components/Administracion/GestionUsuarios";
import ReporteDiario from "./Components/Administracion/ReporteDiario";
import RegistroUsuario from "./Components/Administracion/RegistroUsuario";
import RegistroAdmin from "./Components/Administracion/RegistroAdmin";
import SelectorMesa from "./Components/Mesero/SelectorMesa";
import PaginaAlimentos from "./Components/Mesero/PaginaAlimentos";
import PedidosActivos from "./Components/Mesero/Pedidos";
import PantallaCocina from "./Components/Cocina/PantallaCocina";
import Navbar from "./Components/Administracion/Navbar"

import "./App.css";

const RutaProtegida = ({ children, roles }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {/* NAVBAR SOLO PARA ADMIN */}
      {usuario.rol === "administrador" && <Navbar />}

      {/* CONTENIDO DE LA RUTA */}
      <div style={{ marginTop: usuario.rol === "administrador" ? "70px" : "0" }}>
        {children}
      </div>
    </>
  );
};

// 🔓 CERRAR SESIÓN
const CerrarSesion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
      Cerrando sesión...
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* (PÚBLICOS) */}
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<CerrarSesion />} />

      {/* ADMINISTRADOR */}
      <Route
        path="/registro"
        element={
          <RutaProtegida roles={["administrador"]}>
            <RegistroUsuario />
          </RutaProtegida>
        }
      />

      <Route
        path="/registro-admin"
        element={
          <RutaProtegida roles={["administrador"]}>
            <RegistroAdmin />
          </RutaProtegida>
        }
      />

      <Route
        path="/CRUDPlatillos"
        element={
          <RutaProtegida roles={["administrador"]}>
            <CRUDPlatillos />
          </RutaProtegida>
        }
      />

      <Route
        path="/gestion-usuarios"
        element={
          <RutaProtegida roles={["administrador"]}>
            <GestionUsuarios />
          </RutaProtegida>
        }
      />

      <Route
        path="/filtroReportes"
        element={
          <RutaProtegida roles={["administrador"]}>
            <FiltroReporte />
          </RutaProtegida>
        }
      />

      <Route
        path="/reporte-diario"
        element={
          <RutaProtegida roles={["administrador"]}>
            <ReporteDiario />
          </RutaProtegida>
        }
      />

      <Route
        path="/cuenta"
        element={
          <RutaProtegida roles={["administrador"]}>
            <Cuentas />
          </RutaProtegida>
        }
      />

      {/* MESERO */}
      <Route
        path="/"
        element={
          <RutaProtegida roles={["mesero"]}>
            <SelectorMesa />
          </RutaProtegida>
        }
      />

      <Route
        path="/alimentos/:id"
        element={
          <RutaProtegida roles={["mesero"]}>
            <PaginaAlimentos />
          </RutaProtegida>
        }
      />

      <Route
        path="/pedidos"
        element={
          <RutaProtegida roles={["mesero"]}>
            <PedidosActivos />
          </RutaProtegida>
        }
      />

      {/* COCINA */}
      <Route
        path="/pantallaCocina"
        element={
          <RutaProtegida roles={["cocina"]}>
            <PantallaCocina />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
