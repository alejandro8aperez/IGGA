import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit3, Trash2, FileText, TrendingUp, AlertCircle, 
    DollarSign, ShoppingCart, Users, Calendar, CheckCircle, 
    Clock, X, Eye, Download, Filter, Search
} from 'lucide-react';
import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/';
const API_ORD_VENTA = `${API_BASE}venta/ordenes-venta/`;
const API_FACT_VENTA = `${API_BASE}venta/facturas-venta/`;

export default function Ventas() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('ordenes');

    // Modal Orden Venta
    const [isOrdModalOpen, setIsOrdModalOpen] = useState(false);
    const [currentOrd, setCurrentOrd] = useState(null);
    const [ordForm, setOrdForm] = useState({
        cliente: '', 
        fecha_entrega_esperada: '', 
        estado: 'borrador', 
        total: 0
    });

    const [ordenesVenta, setOrdenesVenta] = useState([]);
    const [facturasVenta, setFacturasVenta] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resOrd, resFact] = await Promise.all([
                axios.get(API_ORD_VENTA),
                axios.get(API_FACT_VENTA)
            ]);
            setOrdenesVenta(resOrd.data);
            setFacturasVenta(resFact.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de Ventas.');
            setLoading(false);
        }
    };

    const openOrdModal = (ord = null) => {
        if (ord) {
            setCurrentOrd(ord);
            setOrdForm({
                cliente: ord.cliente,
                fecha_entrega_esperada: ord.fecha_entrega_esperada || '',
                estado: ord.estado,
                total: ord.total
            });
        } else {
            setCurrentOrd(null);
            setOrdForm({ 
                cliente: '', 
                fecha_entrega_esperada: '', 
                estado: 'borrador', 
                total: 0 
            });
        }
        setIsOrdModalOpen(true);
    };

    const handleOrdSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentOrd) {
                await axios.put(`${API_ORD_VENTA}${currentOrd.id}/`, ordForm);
            } else {
                await axios.post(API_ORD_VENTA, ordForm);
            }
            fetchData();
            setIsOrdModalOpen(false);
        } catch (err) {
            console.error('Error al guardar orden de venta:', err);
            setError('Error al guardar la orden de venta');
        }
    };

    const deleteOrd = async (id) => {
        if (window.confirm('¿Eliminar esta orden de venta?')) {
            try {
                await axios.delete(`${API_ORD_VENTA}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar orden de venta:', err);
                setError('Error al eliminar la orden de venta');
            }
        }
    };

    const generarFactura = async (orden) => {
        try {
            const numero = `FV-${orden.id}-${Date.now()}`;
            await axios.post(API_FACT_VENTA, {
                orden_venta: orden.id,
                numero_factura: numero,
                total: orden.total,
            });
            fetchData();
        } catch (err) {
            console.error('Error al generar factura:', err);
            setError('Error al generar factura');
        }
    };

    const filteredOrdenes = ordenesVenta.filter(ord => {
        const matchesSearch = ord.cliente?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'todos' || ord.estado === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filteredFacturas = facturasVenta.filter(fact => {
        const matchesSearch = fact.numero_factura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            fact.orden_venta_cliente?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Calcular estadísticas
    const totalVentas = ordenesVenta.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const ordenesPendientes = ordenesVenta.filter(ord => ord.estado === 'pendiente').length;
    const facturasPendientes = facturasVenta.filter(fact => fact.estado === 'pendiente').length;
    const totalFacturado = facturasVenta.reduce((sum, fact) => sum + (fact.total || 0), 0);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '16px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        border: '4px solid rgba(102, 126, 234, 0.2)', 
                        borderTop: '4px solid #667eea', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <div style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1rem' }}>
                        Cargando datos de Ventas...
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh',
                background: '#f8fafc'
            }}>
                <div style={{
                    background: '#fee2e2',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    maxWidth: '500px'
                }}>
                    <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                        Error en Ventas
                    </h3>
                    <p style={{ color: '#991b1b', margin: 0 }}>
                        {error}
                    </p>
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '1rem'
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
                        <ShoppingCart size={32} style={{ color: '#667eea' }} />
                        Gestión de Ventas
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Órdenes de venta y facturación
                    </p>
                </div>
                <button
                    onClick={() => openOrdModal()}
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
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Ventas
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Órdenes de venta
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#667eea',
                        margin: '0'
                    }}>
                        ${totalVentas.toLocaleString()}
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
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Órdenes Pendientes
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Por procesar
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        {ordenesPendientes}
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
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Facturas Pendientes
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Por cobrar
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#ed8936',
                        margin: '0'
                    }}>
                        {facturasPendientes}
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
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Facturado
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Monto total
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#38b2ac',
                        margin: '0'
                    }}>
                        ${totalFacturado.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Search and Filter */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ 
                        position: 'absolute', 
                        left: '1rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#718096'
                    }} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, número de factura..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#667eea';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                        }}
                    />
                </div>
                {activeTab === 'ordenes' && (
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="borrador">Borrador</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="completado">Completado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                )}
            </div>

            {/* Tab Navigation */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                        style={{
                            background: activeTab === 'ordenes' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'ordenes' ? 'white' : '#4a5568',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== 'ordenes') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'ordenes') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('ordenes')}
                    >
                        <ShoppingCart size={16} />
                        Órdenes de Venta
                    </button>
                    <button 
                        style={{
                            background: activeTab === 'facturas' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'facturas' ? 'white' : '#4a5568',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== 'facturas') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'facturas') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('facturas')}
                    >
                        <FileText size={16} />
                        Facturas
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'ordenes' && (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Cliente</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Entrega</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrdenes.map((ord) => (
                                    <tr key={ord.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{ord.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                                {ord.cliente}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {ord.fecha_entrega_esperada || 'No definida'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#2d3748' }}>
                                            ${ord.total?.toLocaleString() || 0}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(ord.estado === 'completado' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : ord.estado === 'confirmado' 
                                                        ? { background: '#dbeafe', color: '#1e40af' }
                                                        : ord.estado === 'pendiente' 
                                                            ? { background: '#fbbf24', color: '#92400e' }
                                                            : ord.estado === 'cancelado' 
                                                                ? { background: '#fee2e2', color: '#991b1b' }
                                                                : { background: '#f3f4f6', color: '#6b7280' })
                                            }}>
                                                {ord.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button 
                                                    style={{
                                                        background: '#e2e8f0',
                                                        color: '#4a5568',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#cbd5e0';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#e2e8f0';
                                                    }}
                                                    onClick={() => openOrdModal(ord)}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    style={{
                                                        background: '#dbeafe',
                                                        color: '#1e40af',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#bfdbfe';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#dbeafe';
                                                    }}
                                                    onClick={() => generarFactura(ord)}
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button 
                                                    style={{
                                                        background: '#fee2e2',
                                                        color: '#991b1b',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#fecaca';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#fee2e2';
                                                    }}
                                                    onClick={() => deleteOrd(ord.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'facturas' && (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Número</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Cliente</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFacturas.map((fact) => (
                                    <tr key={fact.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                            {fact.numero_factura}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                                {fact.orden_venta_cliente}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {new Date(fact.fecha_emision).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#2d3748' }}>
                                            ${fact.total?.toLocaleString() || 0}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(fact.estado === 'pagada' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : fact.estado === 'pendiente' 
                                                        ? { background: '#fbbf24', color: '#92400e' }
                                                        : { background: '#fee2e2', color: '#991b1b' })
                                            }}>
                                                {fact.estado}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button 
                                                    style={{
                                                        background: '#e2e8f0',
                                                        color: '#4a5568',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#cbd5e0';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#e2e8f0';
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    style={{
                                                        background: '#dbeafe',
                                                        color: '#1e40af',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.target.style.backgroundColor = '#bfdbfe';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.target.style.backgroundColor = '#dbeafe';
                                                    }}
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isOrdModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '1.5rem' 
                        }}>
                            <h3 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#1a202c',
                                margin: 0
                            }}>
                                {currentOrd ? 'Editar Orden' : 'Nueva Orden de Venta'}
                            </h3>
                            <button
                                onClick={() => setIsOrdModalOpen(false)}
                                style={{
                                    background: '#f3f4f6',
                                    color: '#4a5568',
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleOrdSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748' 
                                    }}>
                                        Cliente
                                    </label>
                                    <input
                                        type="text"
                                        value={ordForm.cliente}
                                        onChange={(e) => setOrdForm({...ordForm, cliente: e.target.value})}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748' 
                                    }}>
                                        Fecha Entrega Esperada
                                    </label>
                                    <input
                                        type="date"
                                        value={ordForm.fecha_entrega_esperada}
                                        onChange={(e) => setOrdForm({...ordForm, fecha_entrega_esperada: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748' 
                                    }}>
                                        Estado
                                    </label>
                                    <select
                                        value={ordForm.estado}
                                        onChange={(e) => setOrdForm({...ordForm, estado: e.target.value})}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            background: 'white'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <option value="borrador">Borrador</option>
                                        <option value="confirmado">Confirmado</option>
                                        <option value="pendiente">Pendiente</option>
                                        <option value="completado">Completado</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748' 
                                    }}>
                                        Total
                                    </label>
                                    <input
                                        type="number"
                                        value={ordForm.total}
                                        onChange={(e) => setOrdForm({...ordForm, total: parseFloat(e.target.value) || 0})}
                                        required
                                        step="0.01"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                gap: '1rem', 
                                justifyContent: 'flex-end', 
                                marginTop: '1.5rem' 
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOrdModalOpen(false)}
                                    style={{
                                        background: '#f3f4f6',
                                        color: '#4a5568',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    {currentOrd ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
