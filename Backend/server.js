import express from "express";
import cors from "cors";
import supabase from "./config/dataBase.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/test-db", async (req, res) => {
  try {
    // consulta simple a Supabase
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .limit(1);

    if (error) throw error;

    res.json({
      success: true,
      message: "Conexión exitosa",
      data: data,
    });
  } catch (error) {
    console.error("Error de conexión:", error);
    res.status(500).json({
      success: false,
      message: "Error en la conexión a Supabase",
      error: error.message,
    });
  }
});

// Ruta base para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.json({ message: "Servidor funcionando correctamente" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
