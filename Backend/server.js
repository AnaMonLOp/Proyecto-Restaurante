import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta base para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
