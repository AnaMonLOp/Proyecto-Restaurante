import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// COMPONENTES
import Login from "./Components/Login";
import CRUDPlatillos from "./Components/CRUDPlatillos";
import Cuentas from "./Components/Cuenta";
import GestionUsuarios from "./Components/GestionUsuarios";
import RegistroUsuario from "./Components/RegistroUsuario";
import RegistroAdmin from "./Components/RegistroAdmin";
import Navbar from "./Components/Navbar";
import Reportes from "./Components/Reportes";

// Mesero
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos";
import PedidosActivos from "./Components/Pedidos";

// Cocinero
import PantallaCocina from "./Components/PantallaCocina";

import "./App.css";

// 🔐 RUTA PROTEGIDA
const RutaProtegida = ({ children, roles }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar Navbar solo para admins
  return (
    <>
      {usuario.rol === "administrador" && <Navbar />}
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
      {/* PÚBLICOS */}
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
        path="/reportes"
        element={
          <RutaProtegida roles={["administrador"]}>
            <Reportes />
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

      {/* RUTA POR DEFECTO */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
