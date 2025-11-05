const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const puerto = 3001;

app.use(cors());
app.use(express.json());

// conexion a la base de datos
const db = mysql.createPool({
    host: process.env.MYSQLHOST, 
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT 
}).promise();

// obtener todos los platillos
app.get('/api/platillos', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM platillos");
        res.json(rows);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al obtener platillos" });
    }
});

// crear platillo
app.post('/api/platillos', async (req, res) => {
    const { nombre, descripcion, precio } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ mensaje: "Faltan datos" });
    }
    
    try {
        const query = "INSERT INTO platillos (nombre, descripcion, precio) VALUES (?, ?, ?)";
        const [result] = await db.query(query, [nombre, descripcion, precio]);
        
        res.status(201).json({ 
            id: result.insertId, 
            mensaje: "Platillo creado" 
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al crear el platillo" });
    }
});

// actualizar platillo
app.put('/api/platillos/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ mensaje: "Faltan datos" });
    }
    
    try {
        const [result] = await db.query(
            "UPDATE platillos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?",
            [nombre, descripcion, precio, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "No se encontro el platillo" });
        }
        
        res.json({ mensaje: "Platillo actualizado" });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
});

// eliminar platillo
app.delete('/api/platillos/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const [result] = await db.query("DELETE FROM platillos WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Platillo no encontrado" });
        }
        
        res.json({ mensaje: "Platillo eliminado" });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al eliminar" });
    }
});



// obtener pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM pedidos ORDER BY fecha_creacion ASC");
        res.json(rows);
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al obtener pedidos" });
    }
});

// crear pedido
app.post('/api/pedidos', async (req, res) => {
    const { id_mesa, total } = req.body;

    if (!id_mesa || !total) {
        return res.status(400).json({ mensaje: "Faltan datos del pedido" });
    }
    
    try {
        const query = "INSERT INTO pedidos (id_mesa, total, estado) VALUES (?, ?, ?)";
        const [result] = await db.query(query, [id_mesa, total, 'pendiente']);
        
        res.status(201).json({ 
            id: result.insertId, 
            mensaje: "Pedido creado" 
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ mensaje: "Error al crear pedido" });
    }
});


app.listen(puerto, () => {
    console.log(`Servidor corriendo en puerto ${puerto}`); 
});