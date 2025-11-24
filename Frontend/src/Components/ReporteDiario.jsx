import React, { useState } from "react";
import api from "../api/axios"; // usa el cliente centralizado que ya tienes
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"];

function formatCurrency(n) {
  return typeof n === "number" ? n.toFixed(2) : n;
}

export default function ReporteDiario() {
  // filtros
  const [fecha, setFecha] = useState("");
  const [startFecha, setStartFecha] = useState("");
  const [endFecha, setEndFecha] = useState("");
  const [rangeMode, setRangeMode] = useState(false); // single date vs rango
  const [tipo, setTipo] = useState("diario"); // diario | ventas | pedidos | productos

  // datos
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // solicitudes: por ahora mantenemos funcionalidad diaria (endpoint /reportes?fecha=YYYY-MM-DD)
  const generarReporte = async () => {
    setMensaje("");
    setReporte(null);

    // validar
    if (rangeMode) {
      if (!startFecha || !endFecha) {
        setMensaje("Selecciona fecha inicial y final para rango.");
        return;
      }
    } else {
      if (!fecha) {
        setMensaje("Selecciona una fecha.");
        return;
      }
    }

    setLoading(true);
    try {
      if (tipo === "diario") {
        // endpoint existente -> /api/reportes?fecha=YYYY-MM-DD
        const qFecha = rangeMode ? startFecha : fecha;
        const res = await api.get(`/reportes?fecha=${qFecha}`);
        if (!res?.data) {
          setMensaje("No hay datos para la fecha seleccionada.");
          setReporte(null);
        } else {
          setReporte(res.data);
        }
      } else {
        // Aún no hay endpoints específicos para los tipos extra (si los hay, sustituir aquí)
        // Mantenemos la UI preparada: mostramos mensaje explicativo y no rompemos nada.
        setMensaje(
          `El tipo "${tipo}" aún no tiene endpoint en este sprint. Consulta "Diario" o pide al backend.`
        );
        setReporte(null);
      }
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setMensaje("Error al obtener datos del servidor. Revisa la consola.");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  // preparacion de datos para graficas a partir del reporte (si viene)
  const getChartData = () => {
    if (!reporte) return [];
    // backend actual devuelve: { fecha, total_pedidos, monto_total_vendido, promedio_por_pedido? }
    // Convertimos a un array sencillo para barra.
    return [
      { name: "Pedidos", value: Number(reporte.total_pedidos || 0) },
      { name: "Ventas", value: Number(reporte.monto_total_vendido || 0) },
    ];
  };

  // Si no hay reporte, mostramos cajas limpias (sin NaN)
  const totalPedidos = reporte ? Number(reporte.total_pedidos || 0) : 0;
  const totalVendido = reporte ? Number(reporte.monto_total_vendido || 0) : 0;

  // Placeholder para pie (categorias) — el backend actual no retorna categorias, queda preparado
  const categorias = reporte?.categorias || [
    { name: "Comidas", value: 0 },
    { name: "Bebidas", value: 0 },
    { name: "Postres", value: 0 },
  ];

  return (
    <div className="reporte-diario-container">
      <h1>📊 Reportes — Dashboard</h1>

      {/* filtros arriba, todo en una sola pantalla */}
      <div className="reporte-filtros">
        <div className="filtro-line">
          <label className="lbl">Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="diario">Diario (por fecha)</option>
            <option value="ventas">Ventas (por producto / categoría)</option>
            <option value="pedidos">Pedidos (detalle)</option>
            <option value="productos">Productos más vendidos</option>
          </select>

          <label className="lbl">Modo:</label>
          <button
            className={`mode-btn ${!rangeMode ? "active" : ""}`}
            onClick={() => setRangeMode(false)}
            type="button"
          >
            Fecha única
          </button>
          <button
            className={`mode-btn ${rangeMode ? "active" : ""}`}
            onClick={() => setRangeMode(true)}
            type="button"
          >
            Rango
          </button>
        </div>

        <div className="filtro-line">
          {!rangeMode ? (
            <>
              <label className="lbl">Fecha:</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="lbl">Inicio:</label>
              <input
                type="date"
                value={startFecha}
                onChange={(e) => setStartFecha(e.target.value)}
              />
              <label className="lbl">Fin:</label>
              <input
                type="date"
                value={endFecha}
                onChange={(e) => setEndFecha(e.target.value)}
              />
            </>
          )}

          <button
            onClick={generarReporte}
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Generar reporte"}
          </button>
        </div>
      </div>

      {mensaje && <p className="mensaje-error">{mensaje}</p>}

      {/* si tipo distinto a diario y no hay endpoint, no mostramos métricas */}
      {tipo !== "diario" && mensaje && (
        <div className="info-box">
          <p>{mensaje}</p>
        </div>
      )}

      {/* métricas + tabla + graficas */}
      {tipo === "diario" && (
        <>
          <div className="metric-cards">
            <div className="metric-card">
              <p className="metric-label">📦 Pedidos</p>
              <p className="metric-value">{totalPedidos}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">💰 Ventas totales</p>
              <p className="metric-value">${formatCurrency(totalVendido)}</p>
            </div>
            <div className="metric-card small">
              <p className="metric-label">📅 Fecha</p>
              <p className="metric-value">{reporte?.fecha || "-"}</p>
            </div>
          </div>

          {/* tabla resumen */}
          <div className="tabla-resumen">
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
                  <td>{reporte?.fecha || "-"}</td>
                  <td>{totalPedidos}</td>
                  <td>${formatCurrency(totalVendido)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* graficas */}
          <div className="graficas-row">
            <div className="grafica-card">
              <h4>Ventas vs Pedidos</h4>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grafica-card">
              <h4>Ingresos por categoría</h4>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categorias}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                  >
                    {categorias.map((entry, i) => (
                      <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
