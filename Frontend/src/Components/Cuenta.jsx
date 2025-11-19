import { useState, useEffect } from "react";
import api from "../api/axios";

function Cuentas() {
  const [mesas, setMesas] = useState([]); // 🔹 Lista de mesas
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null); // 🔹 Mesa activa
  const [pedidos, setPedidos] = useState([]); // 🔹 Pedidos de la mesa seleccionada
  const [propina, setPropina] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalFinal, setTotalFinal] = useState(0);

  // 🔹 Cargar lista de mesas (simulación o desde API)
  useEffect(() => {
    api.get("/mesas")
      .then((res) => setMesas(res.data))
      .catch((err) => {
        console.warn("No hay endpoint /mesas, usando datos simulados");
        setMesas([
          { id: 1, nombre: "Mesa 1" },
          { id: 2, nombre: "Mesa 2" },
          { id: 3, nombre: "Mesa 3" },
        ]);
      });
  }, []);

  // 🔹 Cargar pedidos al seleccionar una mesa
  const seleccionarMesa = (mesa) => {
    setMesaSeleccionada(mesa);
    api.get(`/pedidos?mesa_id=${mesa.id}`)
      .then((res) => {
        setPedidos(res.data);
        calcularTotal(res.data);
      })
      .catch((err) => console.error("Error al cargar pedidos:", err));
  };

  // 🔹 Calcular totales
  const calcularTotal = (lista) => {
    const suma = lista.reduce(
      (acc, p) => acc + parseFloat(p.precio || 0) * parseInt(p.cantidad || 1),
      0
    );
    setTotal(suma);
    setTotalFinal(suma + parseFloat(propina || 0));
  };

  const handlePropinaChange = (e) => {
    const valor = parseFloat(e.target.value) || 0;
    setPropina(valor);
    setTotalFinal(total + valor);
  };

  const marcarPagada = () => {
  alert(`✅ La cuenta de ${mesaSeleccionada.nombre} fue marcada como pagada`);

  // 🔹 Elimina la mesa del listado (simulado como "pagada")
  setMesas((prev) => prev.filter((m) => m.id !== mesaSeleccionada.id));

  // 🔹 Reinicia todo
  setMesaSeleccionada(null);
  setPedidos([]);
  setPropina(0);
  setTotal(0);
  setTotalFinal(0);
};


  if (!mesaSeleccionada) {
  return (
    <div className="cuentas-container">
      <h1>🪑 Selecciona una Mesa</h1>

      {/* 🔹 Botón para agregar nueva mesa */}
      <button
  className="btn-agregar-mesa"
  onClick={() => {
    const nuevaMesa = {
      id: mesas.length + 1,
      nombre: `Mesa ${mesas.length + 1}`,
    };

    // 🔹 Agregar la mesa a la lista
    setMesas([...mesas, nuevaMesa]);

    // 🔹 Abrir automáticamente la nueva mesa
    setMesaSeleccionada(nuevaMesa);

    // 🔹 (Opcional) Si tienes API, podrías guardar la mesa en el backend:
    // api.post("/mesas", nuevaMesa).then(() => setMesaSeleccionada(nuevaMesa));
  }}
>
  ➕ Agregar Mesa
</button>

      <div className="mesas-lista">
        {mesas.map((m) => (
          <button key={m.id} className="mesa-btn" onClick={() => seleccionarMesa(m)}>
            {m.nombre || `Mesa ${m.id}`}
          </button>
        ))}
      </div>
    </div>
  );
}

  // 🔹 Si hay mesa seleccionada, mostrar su cuenta
  return (
    <div className="cuentas-container">
      <button className="volver" onClick={() => setMesaSeleccionada(null)}>
        🔙 Volver a Mesas
      </button>
      <h1>💰 Cuenta de {mesaSeleccionada.nombre}</h1>

      <table>
        <thead>
          <tr>
            <th>Platillo</th>
            <th>Cantidad</th>
            <th>Precio ($)</th>
            <th>Subtotal ($)</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? (
            pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.cantidad || 1}</td>
                <td>{parseFloat(p.precio).toFixed(2)}</td>
                <td>{(parseFloat(p.precio || 0) * parseInt(p.cantidad || 1)).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                No hay pedidos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="totales">
        <p><strong>Total:</strong> ${total.toFixed(2)}</p>
        <label>
          Propina: $
          <input
            type="number"
            min="0"
            step="1"
            value={propina}
            onChange={handlePropinaChange}
          />
        </label>
        <p><strong>Total Final:</strong> ${totalFinal.toFixed(2)}</p>
      </div>

      <button onClick={marcarPagada} className="btn-pagada">
        Marcar como Pagada ✅
      </button>
    </div>
  );
}

export default Cuentas;