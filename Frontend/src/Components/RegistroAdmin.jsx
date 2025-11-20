import { useMemo, useState } from "react";
import api from "../api/axios";
import "./RegistroUsuario.css";

function RegistroAdmin() {
    const [form, setForm] = useState({
        nombre: "",
        identificador: "",
        password: "",
    });
    const [touched, setTouched] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [errorServidor, setErrorServidor] = useState("");
    const [exito, setExito] = useState(false);

    const errores = useMemo(() => {
        const e = {};
        if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
        else if (form.nombre.trim().length < 2) e.nombre = "Mínimo 2 caracteres";

        if (!form.identificador.trim()) e.identificador = "El identificador es obligatorio";
        else if (form.identificador.trim().length < 3) e.identificador = "Mínimo 3 caracteres";

        if (!form.password) e.password = "La contraseña es obligatoria";
        else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";

        return e;
    }, [form]);

    const esValido = useMemo(() => Object.keys(errores).length === 0, [errores]);

    function actualizar(campo, valor) {
        setForm((f) => ({ ...f, [campo]: valor }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setTouched({ nombre: true, identificador: true, password: true });
        setErrorServidor("");
        setExito(false);
        if (!esValido) return;
        setEnviando(true);
        try {
            const payload = {
                identificador: form.identificador,
                password: form.password,
                nombre: form.nombre,
                rol: "administrador",
            };
            await api.post("/auth/registro", payload);
            setExito(true);
            setForm({ nombre: "", identificador: "", password: "" });
            setTouched({});
        } catch (err) {
            if (err?.response?.status === 409 || err?.response?.status === 400) {
                setErrorServidor("El identificador ya está registrado");
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
                <h2 className="registro-title">Registrar Administrador</h2>
                <p className="registro-subtitle">Crea una cuenta de administrador para el sistema</p>

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
                            <label className="label" htmlFor="identificador">Identificador</label>
                            <input
                                id="identificador"
                                className="input"
                                type="text"
                                placeholder="admin01, admin02"
                                value={form.identificador}
                                onChange={(e) => actualizar("identificador", e.target.value)}
                                onBlur={() => setTouched((t) => ({ ...t, identificador: true }))}
                                autoComplete="username"
                            />
                            {touched.identificador && errores.identificador && (
                                <span className="error-text">{errores.identificador}</span>
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

                        {errorServidor ? (
                            <div className="server-error">{errorServidor}</div>
                        ) : null}

                        {exito ? (
                            <div className="success-box">Administrador registrado correctamente</div>
                        ) : null}

                        <div className="actions">
                            <button className="btn-primary" type="submit" disabled={!esValido || enviando}>
                                {enviando ? "Registrando…" : "Registrar"}
                            </button>
                            <button
                                className="btn-secondary"
                                type="button"
                                onClick={() => {
                                    setForm({ nombre: "", identificador: "", password: "" });
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

export default RegistroAdmin;
