import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProyectosPS() {
    const navigate = useNavigate();
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProyectosPS = async () => {
            try {
                const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/proyectos/proyectos-ps/');
                setProyectos(res.data);
            } catch (err) {
                setError('No se pudieron cargar los proyectos PS.');
            } finally {
                setLoading(false);
            }
        };

        fetchProyectosPS();
    }, []);

    if (loading) {
        return <div className="container" style={{ position: 'relative' }}>
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
                </button><div className="spinner"></div></div>;
    }

    if (error) {
        return <div className="container"><p>{error}</p></div>;
    }

    const kpis = {
        totalProyectos: proyectos.length,
        presupuestoTotal: proyectos.reduce((sum, p) => sum + (Number(p.presupuesto) || 0), 0),
        costoRealTotal: proyectos.reduce((sum, p) => sum + (Number(p.costo_real) || 0), 0),
        cpiPromedio: proyectos.length ? (proyectos.reduce((sum, p) => sum + (Number(p.cpi) || 0), 0) / proyectos.length).toFixed(2) : '0.00',
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Control de Proyectos PS</h1>
                <p>Gestión centralizada de proyectos SAP PS: hitos, fases, presupuesto y avance.</p>
            </div>

            <div className="dashboard-cards">
                <div className="card"><strong>Proyectos</strong><span>{kpis.totalProyectos}</span></div>
                <div className="card"><strong>Presupuesto total</strong><span>{kpis.presupuestoTotal.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</span></div>
                <div className="card"><strong>Costo real total</strong><span>{kpis.costoRealTotal.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</span></div>
                <div className="card"><strong>CPI promedio</strong><span>{kpis.cpiPromedio}</span></div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código PS</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Avance (%)</th>
                        <th>CPI</th>
                        <th>SPI</th>
                        <th>Presupuesto</th>
                        <th>Costo Real</th>
                    </tr>
                </thead>
                <tbody>
                    {proyectos.map((proyecto) => (
                        <tr key={proyecto.id}>
                            <td>{proyecto.id}</td>
                            <td>{proyecto.codigo_ps}</td>
                            <td>{proyecto.nombre}</td>
                            <td>{proyecto.estado}</td>
                            <td>{proyecto.avance != null ? proyecto.avance : '0'}</td>
                            <td>{proyecto.cpi != null ? proyecto.cpi : '-'}</td>
                            <td>{proyecto.spi != null ? proyecto.spi : '-'}</td>
                            <td>{proyecto.presupuesto}</td>
                            <td>{proyecto.costo_real}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Detalles por proyecto</h2>
            {proyectos.map((proyecto) => (
                <div key={`det-${proyecto.id}`} className="project-details">
                    <h3>{proyecto.codigo_ps} - {proyecto.nombre}</h3>
                    <p>Hitos programados: {proyecto.hitos_ps?.length || 0} - Costos: {proyecto.costos?.length || 0} - WBS: {proyecto.wbs_items?.length || 0}</p>
                    <div className="subtable-wrap">
                        <table className="data-table small">
                            <thead>
                                <tr><th>Hito</th><th>Fecha prog.</th><th>Fecha real</th><th>Progreso</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                {(proyecto.hitos_ps || []).map((hito) => (
                                    <tr key={hito.id}>
                                        <td>{hito.nombre}</td>
                                        <td>{hito.fecha_programada}</td>
                                        <td>{hito.fecha_real || '-'}</td>
                                        <td>{hito.progreso}%</td>
                                        <td>{hito.estado}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProyectosPS;
