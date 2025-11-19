import { useEffect, useState } from "react";
import api from "../api/axios";
import "./GestionUsuarios.css";

function GestionUsuarios() {
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
            console.log("Usuarios cargados desde backend:", data);
            console.log("¿Existe mesero06?", data.find(u => u.identificador === "mesero06"));
            setUsuarios(data || []);
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
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
            console.error("Error al cambiar rol:", err);
            alert("No se pudo cambiar el rol. Intenta de nuevo");
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
            console.error("Error al eliminar usuario:", err);
            alert("No se pudo eliminar el usuario. Intenta de nuevo");
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
            console.error("Error al cambiar estado:", err);
            alert("No se pudo cambiar el estado. Intenta de nuevo");
        } finally {
            setEditandoId(null);
        }
    }

    if (cargando) {
        return (
            <div className="gestion-container">
                <div className="cargando">Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div className="gestion-container">
            <div className="gestion-header">
                <h1>Gestión de Usuarios</h1>
                <p className="subtitulo">Administra los roles del personal</p>
            </div>

            {error && (
                <div className="mensaje-error">{error}</div>
            )}

            <div className="tabla-wrapper">
                <table className="tabla-usuarios">
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
                                <td colSpan="5" className="sin-datos">
                                    No hay usuarios registrados
                                </td>
                            </tr>
                        ) : (
                            usuarios.map(usuario => (
                                <tr key={usuario.id} className={!usuario.activo ? "usuario-inactivo" : ""}>
                                    <td>{usuario.nombre}</td>
                                    <td>{usuario.identificador}</td>
                                    <td>
                                        <span className={`badge-rol ${usuario.rol}`}>
                                            {usuario.rol === "administrador" ? "Administrador" :
                                             usuario.rol === "mesero" ? "Mesero" : "Cocinero"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge-estado ${usuario.activo ? "activo" : "inactivo"}`}>
                                            {usuario.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td>
                                        {usuario.rol === "administrador" ? (
                                            <span className="texto-bloqueado">
                                                No editable
                                            </span>
                                        ) : (
                                            <div className="acciones-botones">
                                                <button
                                                    className="btn-cambiar"
                                                    onClick={() => cambiarRol(usuario.id, usuario.rol)}
                                                    disabled={editandoId === usuario.id || !usuario.activo}
                                                >
                                                    {editandoId === usuario.id ? (
                                                        "Cambiando..."
                                                    ) : (
                                                        <>
                                                            Cambiar a {usuario.rol === "mesero" ? "Cocinero" : "Mesero"}
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    className={usuario.activo ? "btn-desactivar" : "btn-activar"}
                                                    onClick={() => toggleActivo(usuario.id, usuario.activo, usuario.rol)}
                                                    disabled={editandoId === usuario.id}
                                                >
                                                    {editandoId === usuario.id ? "Procesando..." : (usuario.activo ? "Desactivar" : "Activar")}
                                                </button>
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => eliminarUsuario(usuario.id, usuario.rol)}
                                                    disabled={eliminandoId === usuario.id}
                                                >
                                                    {eliminandoId === usuario.id ? "Eliminando..." : "Eliminar"}
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

            <div className="info-footer">
                <p>Total de usuarios: <strong>{usuarios.length}</strong> ({usuarios.filter(u => u.activo).length} activos)</p>
                <p className="nota">
                    * Los usuarios inactivos no pueden iniciar sesión
                </p>
            </div>
        </div>
    );
}

export default GestionUsuarios;
