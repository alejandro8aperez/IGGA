import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ShoppingCart, AlertCircle, Edit3, Trash2, Plus, X, Truck, FileText, Palette,
    Users, DollarSign, Package, CheckCircle, Clock, TrendingUp,
    Search, Filter, Calendar, CreditCard
} from 'lucide-react';

const API_PROV = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/proveedores/';
const API_ORD = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/ordenes/';
const API_RECEPCION = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/recepciones/';
const API_PAGO = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/compras/pagos/';

export default function Compras() {
    const [proveedores, setProveedores] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [recepciones, setRecepciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('proveedores');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    // Modal Proveedores
    const [isProvModalOpen, setIsProvModalOpen] = useState(false);
    const [currentProv, setCurrentProv] = useState(null);
    const [provForm, setProvForm] = useState({
        razon_social: '', 
        nit: '', 
        contacto_nombre: '', 
        contacto_email: '', 
        contacto_telefono: '', 
        direccion: '',
        tipo: 'nacional',
        estado: 'activo'
    });

    // Modal Pagos
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [pagoForm, setPagoForm] = useState({
        orden: '',
        monto: '',
        metodo: 'transferencia',
        referencia: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resProv, resOrd, resRecep, resPagos] = await Promise.all([
                axios.get(API_PROV),
                axios.get(API_ORD),
                axios.get(API_RECEPCION),
                axios.get(API_PAGO)
            ]);
            setProveedores(resProv.data);
            setOrdenes(resOrd.data);
            setRecepciones(resRecep.data);
            setPagos(resPagos.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de Compras.');
            setLoading(false);
        }
    };

    const openProvModal = (prov = null) => {
        if (prov) {
            setCurrentProv(prov);
            setProvForm(prov);
        } else {
            setCurrentProv(null);
            setProvForm({ 
                razon_social: '', 
                nit: '', 
                contacto_nombre: '', 
                contacto_email: '', 
                contacto_telefono: '', 
                direccion: '',
                tipo: 'nacional',
                estado: 'activo'
            });
        }
        setIsProvModalOpen(true);
    };

    const handleProvSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProv) {
                await axios.put(`${API_PROV}${currentProv.id}/`, provForm);
            } else {
                await axios.post(API_PROV, provForm);
            }
            setIsProvModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error al guardar proveedor:', err);
            setError('Error al guardar proveedor');
        }
    };

    const handleProvDelete = async (id) => {
        if (window.confirm('¿Eliminar proveedor? (Puede fallar si tiene órdenes asociadas)')) {
            try {
                await axios.delete(`${API_PROV}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar proveedor:', err);
                setError('Error al eliminar proveedor. Es probable que tenga órdenes de compra asociadas.');
            }
        }
    };

    const registrarRecepcion = async (orden) => {
        if (orden.estado === 'cancelada') {
            setError('No se puede recibir una orden cancelada.');
            return;
        }

        const cantidad = Number(prompt('Cantidad recibida:', orden.cantidad || 0));
        if (!cantidad || cantidad <= 0) return;

        try {
            await axios.post(API_RECEPCION, {
                orden: orden.id,
                cantidad_recibida: cantidad,
                fecha_recepcion: new Date().toISOString().split('T')[0],
                estado: 'recibida'
            });
            fetchData();
        } catch (err) {
            console.error('Error al registrar recepción:', err);
            setError('Error al registrar recepción');
        }
    };

    const openPagoModal = (ordenId = '') => {
        setPagoForm({
            orden: ordenId,
            monto: '',
            metodo: 'transferencia',
            referencia: ''
        });
        setIsPagoModalOpen(true);
    };

    const handlePagoSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(API_PAGO, {
                orden: Number(pagoForm.orden),
                monto: Number(pagoForm.monto),
                metodo: pagoForm.metodo,
                referencia: pagoForm.referencia
            });
            setIsPagoModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error al registrar pago:', err);
            setError(err.response?.data?.error || 'Error al registrar pago');
        }
    };

    const filteredProveedores = proveedores.filter(prov => {
        const matchesSearch = prov.razon_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prov.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            prov.contacto_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'todos' || prov.estado === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filteredOrdenes = ordenes.filter(ord => {
        const matchesSearch = ord.numero_orden?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            ord.proveedor_razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredRecepciones = recepciones.filter(rec => {
        const matchesSearch = rec.orden_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rec.proveedor_razon_social?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const filteredPagos = pagos.filter(p => {
        const orden = ordenes.find(o => o.id === p.orden);
        const provName = orden?.proveedor_nombre || '';
        return provName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               p.referencia?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Calcular estadísticas
    const totalProveedores = proveedores.length;
    const proveedoresActivos = proveedores.filter(prov => prov.estado === 'activo').length;
    const totalOrdenes = ordenes.length;
    const ordenesPendientes = ordenes.filter(ord => ord.estado === 'pendiente').length;
    const totalCompras = ordenes.reduce((sum, ord) => sum + (ord.total || 0), 0);
    const recepcionesPendientes = recepciones.filter(rec => rec.estado === 'pendiente').length;

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
                        Cargando datos de Compras...
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
                        Error en Compras
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
                        Gestión de Compras
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Proveedores y órdenes de compra
                    </p>
                </div>
                <button
                    onClick={() => openProvModal()}
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
                    Nuevo Proveedor
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
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Proveedores
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
                        {totalProveedores}
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
                                Proveedores Activos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Disponibles
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        {proveedoresActivos}
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
                        color: '#ed8936',
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
                            background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
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
                                Total Compras
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Monto acumulado
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#38b2ac',
                        margin: '0'
                    }}>
                        ${totalCompras.toLocaleString()}
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
                        placeholder="Buscar por proveedor, NIT, número de orden..."
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
                {activeTab === 'proveedores' && (
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
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
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
                            background: activeTab === 'proveedores' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'proveedores' ? 'white' : '#4a5568',
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
                            if (activeTab !== 'proveedores') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'proveedores') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('proveedores')}
                    >
                        <Users size={16} />
                        Proveedores
                    </button>
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
                        <FileText size={16} />
                        Órdenes de Compra
                    </button>
                    <button 
                        style={{
                            background: activeTab === 'recepciones' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'recepciones' ? 'white' : '#4a5568',
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
                            if (activeTab !== 'recepciones') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'recepciones') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('recepciones')}
                    >
                        <Package size={16} />
                        Recepciones
                    </button>
                    <button 
                        style={{
                            background: activeTab === 'pagos' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'pagos' ? 'white' : '#4a5568',
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
                            if (activeTab !== 'pagos') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'pagos') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('pagos')}
                    >
                        <CreditCard size={16} />
                        Pagos
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'proveedores' && (
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
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Razón Social</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>NIT</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Contacto</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Email</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Teléfono</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProveedores.map((prov) => (
                                    <tr key={prov.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{prov.razon_social}</td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>{prov.nit}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {prov.contacto_nombre}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>{prov.contacto_email}</td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>{prov.contacto_telefono}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(prov.estado === 'activo' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : prov.estado === 'inactivo' 
                                                        ? { background: '#fee2e2', color: '#991b1b' }
                                                        : { background: '#fbbf24', color: '#92400e' })
                                            }}>
                                                {prov.estado}
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
                                                    onClick={() => openProvModal(prov)}
                                                >
                                                    <Edit3 size={16} />
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
                                                    onClick={() => handleProvDelete(prov.id)}
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
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Número</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Proveedor</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Total</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrdenes.map((ord) => (
                                    <tr key={ord.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{ord.numero_orden}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {ord.proveedor_razon_social}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {new Date(ord.fecha_orden).toLocaleDateString()}
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
                                                ...(ord.estado === 'recibida' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : ord.estado === 'pendiente' 
                                                        ? { background: '#fbbf24', color: '#92400e' }
                                                        : ord.estado === 'cancelada' 
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
                                                    onClick={() => registrarRecepcion(ord)}
                                                >
                                                    <Package size={16} />
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

            {activeTab === 'recepciones' && (
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
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Orden</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Proveedor</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Recepción</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Cantidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecepciones.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{rec.orden_numero}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {rec.proveedor_razon_social}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {new Date(rec.fecha_recepcion).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>
                                            {rec.cantidad_recibida}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(rec.estado === 'recibida' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : { background: '#fbbf24', color: '#92400e' })
                                            }}>
                                                {rec.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'pagos' && (
                <div>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#2d3748',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <CreditCard size={24} style={{ color: '#667eea' }} />
                            Gestión de Pagos a Proveedores
                        </h3>
                        <button
                            onClick={() => openPagoModal()}
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
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                            }}
                        >
                            <Plus size={20} /> Nuevo Pago
                        </button>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', margin: '0 0 0.25rem 0' }}>Total Pagado</h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>A proveedores</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea', margin: '0' }}>
                                ${pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'linear-gradient(135deg, #ed8936 0%, #f59e0b 100%)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', margin: '0 0 0.25rem 0' }}>Por Pagar</h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>Saldo pendiente</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ed8936', margin: '0' }}>
                                ${(() => {
                                    const tOrd = ordenes.filter(o => o.estado !== 'cancelada').reduce((sum, o) => sum + Number(o.total || 0), 0);
                                    const tPag = pagos.reduce((sum, p) => sum + Number(p.monto || 0), 0);
                                    return Math.max(tOrd - tPag, 0).toLocaleString();
                                })()}
                            </p>
                        </div>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', margin: '0 0 0.25rem 0' }}>Pagos Registrados</h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>Transacciones</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#48bb78', margin: '0' }}>{pagos.length}</p>
                        </div>
                        <div style={{
                            background: 'white', borderRadius: '16px', padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '50px', height: '50px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2d3748', margin: '0 0 0.25rem 0' }}>Órdenes con Saldo</h3>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>Pendientes</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', margin: '0' }}>
                                {(() => {
                                    const oa = ordenes.filter(o => o.estado !== 'cancelada');
                                    return oa.filter(o => {
                                        const tp = pagos.filter(p => p.orden === o.id).reduce((s, p) => s + Number(p.monto || 0), 0);
                                        return tp < Number(o.total || 0);
                                    }).length;
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Payments Table */}
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
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Orden</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Proveedor</th>
                                        <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Monto</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Método</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Referencia</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPagos.map((pago) => {
                                        const orden = ordenes.find(o => o.id === pago.orden);
                                        return (
                                            <tr key={pago.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '1rem', color: '#4a5568' }}>{new Date(pago.fecha).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>OC-{pago.orden}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Users size={16} style={{ color: '#718096' }} />
                                                        {orden?.proveedor_nombre || 'Desconocido'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#2d3748' }}>${Number(pago.monto).toLocaleString()}</td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '9999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        ...(pago.metodo === 'efectivo' ? { background: '#d1fae5', color: '#065f46' }
                                                            : pago.metodo === 'cheque' ? { background: '#dbeafe', color: '#1e40af' }
                                                            : { background: '#fef3c7', color: '#92400e' })
                                                    }}>
                                                        {pago.metodo}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#4a5568', fontFamily: 'monospace', fontSize: '0.85rem' }}>{pago.referencia || '-'}</td>
                                            </tr>
                                        );
                                    })}
                                    {filteredPagos.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                                    <CreditCard size={48} style={{ color: '#cbd5e0' }} />
                                                    <p>No hay pagos registrados</p>
                                                    <button
                                                        onClick={() => openPagoModal()}
                                                        style={{
                                                            padding: '0.75rem 1.5rem',
                                                            background: '#667eea',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Registrar primer pago
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isProvModalOpen && (
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
                        maxWidth: '600px',
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
                                {currentProv ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h3>
                            <button
                                onClick={() => setIsProvModalOpen(false)}
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
                        <form onSubmit={handleProvSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: '600', 
                                            color: '#2d3748' 
                                        }}>
                                            Razón Social *
                                        </label>
                                        <input
                                            type="text"
                                            value={provForm.razon_social}
                                            onChange={(e) => setProvForm({...provForm, razon_social: e.target.value})}
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
                                            NIT *
                                        </label>
                                        <input
                                            type="text"
                                            value={provForm.nit}
                                            onChange={(e) => setProvForm({...provForm, nit: e.target.value})}
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
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: '600', 
                                            color: '#2d3748' 
                                        }}>
                                            Contacto
                                        </label>
                                        <input
                                            type="text"
                                            value={provForm.contacto_nombre}
                                            onChange={(e) => setProvForm({...provForm, contacto_nombre: e.target.value})}
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
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={provForm.contacto_email}
                                            onChange={(e) => setProvForm({...provForm, contacto_email: e.target.value})}
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
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: '600', 
                                            color: '#2d3748' 
                                        }}>
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={provForm.contacto_telefono}
                                            onChange={(e) => setProvForm({...provForm, contacto_telefono: e.target.value})}
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
                                            value={provForm.estado}
                                            onChange={(e) => setProvForm({...provForm, estado: e.target.value})}
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
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                            <option value="suspendido">Suspendido</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ 
                                        display: 'block', 
                                        marginBottom: '0.5rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748' 
                                    }}>
                                        Dirección
                                    </label>
                                    <textarea
                                        value={provForm.direccion}
                                        onChange={(e) => setProvForm({...provForm, direccion: e.target.value})}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            resize: 'vertical'
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
                                    onClick={() => setIsProvModalOpen(false)}
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
                                    {currentProv ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Pago */}
            {isPagoModalOpen && (
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                Registrar Pago a Proveedor
                            </h3>
                            <button
                                onClick={() => setIsPagoModalOpen(false)}
                                style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handlePagoSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Orden de Compra *
                                    </label>
                                    <select
                                        value={pagoForm.orden}
                                        onChange={(e) => setPagoForm({...pagoForm, orden: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'white' }}
                                        onFocus={(e) => { e.target.style.borderColor = '#667eea'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                                    >
                                        <option value="">Seleccione una orden...</option>
                                        {ordenes.filter(o => o.estado !== 'cancelada').map(o => (
                                            <option key={o.id} value={o.id}>
                                                OC-{o.id} - {o.proveedor_nombre || 'Proveedor'} (${Number(o.total).toLocaleString()})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Monto a Pagar *
                                    </label>
                                    <input
                                        type="number"
                                        value={pagoForm.monto}
                                        onChange={(e) => setPagoForm({...pagoForm, monto: e.target.value})}
                                        required
                                        min="1"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                        onFocus={(e) => { e.target.style.borderColor = '#667eea'; }}
                                        onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                            Método de Pago
                                        </label>
                                        <select
                                            value={pagoForm.metodo}
                                            onChange={(e) => setPagoForm({...pagoForm, metodo: e.target.value})}
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'white' }}
                                            onFocus={(e) => { e.target.style.borderColor = '#667eea'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                                        >
                                            <option value="transferencia">Transferencia</option>
                                            <option value="efectivo">Efectivo</option>
                                            <option value="cheque">Cheque</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                            Referencia
                                        </label>
                                        <input
                                            type="text"
                                            value={pagoForm.referencia}
                                            onChange={(e) => setPagoForm({...pagoForm, referencia: e.target.value})}
                                            placeholder="N° de transferencia, cheque..."
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                            onFocus={(e) => { e.target.style.borderColor = '#667eea'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsPagoModalOpen(false)}
                                    style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
                                >
                                    Guardar Pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
