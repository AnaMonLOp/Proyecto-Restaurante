import supabase from "../config/dataBase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({
      mensaje: "Identificador y contraseña son obligatorios",
    });
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("identificador", identificador)
      .eq("activo", true);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const usuario = data[0];

    if (usuario.password !== password) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas",
      });
    }

    const { password: _, ...usuarioSinPassword } = usuario;

    const token = jwt.sign(
      {
        id: usuario.id,
        identificador: usuario.identificador,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      usuario: usuarioSinPassword,
      token: token,
    });
  } catch (error) {
    console.error("Error en login:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
};

export const registro = async (req, res) => {
  const { identificador, password, nombre, rol } = req.body;

  if (!identificador || !password || !nombre || !rol) {
    return res.status(400).json({
      mensaje: "Identificador, password, nombre y rol son obligatorios",
    });
  }

  const rolesValidos = ["administrador", "mesero", "cocina"];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({
      mensaje: "Rol inválido. Debe ser: administrador, mesero o cocina",
    });
  }

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ identificador, password, nombre, rol }])
      .select("id, identificador, nombre, rol, activo, created_at");

    if (error) throw error;

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      usuario: data[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        mensaje: "El identificador ya existe",
      });
    }
    console.error("Error al registrar usuario:", error.message);
    res.status(500).json({ mensaje: error.message });
  }
};
