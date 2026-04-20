import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Truck, AlertCircle, Edit3, Trash2, Plus, X, MapPin, Package,
    Navigation, Clock, CheckCircle, Users, Fuel, Gauge,
    Search, Filter, TrendingUp, Activity
} from 'lucide-react';

const API_VEHICULOS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/logistica/vehiculos/';
const API_ENVIOS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/logistica/envios/';

export default function Logistica() {
    const [vehiculos, setVehiculos] = useState([]);
    const [envios, setEnvios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('vehiculos');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');

    // Modal Vehiculo
    const [isVehModalOpen, setIsVehModalOpen] = useState(false);
    const [currentVeh, setCurrentVeh] = useState(null);
    const [vehForm, setVehForm] = useState({
        placa: '', 
        modelo: '', 
        capacidad: 0, 
        estado: 'disponible',
        tipo: 'camion',
        conductor: '',
        kilometraje: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resVeh, resEnv] = await Promise.all([
                axios.get(API_VEHICULOS),
                axios.get(API_ENVIOS)
            ]);
            setVehiculos(resVeh.data);
            setEnvios(resEnv.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de Logística.');
            setLoading(false);
        }
    };

    const openVehModal = (veh = null) => {
        if (veh) {
            setCurrentVeh(veh);
            setVehForm(veh);
        } else {
            setCurrentVeh(null);
            setVehForm({ 
                placa: '', 
                modelo: '', 
                capacidad: 0, 
                estado: 'disponible',
                tipo: 'camion',
                conductor: '',
                kilometraje: 0
            });
        }
        setIsVehModalOpen(true);
    };

    const handleVehSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentVeh) {
                await axios.put(`${API_VEHICULOS}${currentVeh.id}/`, vehForm);
            } else {
                await axios.post(API_VEHICULOS, vehForm);
            }
            fetchData();
            setIsVehModalOpen(false);
        } catch (err) {
            console.error('Error al guardar vehículo:', err);
            setError('Error al guardar el vehículo');
        }
    };

    const deleteVeh = async (id) => {
        if (window.confirm('¿Eliminar este vehículo?')) {
            try {
                await axios.delete(`${API_VEHICULOS}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar vehículo:', err);
                setError('Error al eliminar el vehículo');
            }
        }
    };

    const filteredVehiculos = vehiculos.filter(veh => {
        const matchesSearch = veh.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            veh.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            veh.conductor?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'todos' || veh.estado === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const filteredEnvios = envios.filter(env => {
        const matchesSearch = env.destino?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            env.numero_envio?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Calcular estadísticas
    const totalVehiculos = vehiculos.length;
    const vehiculosDisponibles = vehiculos.filter(veh => veh.estado === 'disponible').length;
    const vehiculosEnRuta = vehiculos.filter(veh => veh.estado === 'en_ruta').length;
    const totalCapacidad = vehiculos.reduce((sum, veh) => sum + (veh.capacidad || 0), 0);
    const enviosPendientes = envios.filter(env => env.estado === 'pendiente').length;
    const enviosCompletados = envios.filter(env => env.estado === 'completado').length;

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
                        Cargando datos de Logística...
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
                        Error en Logística
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
                        <Truck size={32} style={{ color: '#667eea' }} />
                        Gestión Logística
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Control de flota y envíos
                    </p>
                </div>
                <button
                    onClick={() => openVehModal()}
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
                    Nuevo Vehículo
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
                            <Truck size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Vehículos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Flota completa
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#667eea',
                        margin: '0'
                    }}>
                        {totalVehiculos}
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
                                Disponibles
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Listos para envío
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        {vehiculosDisponibles}
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
                            <Navigation size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                En Ruta
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Activos actualmente
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#ed8936',
                        margin: '0'
                    }}>
                        {vehiculosEnRuta}
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
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Capacidad Total
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Toneladas
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#38b2ac',
                        margin: '0'
                    }}>
                        {totalCapacidad.toLocaleString()}
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
                        placeholder="Buscar por placa, modelo, conductor, destino..."
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
                {activeTab === 'vehiculos' && (
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
                        <option value="disponible">Disponible</option>
                        <option value="en_ruta">En Ruta</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="inactivo">Inactivo</option>
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
                            background: activeTab === 'vehiculos' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'vehiculos' ? 'white' : '#4a5568',
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
                            if (activeTab !== 'vehiculos') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'vehiculos') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('vehiculos')}
                    >
                        <Truck size={16} />
                        Vehículos
                    </button>
                    <button 
                        style={{
                            background: activeTab === 'envios' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'envios' ? 'white' : '#4a5568',
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
                            if (activeTab !== 'envios') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'envios') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('envios')}
                    >
                        <Package size={16} />
                        Envíos
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'vehiculos' && (
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
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Placa</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Modelo</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Conductor</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Capacidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Kilometraje</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehiculos.map((veh) => (
                                    <tr key={veh.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{veh.placa}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                                {veh.modelo}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {veh.conductor || 'No asignado'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>
                                            {veh.capacidad} ton
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>
                                            {veh.kilometraje?.toLocaleString() || 0} km
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(veh.estado === 'disponible' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : veh.estado === 'en_ruta' 
                                                        ? { background: '#fbbf24', color: '#92400e' }
                                                        : veh.estado === 'mantenimiento' 
                                                            ? { background: '#fed7aa', color: '#92400e' }
                                                            : { background: '#f3f4f6', color: '#6b7280' })
                                            }}>
                                                {veh.estado}
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
                                                    onClick={() => openVehModal(veh)}
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
                                                    onClick={() => deleteVeh(veh.id)}
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

            {activeTab === 'envios' && (
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
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Destino</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Vehículo</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Fecha Envío</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Estado</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEnvios.map((env) => (
                                    <tr key={env.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                            {env.numero_envio}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MapPin size={16} style={{ color: '#718096' }} />
                                                {env.destino}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Truck size={16} style={{ color: '#718096' }} />
                                                {env.vehiculo_placa}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {new Date(env.fecha_envio).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(env.estado === 'completado' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : env.estado === 'en_transito' 
                                                        ? { background: '#fbbf24', color: '#92400e' }
                                                        : { background: '#f3f4f6', color: '#6b7280' })
                                            }}>
                                                {env.estado}
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
                                                >
                                                    <MapPin size={16} />
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
            {isVehModalOpen && (
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
                                {currentVeh ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                            </h3>
                            <button
                                onClick={() => setIsVehModalOpen(false)}
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
                        <form onSubmit={handleVehSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ 
                                            display: 'block', 
                                            marginBottom: '0.5rem', 
                                            fontWeight: '600', 
                                            color: '#2d3748' 
                                        }}>
                                            Placa
                                        </label>
                                        <input
                                            type="text"
                                            value={vehForm.placa}
                                            onChange={(e) => setVehForm({...vehForm, placa: e.target.value})}
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
                                            Modelo
                                        </label>
                                        <input
                                            type="text"
                                            value={vehForm.modelo}
                                            onChange={(e) => setVehForm({...vehForm, modelo: e.target.value})}
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
                                            Conductor
                                        </label>
                                        <input
                                            type="text"
                                            value={vehForm.conductor}
                                            onChange={(e) => setVehForm({...vehForm, conductor: e.target.value})}
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
                                            Tipo
                                        </label>
                                        <select
                                            value={vehForm.tipo}
                                            onChange={(e) => setVehForm({...vehForm, tipo: e.target.value})}
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
                                            <option value="camion">Camión</option>
                                            <option value="furgoneta">Furgoneta</option>
                                            <option value="motocicleta">Motocicleta</option>
                                            <option value="otro">Otro</option>
                                        </select>
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
                                            Capacidad (ton)
                                        </label>
                                        <input
                                            type="number"
                                            value={vehForm.capacidad}
                                            onChange={(e) => setVehForm({...vehForm, capacidad: parseFloat(e.target.value) || 0})}
                                            required
                                            step="0.1"
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
                                            Kilometraje
                                        </label>
                                        <input
                                            type="number"
                                            value={vehForm.kilometraje}
                                            onChange={(e) => setVehForm({...vehForm, kilometraje: parseInt(e.target.value) || 0})}
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
                                        value={vehForm.estado}
                                        onChange={(e) => setVehForm({...vehForm, estado: e.target.value})}
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
                                        <option value="disponible">Disponible</option>
                                        <option value="en_ruta">En Ruta</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                        <option value="inactivo">Inactivo</option>
                                    </select>
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
                                    onClick={() => setIsVehModalOpen(false)}
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
                                    {currentVeh ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
