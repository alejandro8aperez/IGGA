import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Edit3, Trash2, Plus, X, FileText, Phone, Mail, Building2, Calendar, DollarSign, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CotizacionesCRM from '../components/CotizacionesCRM';

const API_URL = 'http://127.0.0.1:8000/api/crm/clientes/';

function CRM() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clientes');
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        representante: '',
        cedula: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            console.log('CRM: Cargando clientes desde:', API_URL);
            const response = await axios.get(API_URL);
            console.log('CRM: Clientes cargados:', response.data);
            setClientes(response.data);
            setLoading(false);
        } catch (err) {
            console.error('CRM: Error al cargar clientes:', err);
            console.error('CRM: Detalles del error:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(`Error al cargar clientes del CRM: ${err.message || 'Error de conexión'}`);
            setLoading(false);
        }
    };

    const openModal = (client = null) => {
        if (client) {
            setCurrentClient(client);
            setFormData({
                nombre: client.nombre,
                representante: client.representante || '',
                cedula: client.cedula || '',
                email: client.email,
                telefono: client.telefono,
                direccion: client.direccion
            });
        } else {
            setCurrentClient(null);
            setFormData({
                nombre: '',
                representante: '',
                cedula: '',
                email: '',
                telefono: '',
                direccion: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentClient(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentClient) {
                await axios.put(`${API_URL}${currentClient.id}/`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            closeModal();
            fetchClientes();
        } catch (err) {
            alert("Error al guardar el cliente.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este cliente definitivamente?')) {
            try {
                await axios.delete(`${API_URL}${id}/`);
                fetchClientes();
            } catch (err) {
                alert("Error al eliminar el cliente.");
            }
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        border: '4px solid rgba(255,255,255,0.3)', 
                        borderTop: '4px solid white', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>Cargando CRM...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '700', 
                            color: '#1a202c',
                            margin: '0 0 0.5rem 0'
                        }}>
                            CRM Avanzado
                        </h1>
                        <p style={{ 
                            fontSize: '1.1rem', 
                            color: '#718096',
                            margin: 0
                        }}>
                            Gestión de Clientes y Oportunidades
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
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
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <X size={18} />
                        Volver al Inicio
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
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('clientes')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'clientes' ? '#667eea' : '#718096',
                            backgroundColor: activeTab === 'clientes' ? '#f0f4ff' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Clientes
                    </button>
                    <button
                        onClick={() => setActiveTab('cotizaciones')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'cotizaciones' ? '#667eea' : '#718096',
                            backgroundColor: activeTab === 'cotizaciones' ? '#f0f4ff' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <FileText size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Cotizaciones
                    </button>
                </div>

                {activeTab === 'clientes' ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}>
                                    <Users size={24} />
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{clientes.length}</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Clientes</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button 
                                    onClick={() => {
                                        window.location.href = '/form-designer?template=Cotización%20CRM';
                                    }}
                                    style={{
                                        background: 'white',
                                        color: '#667eea',
                                        border: '2px solid #667eea',
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
                                        e.target.style.backgroundColor = '#667eea';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'white';
                                        e.target.style.color = '#667eea';
                                    }}
                                >
                                    <Palette size={18} />
                                    Personalizar
                                </button>
                                <button 
                                    onClick={() => openModal()}
                                    style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
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
                                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
                                    }}
                                >
                                    <Plus size={18} />
                                    Nuevo Cliente
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Nombre</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Teléfono</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Representante</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientes.map((cliente, index) => (
                                            <tr key={cliente.id} style={{ 
                                                borderBottom: '1px solid #e2e8f0',
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                            }}>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Building2 size={16} style={{ color: '#667eea' }} />
                                                        {cliente.nombre}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Mail size={14} style={{ color: '#718096' }} />
                                                        {cliente.email}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Phone size={14} style={{ color: '#718096' }} />
                                                        {cliente.telefono || 'N/A'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#4a5568' }}>
                                                    {cliente.representante || 'N/A'}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button 
                                                            onClick={() => openModal(cliente)}
                                                            style={{
                                                                background: '#667eea',
                                                                color: 'white',
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
                                                                e.target.style.backgroundColor = '#5a67d8';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = '#667eea';
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(cliente.id)}
                                                            style={{
                                                                background: '#e53e3e',
                                                                color: 'white',
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
                                                                e.target.style.backgroundColor = '#c53030';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = '#e53e3e';
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {clientes.length === 0 && !error && (
                                    <div style={{ 
                                        padding: '4rem', 
                                        textAlign: 'center', 
                                        color: '#718096',
                                        background: '#f8fafc'
                                    }}>
                                        <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                            No hay clientes registrados
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            Empieza añadiendo tu primer cliente para comenzar a gestionar tus relaciones.
                                        </div>
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
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Plus size={18} />
                                            Crear Primer Cliente
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <CotizacionesCRM />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(4px)'
                }} onClick={closeModal}>
                    <div 
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '600px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#2d3748',
                                margin: 0
                            }}>
                                {currentClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <button 
                                onClick={closeModal}
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
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Nombre *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Cédula</label>
                                    <input
                                        type="text"
                                        name="cedula"
                                        value={formData.cedula}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
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
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Representante</label>
                                    <input
                                        type="text"
                                        name="representante"
                                        value={formData.representante}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
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
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Dirección</label>
                                <textarea
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    rows={3}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        resize: 'vertical',
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
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    style={{
                                        background: '#e2e8f0',
                                        color: '#4a5568',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#cbd5e0';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#e2e8f0';
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
                                    {currentClient ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CRM;
