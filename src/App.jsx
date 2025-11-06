import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CRUDPlatillos from "./Components/CRUDPlatillos";
import SelectorMesa from "./Components/SelectorMesa";
import PaginaAlimentos from "./Components/PaginaAlimentos";
import PedidosActivos from "./Components/Pedidos";
import PantallaCocina from "./Components/PantallaCocina";
import "./App.css";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<SelectorMesa />} />
        <Route path="/alimentos/:id" element={<PaginaAlimentos />} />
        <Route path="/pedidos" element={<PedidosActivos />} />
        <Route path="/pantallaCocina" element={<PantallaCocina />} />
        <Route path="/CRUDPlatillos" element={<CRUDPlatillos />} />
      </Routes>
  );
}

export default App;
