import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos"; // vista simulada
import PedidosActivos from "./Components/Pedidos"; // para cuando la agregues
import "./App.css"

function App() {
  return (

      <Routes>
        <Route path="/" element={<SelectorMesa />} />
        <Route path="/alimentos/:id" element={<PaginaAlimentos />} />
        <Route path="/pedidos" element={<PedidosActivos />} />
      </Routes>
  );
}

export default App;
