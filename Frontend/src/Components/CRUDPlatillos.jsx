import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CRUDPlatillos.css";

function CRUDPlatillos() {
    const navigate = useNavigate();
  const [platillo, setPlatillo] = useState({ nombre: "", precio: "", categoria: "" });
  const [platillos, setPlatillos] = useState([
    { id: 1, nombre: "Tacos al Pastor", precio: 45, categoria: "Comida mexicana" },
    { id: 2, nombre: "Pizza Hawaiana", precio: 120, categoria: "Italiana" },
    { id: 3, nombre: "Hamburguesa Doble", precio: 90, categoria: "Rápida" },
  ]);
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setPlatillo({ ...platillo, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!platillo.nombre || !platillo.precio || !platillo.categoria) return;

    if (editIndex === null) {
      const nuevo = { ...platillo, id: Date.now() };
      setPlatillos([...platillos, nuevo]);
    } else {
      const actualizados = [...platillos];
      actualizados[editIndex] = { ...platillo, id: platillos[editIndex].id };
      setPlatillos(actualizados);
      setEditIndex(null);
    }

    setPlatillo({ nombre: "", precio: "", categoria: "" });
  };

  const handleEdit = (index) => {
    setPlatillo(platillos[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const filtrados = platillos.filter((_, i) => i !== index);
    setPlatillos(filtrados);
  };

  return (

    <div className="crud-platillos-container">
        <div className="Navbar-crud">
            <span className="NavMenu" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                Mesero
            </span>
            <span className="NavMenu" onClick={() => navigate("/PantallaCocina")} style={{ cursor: "pointer" }}>
                Cocina
            </span>
        </div>
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

export default CRUDPlatillos;
