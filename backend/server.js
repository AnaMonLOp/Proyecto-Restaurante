import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { verificarToken, verificarRol } from "./middlewares/auth.js";

// CONTROLADORES
import { login, registro } from "./controllers/authController.js";
import {
  obtenerPlatillos,
  crearPlatillo,
  actualizarPlatillo,
  eliminarPlatillo,
} from "./controllers/platillosController.js";
import {
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
} from "./controllers/categoriasController.js";
import {
  obtenerPedidos,
  crearPedido,
  actualizarPedido,
  obtenerDetallesPedidos,
  obtenerDetallePorId,
  obtenerDetallePorPedidoId,
  obtenerPedidosPorMesa,
  actualizarEstadoPedidosPorMesa,
} from "./controllers/pedidosController.js";
import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
} from "./controllers/mesasController.js";
import {
  obtenerUsuarios,
  obtenerMeseros,
  obtenerCocina,
  obtenerAdministradores,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "./controllers/usuariosController.js";
import {
  obtenerCuentas,
  obtenerCuentaPorPedido,
  crearCuenta,
  actualizarCuenta,
} from "./controllers/cuentasController.js";
import { generarReporte } from "./controllers/reportesController.js";

dotenv.config();

const app = express();
const puerto = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// AUTENTICACIÓN
app.post("/api/auth/login", login);
app.post("/api/auth/registro", registro);

// PLATILLOS
app.get("/api/platillos", verificarToken, obtenerPlatillos);
app.post("/api/platillos", verificarToken, crearPlatillo);
app.put("/api/platillos/:id", verificarToken, actualizarPlatillo);
app.delete("/api/platillos/:id", verificarToken, eliminarPlatillo);

// CATEGORIAS
app.get("/api/categorias", verificarToken, obtenerCategorias);
app.post("/api/categorias", verificarToken, crearCategoria);
app.put("/api/categorias/:id", verificarToken, actualizarCategoria);

// PEDIDOS
app.get("/api/pedidos", verificarToken, obtenerPedidos);
app.post("/api/pedidos", verificarToken, crearPedido);
app.put("/api/pedidos/:id", verificarToken, actualizarPedido);

// Detalles de pedidos
app.get("/api/pedidos/detalles", verificarToken, obtenerDetallesPedidos);
app.get("/api/pedidos/detalles/:id", verificarToken, obtenerDetallePorId);
app.get(
  "/api/pedidos/detallespedido/:id",
  verificarToken,
  obtenerDetallePorPedidoId
);

// Pedidos por mesa
app.get("/api/pedidos/mesa/:numero", verificarToken, obtenerPedidosPorMesa);
app.put(
  "/api/pedidos/mesa/:numero/estado",
  verificarToken,
  actualizarEstadoPedidosPorMesa
);

// MESAS
app.get("/api/mesas", verificarToken, obtenerMesas);
app.post("/api/mesas", verificarToken, crearMesa);
app.put("/api/mesas/:id", verificarToken, actualizarMesa);

// USUARIOS
app.get("/api/usuarios", verificarToken, obtenerUsuarios);
app.get("/api/usuarios/meseros", verificarToken, obtenerMeseros);
app.get("/api/usuarios/cocina", verificarToken, obtenerCocina);
app.get(
  "/api/usuarios/administradores",
  verificarToken,
  obtenerAdministradores
);
app.post(
  "/api/usuarios",
  verificarToken,
  verificarRol("administrador"),
  crearUsuario
);
app.put(
  "/api/usuarios/:id",
  verificarToken,
  verificarRol("administrador"),
  actualizarUsuario
);
app.delete(
  "/api/usuarios/:id",
  verificarToken,
  verificarRol("administrador"),
  eliminarUsuario
);

// CUENTAS
app.get("/api/cuentas", verificarToken, obtenerCuentas);
app.get(
  "/api/cuentas/pedido/:pedido_id",
  verificarToken,
  obtenerCuentaPorPedido
);
app.post("/api/cuentas", verificarToken, crearCuenta);
app.put("/api/cuentas/:id", verificarToken, actualizarCuenta);

// REPORTESS
app.get("/api/reportes", verificarToken, generarReporte);

// INICIAR EL SERVIDOR 
app.listen(puerto, () => {
  console.log(`Servidor corriendo en puerto ${puerto}`);
});
