import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, AlertCircle, Edit3, Trash2, Plus, X, FileSpreadsheet, Calendar, DollarSign, User, Package, Clock, Shield, Percent } from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/crm/cotizaciones/';
const CLIENTES_URL = 'http://127.0.0.1:8000/api/crm/clientes/';

export default function CotizacionesCRM() {
    const [cotizaciones, setCotizaciones] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCoti, setCurrentCoti] = useState(null);

    const [formData, setFormData] = useState({
        cliente: '',
        asunto: '',
        tiempo_entrega: '15 días hábiles',
        forma_pago: 'Contado',
        garantia: '1 Año',
        validez_oferta: '30 Días',
        porcentaje_iva: 19.00,
        valor_total: 0,
        gran_total: 0,
        estado: 'borrador',
        fecha_validez: '',
        detalles: []
    });

    useEffect(() => {
        fetchDatos();
    }, []);

    // Recalcular el total cada vez que cambien los detalles o el IVA
    useEffect(() => {
        if (formData.detalles && formData.detalles.length >= 0) {
            const total = formData.detalles.reduce((acc, current) => acc + (parseFloat(current.valor_total) || 0), 0);
            const iva_amount = (total * parseFloat(formData.porcentaje_iva || 0)) / 100;
            const granTotal = total + iva_amount;
            setFormData(prev => ({ ...prev, valor_total: total, gran_total: granTotal }));
        }
    }, [formData.detalles, formData.porcentaje_iva]);

    const fetchDatos = async () => {
        try {
            const [cotizacionesRes, clientesRes] = await Promise.all([
                axios.get(API_URL),
                axios.get(CLIENTES_URL)
            ]);
            setCotizaciones(cotizacionesRes.data);
            setClientes(clientesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("Error al cargar los datos. Por favor, intenta de nuevo.");
            setLoading(false);
        }
    };

    const openModal = (coti = null) => {
        if (coti) {
            setCurrentCoti(coti);
            setFormData({
                cliente: coti.cliente,
                asunto: coti.asunto,
                tiempo_entrega: coti.tiempo_entrega || '15 días hábiles',
                forma_pago: coti.forma_pago || 'Contado',
                garantia: coti.garantia || '1 Año',
                validez_oferta: coti.validez_oferta || '30 Días',
                porcentaje_iva: coti.porcentaje_iva || 19.00,
                valor_total: coti.valor_total,
                gran_total: coti.gran_total || 0,
                estado: coti.estado,
                fecha_validez: coti.fecha_validez || '',
                detalles: coti.detalles || []
            });
        } else {
            setCurrentCoti(null);
            setFormData({
                cliente: clientes.length > 0 ? clientes[0].id : '',
                asunto: '',
                tiempo_entrega: '15 días hábiles',
                forma_pago: 'Contado',
                garantia: '1 Año',
                validez_oferta: '30 Días',
                porcentaje_iva: 19.00,
                valor_total: 0,
                gran_total: 0,
                estado: 'borrador',
                fecha_validez: '',
                detalles: [{
                    item: 1,
                    producto: '',
                    unidad: 'Und',
                    cantidad: 1,
                    valor_unitario: 0,
                    valor_total: 0
                }]
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentCoti(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index][field] = value;
        
        // Recalcular valor_total si cambian cantidad o valor_unitario
        if (field === 'cantidad' || field === 'valor_unitario') {
            const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
            const valorUnitario = parseFloat(newDetalles[index].valor_unitario) || 0;
            newDetalles[index].valor_total = cantidad * valorUnitario;
        }
        
        setFormData({ ...formData, detalles: newDetalles });
    };

    const addDetalle = () => {
        const newItem = {
            item: formData.detalles.length + 1,
            producto: '',
            unidad: 'Und',
            cantidad: 1,
            valor_unitario: 0,
            valor_total: 0
        };
        setFormData({ ...formData, detalles: [...formData.detalles, newItem] });
    };

    const removeDetalle = (index) => {
        if (formData.detalles.length > 1) {
            const newDetalles = formData.detalles.filter((_, i) => i !== index);
            // Reenumerar items
            const renumeratedDetalles = newDetalles.map((detalle, i) => ({
                ...detalle,
                item: i + 1
            }));
            setFormData({ ...formData, detalles: renumeratedDetalles });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCoti) {
                await axios.put(`${API_URL}${currentCoti.id}/`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            closeModal();
            fetchDatos();
        } catch (err) {
            console.error("Detalles del error del servidor:", err.response?.data);
            const backendErrors = err.response?.data
                ? JSON.stringify(err.response.data)
                : err.message;
            alert(`Error al guardar: ${backendErrors}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta cotización definitivamente?')) {
            try {
                await axios.delete(`${API_URL}${id}/`);
                fetchDatos();
            } catch (err) {
                alert("Error al eliminar la cotización.");
            }
        }
    };

    const handleDownloadExcel = (id) => {
        window.open(`${API_URL}${id}/excel/`, '_blank');
    };

    const handleViewDetails = (coti) => {
        alert(`Detalles de la cotización ${coti.numero_cotizacion || `KAVE-${String(coti.id).padStart(4, '0')}`}:\n\nCliente: ${coti.cliente_nombre || (clientes.find(c => c.id === coti.cliente)?.nombre)}\nAsunto: ${coti.asunto}\nTotal: ${(Number(coti.gran_total || coti.valor_total) || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}\nEstado: ${coti.estado}\n\nItems: ${(coti.detalles || []).length} productos`);
    };

    const getBadgeStyle = (estado) => {
        switch (estado) {
            case 'enviada': return { background: '#DBEAFE', color: '#1E40AF' };
            case 'aceptada': return { background: '#D1FAE5', color: '#065F46' };
            case 'rechazada': return { background: '#FEE2E2', color: '#991B1B' };
            default: return { background: '#F3F4F6', color: '#374151' };
        }
    };

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
                    <div style={{ color: '#667eea', fontWeight: '600' }}>Cargando cotizaciones...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: '700', 
                        color: '#1a202c',
                        margin: '0 0 0.5rem 0'
                    }}>
                        Gestión de Cotizaciones
                    </h2>
                    <p style={{ 
                        fontSize: '1rem', 
                        color: '#718096',
                        margin: 0
                    }}>
                        Administra y crea cotizaciones para tus clientes
                    </p>
                </div>
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
                        <FileText size={24} />
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{cotizaciones.length}</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Cotizaciones</div>
                        </div>
                    </div>
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
                        Nueva Cotización
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

            {/* Table */}
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
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Número</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Cliente</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Asunto</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Total</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Estado</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Fecha</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cotizaciones.map((coti, index) => (
                                <tr key={coti.id} style={{ 
                                    borderBottom: '1px solid #e2e8f0',
                                    backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                }}>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={16} style={{ color: '#667eea' }} />
                                            {coti.numero_cotizacion || `KAVE-${String(coti.id).padStart(4, '0')}`}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={14} style={{ color: '#718096' }} />
                                            {coti.cliente_nombre || (clientes.find(c => c.id === coti.cliente)?.nombre)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#4a5568' }}>{coti.asunto}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#667eea' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <DollarSign size={14} />
                                            {(Number(coti.gran_total || coti.valor_total) || 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            ...getBadgeStyle(coti.estado)
                                        }}>
                                            {coti.estado.charAt(0).toUpperCase() + coti.estado.slice(1)}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#4a5568' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} style={{ color: '#718096' }} />
                                            {new Date(coti.fecha_creacion).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => handleViewDetails(coti)}
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
                                                title="Ver detalles"
                                            >
                                                <FileText size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDownloadExcel(coti.id)}
                                                style={{
                                                    background: '#48bb78',
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
                                                    e.target.style.backgroundColor = '#38a169';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = '#48bb78';
                                                }}
                                                title="Generar Excel"
                                            >
                                                <FileSpreadsheet size={14} />
                                            </button>
                                            <button 
                                                onClick={() => openModal(coti)} 
                                                style={{
                                                    background: '#ed8936',
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
                                                    e.target.style.backgroundColor = '#dd6b20';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.target.style.backgroundColor = '#ed8936';
                                                }}
                                                title="Editar"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(coti.id)}
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
                    
                    {cotizaciones.length === 0 && (
                        <div style={{ 
                            padding: '4rem', 
                            textAlign: 'center', 
                            color: '#718096',
                            background: '#f8fafc'
                        }}>
                            <FileText size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
                            <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                No hay cotizaciones registradas
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                Crea tu primera cotización para comenzar a gestionar tus ventas.
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
                                Crear Primera Cotización
                            </button>
                        </div>
                    )}
                </div>
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
                            width: '95%',
                            maxWidth: '900px',
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
                                {currentCoti ? 'Editar Cotización' : 'Nueva Cotización'}
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
                            {/* Información General */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '600', 
                                    color: '#2d3748',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <FileText size={18} style={{ color: '#667eea' }} />
                                    Información General
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <User size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Cliente *
                                        </label>
                                        <select
                                            name="cliente"
                                            value={formData.cliente}
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
                                        >
                                            <option value="">Selecciona un cliente</option>
                                            {clientes.map(cliente => (
                                                <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <FileText size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Asunto *
                                        </label>
                                        <input
                                            type="text"
                                            name="asunto"
                                            value={formData.asunto}
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <Clock size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Tiempo de Entrega
                                        </label>
                                        <input
                                            type="text"
                                            name="tiempo_entrega"
                                            value={formData.tiempo_entrega}
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <DollarSign size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Forma de Pago
                                        </label>
                                        <input
                                            type="text"
                                            name="forma_pago"
                                            value={formData.forma_pago}
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <Shield size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Garantía
                                        </label>
                                        <input
                                            type="text"
                                            name="garantia"
                                            value={formData.garantia}
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Validez de Oferta
                                        </label>
                                        <input
                                            type="text"
                                            name="validez_oferta"
                                            value={formData.validez_oferta}
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            <Percent size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            IVA (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="porcentaje_iva"
                                            value={formData.porcentaje_iva}
                                            onChange={handleInputChange}
                                            step="0.01"
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
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                            Estado
                                        </label>
                                        <select
                                            name="estado"
                                            value={formData.estado}
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
                                        >
                                            <option value="borrador">Borrador</option>
                                            <option value="enviada">Enviada</option>
                                            <option value="aceptada">Aceptada</option>
                                            <option value="rechazada">Rechazada</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <Package size={18} style={{ color: '#667eea' }} />
                                        Detalles de la Cotización
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={addDetalle}
                                        style={{
                                            background: '#667eea',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#5a67d8';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = '#667eea';
                                        }}
                                    >
                                        <Plus size={14} />
                                        Agregar Item
                                    </button>
                                </div>
                                
                                <div style={{ 
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#e2e8f0' }}>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>#</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Producto</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>Unidad</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>Cantidad</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#4a5568', fontWeight: '600' }}>V. Unitario</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'right', color: '#4a5568', fontWeight: '600' }}>V. Total</th>
                                                <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.detalles.map((detalle, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <span style={{
                                                            background: '#667eea',
                                                            color: 'white',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '600'
                                                        }}>
                                                            {detalle.item}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            type="text"
                                                            value={detalle.producto}
                                                            onChange={(e) => handleDetalleChange(index, 'producto', e.target.value)}
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '0.5rem', 
                                                                border: '1px solid #e2e8f0', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.875rem'
                                                            }}
                                                            placeholder="Nombre del producto"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            type="text"
                                                            value={detalle.unidad}
                                                            onChange={(e) => handleDetalleChange(index, 'unidad', e.target.value)}
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '0.5rem', 
                                                                border: '1px solid #e2e8f0', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.875rem',
                                                                textAlign: 'center'
                                                            }}
                                                            placeholder="Und"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            type="number"
                                                            value={detalle.cantidad}
                                                            onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '0.5rem', 
                                                                border: '1px solid #e2e8f0', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.875rem',
                                                                textAlign: 'center'
                                                            }}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            type="number"
                                                            value={detalle.valor_unitario}
                                                            onChange={(e) => handleDetalleChange(index, 'valor_unitario', e.target.value)}
                                                            style={{ 
                                                                width: '100%', 
                                                                padding: '0.5rem', 
                                                                border: '1px solid #e2e8f0', 
                                                                borderRadius: '4px',
                                                                fontSize: '0.875rem',
                                                                textAlign: 'right'
                                                            }}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                                                        ${(detalle.valor_total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeDetalle(index)}
                                                            disabled={formData.detalles.length === 1}
                                                            style={{
                                                                background: formData.detalles.length === 1 ? '#e2e8f0' : '#e53e3e',
                                                                color: formData.detalles.length === 1 ? '#a0aec0' : 'white',
                                                                border: 'none',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '4px',
                                                                cursor: formData.detalles.length === 1 ? 'not-allowed' : 'pointer',
                                                                fontSize: '0.75rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                if (formData.detalles.length > 1) {
                                                                    e.target.style.backgroundColor = '#c53030';
                                                                }
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = formData.detalles.length === 1 ? '#e2e8f0' : '#e53e3e';
                                                            }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Resumen */}
                            <div style={{ 
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: '600', 
                                    color: '#2d3748',
                                    marginBottom: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <DollarSign size={18} style={{ color: '#667eea' }} />
                                    Resumen de Valores
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>Subtotal</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4a5568' }}>
                                            ${(formData.valor_total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>IVA ({formData.porcentaje_iva}%)</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4a5568' }}>
                                            ${((formData.valor_total || 0) * (formData.porcentaje_iva || 0) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>Total</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                                            ${(formData.gran_total || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
                                    {currentCoti ? 'Actualizar' : 'Guardar'} Cotización
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
