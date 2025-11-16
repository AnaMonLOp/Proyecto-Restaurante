import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ReporteDiario = () => {
  const [fecha, setFecha] = useState("");
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Datos demo si no hay reporte aún
  const datosDemo = {
    total_pedidos: 12,
    monto_total_vendido: 2450,
  };

  const handleGenerarReporte = async () => {
    if (!fecha) return alert("Selecciona una fecha primero.");
    setCargando(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/reporte-diario?fecha=${fecha}`
      );
      setReporte(response.data);
    } catch (error) {
      console.error("Error al obtener reporte", error);
      alert("No se pudo obtener el reporte. Usando datos de ejemplo.");
      setReporte(datosDemo);
    } finally {
      setCargando(false);
    }
  };

  // Usa reporte real si existe, si no usa demo
  const data = [
    {
      name: "Pedidos",
      value: reporte?.total_pedidos ?? datosDemo.total_pedidos,
    },
    {
      name: "Ventas $",
      value: reporte?.monto_total_vendido ?? datosDemo.monto_total_vendido,
    },
  ];

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">📊 Reporte Diario de Ventas</h2>

      {/* Filtro de fecha */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="date"
          className="p-2 rounded bg-gray-800 border border-gray-700"
          onChange={(e) => setFecha(e.target.value)}
        />
        <button
          onClick={handleGenerarReporte}
          className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded"
        >
          {cargando ? "Cargando..." : "Generar Reporte"}
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-lg">📦 Pedidos</p>
          <p className="text-3xl font-bold">
            {reporte?.total_pedidos ?? datosDemo.total_pedidos}
          </p>
        </div>
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-lg">💰 Ventas totales</p>
          <p className="text-3xl font-bold">
            ${reporte?.monto_total_vendido ?? datosDemo.monto_total_vendido}
          </p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-gray-800 p-4 rounded shadow" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReporteDiario;
