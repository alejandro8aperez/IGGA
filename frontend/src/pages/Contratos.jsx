import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';

function Contratos() {
    const navigate = useNavigate();
    const [contratos, setContratos] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        codigo: '',
        proveedor: '',
        tipo: 'compra',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        valor_contrato: '',
        estado: 'negociacion'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contratosRes, proveedoresRes] = await Promise.all([
                    axiosInstance.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/contratos/'),
                    axiosInstance.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/proveedores/')
                ]);
                setContratos(contratosRes.data);
                setProveedores(proveedoresRes.data);
            } catch (err) {
                setError('Error al cargar contratos o proveedores.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/contratos/', {
                ...form,
                valor_contrato: Number(form.valor_contrato),
            });
            const res = await axiosInstance.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/contratos/');
            setContratos(res.data);
            setForm({
                codigo: '', proveedor: '', tipo: 'compra', descripcion: '', fecha_inicio: '', fecha_fin: '', valor_contrato: '', estado: 'negociacion'
            });
        } catch (err) {
            setError('No se pudo guardar el contrato.');
        }
    };

    if (loading) return <div className="container" style={{ position: 'relative' }}>
                <button 
                    onClick={() => navigate('/')} 
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
                </button><p>Cargando contratos...</p></div>;
    if (error) return <div className="container"><p>{error}</p></div>;

    const totalValor = contratos.reduce((sum, c) => sum + Number(c.valor_contrato || 0), 0);
    const activos = contratos.filter((c) => c.estado === 'activo').length;

    return (
        <div className="container" style={{ position: 'relative' }}>
            <button 
                onClick={() => navigate('/')} 
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
            </button>
            <h1>Contratos</h1>
            <p>Gestión de contratos de compra/venta, seguimiento de estado y valores.</p>

            <div className="dashboard-cards">
                <div className="card"><strong>Contratos totales</strong><span>{contratos.length}</span></div>
                <div className="card"><strong>Contratos activos</strong><span>{activos}</span></div>
                <div className="card"><strong>Valor total</strong><span>{totalValor.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span></div>
            </div>

            <section className="form-section">
                <h2>Crear contrato</h2>
                <form onSubmit={handleSubmit} className="simple-form">
                    <label>Código:<input name="codigo" value={form.codigo} onChange={handleChange} required /></label>
                    <label>Proveedor:
                        <select name="proveedor" value={form.proveedor} onChange={handleChange} required>
                            <option value="">Seleccione proveedor</option>
                            {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                        </select>
                    </label>
                    <label>Tipo:<select name="tipo" value={form.tipo} onChange={handleChange}><option value="compra">Compra</option><option value="venta">Venta</option></select></label>
                    <label>Descripción:<input name="descripcion" value={form.descripcion} onChange={handleChange} /></label>
                    <label>Fecha inicio:<input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} required /></label>
                    <label>Fecha fin:<input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} /></label>
                    <label>Valor contrato:<input name="valor_contrato" type="number" step="0.01" value={form.valor_contrato} onChange={handleChange} required /></label>
                    <label>Estado:<select name="estado" value={form.estado} onChange={handleChange}><option value="negociacion">Negociación</option><option value="activo">Activo</option><option value="vencido">Vencido</option><option value="cancelado">Cancelado</option></select></label>
                    <button type="submit">Guardar contrato</button>
                </form>
            </section>

            <section>
                <h2>Listado de contratos</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Código</th><th>Proveedor</th><th>Tipo</th><th>Estado</th><th>Valor</th><th>Inicio</th><th>Fin</th><th>Duración</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contratos.map((c) => (
                            <tr key={c.id}>
                                <td>{c.id}</td>
                                <td>{c.codigo}</td>
                                <td>{c.proveedor_nombre}</td>
                                <td>{c.tipo}</td>
                                <td>{c.estado}</td>
                                <td>{Number(c.valor_contrato).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                                <td>{c.fecha_inicio}</td>
                                <td>{c.fecha_fin || '-'}</td>
                                <td>{c.duracion_dias || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Contratos;
