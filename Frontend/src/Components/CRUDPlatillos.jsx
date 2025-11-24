import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import "./CRUDPlatillos.css";

function CRUDPlatillos() {
  const navigate = useNavigate();
  const [platillo, setPlatillo] = useState({ nombre: "", precio: "", categoria: "" });
  const [platillos, setPlatillos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [catMap, setCatMap] = useState({});
  const [categorias, setCategorias] = useState([]);

  // Cargar los platillos desde el backend
  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get("/platillos");
        setPlatillos(res.data || []);
        const resCat = await api.get("/categorias");
        const map = {};
        (resCat.data || []).forEach((c) => { map[c.id] = c.nombre; });
        setCatMap(map);
        setCategorias(resCat.data || []);
      } catch (err) {
        console.error("Error al cargar datos:", err);
      }
    };
    cargar();
  }, []);

  // Actualizar valores del formulario
  const handleChange = (e) => {
    setPlatillo({ ...platillo, [e.target.name]: e.target.value });
  };

  // Guardar o actualizar platillo
  const handleSubmit = async () => {
    if (!platillo.nombre || !platillo.precio || !platillo.categoria) return;

    // Mapear el nombre seleccionado a categoria_id para que se guarde correctamente
    const categoriaSeleccionada = categorias.find((c) => c.nombre === platillo.categoria);
    const payload = {
      nombre: platillo.nombre,
      precio: Number(platillo.precio),
      categoria_id: categoriaSeleccionada ? categoriaSeleccionada.id : null,
    };

    try {
      if (editIndex === null) {
        await api.post("/platillos", payload);
      } else {
        const id = platillos[editIndex]?.id;
        await api.put(`/platillos/${id}`, payload);
      }
      const res = await api.get("/platillos");
      setPlatillos(res.data || []);
      setEditIndex(null);
      setPlatillo({ nombre: "", precio: "", categoria: "" });
    } catch (err) {
      console.error("Error al guardar platillo:", err);
    }
  };

  // Cargar platillo en el formulario para editar
  const handleEdit = (index) => {
    const p = platillos[index];
    setPlatillo({
      nombre: p?.nombre ?? "",
      precio: p?.precio ?? "",
      categoria: p?.categoria || catMap[p?.categoria_id] || "",
    });
    setEditIndex(index);
  };

  // Eliminar platillo
  const handleDelete = (index) => {
    const id = platillos[index]?.id;
    if (!id) return;
    api
      .delete(`/platillos/${id}`)
      .then(() => api.get("/platillos"))
      .then((res) => setPlatillos(res.data || []))
      .catch((err) => console.error("Error al eliminar platillo:", err));
  };

  return (
    <div className="crud-platillos-container">
        <header className="crud-header">
          <h3 className="logo">🍽️ Gestión de Platillos</h3>
          <nav className="nav-menu">
            <span onClick={() => navigate("/gestion-usuarios")} className="nav-link">Gestion</span>
            <span onClick={() => navigate("/reporteDiario")} className="nav-link">Reportes</span>
            <span onClick={() => navigate("/cuenta")} className="nav-link">Cuenta</span>
            <span onClick={() => navigate("/logout")} className="nav-link logout">Cerrar sesión</span>
          </nav>
        </header>

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
        <select
          name="categoria"
          value={platillo.categoria}
          onChange={handleChange}
        >
          <option value="">Selecciona categoría</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
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
              <td>{p.categoria || catMap[p.categoria_id] || ""}</td>
              <td>
                <button className="edit" onClick={() => handleEdit(index)}>
                  Editar
                </button>
                <button className="delete" onClick={() => handleDelete(index)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {platillos.length === 0 && (
            <tr>
              <td colSpan={4} className="no-data">
                No hay platillos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CRUDPlatillos;
