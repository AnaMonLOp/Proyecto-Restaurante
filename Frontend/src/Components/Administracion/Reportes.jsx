import React, { useState } from "react";
import api from "../../api/axios";
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
import "./styles/Reportes.css";

// Colores actualizados a la nueva paleta: Azul, Turquesa, Naranja, Rojo
const COLORS = ["#3498DB", "#1ABC9C", "#F39C12", "#E74C3C"];

function formatCurrency(n) {
  return typeof n === "number" ? n.toFixed(2) : n;
}

const Reportes = () => {

  // filtros
  const [fecha, setFecha] = useState("");
  const [startFecha, setStartFecha] = useState("");
  const [endFecha, setEndFecha] = useState("");
  const [rangeMode, setRangeMode] = useState(false);

  // datos
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const generarReporte = async () => {
    setMensaje("");
    setReporte(null);

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
      const qFecha = rangeMode ? `${startFecha},${endFecha}` : fecha;
      const res = await api.get(`/reportes?fecha=${qFecha}`);
      if (!res?.data) {
        setMensaje("No hay datos para la fecha seleccionada.");
        setReporte(null);
      } else {
        setReporte(res.data);
      }
    } catch (err) {
      console.error("Error al generar reporte:", err);
      setMensaje("Error en el servidor.");
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  const totalPedidos = reporte ? Number(reporte.total_pedidos || 0) : 0;
  const totalCancelados = reporte ? Number(reporte.total_cancelados || 0) : 0;
  const totalVendido = reporte ? Number(reporte.monto_total_vendido || 0) : 0;
  const promedio = reporte ? Number(reporte.promedio_por_pedido || 0) : 0;
  const categorias = reporte?.categorias || [
    { name: "Comidas", value: 0 },
    { name: "Bebidas", value: 0 },
    { name: "Postres", value: 0 },
  ];

  const getChartData = () => {
    if (!reporte) return [];
    return [
      { name: "Pedidos", value: totalPedidos, color: COLORS[0] }, // Azul
      { name: "Cancelados", value: totalCancelados, color: COLORS[3] }, // Rojo
      { name: "Ventas", value: totalVendido, color: COLORS[1] }, // Turquesa
    ];
  };

  return (
    <div className="reportes-page">
      <header className="reportes-header">
        <h1 className="reportes-header-title">📊 Reportes de Pedidos</h1>
      </header>

      {/* Filtros */}
      <div className="reportes-filters-card">
        <div className="reportes-filter-group">
          {!rangeMode ? (
            <>
              <label className="reportes-label">Fecha:</label>
              <input
                type="date"
                className="reportes-input-date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="reportes-label">Inicio:</label>
              <input
                type="date"
                className="reportes-input-date"
                value={startFecha}
                onChange={(e) => setStartFecha(e.target.value)}
              />
              <label className="reportes-label">Fin:</label>
              <input
                type="date"
                className="reportes-input-date"
                value={endFecha}
                onChange={(e) => setEndFecha(e.target.value)}
              />
            </>
          )}
          <button 
            onClick={generarReporte} 
            className="reportes-btn-primary" 
            disabled={loading}
          >
            {loading ? "Cargando..." : "Generar Reporte"}
          </button>
        </div>

        <button
          className={`reportes-btn-toggle ${!rangeMode ? "active" : ""}`}
          onClick={() => setRangeMode(!rangeMode)}
          type="button"
        >
          {rangeMode ? "Cambiar a Fecha Única" : "Cambiar a Rango de Fechas"}
        </button>
      </div>

      {mensaje && <p className="reportes-error-msg">{mensaje}</p>}

      {/* Métricas */}
      {reporte && (
        <>
          <div className="reportes-metrics-grid">
            <div className="reportes-metric-card">
              <p className="reportes-metric-label">📦 Pedidos Totales</p>
              <p className="reportes-metric-value">{totalPedidos}</p>
            </div>

            <div className="reportes-metric-card">
              <p className="reportes-metric-label">❌ Cancelados</p>
              <p className="reportes-metric-value" style={{ color: "#E74C3C" }}>{totalCancelados}</p>
            </div>

            <div className="reportes-metric-card">
              <p className="reportes-metric-label">💰 Ventas totales</p>
              <p className="reportes-metric-value" style={{ color: "#3498DB" }}>${formatCurrency(totalVendido)}</p>
            </div>

            <div className="reportes-metric-card">
              <p className="reportes-metric-label">📊 Promedio / pedido</p>
              <p className="reportes-metric-value" style={{ color: "#1ABC9C" }}>${formatCurrency(promedio)}</p>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="reportes-table-container">
            <table className="reportes-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Pedidos</th>
                  <th>Cancelados</th>
                  <th>Total vendido ($)</th>
                  <th>Promedio por pedido ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reporte?.fecha || (rangeMode ? `${startFecha} - ${endFecha}` : fecha)}</td>
                  <td>{totalPedidos}</td>
                  <td>
                    {totalCancelados > 0 ? (
                        <span className="reportes-cell-danger">{totalCancelados}</span>
                    ) : 0}
                  </td>
                  <td>${formatCurrency(totalVendido)}</td>
                  <td>${formatCurrency(promedio)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Gráficas */}
          <div className="reportes-charts-grid">
            <div className="reportes-chart-card">
              <h4 className="reportes-chart-title">Resumen General</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                  <XAxis dataKey="name" tick={{ fill: '#7F8C8D' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7F8C8D' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend />
                  {getChartData().map((data, index) => (
                    <Bar key={index} dataKey="value" name={data.name} fill={data.color} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="reportes-chart-card">
              <h4 className="reportes-chart-title">Ingresos por Categoría</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={categorias} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100}
                    innerRadius={60} // Para hacerla tipo Donut (se ve más moderno)
                    paddingAngle={5}
                  >
                    {categorias.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: 'none' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;