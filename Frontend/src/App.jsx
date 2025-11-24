import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

<<<<<<< HEAD
import Login from "./Components/Login";

// Administrador
=======
// COMPONENTES
>>>>>>> S3
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
<<<<<<< HEAD
=======
import Login from "./Components/Login";
import RegistroUsuario from "./Components/RegistroUsuario";
import RegistroAdmin from "./Components/RegistroAdmin";
import GestionUsuarios from "./Components/GestionUsuarios";
import FiltroReporte from "./Components/FiltroReporte";
import ReporteDiario from "./Components/ReporteDiario";
import Navbar from "./Components/Navbar";
>>>>>>> S3

import "./App.css";

// 🔐 RUTA PROTEGIDA
const RutaProtegida = ({ children, roles }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
  }

<<<<<<< HEAD
  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
=======
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
>>>>>>> S3
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
<<<<<<< HEAD
        path="/reporteDiario"
        element={
          <RutaProtegida roles={["administrador"]}>
=======
        path="/reporte-diario"
        element={
          <RutaProtegida>
>>>>>>> S3
            <ReporteDiario />
          </RutaProtegida>
        }
      />

<<<<<<< HEAD
      <Route
        path="/cuenta"
        element={
          <RutaProtegida roles={["administrador"]}>
            <Cuentas />
          </RutaProtegida>
        }
      />

=======
>>>>>>> S3
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
