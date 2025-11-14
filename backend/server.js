import express from 'express';
import cors from 'cors';
import supabase from './config/dataBase.js';

const app = express();
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
        const { data: pedidoData, error: pedidoError } = await supabase
            .from('pedidos')
            .insert([{ mesa_id: mesa_id, mesero_id: mesero_id, estado: 'pendiente' }])
            .select()
            .single();

        if (pedidoError) throw pedidoError;

        const itemsParaInsertar = platillos.map(item => ({
            pedido_id: pedidoData.id,
            item_menu_id: item.platillo_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario || 0,
            subtotal: (item.cantidad || 0) * (item.precio_unitario || 0),
            notas_item: item.notas_item || null,
        }));

        const { error: detalleError } = await supabase.from('detalle_pedido').insert(itemsParaInsertar);

        if (detalleError) throw detalleError;

        res.status(201).json({ mensaje: "Pedido creado", pedido: pedidoData });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// actualizar estado del pedido
app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        const { data: pedidoActual, error: errorPedido } = await supabase
        .from('pedidos')
        .select('estado')
        .eq('id', id)
        .single();

        if (errorPedido) throw errorPedido;
        if (!pedidoActual) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        const estadoActual = pedidoActual.estado;
        const transicionesValidas = {
            pendiente: ['en_preparacion', 'cancelado'],
            en_preparacion: ['listo', 'cancelado'],
            listo: ['entregado', 'cancelado'],
            entregado: [],
            cancelado: [],
        };

        if (!transicionesValidas[estadoActual].includes(estado)) {
        return res
            .status(400)
            .json({ mensaje: `Transición no válida de '${estadoActual}' a '${estado}'` });
        }

        const camposActualizar = {
            estado,
            updated_at: new Date().toISOString(),
        };

        if (estado === 'listo') {
            camposActualizar.fecha_listo = new Date().toISOString();
        } else if (estado === 'entregado') {
            camposActualizar.fecha_entregado = new Date().toISOString();
        }

        const { data: pedidoActualizado, error: errorUpdate } = await supabase
            .from('pedidos')
            .update(camposActualizar)
            .eq('id', id)
            .select()
            .single();

        if (errorUpdate) throw errorUpdate;

        res.status(200).json({
            mensaje: 'Estado actualizado correctamente',
            pedido: pedidoActualizado,
        });
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

//-----------------------------------
//-------- Cuentas APIs
//-----------------------------------

// calcular y guardar cuenta con propina
app.post('/api/cuentas', async (req, res) => {
    const { pedido_id, porcentaje_propina = 10, metodo_pago } = req.body;

    if (!pedido_id) {
        return res.status(400).json({ mensaje: "El pedido_id es obligatorio" });
    }

    try {
        // información del pedido
        const { data: pedido, error: pedidoError } = await supabase
            .from('pedidos')
            .select('id, mesa_id, mesero_id, total')
            .eq('id', pedido_id)
            .single();

        if (pedidoError) throw pedidoError;
        if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }

        // Calcular propina y total
        const subtotal = pedido.total || 0;
        const propina = (subtotal * porcentaje_propina) / 100;
        const total = subtotal + propina;

        const { data: cuenta, error: cuentaError } = await supabase
            .from('cuentas')
            .insert([{
                pedido_id: pedido.id,
                mesa_id: pedido.mesa_id,
                mesero_id: pedido.mesero_id,
                subtotal: parseFloat(subtotal.toFixed(2)),
                propina: parseFloat(propina.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                metodo_pago: metodo_pago || null,
                estado: metodo_pago ? 'pagada' : 'pendiente',
                fecha_pago: metodo_pago ? new Date().toISOString() : null
            }])
            .select()
            .single();

        if (cuentaError) throw cuentaError;

        res.status(201).json({
            mensaje: "Cuenta creada exitosamente",
            cuenta: {
                id: cuenta.id,
                pedido_id: cuenta.pedido_id,
                subtotal: cuenta.subtotal,
                propina: cuenta.propina,
                total: cuenta.total,
                metodo_pago: cuenta.metodo_pago,
                estado: cuenta.estado
            }
        });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// Temporal para pruebas del endpoint reportes
app.get('/api/cuentas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('cuentas')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ mensaje: err.message });
    }
});


//-----------------------------------
//-------- REPORTES APIs
//-----------------------------------
app.get('/api/reportes', async (req, res) => {
    const { fecha } = req.query;

    if (!fecha) {
        return res.status(400).json({ mensaje: "La fecha es obligatoria (YYYY-MM-DD)" });
    }

    try {
        // Obtener cuentas pagadas del día
        const { data: cuentas, error } = await supabase
            .from('cuentas')
            .select('id, total')
            .eq('estado', 'pagada')
            .gte('fecha_pago', `${fecha} 00:00:00`)
            .lte('fecha_pago', `${fecha} 23:59:59`);

        if (error) throw error;

        const total_pedidos = cuentas.length;
        const monto_total = cuentas.reduce((acumulador, dato) => acumulador + Number(dato.total), 0);
        const promedio = total_pedidos > 0 ? monto_total / total_pedidos : 0;

        res.status(200).json({
            fecha,
            total_pedidos,
            monto_total_vendido: Number(monto_total.toFixed(2)),
            promedio_por_pedido: Number(promedio.toFixed(2)),
        });
    } catch (err) {
        res.status(500).json({ mensaje: err.message });
    }
});

const puerto = process.env.PORT || 3001;
app.listen(puerto, () => {
    console.log(`Servidor corriendo en puerto ${puerto}`);
});