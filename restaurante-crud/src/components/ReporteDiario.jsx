import { useState } from "react";
import api from "../api/axios";

function ReporteDiario() {
  const [fecha, setFecha] = useState("");
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState("");

  const generarReporte = async () => {
    if (!fecha) {
      setError("Selecciona una fecha");
      return;
    }

    try {
      setError("");
      const res = await api.get(`/reportes?fecha=${fecha}`);
      setReporte(res.data);
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setError("No se pudo generar el reporte. Revisa la consola.");
      setReporte(null);
    }
  };

  return (
    <div className="reporte-diario-container">
      <h1>📊 Reporte Diario</h1>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <button onClick={generarReporte} style={{ marginLeft: "10px" }}>
          Generar reporte
        </button>
      </div>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {reporte && (
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Número de pedidos</th>
              <th>Total vendido ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{reporte.fecha}</td>
              <td>{reporte.total_pedidos}</td>
              <td>{reporte.monto_total_vendido}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReporteDiario;
