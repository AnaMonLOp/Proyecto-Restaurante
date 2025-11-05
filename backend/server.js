import express from 'express';
import cors from 'cors';
import supabase from './config/dataBase.js';

const app = express();
const puerto = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

//-----------------------------------
//-------- Platillos APIs
//-----------------------------------

// obtener todos los platillos
app.get('/api/platillos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('items_menu').select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// crear platillo
app.post('/api/platillos', async (req, res) => { 
    const { nombre, descripcion, precio, categoria_id } = req.body;
    if (!nombre || !precio) {
        return res.status(400).json({ mensaje: "Nombre y precio son obligatorios" });
    }
    try {
        const { data, error } = await supabase
            .from('items_menu').insert([{ nombre, descripcion, precio, categoria_id }]).select();

        if (error) throw error;
        res.status(201).json({ mensaje: "Platillo creado", platillo: data[0] });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// actualizar platillo
app.put('/api/platillos/:id', async (req, res) => {
    const idPlatillo = req.params.id;
    const { nombre, descripcion, precio, categoria_id } = req.body;

    if (!nombre || !precio) {
        return res.status(400).json({ mensaje: "Faltan datos" });
    }
    try {
        const { data, error } = await supabase.from('items_menu').update({ nombre, descripcion, precio, categoria_id }).eq('id', idPlatillo); 

        if (error) throw error;
        res.status(200).json({ mensaje: "Platillo actualizado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// eliminar platillo
app.delete('/api/platillos/:id', async (req, res) => {
    const idPlatillo = req.params.id;
    try {
        const { data, error } = await supabase.from('items_menu').delete().eq('id', idPlatillo);

        if (error) throw error;
        res.status(200).json({ mensaje: "Platillo eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//-----------------------------------
//-------- Categorías APIs
//-----------------------------------

// obtener categorias
app.get('/api/categorias', async (req, res) => {
    try {
        const { data, error } = await supabase.from('categorias_menu').select('*'); 

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error("Error al consultar categorías:", error.message);
        res.status(500).json({ mensaje: error.message });
    }
});

// crear categoria
app.post('/api/categorias', async (req, res) => {
    const { nombre, descripcion } = req.body; 

    if (!nombre) {
        return res.status(400).json({ mensaje: "El nombre es obligatorio" });
    }
    try {
        const { data, error } = await supabase
            .from('categorias_menu').insert([ { nombre, descripcion } ]).select().single();

        if (error) throw error;
        res.status(201).json({ mensaje: "Categoría creada", categoria: data });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});


//-----------------------------------
//-------- Pedidos APIs
//-----------------------------------

// obtener pedidos
app.get('/api/pedidos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('pedidos') .select('*').order('fecha_pedido', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// crear pedido
app.post('/api/pedidos', async (req, res) => {
    const { mesa_id, mesero_id, platillos } = req.body;
    
    if (!mesa_id || !platillos || platillos.length === 0) {
        return res.status(400).json({ mensaje: "Faltan mesa_id o platillos" });
    }

    try {
        const { data: pedidoData, error: pedidoError } = await supabase.from('pedidos').insert([{ mesa_id: mesa_id, mesero_id: mesero_id, estado: 'pendiente' }])
        .select().single();

        if (pedidoError) throw pedidoError;
        const nuevoPedidoId = pedidoData.id;

        const itemsParaInsertar = platillos.map(item => ({
            pedido_id: nuevoPedidoId,
            item_menu_id: item.item_menu_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.cantidad * item.precio_unitario
        }));

        const { error: detalleError } = await supabase.from('detalle_pedido').insert(itemsParaInsertar);

        if (detalleError) throw detalleError;
        
        

        res.status(201).json({ mensaje: "Pedido creado", pedido: pedidoData });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//-----------------------------------
//-------- Mesas APIs
//-----------------------------------

app.get('/api/mesas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('mesas').select('*').eq('activa', true);

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

//-----------------------------------
//-------- Meseros APIs
//-----------------------------------

app.get('/api/usuarios/meseros', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('usuarios').select('id, nombre').eq('rol', 'mesero');

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});



app.listen(puerto, () => {
    console.log(`Servidor corriendo en puerto ${puerto}`); 
});