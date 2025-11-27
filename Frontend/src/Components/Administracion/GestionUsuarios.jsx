import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./styles/GestionUsuarios.css";

function GestionUsuarios() {
    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editandoId, setEditandoId] = useState(null);
    const [eliminandoId, setEliminandoId] = useState(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    async function cargarUsuarios() {
        setCargando(true);
        setError("");
        try {
            const { data } = await api.get("/usuarios");
            setUsuarios(data || []);
        } catch (err) {
            setError("No se pudieron cargar los usuarios");
        } finally {
            setCargando(false);
        }
    }

    async function cambiarRol(id, rolActual) {
        if (rolActual === "administrador") return;

        const nuevoRol = rolActual === "mesero" ? "cocina" : "mesero";
        
        setEditandoId(id);
        try {
            await api.put(`/usuarios/${id}`, { rol: nuevoRol });
            
            setUsuarios(prev => 
                prev.map(u => u.id === id ? { ...u, rol: nuevoRol } : u)
            );
        } catch (err) {
            alert("Hubo un problema al cambiar el rol");
        } finally {
            setEditandoId(null);
        }
    }

    async function eliminarUsuario(id, rolActual) {
        if (rolActual === "administrador") return;

        if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

        setEliminandoId(id);
        try {
            await api.delete(`/usuarios/${id}`);
            
            setUsuarios(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            alert("Hubo un problema al eliminar el usuario");
        } finally {
            setEliminandoId(null);
        }
    }

    async function toggleActivo(id, activoActual, rolActual) {
        if (rolActual === "administrador") return;

        setEditandoId(id);
        try {
            await api.put(`/usuarios/${id}`, { activo: !activoActual });
            
            setUsuarios(prev => 
                prev.map(u => u.id === id ? { ...u, activo: !activoActual } : u)
            );
        } catch (err) {
            alert("Hubo un problema al cambiar el estado");
        } finally {
            setEditandoId(null);
        }
    }

    if (cargando) {
        return (
            <div className="usuarios-page">
                <div className="usuarios-loading">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className="usuarios-page">
            <header className="usuarios-header">
                <h1 className="usuarios-logo">👤 Gestión de Usuarios</h1>
                <nav className="usuarios-nav">
                    <button onClick={() => navigate("/registro-admin")} className="usuarios-nav-btn">
                        + Admin
                    </button>
                    <button onClick={() => navigate("/registro")} className="usuarios-nav-btn">
                        + Personal
                    </button>
                </nav>
            </header>

            <div className="usuarios-main">
                <div className="usuarios-title-section">
                    <p className="usuarios-subtitle">Administra los roles y accesos del personal del restaurante.</p>
                </div>

                {error && (
                    <div className="usuarios-error">{error}</div>
                )}

                <div className="usuarios-table-card">
                    <table className="usuarios-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Identificador</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="usuarios-no-data">
                                        No hay usuarios registrados
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map(usuario => (
                                    <tr key={usuario.id} className={!usuario.activo ? "usuarios-row-inactive" : ""}>
                                        <td><strong>{usuario.nombre}</strong></td>
                                        <td>{usuario.identificador}</td>
                                        <td>
                                            <span className={`usuarios-badge badge-role-${usuario.rol}`}>
                                                {usuario.rol === "administrador" ? "Administrador" :
                                                 usuario.rol === "mesero" ? "Mesero" : "Cocinero"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`usuarios-badge badge-status-${usuario.activo ? "active" : "inactive"}`}>
                                                {usuario.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td>
                                            {usuario.rol === "administrador" ? (
                                                <span style={{color: '#95A5A6', fontSize: '0.9rem'}}>No editable</span>
                                            ) : (
                                                <div className="usuarios-actions">
                                                    <button
                                                        className="usuarios-btn-action btn-role"
                                                        onClick={() => cambiarRol(usuario.id, usuario.rol)}
                                                        disabled={editandoId === usuario.id || !usuario.activo}
                                                        title="Cambiar Rol"
                                                    >
                                                        {editandoId === usuario.id ? "..." : (usuario.rol === "mesero" ? "A Cocina" : "A Mesero")}
                                                    </button>
                                                    <button
                                                        className="usuarios-btn-action btn-toggle"
                                                        onClick={() => toggleActivo(usuario.id, usuario.activo, usuario.rol)}
                                                        disabled={editandoId === usuario.id}
                                                        title={usuario.activo ? "Desactivar cuenta" : "Activar cuenta"}
                                                    >
                                                        {editandoId === usuario.id ? "..." : (usuario.activo ? "Desactivar" : "Activar")}
                                                    </button>
                                                    <button
                                                        className="usuarios-btn-action btn-delete"
                                                        onClick={() => eliminarUsuario(usuario.id, usuario.rol)}
                                                        disabled={eliminandoId === usuario.id}
                                                        title="Eliminar usuario permanentemente"
                                                    >
                                                        {eliminandoId === usuario.id ? "..." : "Eliminar"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="usuarios-footer">
                    <span>Total de usuarios: <strong>{usuarios.length}</strong> ({usuarios.filter(u => u.activo).length} activos)</span>
                    <span style={{fontStyle: 'italic'}}>* Usuarios inactivos no pueden acceder al sistema</span>
                </div>
            </div>
        </div>
    );
}

export default GestionUsuarios;