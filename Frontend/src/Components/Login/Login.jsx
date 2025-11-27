import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./styles/Login.css";

const Login = () => {
  const [credenciales, setCredenciales] = useState({
    nombre_usuario: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredenciales({
      ...credenciales,
      [e.target.name]: e.target.value,
    });
    // Limpiar error al escribir
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    // Validación simple
    if (!credenciales.nombre_usuario || !credenciales.password) {
      setError("Por favor completa todos los campos");
      setCargando(false);
      return;
    }

    try {
      const response = await api.post("/usuarios/login", credenciales);
      const { usuario, token } = response.data;

      // Guardar en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("token", token); // Si usas tokens

      // Redirección según rol
      if (usuario.rol === "cocina") {
        navigate("/cocina");
      } else if (usuario.rol === "mesero") {
        navigate("/");
      } else if (usuario.rol === "admin" || usuario.rol === "caja") {
        navigate("/admin"); // O la ruta que corresponda
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Usuario o contraseña incorrectos");
      } else {
        setError("Error al conectar con el servidor");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      {/* Lado Izquierdo - Visual/Branding */}
      <div className="login-hero-section">
        <div className="login-hero-content">
          <h1 className="login-hero-title">Bienvenido</h1>
          <p className="login-hero-text">
            Sistema de Gestión de Restaurante. <br />
            Optimiza tus pedidos y mejora el servicio.
          </p>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="login-form-section">
        <div className="login-header">
          <h2 className="login-title">Iniciar Sesión</h2>
          <p className="login-subtitle">Ingresa tus credenciales para acceder</p>
        </div>

        {error && <div className="login-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-group">
            <label htmlFor="nombre_usuario" className="login-label">
              Usuario
            </label>
            <input
              type="text"
              id="nombre_usuario"
              name="nombre_usuario"
              className="login-input"
              placeholder="Ej. JuanPerez"
              value={credenciales.nombre_usuario}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="login-group">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="login-input"
              placeholder="••••••••"
              value={credenciales.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? "Accediendo..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;