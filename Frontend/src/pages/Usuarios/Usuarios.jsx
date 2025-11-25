import { useState } from "react";
import ListaUsuarios from "./ListaUsuarios";
import "./estilos.css";

export default function Usuarios() {
  const [vista, setVista] = useState("meseros");

  return (
    <div className="usuarios-container">
      <h1 className="titulo">Gestión de Usuarios</h1>

      <div className="tabs">
        <button
          className={vista === "meseros" ? "tab active" : "tab"}
          onClick={() => setVista("meseros")}
        >
          Meseros
        </button>

        <button
          className={vista === "cocina" ? "tab active" : "tab"}
          onClick={() => setVista("cocina")}
        >
          Cocina
        </button>

        <button
          className={vista === "admin" ? "tab active" : "tab"}
          onClick={() => setVista("admin")}
        >
          Administradores
        </button>
      </div>

      {/* Contenido dinámico */}
      {vista === "meseros" && (
        <ListaUsuarios endpoint="/api/usuarios/meseros" titulo="Meseros" />
      )}
      {vista === "cocina" && (
        <ListaUsuarios endpoint="/api/usuarios/cocina" titulo="Cocina" />
      )}
      {vista === "admin" && (
        <ListaUsuarios
          endpoint="/api/usuarios/administradores"
          titulo="Administradores"
        />
      )}
    </div>
  );
}
