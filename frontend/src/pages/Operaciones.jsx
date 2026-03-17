import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, AlertCircle, Edit3, Trash2, Plus, X, ListTodo, User } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8000/api/operaciones/proyectos/';
const CLIENTS_API = 'http://localhost:8000/api/crm/clientes/';

function Operaciones() {
    const [proyectos, setProyectos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProyecto, setCurrentProyecto] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        cliente: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin_estimada: '',
        estado: 'planificacion',
        presupuesto: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [proyectosRes, clientesRes] = await Promise.all([
                axios.get(API_URL),
                axios.get(CLIENTS_API).catch(() => ({ data: [] })) // In case CRM is empty or errors
            ]);
            setProyectos(proyectosRes.data);
            setClientes(clientesRes.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar proyectos. ' + err.message);
            setLoading(false);
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'completado': return <span className="badge badge-success">Completado</span>;
            case 'ejecucion': return <span className="badge badge-primary">En Ejecución</span>;
            case 'pausado': return <span className="badge badge-warning">Pausado</span>;
            default: return <span className="badge" style={{ background: 'var(--surface-mixed)', color: 'white' }}>Planificación</span>;
        }
    };

    const openModal = (proyecto = null) => {
        if (proyecto) {
            setCurrentProyecto(proyecto);
            setFormData({
                nombre: proyecto.nombre,
                cliente: proyecto.cliente || '',
                descripcion: proyecto.descripcion,
                fecha_inicio: proyecto.fecha_inicio,
                fecha_fin_estimada: proyecto.fecha_fin_estimada,
                estado: proyecto.estado,
                presupuesto: proyecto.presupuesto
            });
        } else {
            setCurrentProyecto(null);
            setFormData({
                nombre: '',
                cliente: '',
                descripcion: '',
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin_estimada: new Date().toISOString().split('T')[0],
                estado: 'planificacion',
                presupuesto: '0'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProyecto(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                cliente: formData.cliente ? parseInt(formData.cliente) : null,
                presupuesto: parseFloat(formData.presupuesto) || 0
            };

            if (currentProyecto) {
                await axios.put(`${API_URL}${currentProyecto.id}/`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            closeModal();
            fetchData();
        } catch (err) {
            alert("Error al guardar el proyecto. Verifica los campos.");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                await axios.delete(`${API_URL}${id}/`);
                fetchData();
            } catch (err) {
                alert("Error al eliminar el proyecto.");
            }
        }
    };

    return (
        <div className="container">
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="header-title">Operaciones</h1>
                        <p className="header-subtitle" style={{ marginBottom: 0 }}>Gestión de Proyectos Operativos</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="stats-pill" style={{
                            background: 'rgba(56, 189, 248, 0.2)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Briefcase size={20} />
                            <span style={{ fontWeight: 600 }}>{proyectos.length} Proyectos</span>
                        </div>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <Plus size={18} />
                            Nuevo Proyecto
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Proyecto</th>
                                    <th>Cliente Asociado</th>
                                    <th>Fechas (Inicio - Fin)</th>
                                    <th>Presupuesto</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proyectos.map((proy) => (
                                    <tr key={proy.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{proy.nombre}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                {proy.descripcion?.substring(0, 40)}{proy.descripcion?.length > 40 ? '...' : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} style={{ color: 'var(--text-muted)' }} />
                                                {proy.cliente ? (
                                                    clientes.find(c => c.id === proy.cliente)?.nombre || proy.cliente_nombre || `Cliente ID: ${proy.cliente}`
                                                ) : 'Interno / Sin Asignar'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>I: {proy.fecha_inicio}</div>
                                            <div style={{ fontSize: '0.85rem' }}>F: {proy.fecha_fin_estimada}</div>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>
                                            ${parseFloat(proy.presupuesto).toLocaleString()}
                                        </td>
                                        <td>{getStatusBadge(proy.estado)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => openModal(proy)}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleDelete(proy.id)}
                                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {proyectos.length === 0 && !error && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No hay proyectos operativos. Haz clic en "Nuevo Proyecto".
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nombre del Proyecto</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Cliente (Opcional)</label>
                                <select name="cliente" value={formData.cliente} onChange={handleInputChange} className="form-input" style={{ background: 'var(--surface)' }}>
                                    <option value="">-- Proyecto Interno --</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre} ({c.documento_identidad})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} className="form-input" rows="3"></textarea>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Fecha Inicio</label>
                                    <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fecha Fin Estimada</label>
                                    <input type="date" name="fecha_fin_estimada" value={formData.fecha_fin_estimada} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Estado</label>
                                    <select name="estado" value={formData.estado} onChange={handleInputChange} className="form-input" style={{ background: 'var(--surface)' }}>
                                        <option value="planificacion">En Planificación</option>
                                        <option value="ejecucion">En Ejecución</option>
                                        <option value="pausado">Pausado</option>
                                        <option value="completado">Completado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Presupuesto ($)</label>
                                    <input type="number" step="0.01" name="presupuesto" value={formData.presupuesto} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{currentProyecto ? 'Guardar Cambios' : 'Crear Proyecto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Operaciones;
