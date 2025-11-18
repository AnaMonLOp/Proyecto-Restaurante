// src/Components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth"; 
import "./Login.css"; 


const LogoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#39ff14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 16.5l-8.5 -8.5" />
    <path d="M6 6l11.5 11.5" />
    <path d="M18 18v-3l-3 -3" />
    <path d="M6 6v3l3 3" />
  </svg>
);

const EyeIcon = ({ visible }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
    ) : (
      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
    )}
  </svg>
);

const Login = () => {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const usuario = login(identificador, password);

      setIsLoading(false);

      if (!usuario) {
        setError("Usuario o contraseña incorrectos");
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));

      switch (usuario.rol) {
        case "mesero":
          navigate("/"); 
          break;
        case "cocina":
          navigate("/pantallaCocina");
          break;
        case "administrador":
          navigate("/CRUDPlatillos"); 
          break;
        default:
          navigate("/");
      }
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-content">
        
        <div className="login-header">
          <LogoIcon />
          <span className="brand-name">RestauranteApp</span>
        </div>

        <h1 className="welcome-text">Bienvenido de nuevo</h1>
        <p className="subtitle-text">Acceso al Sistema de Gestión (Modo Prueba)</p>

        <form onSubmit={handleLogin} className="login-form">
          
          <div className="input-group">
            <label>Nombre de Usuario</label>
            <input 
              type="text" 
              placeholder="Ej: mesero, cocina, admin"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña: 123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          {error && <div className="error-badge">{error}</div>}

          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? "Verificando..." : "Ingresar"}
          </button>

          <a href="#" className="forgot-password">¿Problemas para ingresar?</a>
        </form>

        <div className="login-footer">
          © 2024 RestauranteApp. Todos los derechos reservados. v1.0.0
        </div>
      </div>
    </div>
  );
};

export default Login;