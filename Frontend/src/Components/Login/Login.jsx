import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./styles/Login.css"; 

const Login = () => {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        identificador,
        password,
      });

      const { usuario, token } = res.data;

      // Guardar datos en localStorage
      localStorage.setItem("usuario", JSON.stringify(usuario));
      localStorage.setItem("token", token);

      // Redirección según rol
      if (usuario.rol === "mesero") {
        navigate("/");
      } else if (usuario.rol === "cocina") {
        navigate("/pantallaCocina");
      } else if (usuario.rol === "administrador") {
        navigate("/CRUDPlatillos");
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

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={manejarSubmit}>
        <h2>Iniciar Sesión</h2>

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <div className="login-input-group">
          <label>Identificador</label>
          <input
            type="text"
            value={identificador}
            onChange={(e) => setIdentificador(e.target.value)}
            required
          />
        </div>

        <div className="login-input-group">
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
