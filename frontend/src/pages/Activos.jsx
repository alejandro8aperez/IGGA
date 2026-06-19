import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';
import { 
    Building, DollarSign, TrendingDown, TrendingUp, AlertCircle, 
    Plus, Edit3, Trash2, Eye, Search, Filter, Calendar, X,
    Package, BarChart3, CheckCircle, Clock, Wrench, Archive
} from 'lucide-react';

const API_BASE = BASE_URL + '/finanzas/activos-fijos/';

export default function Activos() {
    const navigate = useNavigate();
    const [activos, setActivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [showModal, setShowModal] = useState(false);
    const [currentActivo, setCurrentActivo] = useState(null);

    const [form, setForm] = useState({ 
        codigo: '', 
        descripcion: '', 
        valor_adquisicion: '', 
        vida_util_meses: 60, 
        fecha_adquisicion: '', 
        estado: 'activo' 
    });

    useEffect(() => {
        fetchActivos();
    }, []);

    const fetchActivos = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API_BASE);
            setActivos(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching activos:', err);
            setError('No se pudo cargar los activos fijos.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                valor_adquisicion: Number(form.valor_adquisicion) || 0,
                vida_util_meses: Number(form.vida_util_meses) || 0,
            };
            if (currentActivo) {
                await axiosInstance.put(`${API_BASE}${currentActivo.id}/`, payload);
            } else {
                await axiosInstance.post(API_BASE, payload);
            }
            fetchActivos();
            setShowModal(false);
            setCurrentActivo(null);
            setForm({ 
                codigo: '', 
                descripcion: '', 
                valor_adquisicion: '', 
                vida_util_meses: 60, 
                fecha_adquisicion: '', 
                estado: 'activo' 
            });
        } catch (err) {
            console.error('Error saving activo:', err);
            setError('No se pudo guardar el activo fijo.');
        }
    };

    const openModal = (activo = null) => {
        if (activo) {
            setCurrentActivo(activo);
            setForm({
                codigo: activo.codigo,
                descripcion: activo.descripcion,
                valor_adquisicion: activo.valor_adquisicion,
                vida_util_meses: activo.vida_util_meses,
                fecha_adquisicion: activo.fecha_adquisicion,
                estado: activo.estado
            });
        } else {
            setCurrentActivo(null);
            setForm({ 
                codigo: '', 
                descripcion: '', 
                valor_adquisicion: '', 
                vida_util_meses: 60, 
                fecha_adquisicion: '', 
                estado: 'activo' 
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentActivo(null);
    };

    const deleteActivo = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este activo fijo?')) {
            try {
                await axiosInstance.delete(`${API_BASE}${id}/`);
                fetchActivos();
            } catch (err) {
                console.error('Error deleting activo:', err);
                setError('No se pudo eliminar el activo fijo.');
            }
        }
    };

    // Filter data
    const filteredActivos = activos.filter(activo => {
        const matchesSearch = activo.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            activo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === 'todos' || activo.estado === filterEstado;
        return matchesSearch && matchesEstado;
    });

    // Calculate statistics
    const totalActivos = activos.length;
    const totalValor = activos.reduce((sum, item) => sum + Number(item.valor_adquisicion || 0), 0);
    const totalNeto = activos.reduce((sum, item) => sum + Number(item.valor_neto || 0), 0);
    const totalDepreciacion = activos.reduce((sum, item) => sum + Number(item.depreciacion_acumulada || 0), 0);
    const activosEnUso = activos.filter(item => item.estado === 'activo').length;
    const activosEnMantenimiento = activos.filter(item => item.estado === 'en_mantenimiento').length;
    const activosDadosBaja = activos.filter(item => item.estado === 'baja').length;

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
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando Activos Fijos...</p>
                </div>
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
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
                            fetchActivos();
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
                        <Building size={32} style={{ color: '#667eea' }} />
                        Activos Fijos
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Administración del ciclo de vida de activos fijos
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
                        Nuevo Activo
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
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Activos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Registrados
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#667eea',
                        margin: '0'
                    }}>
                        {totalActivos}
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
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Valor Adquisición
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Total invertido
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        ${totalValor.toLocaleString()}
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
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Depreciación
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Acumulada
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#ed8936',
                        margin: '0'
                    }}>
                        ${totalDepreciacion.toLocaleString()}
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
                            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Valor Neto
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Actual
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#38b2ac',
                        margin: '0'
                    }}>
                        ${totalNeto.toLocaleString()}
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
                    <CheckCircle size={20} style={{ color: '#48bb78' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>En uso</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#48bb78' }}>{activosEnUso}</p>
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
                    <Wrench size={20} style={{ color: '#ed8936' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>Mantenimiento</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#ed8936' }}>{activosEnMantenimiento}</p>
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
                    <Archive size={20} style={{ color: '#ef4444' }} />
                    <div>
                        <p style={{ margin: '0', fontSize: '0.8rem', color: '#718096' }}>Dados de baja</p>
                        <p style={{ margin: '0', fontSize: '1.2rem', fontWeight: '700', color: '#ef4444' }}>{activosDadosBaja}</p>
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
                            placeholder="Buscar por código, descripción..."
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
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="en_mantenimiento">En mantenimiento</option>
                        <option value="baja">Baja</option>
                    </select>
                </div>
            </div>

            {/* Activos Table */}
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
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '8%' }}>ID</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Código</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '25%' }}>Descripción</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Valor</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Depreciación</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Valor Neto</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Estado</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Fecha Adq</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '7%' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredActivos.map((activo, index) => (
                                <tr key={activo.id} style={{ 
                                    borderBottom: '1px solid #e2e8f0',
                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                }}>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>{activo.id}</td>
                                    <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Package size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activo.codigo}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                        <span style={{ fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activo.descripcion}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>
                                        ${(Number(activo.valor_adquisicion) || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>
                                        ${(Number(activo.depreciacion_acumulada) || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', fontSize: '0.85rem' }}>
                                        ${(Number(activo.valor_neto) || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <span style={{
                                            background: activo.estado === 'activo' ? '#d1fae5' : activo.estado === 'en_mantenimiento' ? '#fbbf24' : '#fee2e2',
                                            color: activo.estado === 'activo' ? '#065f46' : activo.estado === 'en_mantenimiento' ? '#92400e' : '#991b1b',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            display: 'inline-block'
                                        }}>
                                            {activo.estado === 'activo' ? 'Activo' : activo.estado === 'en_mantenimiento' ? 'Mantenimiento' : 'Baja'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                                        {activo.fecha_adquisicion}
                                    </td>
                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => openModal(activo)}
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
                                                onClick={() => deleteActivo(activo.id)}
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

            {/* Modal */}
            {showModal && (
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
                        maxWidth: '500px',
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
                                {currentActivo ? 'Editar Activo' : 'Nuevo Activo'}
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
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                    Código:
                                </label>
                                <input
                                    name="codigo"
                                    value={form.codigo}
                                    onChange={handleChange}
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
                                    Descripción:
                                </label>
                                <input
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
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
                                    Valor adquisición:
                                </label>
                                <input
                                    name="valor_adquisicion"
                                    type="number"
                                    step="0.01"
                                    value={form.valor_adquisicion}
                                    onChange={handleChange}
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
                                    Vida útil (meses):
                                </label>
                                <input
                                    name="vida_util_meses"
                                    type="number"
                                    value={form.vida_util_meses}
                                    onChange={handleChange}
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
                                    Fecha adquisición:
                                </label>
                                <input
                                    name="fecha_adquisicion"
                                    type="date"
                                    value={form.fecha_adquisicion}
                                    onChange={handleChange}
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
                                    Estado:
                                </label>
                                <select
                                    name="estado"
                                    value={form.estado}
                                    onChange={handleChange}
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
                                    <option value="activo">Activo</option>
                                    <option value="en_mantenimiento">En mantenimiento</option>
                                    <option value="baja">Baja</option>
                                </select>
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
                                    {currentActivo ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
