import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Planeacion() {
    const navigate = useNavigate();
    const [planes, setPlanes] = useState([]);
    const [objetivos, setObjetivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        codigo: '', nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'borrador'
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [plansRes, objRes] = await Promise.all([
                    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/planeacion/planes/'),
                    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/planeacion/objetivos/')
                ]);
                setPlanes(plansRes.data);
                setObjetivos(objRes.data);
            } catch (err) {
                setError('No se pudo conectar con el módulo de planeación.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/planeacion/planes/', form);
            const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/planeacion/planes/');
            setPlanes(res.data);
            setForm({ codigo: '', nombre: '', descripcion: '', fecha_inicio: '', fecha_fin: '', estado: 'borrador' });
        } catch {
            setError('Error al guardar el plan estratégico.');
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
                </button><p>Cargando planeación...</p></div>;
    if (error) return <div className="container" style={{ position: 'relative' }}>
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
            </button><p>{error}</p></div>;

    const totalPlanes = planes.length;
    const activos = planes.filter((p) => p.estado === 'activo').length;

    return (
        <div className="container">
            <h1>Planeación Estratégica</h1>
            <p>Gestión de planes, objetivos e iniciativas.</p>

            <div className="dashboard-cards">
                <div className="card"><strong>Planes</strong><span>{totalPlanes}</span></div>
                <div className="card"><strong>Planes activos</strong><span>{activos}</span></div>
                <div className="card"><strong>Objetivos totales</strong><span>{objetivos.length}</span></div>
            </div>

            <section className="form-section">
                <h2>Crear plan estratégico</h2>
                <form onSubmit={handleSubmit} className="simple-form">
                    <label>Código:<input name="codigo" value={form.codigo} onChange={handleChange} required /></label>
                    <label>Nombre:<input name="nombre" value={form.nombre} onChange={handleChange} required /></label>
                    <label>Descripción:<textarea name="descripcion" value={form.descripcion} onChange={handleChange} /></label>
                    <label>Inicio:<input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} required /></label>
                    <label>Fin:<input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} /></label>
                    <label>Estado:<select name="estado" value={form.estado} onChange={handleChange}><option value="borrador">Borrador</option><option value="activo">Activo</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></select></label>
                    <button type="submit">Guardar plan</button>
                </form>
            </section>

            <section>
                <h2>Planes registrados</h2>
                <table className="data-table">
                    <thead>
                        <tr><th>ID</th><th>Código</th><th>Nombre</th><th>Estado</th><th>Duración</th><th>Inicio</th><th>Fin</th></tr>
                    </thead>
                    <tbody>
                        {planes.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>{p.codigo}</td>
                                <td>{p.nombre}</td>
                                <td>{p.estado}</td>
                                <td>{p.duracion_dias || '-'}</td>
                                <td>{p.fecha_inicio}</td>
                                <td>{p.fecha_fin || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Planeacion;
