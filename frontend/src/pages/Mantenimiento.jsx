import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Wrench, AlertCircle, Edit3, Trash2, Plus, X, Settings, Calendar,
    Search, Filter, Clock, CheckCircle, AlertTriangle, Zap,
    Activity, TrendingUp, Users, FileText, BarChart3, Target
} from 'lucide-react';

const API_ORDENES = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/ordenes/';
const API_EQUIPOS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/equipos/';

export default function Mantenimiento() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [filterTipo, setFilterTipo] = useState('todos');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentOrden, setCurrentOrden] = useState(null);

    // Form states
    const [form, setForm] = useState({
        numero: '',
        equipo: '',
        tipo: 'preventivo',
        descripcion: '',
        fecha_programada: '',
        prioridad: 'media',
        estado: 'planificada'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordenesRes, equipoRes] = await Promise.all([
                axios.get(API_ORDENES),
                axios.get(API_EQUIPOS)
            ]);
            setOrdenes(ordenesRes.data);
            setEquipos(equipoRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de mantenimiento.');
            setLoading(false);
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'completada': 
                return { 
                    background: '#d1fae5', 
                    color: '#065f46', 
                    text: 'Completada',
                    icon: CheckCircle
                };
            case 'en_progreso': 
                return { 
                    background: '#3b82f6', 
                    color: 'white', 
                    text: 'En Progreso',
                    icon: Activity
                };
            case 'pendiente': 
                return { 
                    background: '#fbbf24', 
                    color: '#92400e', 
                    text: 'Pendiente',
                    icon: Clock
                };
            case 'cancelada': 
                return { 
                    background: '#fee2e2', 
                    color: '#991b1b', 
                    text: 'Cancelada',
                    icon: AlertTriangle
                };
            default: 
                return { 
                    background: '#e2e8f0', 
                    color: '#4a5568', 
                    text: 'Planificada',
                    icon: Calendar
                };
        }
    };

    const getTipoBadge = (tipo) => {
        switch (tipo) {
            case 'correctivo': 
                return { 
                    background: '#fee2e2', 
                    color: '#991b1b', 
                    text: 'Correctivo',
                    icon: Wrench
                };
            case 'preventivo': 
                return { 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    text: 'Preventivo',
                    icon: Settings
                };
            case 'predictivo': 
                return { 
                    background: '#f3e8ff', 
                    color: '#6b21a8', 
                    text: 'Predictivo',
                    icon: Zap
                };
            default: 
                return { 
                    background: '#e2e8f0', 
                    color: '#4a5568', 
                    text: tipo,
                    icon: Wrench
                };
        }
    };

    const getPrioridadBadge = (prioridad) => {
        switch (prioridad) {
            case 'alta': 
                return { 
                    background: '#fee2e2', 
                    color: '#991b1b', 
                    text: 'Alta'
                };
            case 'media': 
                return { 
                    background: '#fbbf24', 
                    color: '#92400e', 
                    text: 'Media'
                };
            case 'baja': 
                return { 
                    background: '#d1fae5', 
                    color: '#065f46', 
                    text: 'Baja'
                };
            default: 
                return { 
                    background: '#e2e8f0', 
                    color: '#4a5568', 
                    text: prioridad
                };
        }
    };

    const openModal = (orden = null) => {
        if (orden) {
            setCurrentOrden(orden);
            setForm({
                numero: orden.numero,
                equipo: orden.equipo,
                tipo: orden.tipo,
                descripcion: orden.descripcion,
                fecha_programada: orden.fecha_programada,
                prioridad: orden.prioridad,
                estado: orden.estado
            });
        } else {
            setCurrentOrden(null);
            setForm({
                numero: '',
                equipo: '',
                tipo: 'preventivo',
                descripcion: '',
                fecha_programada: new Date().toISOString().split('T')[0],
                prioridad: 'media',
                estado: 'planificada'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentOrden(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentOrden) {
                await axios.put(`${API_ORDENES}${currentOrden.id}/`, form);
            } else {
                await axios.post(API_ORDENES, form);
            }
            closeModal();
            fetchData();
        } catch (err) {
            console.error('Error saving orden:', err);
            setError('Error al guardar la orden.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta orden de mantenimiento?')) {
            try {
                await axios.delete(`${API_ORDENES}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error deleting orden:', err);
                setError('Error al eliminar la orden.');
            }
        }
    };

    // Filter data
    const filteredOrdenes = ordenes.filter(orden => {
        const matchesSearch = orden.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            orden.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            orden.equipo_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || orden.estado === filterStatus;
        const matchesTipo = filterTipo === 'todos' || orden.tipo === filterTipo;
        return matchesSearch && matchesStatus && matchesTipo;
    });

    // Calculate statistics
    const totalOrdenes = ordenes.length;
    const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada').length;
    const ordenesEnProgreso = ordenes.filter(o => o.estado === 'en_progreso').length;
    const ordenesPendientes = ordenes.filter(o => o.estado === 'pendiente').length;
    const ordenesAltaPrioridad = ordenes.filter(o => o.prioridad === 'alta').length;
    const totalEquipos = equipos.length;

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
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando Mantenimiento...</p>
                </div>
            </div>
        );
    }

    if (error) {
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
                        onClick={() => {
                            setError(null);
                            fetchData();
                        }}
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
                        <Wrench size={32} style={{ color: '#667eea' }} />
                        Mantenimiento
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Gestión de órdenes y equipos de mantenimiento
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
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        <Plus size={20} />
                        Nueva Orden
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

            {/* Error Display */}
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
                    <div style={{ flex: 1 }}>
                        <strong>Error:</strong> {error}
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Wrench size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Órdenes
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Registradas
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#667eea',
                        margin: '0'
                    }}>
                        {totalOrdenes}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Completadas
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Finalizadas
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        {ordenesCompletadas}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                En Progreso
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Activas
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#3b82f6',
                        margin: '0'
                    }}>
                        {ordenesEnProgreso}
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            background: 'linear-gradient(135deg, #ed8936 0%, #f59e0b 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Equipos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Registrados
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#ed8936',
                        margin: '0'
                    }}>
                        {totalEquipos}
                    </p>
                </div>
            </div>

            {/* Status Distribution */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                marginBottom: '2rem' 
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <Clock size={20} style={{ color: '#fbbf24' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>Pendientes</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#f59e0b' }}>{ordenesPendientes}</p>
                    </div>
                </div>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>Alta Prioridad</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#ef4444' }}>{ordenesAltaPrioridad}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '300px'
                    }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                        <input
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            placeholder="Buscar por número, descripción, equipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <select
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="planificada">Planificada</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En Progreso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                    <select
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                        value={filterTipo}
                        onChange={(e) => setFilterTipo(e.target.value)}
                    >
                        <option value="todos">Todos los tipos</option>
                        <option value="preventivo">Preventivo</option>
                        <option value="correctivo">Correctivo</option>
                        <option value="predictivo">Predictivo</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div style={{ 
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                width: '100%'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        minWidth: '1400px',
                        borderCollapse: 'collapse', 
                        fontSize: '0.9rem',
                        tableLayout: 'fixed'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '8%' }}>Número</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Equipo</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Tipo</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '25%' }}>Descripción</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Prioridad</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Estado</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Fecha</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '7%' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrdenes.map((orden, index) => {
                                const statusInfo = getStatusBadge(orden.estado);
                                const tipoInfo = getTipoBadge(orden.tipo);
                                const prioridadInfo = getPrioridadBadge(orden.prioridad);
                                const StatusIcon = statusInfo.icon;
                                const TipoIcon = tipoInfo.icon;
                                return (
                                    <tr key={orden.id} style={{ 
                                        borderBottom: '1px solid #e2e8f0',
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                    }}>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{orden.numero}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Settings size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orden.equipo_nombre || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background: tipoInfo.background,
                                                color: tipoInfo.color,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <TipoIcon size={12} />
                                                {tipoInfo.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{orden.descripcion}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background: prioridadInfo.background,
                                                color: prioridadInfo.color,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-block'
                                            }}>
                                                {prioridadInfo.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background: statusInfo.background,
                                                color: statusInfo.color,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <StatusIcon size={12} />
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                                            {orden.fecha_programada}
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => openModal(orden)}
                                                    style={{
                                                        background: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#5a67d8'}
                                                    onMouseOut={(e) => e.target.style.background = '#667eea'}
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(orden.id)}
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                                    onMouseOut={(e) => e.target.style.background = '#ef4444'}
                                                >
                                                    <Trash2 size={12} />
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
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
                                {currentOrden ? 'Editar Orden' : 'Nueva Orden'}
                            </h3>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#718096'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Número de Orden:
                                    </label>
                                    <input
                                        name="numero"
                                        value={form.numero}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Equipo:
                                    </label>
                                    <select
                                        name="equipo"
                                        value={form.equipo}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="">Seleccionar equipo</option>
                                        {equipos.map(equipo => (
                                            <option key={equipo.id} value={equipo.id}>
                                                {equipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Tipo:
                                    </label>
                                    <select
                                        name="tipo"
                                        value={form.tipo}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="preventivo">Preventivo</option>
                                        <option value="correctivo">Correctivo</option>
                                        <option value="predictivo">Predictivo</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Prioridad:
                                    </label>
                                    <select
                                        name="prioridad"
                                        value={form.prioridad}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="baja">Baja</option>
                                        <option value="media">Media</option>
                                        <option value="alta">Alta</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Estado:
                                    </label>
                                    <select
                                        name="estado"
                                        value={form.estado}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                    >
                                        <option value="planificada">Planificada</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="en_progreso">En Progreso</option>
                                        <option value="completada">Completada</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                    Descripción:
                                </label>
                                <textarea
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                    Fecha Programada:
                                </label>
                                <input
                                    name="fecha_programada"
                                    type="date"
                                    value={form.fecha_programada}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        color: '#718096',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {currentOrden ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
