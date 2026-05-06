import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, AlertCircle, Edit3, Trash2, Plus, X, Users, Calendar } from 'lucide-react';

const API_PROYECTOS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/proyectos/proyectos/';
const API_TAREAS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/proyectos/tareas/';

function Proyectos() {
    const navigate = useNavigate();
    const [proyectos, setProyectos] = useState([]);
    const [tareas, setTareas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal Proyecto
    const [isProyModalOpen, setIsProyModalOpen] = useState(false);
    const [currentProy, setCurrentProy] = useState(null);
    const [proyForm, setProyForm] = useState({
        nombre: '', descripcion: '', cliente: null, gerente: null, fecha_inicio: '', fecha_fin: '', presupuesto: 0, estado: 'planificado'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resProy, resTareas] = await Promise.all([
                axios.get(API_PROYECTOS),
                axios.get(API_TAREAS)
            ]);
            setProyectos(resProy.data);
            setTareas(resTareas.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar datos de Proyectos.');
            setLoading(false);
        }
    };

    const openProyModal = (proy = null) => {
        if (proy) {
            setCurrentProy(proy);
            setProyForm(proy);
        } else {
            setCurrentProy(null);
            setProyForm({ nombre: '', descripcion: '', cliente: null, gerente: null, fecha_inicio: '', fecha_fin: '', presupuesto: 0, estado: 'planificado' });
        }
        setIsProyModalOpen(true);
    };

    const handleProySubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProy) {
                await axios.put(`${API_PROYECTOS}${currentProy.id}/`, proyForm);
            } else {
                await axios.post(API_PROYECTOS, proyForm);
            }
            fetchData();
            setIsProyModalOpen(false);
        } catch (err) {
            console.error('Error al guardar proyecto:', err);
        }
    };

    const deleteProy = async (id) => {
        if (window.confirm('¿Eliminar este proyecto?')) {
            try {
                await axios.delete(`${API_PROYECTOS}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar proyecto:', err);
            }
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
                </button><div className="loading">Cargando Proyectos...</div></div>;
    if (error) return <div className="container"><div className="error"><AlertCircle size={20} />{error}</div></div>;

    return (
        <div className="container">
            <div className="header">
                <h1><Briefcase size={32} /> Gestión de Proyectos</h1>
                <button className="btn-primary" onClick={() => openProyModal()}>
                    <Plus size={20} /> Nuevo Proyecto
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Proyectos</h3>
                    <p className="stat-number">{proyectos.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Proyectos Activos</h3>
                    <p className="stat-number">{proyectos.filter(p => p.estado === 'en_progreso').length}</p>
                </div>
                <div className="stat-card">
                    <h3>Presupuesto Total</h3>
                    <p className="stat-number">${proyectos.reduce((sum, p) => sum + parseFloat(p.presupuesto || 0), 0).toFixed(2)}</p>
                </div>
            </div>

            <div className="section">
                <h2>Proyectos</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Cliente</th>
                                <th>Gerente</th>
                                <th>Fecha Inicio</th>
                                <th>Estado</th>
                                <th>Presupuesto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proyectos.map(proy => (
                                <tr key={proy.id}>
                                    <td>{proy.nombre}</td>
                                    <td>{proy.cliente_nombre}</td>
                                    <td>{proy.gerente_username}</td>
                                    <td>{proy.fecha_inicio}</td>
                                    <td><span className={`status ${proy.estado}`}>{proy.estado}</span></td>
                                    <td>${proy.presupuesto}</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => openProyModal(proy)}><Edit3 size={16} /></button>
                                        <button className="btn-icon danger" onClick={() => deleteProy(proy.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="section">
                <h2>Tareas Recientes</h2>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Proyecto</th>
                                <th>Asignado</th>
                                <th>Estado</th>
                                <th>Progreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tareas.slice(0, 10).map(tarea => (
                                <tr key={tarea.id}>
                                    <td>{tarea.nombre}</td>
                                    <td>{tarea.proyecto}</td>
                                    <td>{tarea.asignado_a}</td>
                                    <td><span className={`status ${tarea.estado}`}>{tarea.estado}</span></td>
                                    <td>{tarea.progreso}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Proyecto */}
            {isProyModalOpen && (
                <div className="modal-overlay">
                    <div className="modal" style={{ position: 'relative' }}>
                        <div className="modal-header">
                            <h3>{currentProy ? 'Editar' : 'Nuevo'} Proyecto</h3>
                            <button 
                                className="btn btn-ghost modal-close-btn" 
                                onClick={() => setIsProyModalOpen(false)}
                                style={{ 
                                    position: 'absolute', 
                                    top: '0.5rem', 
                                    right: '0.5rem',
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
                        </div>
                        <form onSubmit={handleProySubmit}>
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input type="text" value={proyForm.nombre} onChange={(e) => setProyForm({...proyForm, nombre: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea value={proyForm.descripcion} onChange={(e) => setProyForm({...proyForm, descripcion: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Cliente ID:</label>
                                <input type="number" value={proyForm.cliente} onChange={(e) => setProyForm({...proyForm, cliente: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Gerente ID:</label>
                                <input type="number" value={proyForm.gerente} onChange={(e) => setProyForm({...proyForm, gerente: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Fecha Inicio:</label>
                                <input type="date" value={proyForm.fecha_inicio} onChange={(e) => setProyForm({...proyForm, fecha_inicio: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Fecha Fin:</label>
                                <input type="date" value={proyForm.fecha_fin} onChange={(e) => setProyForm({...proyForm, fecha_fin: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Presupuesto:</label>
                                <input type="number" step="0.01" value={proyForm.presupuesto} onChange={(e) => setProyForm({...proyForm, presupuesto: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Estado:</label>
                                <select value={proyForm.estado} onChange={(e) => setProyForm({...proyForm, estado: e.target.value})}>
                                    <option value="planificado">Planificado</option>
                                    <option value="en_progreso">En Progreso</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsProyModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Proyectos;