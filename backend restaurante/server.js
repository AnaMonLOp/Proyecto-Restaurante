import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 🔹 Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",        // <-- cámbialo si usas otro usuario
  password: "Gordito1705",        // <-- pon tu contraseña de MySQL si tienes una
  database: "restaurante_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a la base de datos MySQL");
});

// 📋 Obtener todos los platillos
app.get("/platillos", (req, res) => {
  db.query("SELECT * FROM platillos", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

// ➕ Agregar platillo
app.post("/platillos", (req, res) => {
  const { nombre, precio, categoria } = req.body;
  db.query(
    "INSERT INTO platillos (nombre, precio, categoria) VALUES (?, ?, ?)",
    [nombre, precio, categoria],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ id: result.insertId, nombre, precio, categoria });
    }
  );
});

// ✏️ Actualizar platillo
app.put("/platillos/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria } = req.body;
  db.query(
    "UPDATE platillos SET nombre=?, precio=?, categoria=? WHERE id=?",
    [nombre, precio, categoria, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ id, nombre, precio, categoria });
    }
  );
});

// ❌ Eliminar platillo
app.delete("/platillos/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM platillos WHERE id=?", [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(204);
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
