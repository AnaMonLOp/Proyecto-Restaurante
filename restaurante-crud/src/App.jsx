import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [platillo, setPlatillo] = useState({ nombre: "", precio: "", categoria: "" });
  const [platillos, setPlatillos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  // 🔹 Cargar los platillos desde el backend al iniciar
  useEffect(() => {
    axios.get("http://localhost:3000/platillos")
      .then(res => setPlatillos(res.data))
      .catch(err => console.error("Error al cargar platillos:", err));
  }, []);

  // 🔹 Actualizar valores del formulario
  const handleChange = (e) => {
    setPlatillo({ ...platillo, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar o actualizar platillo
  const handleSubmit = () => {
    if (!platillo.nombre || !platillo.precio || !platillo.categoria) return;

    if (editIndex === null) {
      // Agregar nuevo platillo
      axios.post("http://localhost:3000/platillos", platillo)
        .then(() => {
          setPlatillo({ nombre: "", precio: "", categoria: "" });
          return axios.get("http://localhost:3000/platillos");
        })
        .then(res => setPlatillos(res.data))
        .catch(err => console.error("Error al agregar platillo:", err));
    } else {
      // Actualizar platillo existente
      const id = platillos[editIndex].id;
      axios.put(`http://localhost:3000/platillos/${id}`, platillo)
        .then(() => {
          setEditIndex(null);
          setPlatillo({ nombre: "", precio: "", categoria: "" });
          return axios.get("http://localhost:3000/platillos");
        })
        .then(res => setPlatillos(res.data))
        .catch(err => console.error("Error al actualizar platillo:", err));
    }
  };

  // 🔹 Cargar platillo en el formulario para editar
  const handleEdit = (index) => {
    setPlatillo(platillos[index]);
    setEditIndex(index);
  };

  // 🔹 Eliminar platillo
  const handleDelete = (index) => {
    const id = platillos[index].id;
    axios.delete(`http://localhost:3000/platillos/${id}`)
      .then(() => axios.get("http://localhost:3000/platillos"))
      .then(res => setPlatillos(res.data))
      .catch(err => console.error("Error al eliminar platillo:", err));
  };

  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;
