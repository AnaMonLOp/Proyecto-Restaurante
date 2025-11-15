import { useState, useEffect } from "react";
import api from "./api/axios.js";
import "./App.css";
import Cuentas from "./components/Cuenta.jsx";
import ReporteDiario from "./components/ReporteDiario.jsx";

function App() {
  const [platillo, setPlatillo] = useState({ nombre: "", precio: "", categoria: "" });
  const [platillos, setPlatillos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [pagina, setPagina] = useState("platillos");

  useEffect(() => {
    api.get("/platillos")
      .then(res => setPlatillos(res.data))
      .catch(err => console.error("Error al cargar platillos:", err));
  }, []);

  const handleChange = (e) => {
    setPlatillo({ ...platillo, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!platillo.nombre || !platillo.precio || !platillo.categoria) return;

    if (editIndex === null) {
      api.post("/platillos", platillo)
        .then(() => {
          setPlatillo({ nombre: "", precio: "", categoria: "" });
          return api.get("/platillos");
        })
        .then(res => setPlatillos(res.data))
        .catch(err => console.error("Error al agregar platillo:", err));
    } else {
      const id = platillos[editIndex].id;
      api.put(`/platillos/${id}`, platillo)
        .then(() => {
          setEditIndex(null);
          setPlatillo({ nombre: "", precio: "", categoria: "" });
          return api.get("/platillos");
        })
        .then(res => setPlatillos(res.data))
        .catch(err => console.error("Error al actualizar platillo:", err));
    }
  };

  const handleEdit = (index) => {
    setPlatillo(platillos[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const id = platillos[index].id;
    api.delete(`/platillos/${id}`)
      .then(() => api.get("/platillos"))
      .then(res => setPlatillos(res.data))
      .catch(err => console.error("Error al eliminar platillo:", err));
  };

  return (
    <div className="app-container">
      <div className="nav">
        <button onClick={() => setPagina("platillos")}>🍽️ Platillos</button>
        <button onClick={() => setPagina("cuentas")}>💳 Cuentas</button>
        <button onClick={() => setPagina("reporte")}>📊 Reporte Diario</button>
      </div>

      {pagina === "platillos" ? (
        <>
          <h1>🍽️ Gestión de Platillos</h1>

          <div className="form-container">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del platillo"
              value={platillo.nombre}
              onChange={handleChange}
            />
            <input
              type="number"
              name="precio"
              placeholder="Precio"
              value={platillo.precio}
              onChange={handleChange}
            />
            <input
              type="text"
              name="categoria"
              placeholder="Categoría"
              value={platillo.categoria}
              onChange={handleChange}
            />
            <button onClick={handleSubmit}>
              {editIndex === null ? "Agregar Platillo" : "Guardar Cambios"}
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio ($)</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {platillos.map((p, index) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.precio}</td>
                  <td>{p.categoria}</td>
                  <td>
                    <button className="edit" onClick={() => handleEdit(index)}>Editar</button>
                    <button className="delete" onClick={() => handleDelete(index)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : pagina === "cuentas" ? (
        <Cuentas />
      ) : (
        <ReporteDiario />
      )}
    </div>
  );
}

export default App;
