import { useMemo, useState } from "react";
import api from "../api/axios";
import "./RegistroUsuario.css";

function validarEmail(valor) {
    const re = /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:(?:[a-zA-Z0-9-])+\.)+[a-zA-Z]{2,}$/;
    return re.test(String(valor).toLowerCase());
}

function RegistroUsuario() {
    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        password: "",
        rol: "",
    });
    const [touched, setTouched] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorServidor, setErrorServidor] = useState("");
    const [exito, setExito] = useState(false);

    const errores = useMemo(() => {
        const e = {};
        if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
        else if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";

        if (!form.correo.trim()) e.correo = "El correo es obligatorio";
        else if (!validarEmail(form.correo)) e.correo = "Formato de correo inválido";

        if (!form.password) e.password = "La contraseña es obligatoria";
        else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";

        if (!form.rol) e.rol = "Selecciona un rol";
        return e;
    }, [form]);

    const esValido = useMemo(() => Object.keys(errores).length === 0, [errores]);

    function actualizar(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setTouched({ nombre: true, correo: true, password: true, rol: true });
        setErrorServidor("");
        setExito(false);
        if (!esValido) return;
        setEnviando(true);
        try {
        const payload = {
            nombre: form.nombre,
            correo: form.correo,
            contrasena: form.password,
            rol: form.rol,
        };
        await api.post("/usuarios", payload);
        setExito(true);
        setForm({ nombre: "", correo: "", password: "", rol: "" });
        setTouched({});
        } catch (err) {
        if (err?.response?.status === 409) {
            setErrorServidor("El correo ya está registrado");
        } else {
            setErrorServidor("No se pudo registrar. Intenta de nuevo");
        }
        } finally {
        setEnviando(false);
        }
    }

    return (
        <div className="registro-page">
        <div className="registro-card">
            <h2 className="registro-title">Registrar usuario</h2>
            <p className="registro-subtitle">Crea una cuenta para el sistema</p>

            <form onSubmit={onSubmit} noValidate>
            <div className="form-grid">
                <div className="field">
                <label className="label" htmlFor="nombre">Nombre</label>
                <input
                    id="nombre"
                    className="input"
                    type="text"
                    placeholder="Nombre y apellidos"
                    value={form.nombre}
                    onChange={(e) => actualizar("nombre", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                    autoComplete="name"
                />
                {touched.nombre && errores.nombre && (
                    <span className="error-text">{errores.nombre}</span>
                )}
                </div>

                <div className="field">
                <label className="label" htmlFor="correo">Correo</label>
                <input
                    id="correo"
                    className="input"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={form.correo}
                    onChange={(e) => actualizar("correo", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, correo: true }))}
                    autoComplete="email"
                />
                {touched.correo && errores.correo && (
                    <span className="error-text">{errores.correo}</span>
                )}
                </div>

                <div className="field">
                <label className="label" htmlFor="password">Contraseña</label>
                <input
                    id="password"
                    className="input"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => actualizar("password", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    autoComplete="new-password"
                />
                {touched.password && errores.password && (
                    <span className="error-text">{errores.password}</span>
                )}
                </div>

                <div className="field">
                <label className="label" htmlFor="rol">Rol</label>
                <select
                    id="rol"
                    className="select"
                    value={form.rol}
                    onChange={(e) => actualizar("rol", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, rol: true }))}
                >
                    <option value="" disabled>
                    Selecciona un rol
                    </option>
                    <option value="Mesero">Mesero</option>
                    <option value="Cocinero">Cocinero</option>
                </select>
                {touched.rol && errores.rol && (
                    <span className="error-text">{errores.rol}</span>
                )}
                </div>

                {errorServidor ? (
                <div className="server-error">{errorServidor}</div>
                ) : null}

                {exito ? (
                <div className="success-box">Usuario registrado correctamente</div>
                ) : null}

                <div className="actions">
                <button className="btn-primary" type="submit" disabled={!esValido || enviando}>
                    {enviando ? "Registrando…" : "Registrar"}
                </button>
                <button
                    className="btn-secondary"
                    type="button"
                    onClick={() => {
                    setForm({ nombre: "", correo: "", password: "", rol: "" });
                    setTouched({});
                    setErrorServidor("");
                    setExito(false);
                    }}
                >
                    Limpiar
                </button>
                </div>
            </div>
            </form>
        </div>
        </div>
    );
}

export default RegistroUsuario;
