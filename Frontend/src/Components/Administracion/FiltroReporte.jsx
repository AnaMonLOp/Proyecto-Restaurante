import React, { useState } from "react";
import api from "../../api/axios";
import "./styles/FiltroReporte.css";

const FiltroReporte = () => {
  const [fecha, setFecha] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const obtenerReporte = async () => {
    if (!fecha) {
      setError("Selecciona una fecha primero.");
      return;
    }

    setCargando(true);
    setError("");

    try {
      const res = await api.get(`/reportes?fecha=${fecha}`);
      setReporte(res.data);
    } catch (err) {
      console.error(err);
      setError("No se pudo obtener el reporte. Intenta nuevamente.");
      setReporte(null);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="filtro-reporte-container">
      <h2 className="titulo">Reporte por Fecha</h2>

      <div className="filtro-box">
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="input-fecha"
        />

        <button onClick={obtenerReporte} className="btn-generar">
          {cargando ? "Cargando..." : "Generar Reporte"}
        </button>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {reporte && (
        <div className="resultados-box">
          <div className="card">
            <p className="label">Pedidos totales</p>
            <p className="valor">{reporte.total_pedidos}</p>
          </div>

          <div className="card">
            <p className="label">Monto total vendido</p>
            <p className="valor">${reporte.monto_total_vendido}</p>
          </div>

          <div className="card">
            <p className="label">Promedio por pedido</p>
            <p className="valor">${reporte.promedio_por_pedido}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltroReporte;