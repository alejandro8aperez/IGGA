import { useState, useEffect } from 'react';
import axios from 'axios';

function Tesoreria() {
    const [cuentas, setCuentas] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ cuenta: '', monto: '', tipo: 'debito', descripcion: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cuentasRes, transRes] = await Promise.all([
                    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/cuentas/'),
                    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/transacciones/')
                ]);
                setCuentas(cuentasRes.data);
                setTransacciones(transRes.data);
            } catch (err) {
                setError('No se pudo cargar los datos de Tesorería.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, monto: Number(form.monto) };
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/transacciones/', payload);
            const transRes = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/transacciones/');
            setTransacciones(transRes.data);
            setForm({ cuenta: '', monto: '', tipo: 'debito', descripcion: '' });
        } catch (err) {
            setError('No se pudo registrar la transacción.');
        }
    };

    if (loading) return <div className="container" style={{ position: 'relative' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 99999,
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(255, 0, 0, 0.8)'
                    }}
                >
                    X
                </button><p>Cargando Tesorería...</p></div>;
    if (error) return <div className="container" style={{ position: 'relative' }}>
            <button 
                onClick={() => window.location.href = '/'} 
                className="btn btn-ghost modal-close-btn" 
                title="Cerrar Módulo"
                style={{ 
                    position: 'absolute', 
                    top: '1rem', 
                    right: '1rem',
                    background: '#ff0000',
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontSize: '2rem',
                    padding: '0.75rem',
                    border: '2px solid #ff0000',
                    borderRadius: '8px',
                    zIndex: 999999999,
                    width: '60px',
                    height: '60px',
                    minWidth: '60px',
                    minHeight: '60px',
                    maxWidth: '60px',
                    maxHeight: '60px',
                    visibility: 'visible',
                    opacity: 1,
                    display: 'block',
                    pointerEvents: 'auto',
                    transform: 'none',
                    transition: 'none',
                    animation: 'none',
                    textAlign: 'center',
                    lineHeight: '60px'
                }}
            >
                X
            </button><p>{error}</p></div>;

    const totalDebitos = transacciones.filter((t) => t.tipo === 'debito').reduce((sum, t) => sum + Number(t.monto), 0);
    const totalCreditos = transacciones.filter((t) => t.tipo === 'credito').reduce((sum, t) => sum + Number(t.monto), 0);

    return (
        <div className="container">
            <h1>Tesorería</h1>
            <p>Módulo de gestión de tesorería y flujo de caja avanzado.</p>

            <div className="dashboard-cards">
                <div className="card"><strong>Cuentas</strong><span>{cuentas.length}</span></div>
                <div className="card"><strong>Transacciones</strong><span>{transacciones.length}</span></div>
                <div className="card"><strong>Débito total</strong><span>{totalDebitos.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
                <div className="card"><strong>Crédito total</strong><span>{totalCreditos.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
            </div>

            <section className="form-section">
                <h2>Registrar nueva transacción</h2>
                <form onSubmit={handleSubmit} className="simple-form">
                    <label>
                        Cuenta:
                        <select name="cuenta" value={form.cuenta} onChange={handleInputChange} required>
                            <option value="">Seleccione</option>
                            {cuentas.map((cuenta) => (
                                <option key={cuenta.id} value={cuenta.id}>{cuenta.codigo} - {cuenta.nombre}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Monto:
                        <input name="monto" type="number" step="0.01" value={form.monto} onChange={handleInputChange} required />
                    </label>
                    <label>
                        Tipo:
                        <select name="tipo" value={form.tipo} onChange={handleInputChange}>
                            <option value="debito">Débito</option>
                            <option value="credito">Crédito</option>
                        </select>
                    </label>
                    <label>
                        Descripción:
                        <input name="descripcion" type="text" value={form.descripcion} onChange={handleInputChange} />
                    </label>
                    <button type="submit">Registrar transacción</button>
                </form>
            </section>

            <section className="table-section">
                <h2>Listado de transacciones</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cuenta</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transacciones.map((t) => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{t.cuenta_codigo} - {t.cuenta_nombre}</td>
                                <td>{t.tipo}</td>
                                <td>{Number(t.monto).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                                <td>{t.fecha}</td>
                                <td>{t.descripcion}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Tesoreria;
