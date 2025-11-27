import React, { useState } from "react";
import api from "../api/axios";
import Navbar from "./Navbar";
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
import "./Reportes.css";

const COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#ef4444"];

function formatCurrency(n) {
  return typeof n === "number" ? n.toFixed(2) : n;
}

const Reportes = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));

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
      { name: "Pedidos", value: totalPedidos, color: COLORS[0] },
      { name: "Cancelados", value: totalCancelados, color: COLORS[3] },
      { name: "Ventas", value: totalVendido, color: COLORS[2] },
    ];
  };

  return (
    <div className="reportes-container p-6 bg-gray-900 text-white min-h-screen">
      {/* Navbar solo para administrador */}
      {usuario?.rol === "administrador" && <Navbar />}

      <h2 className="titulo">📊 Reportes de Pedidos</h2>

      {/* Filtros */}
      <div className="filtros-box">
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
          <button onClick={generarReporte} className="btn-primary" disabled={loading}>
            {loading ? "Cargando..." : "Generar Reporte"}
          </button>
        </div>

        <div className="filtro-line">
          <button
            className={`mode-btn ${!rangeMode ? "active" : ""}`}
            onClick={() => setRangeMode(false)}
            type="button"
          >
            Fecha única
          </button>
        </div>
      </div>

      {mensaje && <p className="mensaje-error">{mensaje}</p>}

      {/* Métricas */}
      {reporte && (
        <>
          <div className="metric-cards">
            <div className="metric-card">
              <p className="metric-label">📦 Pedidos</p>
              <p className="metric-value">{totalPedidos}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">❌ Cancelados</p>
              <p className="metric-value">{totalCancelados}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">💰 Ventas totales</p>
              <p className="metric-value">${formatCurrency(totalVendido)}</p>
            </div>

            <div className="metric-card">
              <p className="metric-label">📊 Promedio por pedido</p>
              <p className="metric-value">${formatCurrency(promedio)}</p>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="tabla-resumen">
            <table>
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
                  <td>{reporte?.fecha || "-"}</td>
                  <td>{totalPedidos}</td>
                  <td className="cancelados-cell">{totalCancelados}</td>
                  <td>${formatCurrency(totalVendido)}</td>
                  <td>${formatCurrency(promedio)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Gráficas */}
          <div className="graficas-row">
            <div className="grafica-card">
              <h4>Pedidos vs Cancelados</h4>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {getChartData().map((data, index) => (
                    <Bar key={index} dataKey="value" name={data.name} fill={data.color} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grafica-card">
              <h4>Ingresos por categoría</h4>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categorias} dataKey="value" nameKey="name" outerRadius={80}>
                    {categorias.map((e, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
};

export default Reportes;
