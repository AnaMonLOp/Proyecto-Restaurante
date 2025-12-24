import express from "express";
import cors from "cors";
import supabase from "./config/dataBase.js";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ mensaje: "Backend funcionando correctamente" });
});

// 🔹 Obtener cuentas completas por mesa
app.get("/cuentas", async(req, res) => {
    try {
        const { data, error } = await supabase
            .from("pedidos")
            .select(`
        id,
        mesa_id,
        estado,
        detalle_pedido (
          cantidad,
          precio_unitario,
          subtotal,
          items_menu ( nombre )
        )
      `);

        if (error) throw error;

        const cuentas = data.map((p) => {
            const total = p.detalle_pedido.reduce((acc, item) => acc + item.subtotal, 0);
            return {
                id: p.id,
                mesa: p.mesa_id,
                estado: p.estado,
                total,
                platillos: p.detalle_pedido.map((d) => ({
                    nombre: d.items_menu.nombre,
                    cantidad: d.cantidad,
                    precio: d.precio_unitario,
                    subtotal: d.subtotal,
                })),
            };
        });

        res.status(200).json(cuentas);
    } catch (error) {
        console.error("Error al obtener cuentas:", error);
        res.status(500).json({ mensaje: "Error al obtener cuentas" });
    }
});

app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});