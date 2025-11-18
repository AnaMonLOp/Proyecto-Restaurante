import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import CRUDPlatillos from "./Components/CRUDPlatillos";
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos";
import PedidosActivos from "./Components/Pedidos";
import PantallaCocina from "./Components/PantallaCocina";
import Login from "./Components/Login";

import "./App.css";

const RutaProtegida = ({ children }) => {
  const usuario = localStorage.getItem("usuario");
  
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const CerrarSesion = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("usuario");
    navigate("/login");
  }, [navigate]);

  return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Cerrando sesión...</div>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/logout" element={<CerrarSesion />} />

      <Route path="/" element={<RutaProtegida><SelectorMesa /></RutaProtegida>} />
      
      <Route path="/alimentos/:id" element={<RutaProtegida><PaginaAlimentos /></RutaProtegida>} />
      
      <Route path="/pedidos" element={<RutaProtegida><PedidosActivos /></RutaProtegida>} />
      
      <Route path="/pantallaCocina" element={<RutaProtegida><PantallaCocina /></RutaProtegida>} />
      
      <Route path="/CRUDPlatillos" element={<RutaProtegida><CRUDPlatillos /></RutaProtegida>} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;