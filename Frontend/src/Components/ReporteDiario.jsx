import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleGenerarReporte = async () => {
    if (!fecha) {
      alert("Selecciona una fecha primero.");
      return;
    }

    setCargando(true);

    try {
      // Obtener todos los pedidos
      const res = await api.get("/pedidos");
      const pedidos = res.data || [];

      // Filtrar pedidos por fecha exacta (YYYY-MM-DD)
      const pedidosDelDia = pedidos.filter(
        (p) => p.fecha && p.fecha.startsWith(fecha)
      );

      if (pedidosDelDia.length === 0) {
        setReporte({
          total_pedidos: 0,
          monto_total_vendido: 0,
        });
        setCargando(false);
        return;
      }

      // Total de pedidos
      const totalPedidos = pedidosDelDia.length;

      // Total vendido (sumar subtotales de detalle_pedido)
      const montoTotal = pedidosDelDia.reduce((acc, pedido) => {
        if (!pedido.detalle_pedido) return acc;

        const subtotalPedido = pedido.detalle_pedido.reduce(
          (sub, item) => sub + Number(item.subtotal || 0),
          0
        );

        return acc + subtotalPedido;
      }, 0);

      setReporte({
        total_pedidos: totalPedidos,
        monto_total_vendido: montoTotal,
      });
    } catch (error) {
      console.error("Error obteniendo reporte diario:", error);

      setReporte({
        total_pedidos: 0,
        monto_total_vendido: 0,
      });

      alert("Error al generar el reporte");
    } finally {
      setCargando(false);
    }
  };

  // Datos para la gráfica
  const data = [
    {
      name: "Pedidos",
      value: reporte?.total_pedidos ?? 0,
    },
    {
      name: "Ventas $",
      value: reporte?.monto_total_vendido ?? 0,
    },
  ];

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <header className="crud-header">
        <h3>📊 Reporte Diario de Ventas</h3>
        <nav className="nav-menu">
            <span onClick={() => navigate("/filtroReportes")} className="nav-link">Filtrar Reportes</span>
            <span onClick={() => navigate("/CRUDPlatillos")} className="nav-link">CRUD</span>
        </nav>
      </header>

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
            {reporte?.total_pedidos ?? 0}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-lg">💰 Ventas totales</p>
          <p className="text-3xl font-bold">
            ${reporte?.monto_total_vendido ?? 0}
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
