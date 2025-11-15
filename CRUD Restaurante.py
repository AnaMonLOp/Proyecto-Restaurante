import React, { useState } from "react";

export default function CrudPlatillos() {
  const [platillos, setPlatillos] = useState([
    { id: 1, nombre: "Tacos al Pastor", precio: 45, categoria: "Mexicana" },
    { id: 2, nombre: "Hamburguesa Clásica", precio: 80, categoria: "Rápida" },
  ]);

  const [form, setForm] = useState({ id: null, nombre: "", precio: "", categoria: "" });
  const [modoEdicion, setModoEdicion] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarPlatillo = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.categoria) return;
    const nuevo = { ...form, id: Date.now() };
    setPlatillos([...platillos, nuevo]);
    setForm({ id: null, nombre: "", precio: "", categoria: "" });
  };

  const editarPlatillo = (platillo) => {
    setModoEdicion(true);
    setForm(platillo);
  };

  const actualizarPlatillo = (e) => {
    e.preventDefault();
    setPlatillos(
      platillos.map((p) => (p.id === form.id ? form : p))
    );
    setModoEdicion(false);
    setForm({ id: null, nombre: "", precio: "", categoria: "" });
  };

  const eliminarPlatillo = (id) => {
    setPlatillos(platillos.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Gestión de Platillos</h2>

      {/* Formulario */}
      <form onSubmit={modoEdicion ? actualizarPlatillo : agregarPlatillo} className="space-y-3 mb-6">
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del platillo"
          value={form.nombre}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={form.precio}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          name="categoria"
          placeholder="Categoría"
          value={form.categoria}
          onChange={handleChange}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {modoEdicion ? "Actualizar Platillo" : "Agregar Platillo"}
        </button>
      </form>

      {/* Tabla de platillos */}
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Precio ($)</th>
            <th className="border p-2">Categoría</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {platillos.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.nombre}</td>
              <td className="border p-2">{p.precio}</td>
              <td className="border p-2">{p.categoria}</td>
              <td className="border p-2 text-center space-x-2">
                <button
                  onClick={() => editarPlatillo(p)}
                  className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarPlatillo(p.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
