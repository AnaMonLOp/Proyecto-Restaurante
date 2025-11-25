import { useEffect, useState } from "react";

export default function ListaUsuarios({ endpoint, titulo }) {
  const [usuarios, setUsuarios] = useState([]);

  const token = localStorage.getItem("token"); // Usa el token del login

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch(`http://localhost:3001${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsuarios();
  }, [endpoint]);

  return (
    <div className="lista-container">
      <h2>{titulo}</h2>

      {usuarios.length === 0 ? (
        <p>No hay registros.</p>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Correo</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nombre}</td>
                <td>{u.rol}</td>
                <td>{u.correo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
