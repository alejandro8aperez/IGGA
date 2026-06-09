import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { 
    Factory, Package, AlertCircle, BarChart3, Play, Settings, 
    Plus, Edit3, Trash2, Eye, RefreshCw, TrendingUp, Clock, 
    CheckCircle, AlertTriangle, Users, Target, Layers, X, Palette,
    TrendingUp as TrendingUpIcon, Activity, Zap, Database, DollarSign,
    ShoppingCart, Calendar, FileText, Search, Filter
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mrp/';

export default function MRP() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Dashboard data
    const [mpsResumen, setMpsResumen] = useState(null);
    const [capacidadResumen, setCapacidadResumen] = useState(null);
    const [ejecuciones, setEjecuciones] = useState([]);

    // MPS data
    const [mpsItems, setMpsItems] = useState([]);
    const [showMpsModal, setShowMpsModal] = useState(false);
    const [currentMps, setCurrentMps] = useState(null);

    // BOM data
    const [bomItems, setBomItems] = useState([]);
    const [showBomModal, setShowBomModal] = useState(false);
    const [currentBom, setCurrentBom] = useState(null);

    // Requerimientos data
    const [requerimientos, setRequerimientos] = useState([]);

    // Search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardData();
        } else if (activeTab === 'mps') {
            fetchMpsData();
        } else if (activeTab === 'bom') {
            fetchBomData();
        } else if (activeTab === 'requerimientos') {
            fetchRequerimientosData();
        }
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [mpsRes, capRes, ejecRes] = await Promise.all([
                axiosInstance.get(`${API_BASE}plan-maestro-produccion/resumen/`),
                axiosInstance.get(`${API_BASE}planes-capacidad/resumen/`),
                axiosInstance.get(`${API_BASE}ejecuciones-mrp/`)
            ]);
            
            setMpsResumen(mpsRes.data);
            setCapacidadResumen(capRes.data);
            setEjecuciones(ejecRes.data.results || []);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchMpsData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_BASE}plan-maestro-produccion/`);
            setMpsItems(response.data);
        } catch (err) {
            console.error('Error fetching MPS:', err);
            setError('Error al cargar MPS');
        } finally {
            setLoading(false);
        }
    };

    const fetchBomData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_BASE}listas-materiales/`);
            setBomItems(response.data);
        } catch (err) {
            console.error('Error fetching BOM:', err);
            setError('Error al cargar BOM');
        } finally {
            setLoading(false);
        }
    };

    const fetchRequerimientosData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_BASE}requerimientos-materiales/pendientes/`);
            setRequerimientos(response.data);
        } catch (err) {
            console.error('Error fetching requerimientos:', err);
            setError('Error al cargar requerimientos');
        } finally {
            setLoading(false);
        }
    };

    const ejecutarMRP = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`${API_BASE}ejecuciones-mrp/ejecutar/`, {
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                parametros: {
                    dias_lote: 7,
                    horizonte_planificacion: 90
                }
            });
            
            if (response.data.exito) {
                alert('MRP ejecutado exitosamente');
                fetchDashboardData();
            } else {
                setError(response.data.mensaje);
            }
        } catch (err) {
            console.error('Error ejecutando MRP:', err);
            setError('Error al ejecutar MRP');
        } finally {
            setLoading(false);
        }
    };

    // Filter data
    const filteredMpsItems = mpsItems.filter(item => {
        const matchesSearch = item.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.producto_codigo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'todos' || item.estado === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const filteredBomItems = bomItems.filter(item => {
        const matchesSearch = String(item.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(item.codigo || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredRequerimientos = requerimientos.filter(item => {
        const matchesSearch = String(item.producto || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            String(item.codigo || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    if (loading && activeTab === 'dashboard') {
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
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando MRP...</p>
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
                            if (activeTab === 'dashboard') fetchDashboardData();
                            else if (activeTab === 'mps') fetchMpsData();
                            else if (activeTab === 'bom') fetchBomData();
                            else if (activeTab === 'requerimientos') fetchRequerimientosData();
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
                        <Factory size={32} style={{ color: '#667eea' }} />
                        MRP - Material Requirements Planning
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Planificación de requerimientos de materiales
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={ejecutarMRP}
                        disabled={loading}
                        style={{
                            background: loading 
                                ? '#9ca3af' 
                                : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: loading 
                                ? 'none' 
                                : '0 4px 15px rgba(72, 187, 120, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
                            }
                        }}
                    >
                        <Play size={20} />
                        {loading ? 'Ejecutando...' : 'Ejecutar MRP'}
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

            {/* Tabs */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '0.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '0.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'mps', label: 'Plan Maestro', icon: Target },
                    { id: 'bom', label: 'Lista Materiales', icon: Layers },
                    { id: 'requerimientos', label: 'Requerimientos', icon: Package }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            background: activeTab === tab.id 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#718096',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== tab.id) {
                                e.target.style.background = '#f1f5f9';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== tab.id) {
                                e.target.style.background = 'transparent';
                            }
                        }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
                <div>
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
                                    <Package size={24} />
                                </div>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        margin: '0 0 0.25rem 0'
                                    }}>
                                        Planes de Producción
                                    </h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                        Total MPS
                                    </p>
                                </div>
                            </div>
                            <p style={{ 
                                fontSize: '2rem', 
                                fontWeight: '700', 
                                color: '#667eea',
                                margin: '0'
                            }}>
                                {mpsResumen?.total_items || 0}
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
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        margin: '0 0 0.25rem 0'
                                    }}>
                                        Progreso General
                                    </h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                        Completado
                                    </p>
                                </div>
                            </div>
                            <p style={{ 
                                fontSize: '2rem', 
                                fontWeight: '700', 
                                color: '#48bb78',
                                margin: '0'
                            }}>
                                {mpsResumen?.porcentaje_completado || 0}%
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
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        margin: '0 0 0.25rem 0'
                                    }}>
                                        Capacidad Utilizada
                                    </h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                        Promedio
                                    </p>
                                </div>
                            </div>
                            <p style={{ 
                                fontSize: '2rem', 
                                fontWeight: '700', 
                                color: '#ed8936',
                                margin: '0'
                            }}>
                                {capacidadResumen?.utilizacion_promedio || 0}%
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
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        margin: '0 0 0.25rem 0'
                                    }}>
                                        Cuellos de Botella
                                    </h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                        Centros críticos
                                    </p>
                                </div>
                            </div>
                            <p style={{ 
                                fontSize: '2rem', 
                                fontWeight: '700', 
                                color: '#ef4444',
                                margin: '0'
                            }}>
                                {capacidadResumen?.cuellos_botella?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <TrendingUpIcon size={20} style={{ color: '#667eea' }} />
                                Próximas Entregas MPS
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {mpsResumen?.proximas_entregas?.slice(0, 5).map((entrega, index) => (
                                    <div key={index} style={{
                                        background: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h4 style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: '600', 
                                                color: '#2d3748',
                                                margin: '0 0 0.25rem 0'
                                            }}>
                                                {entrega.producto}
                                            </h4>
                                            <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>
                                                {entrega.cantidad} uds
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>
                                                {entrega.fecha}
                                            </p>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(entrega.estado === 'completado' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : { background: '#fbbf24', color: '#92400e' })
                                            }}>
                                                {entrega.estado}
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        color: '#718096', 
                                        padding: '2rem',
                                        fontSize: '0.9rem'
                                    }}>
                                        No hay entregas próximas
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <h3 style={{ 
                                fontSize: '1.2rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <RefreshCw size={20} style={{ color: '#667eea' }} />
                                Ejecuciones MRP
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {ejecuciones.slice(0, 5).map((ejecucion, index) => (
                                    <div key={index} style={{
                                        background: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <h4 style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: '600', 
                                                color: '#2d3748',
                                                margin: '0 0 0.25rem 0'
                                            }}>
                                                Ejecución #{ejecucion.id}
                                            </h4>
                                            <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>
                                                {new Date(ejecucion.fecha_ejecucion).toLocaleString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(ejecucion.estado === 'completado' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : ejecucion.estado === 'error' 
                                                        ? { background: '#fee2e2', color: '#991b1b' }
                                                        : { background: '#fbbf24', color: '#92400e' })
                                            }}>
                                                {ejecucion.estado}
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                    <div style={{ 
                                        textAlign: 'center', 
                                        color: '#718096', 
                                        padding: '2rem',
                                        fontSize: '0.9rem'
                                    }}>
                                        No hay ejecuciones previas
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'mps' && (
                <div>
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
                                    placeholder="Buscar por producto, código..."
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
                                <option value="pendiente">Pendiente</option>
                                <option value="en_progreso">En progreso</option>
                                <option value="completado">Completado</option>
                            </select>
                        </div>
                    </div>

                    {/* MPS Table */}
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
                                minWidth: '1000px',
                                borderCollapse: 'collapse', 
                                fontSize: '0.9rem',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Producto</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Código</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Cantidad</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Fecha Req</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Prioridad</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Estado</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMpsItems.map((item, index) => (
                                        <tr key={item.id} style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                        }}>
                                            <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Package size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.producto_nombre}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.producto_codigo}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>{item.cantidad_planificada}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.fecha_fin}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span style={{
                                                    background: item.prioridad <= 2 ? '#fed7d7' : item.prioridad <= 4 ? '#fef5e7' : '#c6f6d5',
                                                    color: item.prioridad <= 2 ? '#c53030' : item.prioridad <= 4 ? '#d69e2e' : '#276749',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.prioridad <= 2 ? 'Alta' : item.prioridad <= 4 ? 'Media' : 'Baja'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span style={{
                                                    background: item.estado === 'completado' ? '#d1fae5' : item.estado === 'en_progreso' ? '#fbbf24' : '#e2e8f0',
                                                    color: item.estado === 'completado' ? '#065f46' : item.estado === 'en_progreso' ? '#92400e' : '#4a5568',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                    <button 
                                                        onClick={() => console.log('Editar MPS', item)}
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
                                                        onClick={() => console.log('Eliminar MPS', item)}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'bom' && (
                <div>
                    {/* Search */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '400px'
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
                                placeholder="Buscar BOM por producto, código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    {/* BOM Table */}
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
                                minWidth: '1200px',
                                borderCollapse: 'collapse', 
                                fontSize: '0.9rem',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '20%' }}>Producto</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Código</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Componente</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Cantidad</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Unidad</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Costo Unit</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Proveedor</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBomItems.map((item, index) => (
                                        <tr key={item.id} style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                        }}>
                                            <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Layers size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.producto}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.codigo}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                                <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.componente}</span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>{item.cantidad}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.unidad}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>${item.costo_unitario?.toLocaleString() || 0}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.proveedor}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                    <button 
                                                        onClick={() => console.log('Editar BOM', item)}
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
                                                        onClick={() => console.log('Eliminar BOM', item)}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'requerimientos' && (
                <div>
                    {/* Search */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '400px'
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
                                placeholder="Buscar requerimientos por producto, código..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    {/* Requerimientos Table */}
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
                                minWidth: '1200px',
                                borderCollapse: 'collapse', 
                                fontSize: '0.9rem',
                                tableLayout: 'fixed'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '20%' }}>Material</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Código</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Requerido</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Disponible</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Fecha Req</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '15%' }}>Prioridad</th>
                                        <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequerimientos.map((item, index) => (
                                        <tr key={item.id} style={{ 
                                            borderBottom: '1px solid #e2e8f0',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                        }}>
                                            <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Package size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                                    <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.material}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.codigo}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>{item.cantidad_requerida}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>{item.cantidad_disponible}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{item.fecha_requerida}</td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span style={{
                                                    background: item.prioridad === 'urgente' ? '#fed7d7' : item.prioridad === 'alta' ? '#fef5e7' : '#c6f6d5',
                                                    color: item.prioridad === 'urgente' ? '#c53030' : item.prioridad === 'alta' ? '#d69e2e' : '#276749',
                                                    padding: '0.2rem 0.5rem',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap',
                                                    display: 'inline-block'
                                                }}>
                                                    {item.prioridad}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                    <button 
                                                        onClick={() => console.log('Procesar requerimiento', item)}
                                                        style={{
                                                            background: '#48bb78',
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
                                                        onMouseOver={(e) => e.target.style.background = '#38a169'}
                                                        onMouseOut={(e) => e.target.style.background = '#48bb78'}
                                                    >
                                                        <CheckCircle size={12} />
                                                    </button>
                                                    <button 
                                                        onClick={() => console.log('Ver detalles', item)}
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
                                                        <Eye size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
