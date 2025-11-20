import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./Components/Login";

// Administrador
import CRUDPlatillos from "./Components/CRUDPlatillos";
import Cuentas from "./Components/Cuenta";
import FiltroReporte from "./Components/FiltroReporte";
import GestionUsuarios from "./Components/GestionUsuarios";
import ReporteDiario from "./Components/ReporteDiario";
import RegistroUsuario from "./Components/RegistroUsuario";
import RegistroAdmin from "./Components/RegistroAdmin";

//Mesero
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos";
import PedidosActivos from "./Components/Pedidos";

//Cocinero
import PantallaCocina from "./Components/PantallaCocina";

import "./App.css";

// 🔐 RUTA PROTEGIDA
const RutaProtegida = ({ children, roles }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
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

      {/* ADMIN */}
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
        path="/reporteDiario"
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

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
