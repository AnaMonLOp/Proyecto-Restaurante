import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import CRUDPlatillos from "./Components/CRUDPlatillos";
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos";
import PedidosActivos from "./Components/Pedidos";
import PantallaCocina from "./Components/PantallaCocina";
import Login from "./Components/Login";
import RegistroUsuario from "./Components/RegistroUsuario";
import RegistroAdmin from "./Components/RegistroAdmin";
import GestionUsuarios from "./Components/GestionUsuarios";
import FiltroReporte from "./Components/FiltroReporte";
import "./App.css";

// 🔐 RUTA PROTEGIDA
const RutaProtegida = ({ children }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  if (!usuario || !token) {
    return <Navigate to="/login" replace />;
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
      {/* LOGIN / REGISTROS (PÚBLICOS) */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroUsuario />} />
      <Route path="/registro-admin" element={<RegistroAdmin />} />

      {/* LOGOUT */}
      <Route path="/logout" element={<CerrarSesion />} />

      {/* MESERO */}
      <Route
        path="/"
        element={
          <RutaProtegida>
            <SelectorMesa />
          </RutaProtegida>
        }
      />

      <Route
        path="/alimentos/:id"
        element={
          <RutaProtegida>
            <PaginaAlimentos />
          </RutaProtegida>
        }
      />

      <Route
        path="/pedidos"
        element={
          <RutaProtegida>
            <PedidosActivos />
          </RutaProtegida>
        }
      />

      {/* COCINA */}
      <Route
        path="/pantallaCocina"
        element={
          <RutaProtegida>
            <PantallaCocina />
          </RutaProtegida>
        }
      />

      {/* ADMIN */}
      <Route
        path="/CRUDPlatillos"
        element={
          <RutaProtegida>
            <CRUDPlatillos />
          </RutaProtegida>
        }
      />

      <Route
        path="/gestion-usuarios"
        element={
          <RutaProtegida>
            <GestionUsuarios />
          </RutaProtegida>
        }
      />

      <Route
        path="/filtroReportes"
        element={
          <RutaProtegida>
            <FiltroReporte />
          </RutaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
