import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../config/api';
import { 
    Briefcase, AlertCircle, Edit3, Trash2, Plus, X, ListTodo, User, 
    Search, Filter, Calendar, DollarSign, CheckCircle, Clock, 
    TrendingUp, Target, Activity, Users, FileText, BarChart3
} from 'lucide-react';

export default function Operaciones() {
    const navigate = useNavigate();
    const [proyectos, setProyectos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

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
            setLoading(true);
            const [proyectosRes, clientesRes] = await Promise.all([
                axios.get(API.OPERACIONES.PROYECTOS),
                axios.get(API.CRM.CLIENTES).catch(() => ({ data: [] }))
            ]);
            setProyectos(proyectosRes.data);
            setClientes(clientesRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar proyectos. ' + err.message);
            setLoading(false);
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'completado': 
                return { 
                    background: '#d1fae5', 
                    color: '#065f46', 
                    text: 'Completado',
                    icon: CheckCircle
                };
            case 'ejecucion': 
                return { 
                    background: '#3b82f6', 
                    color: 'white', 
                    text: 'En Ejecución',
                    icon: Activity
                };
            case 'pausado': 
                return { 
                    background: '#fbbf24', 
                    color: '#92400e', 
                    text: 'Pausado',
                    icon: Clock
                };
            default: 
                return { 
                    background: '#e2e8f0', 
                    color: '#4a5568', 
                    text: 'Planificación',
                    icon: ListTodo
                };
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
                await axios.put(`${API.OPERACIONES.PROYECTOS}${currentProyecto.id}/`, payload);
            } else {
                await axios.post(API.OPERACIONES.PROYECTOS, payload);
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error('Error saving proyecto:', err);
            setError("Error al guardar el proyecto. Verifica los campos.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                await axios.delete(`${API.OPERACIONES.PROYECTOS}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error deleting proyecto:', err);
                setError("Error al eliminar el proyecto.");
            }
        }
    };

    // Filter data
    const filteredProyectos = proyectos.filter(proyecto => {
        const matchesSearch = proyecto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || proyecto.estado === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calculate statistics
    const totalProyectos = proyectos.length;
    const proyectosCompletados = proyectos.filter(p => p.estado === 'completado').length;
    const proyectosEnEjecucion = proyectos.filter(p => p.estado === 'ejecucion').length;
    const totalPresupuesto = proyectos.reduce((sum, p) => sum + (parseFloat(p.presupuesto) || 0), 0);
    const proyectosPausados = proyectos.filter(p => p.estado === 'pausado').length;

    if (loading) {
        return (
            <div style={{ 
                background: '#f8fafc',
                minHeight: '100vh',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando Operaciones...</p>
                </div>
            </div>
        );
    }

    if (error && proyectos.length === 0) {
        return (
            <div style={{ 
                background: '#f8fafc',
                minHeight: '100vh',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: '#fed7d7',
                    border: '1px solid #feb2b2',
                    borderRadius: '12px',
                    padding: '2rem',
                    maxWidth: '500px',
                    textAlign: 'center'
                }}>
                    <AlertCircle size={48} style={{ color: '#c53030', marginBottom: '1rem' }} />
                    <h2 style={{ color: '#c53030', margin: '0 0 1rem 0' }}>Error</h2>
                    <p style={{ color: '#742a2a', margin: '0 0 1.5rem 0' }}>{error}</p>
                    <button 
                        onClick={() => { setError(null); fetchData(); }}
                        style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            background: '#f8fafc',
            minHeight: '100vh',
            padding: '1rem'
        }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem' 
            }}>
                <div>
                    <h2 style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: '700', 
                        color: '#1a202c',
                        margin: '0 0 0.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <Briefcase size={32} style={{ color: '#667eea' }} />
                        Operaciones
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Gestión de proyectos y operaciones
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => openModal()}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                        }}
                    >
                        <Plus size={20} />
                        Nuevo Proyecto
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <X size={16} />
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Error inline (no bloquea la UI) */}
            {error && (
                <div style={{ 
                    background: '#fed7d7',
                    border: '1px solid #feb2b2',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    color: '#c53030',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertCircle size={20} />
                    <div style={{ flex: 1 }}><strong>Error:</strong> {error}</div>
                    <button 
                        onClick={() => setError(null)}
                        style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                {[
                    { label: 'Total Proyectos', sub: 'Registrados', value: totalProyectos, color: '#667eea', gradient: 'linear-gradient(135deg,#667eea,#764ba2)', Icon: Briefcase },
                    { label: 'Completados',     sub: 'Finalizados', value: proyectosCompletados, color: '#48bb78', gradient: 'linear-gradient(135deg,#48bb78,#38a169)', Icon: CheckCircle },
                    { label: 'En Ejecución',    sub: 'Activos',     value: proyectosEnEjecucion, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)', Icon: Activity },
                    { label: 'Presupuesto Total', sub: 'Invertido', value: '$' + totalPresupuesto.toLocaleString(), color: '#ed8936', gradient: 'linear-gradient(135deg,#ed8936,#f59e0b)', Icon: DollarSign },
                ].map(({ label, sub, value, color, gradient, Icon }) => (
                    <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', background: gradient, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Icon size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#2d3748', margin: '0 0 0.2rem 0' }}>{label}</h3>
                                <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>{sub}</p>
                            </div>
                        </div>
                        <p style={{ fontSize: '2rem', fontWeight: '700', color, margin: 0 }}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Pausados badge */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                    <Clock size={20} style={{ color: '#fbbf24' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>Pausados</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b' }}>{proyectosPausados}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                        <input
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                            placeholder="Buscar por nombre, descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        style={{ padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white', cursor: 'pointer', minWidth: '150px' }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="planificacion">Planificación</option>
                        <option value="ejecucion">En Ejecución</option>
                        <option value="pausado">Pausado</option>
                        <option value="completado">Completado</option>
                    </select>
                </div>
            </div>

            {/* Projects Table */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                {['ID','Nombre','Cliente','Descripción','Presupuesto','Estado','Fechas','Acciones'].map((h, i) => (
                                    <th key={h} style={{ padding: '1.25rem 0.75rem', textAlign: i === 0 ? 'center' : 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProyectos.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                                        No hay proyectos que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : filteredProyectos.map((proyecto, index) => {
                                const statusInfo = getStatusBadge(proyecto.estado);
                                const StatusIcon = statusInfo.icon;
                                return (
                                    <tr key={proyecto.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc' }}>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>{proyecto.id}</td>
                                        <td style={{ padding: '0.75rem 0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Briefcase size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proyecto.nombre}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>{proyecto.cliente_nombre || 'N/A'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proyecto.descripcion}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: '600', fontSize: '0.85rem' }}>
                                            ${parseFloat(proyecto.presupuesto || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                            <span style={{ background: statusInfo.background, color: statusInfo.color, padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
                                                <StatusIcon size={12} />
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', color: '#4a5568' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={10} style={{ color: '#718096' }} />{proyecto.fecha_inicio}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={10} style={{ color: '#718096' }} />{proyecto.fecha_fin_estimada}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                <button onClick={() => openModal(proyecto)} style={{ background: '#667eea', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(proyecto.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer', display: 'flex' }}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
                                {currentProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                            </h3>
                            <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#718096' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Nombre del Proyecto:</label>
                                    <input name="nombre" value={formData.nombre} onChange={handleInputChange} required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Cliente:</label>
                                    <select name="cliente" value={formData.cliente} onChange={handleInputChange}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                                        <option value="">Seleccionar cliente</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>{c.razon_social || c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Descripción:</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Fecha Inicio:</label>
                                    <input name="fecha_inicio" type="date" value={formData.fecha_inicio} onChange={handleInputChange} required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Fecha Fin Estimada:</label>
                                    <input name="fecha_fin_estimada" type="date" value={formData.fecha_fin_estimada} onChange={handleInputChange} required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Presupuesto:</label>
                                    <input name="presupuesto" type="number" step="0.01" value={formData.presupuesto} onChange={handleInputChange} required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Estado:</label>
                                <select name="estado" value={formData.estado} onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                                    <option value="planificacion">Planificación</option>
                                    <option value="ejecucion">En Ejecución</option>
                                    <option value="pausado">Pausado</option>
                                    <option value="completado">Completado</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" onClick={closeModal}
                                    style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white', color: '#718096', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    Cancelar
                                </button>
                                <button type="submit"
                                    style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                                    {currentProyecto ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
