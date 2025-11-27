import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Agregado para navegación
import api from "../../api/axios.js";
import "./styles/CRUDPlatillos.css";

function CRUDPlatillos() {
  const navigate = useNavigate();
  const [platillo, setPlatillo] = useState({ nombre: "", precio: "", categoria: "" });
  const [platillos, setPlatillos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [catMap, setCatMap] = useState({});
  const [categorias, setCategorias] = useState([]);

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

  const handleChange = (e) => {
    setPlatillo({ ...platillo, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!platillo.nombre || !platillo.precio || !platillo.categoria) return;

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

  const handleEdit = (index) => {
    const p = platillos[index];
    setPlatillo({
      nombre: p?.nombre ?? "",
      precio: p?.precio ?? "",
      categoria: p?.categoria || catMap[p?.categoria_id] || "",
    });
    setEditIndex(index);
  };

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
    <div className="crud-page">
      {/* HEADER */}
      <header className="crud-header">
        <h3 className="crud-logo">🍽️ Gestión de Platillos</h3>
        <nav className="crud-nav">
            <button className="crud-nav-btn" onClick={() => navigate("/")}>
                Ir a Mesas
            </button>
            <button className="crud-nav-btn crud-logout" onClick={() => navigate("/logout")}>
                Cerrar Sesión
            </button>
        </nav>
      </header>

      <div className="crud-main">
        {/* FORMULARIO */}
        <div className="crud-form-card">
          <h4 className="crud-section-title">
            {editIndex === null ? "Agregar Nuevo Platillo" : "Editar Platillo"}
          </h4>
          
          <div className="crud-form-grid">
            <div className="crud-input-group">
                <label className="crud-label">Nombre</label>
                <input
                  className="crud-input"
                  type="text"
                  name="nombre"
                  placeholder="Ej. Hamburguesa Doble"
                  value={platillo.nombre}
                  onChange={handleChange}
                />
            </div>

            <div className="crud-input-group">
                <label className="crud-label">Precio</label>
                <input
                  className="crud-input"
                  type="number"
                  name="precio"
                  placeholder="0.00"
                  value={platillo.precio}
                  onChange={handleChange}
                />
            </div>

            <div className="crud-input-group">
                <label className="crud-label">Categoría</label>
                <select
                  className="crud-select"
                  name="categoria"
                  value={platillo.categoria}
                  onChange={handleChange}
                >
                  <option value="">Selecciona...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
            </div>

            <button className="crud-btn-submit" onClick={handleSubmit}>
              {editIndex === null ? "Agregar Platillo" : "Guardar Cambios"}
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="crud-table-card">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {platillos.length > 0 ? (
                platillos.map((p, index) => (
                  <tr key={p.id}>
                    <td><strong>{p.nombre}</strong></td>
                    <td>${Number(p.precio).toFixed(2)}</td>
                    <td>{p.categoria || catMap[p.categoria_id] || "Sin categoría"}</td>
                    <td>
                      <div className="crud-actions">
                        <button className="crud-btn-action crud-btn-edit" onClick={() => handleEdit(index)}>
                          Editar
                        </button>
                        <button className="crud-btn-action crud-btn-delete" onClick={() => handleDelete(index)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="crud-no-data">
                    No hay platillos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CRUDPlatillos;