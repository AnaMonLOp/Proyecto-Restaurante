import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // Asegúrate que esta ruta sea correcta según tu carpetas
import "./styles/Login.css"; // Asegúrate que este apunte al CSS nuevo

const Login = () => {
  const navigate = useNavigate();

  // --- LÓGICA ORIGINAL RESTAURADA ---
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Usamos TU ruta original y TUS nombres de variables
      const res = await api.post("/auth/login", {
        identificador,
        password,
      });

      const { usuario, token } = res.data;

      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("token", token);

      // Usamos TUS redirecciones originales
      if (usuario.rol === "mesero") {
        navigate("/");
      } else if (usuario.rol === "cocina") {
        navigate("/pantallaCocina");
      } else if (usuario.rol === "administrador") {
        navigate("/CRUDPlatillos");
      } else {
        // Redirección por defecto si hay otro rol
        navigate("/"); 
      }
    } catch (error) {
      console.log(error);
      setErrorMsg(
        error.response?.data?.mensaje || "Error al iniciar sesión"
      );

       } finally {
      setLoading(false);
    }
  };
  // ----------------------------------

  return (
    <div className="login-page">
      {/* Lado Izquierdo - Visual/Branding (Diseño Nuevo) */}
      <div className="login-hero-section">
        <div className="login-hero-content">
          <h1 className="login-hero-title">Bienvenido</h1>
          <p className="login-hero-text">
            Sistema de Gestión de Restaurante. <br />
            Optimiza tus pedidos y mejora el servicio.
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario (Diseño Nuevo + Lógica Vieja) */}
      <div className="login-form-section">
        <div className="login-header">
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
        </div>

                {errorMsg && <div className="login-error">⚠ {errorMsg}</div>}

        <form onSubmit={manejarSubmit} className="login-form">
          <div className="login-group">
            <label htmlFor="identificador" className="login-label">
              Identificador
            </label>
            <input
              type="text"
              id="identificador"
              className="login-input"
              placeholder="Ej. JuanPerez"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="login-group">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

