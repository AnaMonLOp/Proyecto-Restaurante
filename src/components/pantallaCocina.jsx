import React from "react";
import "../index.css"; // usamos tu único CSS

const PantallaCocina = () => {
  const ordenes = [
    {
      id: 1024,
      mesa: "Mesa 5",
      tiempo: "Hace 2 min",
      items: [
        "2x Hamburguesa Clásica — Sin tomate, extra queso",
        "1x Ensalada César",
        "1x Papas Fritas",
      ],
      tipo: "normal",
    },
    {
      id: 1023,
      mesa: "Para llevar",
      tiempo: "Hace 8 min",
      items: ["1x Pizza Pepperoni", "2x Refresco de Cola"],
      tipo: "alerta",
    },
    {
      id: 1021,
      mesa: "Mesa 2",
      tiempo: "Hace 15 min",
      items: [
        "1x Sopa de Tortilla",
        "1x Tacos al Pastor (3) — Alergia a frutos secos",
        "1x Agua de Horchata",
      ],
      tipo: "critica",
    },
    {
      id: 1025,
      mesa: "Para llevar",
      tiempo: "Hace 1 min",
      items: ["2x Club Sandwich", "1x Sopa del día"],
      tipo: "normal",
    },
  ];

  const getClasses = (tipo) => {
    if (tipo === "alerta") return "orden alerta";
    if (tipo === "critica") return "orden critica";
    return "orden normal";
  };

  return (
    <div className="pantalla-cocina">
      <header className="encabezado">
        <div className="titulo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#13ec13"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 14v1a6 6 0 1 0 12 0v-9a3 3 0 0 1 6 0" />
            <path d="M9 16c-.663 0 -1.3 -.036 -1.896 -.102l-.5 -.064c-2.123 -.308 -3.604 -1.013 -3.604 -1.834c0 -.82 1.482 -1.526 3.603 -1.834l.5 -.064a17.27 17.27 0 0 1 1.897 -.102c.663 0 1.3 .036 1.896 .102l.5 .064c2.123 .308 3.604 1.013 3.604 1.834c0 .82 -1.482 1.526 -3.603 1.834l-.5 .064a17.27 17.27 0 0 1 -1.897 .102z" />
          </svg>
          <h1>Órdenes de Cocina Pendientes</h1>
        </div>
        <div className="filtros">
          <button className="activo">Todos</button>
          <button>Para llevar</button>
          <button>Salón</button>
        </div>
      </header>

      <main className="grid">
        {ordenes.map((orden) => (
          <div key={orden.id} className={getClasses(orden.tipo)}>
            <div className="cabecera">
              <div>
                <p className="orden-id">Orden #{orden.id}</p>
                <p className="mesa">{orden.mesa}</p>
              </div>
              <p className="tiempo">{orden.tiempo}</p>
            </div>

            <div className="contenido">
              {orden.items.map((item, i) => (
                <p key={i}>{item}</p>
              ))}
            </div>

            <div className="pie">
              <button>Marcar Orden como Lista</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default PantallaCocina;
