import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Calculator, FileText, Save, Download, Upload, Plus, X, Edit3, Trash2,
    Search, Filter, User, Mail, Phone, Building, DollarSign, Calendar,
    AlertCircle, CheckCircle, TrendingUp, BarChart3, Activity,
    Target, Zap, Settings, Wrench, Package, Truck, Users, Clock, ScanLine, Barcode
} from 'lucide-react';
import API from '../config/api';
import { buscarProductoPorCodigoBarras, productoParaCotizacion } from '../utils/productoBarcode';

const API_CLIENTES = API.CRM.CLIENTES;
const API_COTIZACIONES = API.CRM.COTIZACIONES;

export default function CotizadorProfesional() {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [cotizaciones, setCotizaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');
    const [filterCliente, setFilterCliente] = useState('todos');
    
    // Form states
    const [formData, setFormData] = useState({
        numero_cotizacion: '',
        cliente_id: '',
        contacto: '',
        email: '',
        telefono: '',
        empresa: '',
        direccion: '',
        productos: [],
        subtotal: 0,
        impuestos: 0,
        total: 0,
        estado: 'borrador',
        fecha_entrega: '',
        notas: ''
    });

    const [showClienteModal, setShowClienteModal] = useState(false);
    const [editingCotizacion, setEditingCotizacion] = useState(null);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [barcodeBusy, setBarcodeBusy] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [clientesRes, cotizacionesRes] = await Promise.all([
                axios.get(API_CLIENTES),
                axios.get(API_COTIZACIONES)
            ]);
            setClientes(clientesRes.data);
            setCotizaciones(cotizacionesRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleAddProducto = () => {
        const nuevoProducto = {
            id: Date.now(),
            descripcion: '',
            cantidad: 1,
            precio_unitario: 0,
            descuento: 0,
            total: 0
        };
        setFormData(prev => ({
            ...prev,
            productos: [...prev.productos, nuevoProducto]
        }));
    };

    const agregarProductoDesdeMaestro = (linea) => {
        setFormData(prev => {
            const nuevosProductos = [...prev.productos, linea];
            const subtotal = nuevosProductos.reduce((sum, prod) => sum + prod.total, 0);
            const impuestos = subtotal * 0.19;
            return {
                ...prev,
                productos: nuevosProductos,
                subtotal,
                impuestos,
                total: subtotal + impuestos,
            };
        });
    };

    const handleBarcodeAdd = async (codigoOverride) => {
        const codigo = (codigoOverride ?? barcodeInput).trim();
        if (!codigo || barcodeBusy) return;

        setBarcodeBusy(true);
        try {
            const maestro = await buscarProductoPorCodigoBarras(codigo);
            if (!maestro) {
                alert(`No se encontró producto para el código: ${codigo}`);
                return;
            }
            if (maestro.activo === false) {
                alert('El producto está inactivo.');
                return;
            }
            agregarProductoDesdeMaestro(productoParaCotizacion(maestro, 1));
            setBarcodeInput('');
        } catch {
            alert('Error al buscar por código de barras.');
        } finally {
            setBarcodeBusy(false);
        }
    };

    const handleBarcodeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBarcodeAdd();
        }
    };

    const handleProductoChange = (index, field, value) => {
        const nuevosProductos = [...formData.productos];
        if (field === 'cantidad' || field === 'precio_unitario' || field === 'descuento') {
            nuevosProductos[index][field] = parseFloat(value) || 0;
        } else {
            nuevosProductos[index][field] = value;
        }
        
        // Recalcular total del producto
        const producto = nuevosProductos[index];
        producto.total = (producto.cantidad * producto.precio_unitario) - producto.descuento;
        
        setFormData(prev => ({
            ...prev,
            productos: nuevosProductos
        }));
        
        // Recalcular totales
        calcularTotales(nuevosProductos);
    };

    const handleRemoveProducto = (index) => {
        const nuevosProductos = formData.productos.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            productos: nuevosProductos
        }));
        calcularTotales(nuevosProductos);
    };

    const calcularTotales = (productos) => {
        const subtotal = productos.reduce((sum, prod) => sum + prod.total, 0);
        const impuestos = subtotal * 0.19; // 19% IVA
        const total = subtotal + impuestos;
        
        setFormData(prev => ({
            ...prev,
            subtotal,
            impuestos,
            total
        }));
    };

    const handleSave = async () => {
        try {
            if (editingCotizacion) {
                await axios.put(`${API_COTIZACIONES}${editingCotizacion.id}/`, formData);
            } else {
                await axios.post(API_COTIZACIONES, formData);
            }
            
            fetchData();
            resetForm();
            alert(editingCotizacion ? 'Cotización actualizada exitosamente' : 'Cotización guardada exitosamente');
        } catch (err) {
            console.error('Error saving cotizacion:', err);
            setError('Error al guardar cotización');
        }
    };

    const handleEdit = (cotizacion) => {
        setEditingCotizacion(cotizacion);
        setFormData({
            numero_cotizacion: cotizacion.numero_cotizacion,
            cliente_id: cotizacion.cliente_id,
            contacto: cotizacion.contacto,
            email: cotizacion.email,
            telefono: cotizacion.telefono,
            empresa: cotizacion.empresa,
            direccion: cotizacion.direccion,
            productos: cotizacion.productos || [],
            subtotal: cotizacion.subtotal,
            impuestos: cotizacion.impuestos,
            total: cotizacion.total,
            estado: cotizacion.estado,
            fecha_entrega: cotizacion.fecha_entrega,
            notas: cotizacion.notas || ''
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta cotización?')) {
            try {
                await axios.delete(`${API_COTIZACIONES}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error deleting cotizacion:', err);
                setError('Error al eliminar cotización');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            numero_cotizacion: '',
            cliente_id: '',
            contacto: '',
            email: '',
            telefono: '',
            empresa: '',
            direccion: '',
            productos: [],
            subtotal: 0,
            impuestos: 0,
            total: 0,
            estado: 'borrador',
            fecha_entrega: '',
            notas: ''
        });
        setEditingCotizacion(null);
    };

    const handleCreateCliente = async (clienteData) => {
        try {
            await axios.post(API_CLIENTES, clienteData);
            fetchData();
            setShowClienteModal(false);
            alert('Cliente creado exitosamente');
        } catch (err) {
            console.error('Error creating cliente:', err);
            setError('Error al crear cliente');
        }
    };

    // Filter data
    const filteredCotizaciones = cotizaciones.filter(cotizacion => {
        const matchesSearch = cotizacion.numero_cotizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cotizacion.empresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cotizacion.contacto?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEstado = filterEstado === 'todos' || cotizacion.estado === filterEstado;
        const matchesCliente = filterCliente === 'todos' || cotizacion.cliente_id == filterCliente;
        return matchesSearch && matchesEstado && matchesCliente;
    });

    // Calculate statistics
    const totalCotizaciones = cotizaciones.length;
    const cotizacionesAprobadas = cotizaciones.filter(c => c.estado === 'aprobada').length;
    const cotizacionesPendientes = cotizaciones.filter(c => c.estado === 'pendiente').length;
    const cotizacionesBorrador = cotizaciones.filter(c => c.estado === 'borrador').length;
    const valorTotal = cotizaciones.reduce((sum, c) => sum + c.total, 0);

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
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando Cotizador Profesional...</p>
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
                        <FileText size={32} style={{ color: '#667eea' }} />
                        Cotizador Profesional
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Sistema profesional de cotizaciones
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => resetForm()}
                        style={{
                            background: '#f59e0b',
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
                        <Plus size={16} />
                        Nueva
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

            {/* Stats Cards */}
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
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Total Cotizaciones
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
                        {totalCotizaciones}
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
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                                Aprobadas
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Confirmadas
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#10b981',
                        margin: '0'
                    }}>
                        {cotizacionesAprobadas}
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
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Clock size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Pendientes
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                En espera
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#f59e0b',
                        margin: '0'
                    }}>
                        {cotizacionesPendientes}
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
                            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
                                Valor Total
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                En cotizaciones
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#8b5cf6',
                        margin: '0'
                    }}>
                        ${valorTotal.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Form Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '600', 
                        color: '#1a202c',
                        margin: '0 0 1.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Calculator size={24} style={{ color: '#667eea' }} />
                        {editingCotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
                    </h3>

                    {/* Client Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Número de Cotización:
                            </label>
                            <input
                                type="text"
                                name="numero_cotizacion"
                                value={formData.numero_cotizacion}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="COT-2024-001"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Cliente:
                            </label>
                            <select
                                name="cliente_id"
                                value={formData.cliente_id}
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
                                <option value="">Seleccionar cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Contacto:
                            </label>
                            <input
                                type="text"
                                name="contacto"
                                value={formData.contacto}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="Nombre del contacto"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Email:
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="email@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Teléfono:
                            </label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                            Empresa:
                        </label>
                        <input
                            type="text"
                            name="empresa"
                            value={formData.empresa}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                            placeholder="Nombre de la empresa"
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                            Dirección:
                        </label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                            placeholder="Dirección de entrega"
                        />
                    </div>

                    {/* Products Table */}
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem',
                            padding: '0.75rem', background: '#f0f9ff', borderRadius: '10px',
                            border: '1px solid #bae6fd', flexWrap: 'wrap',
                        }}>
                            <Barcode size={20} style={{ color: '#0284c7', flexShrink: 0 }} />
                            <input
                                type="text"
                                value={barcodeInput}
                                onChange={(e) => setBarcodeInput(e.target.value)}
                                onKeyDown={handleBarcodeKeyDown}
                                placeholder="Escanear código de barras o escribir SKU / GTIN..."
                                style={{
                                    flex: 1, minWidth: 220, padding: '0.6rem 0.75rem',
                                    border: '1px solid #7dd3fc', borderRadius: '8px', fontSize: '0.9rem',
                                }}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => handleBarcodeAdd()}
                                disabled={barcodeBusy || !barcodeInput.trim()}
                                style={{
                                    background: barcodeBusy ? '#94a3b8' : '#0284c7',
                                    color: 'white', border: 'none', padding: '0.6rem 1rem',
                                    borderRadius: '8px', cursor: barcodeBusy ? 'wait' : 'pointer',
                                    fontWeight: 600, fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                                }}
                            >
                                <ScanLine size={16} />
                                {barcodeBusy ? 'Buscando...' : 'Agregar por código'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1a202c' }}>
                                Productos
                            </h4>
                            <button
                                onClick={handleAddProducto}
                                style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Plus size={16} />
                                Agregar Producto
                            </button>
                        </div>
                        
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse', 
                                fontSize: '0.9rem'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', width: 90 }}>SKU</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Descripción</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Cantidad</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Precio Unitario</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Descuento</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Total</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.productos.map((producto, index) => (
                                        <tr key={producto.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                                {producto.codigo_sku ? (
                                                    <span style={{
                                                        fontFamily: 'monospace', fontSize: '0.78rem',
                                                        background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: 4,
                                                    }}>{producto.codigo_sku}</span>
                                                ) : (
                                                    <span style={{ color: '#cbd5e0', fontSize: '0.75rem' }}>—</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                                <input
                                                    type="text"
                                                    value={producto.descripcion}
                                                    onChange={(e) => handleProductoChange(index, 'descripcion', e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem',
                                                        outline: 'none'
                                                    }}
                                                    placeholder="Descripción del producto"
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <input
                                                    type="number"
                                                    value={producto.cantidad}
                                                    onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '0.5rem',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <input
                                                    type="number"
                                                    value={producto.precio_unitario}
                                                    onChange={(e) => handleProductoChange(index, 'precio_unitario', e.target.value)}
                                                    style={{
                                                        width: '100px',
                                                        padding: '0.5rem',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <input
                                                    type="number"
                                                    value={producto.descuento}
                                                    onChange={(e) => handleProductoChange(index, 'descuento', e.target.value)}
                                                    style={{
                                                        width: '80px',
                                                        padding: '0.5rem',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600' }}>
                                                ${producto.total.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <button
                                                    onClick={() => handleRemoveProducto(index)}
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem'
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

                    {/* Totals */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Subtotal:
                            </label>
                            <div style={{
                                padding: '0.75rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                ${formData.subtotal.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Impuestos (19%):
                            </label>
                            <div style={{
                                padding: '0.75rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                ${formData.impuestos.toFixed(2)}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Total:
                            </label>
                            <div style={{
                                padding: '0.75rem',
                                background: '#10b981',
                                color: 'white',
                                border: '1px solid #10b981',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '700',
                                textAlign: 'center'
                            }}>
                                ${formData.total.toFixed(2)}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Estado:
                            </label>
                            <select
                                name="estado"
                                value={formData.estado}
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
                                <option value="borrador">Borrador</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="aprobada">Aprobada</option>
                                <option value="rechazada">Rechazada</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                Fecha Entrega:
                            </label>
                            <input
                                type="date"
                                name="fecha_entrega"
                                value={formData.fecha_entrega}
                                onChange={handleInputChange}
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
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                            Notas:
                        </label>
                        <textarea
                            name="notas"
                            value={formData.notas}
                            onChange={handleInputChange}
                            rows="3"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                            placeholder="Notas adicionales..."
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Save size={20} />
                            {editingCotizacion ? 'Actualizar' : 'Guardar'}
                        </button>
                    </div>
                </div>

                {/* Quotes List */}
                <div>
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: '600', 
                            color: '#1a202c',
                            margin: '0 0 1.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <FileText size={24} style={{ color: '#667eea' }} />
                            Cotizaciones Existentes
                        </h3>

                        {/* Search and Filters */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                                    <input
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 3rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                        placeholder="Buscar cotizaciones..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <select
                                    style={{
                                        padding: '0.75rem 1rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        background: 'white'
                                    }}
                                    value={filterEstado}
                                    onChange={(e) => setFilterEstado(e.target.value)}
                                >
                                    <option value="todos">Todos los estados</option>
                                    <option value="borrador">Borrador</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="aprobada">Aprobada</option>
                                    <option value="rechazada">Rechazada</option>
                                </select>
                            </div>
                        </div>

                        {/* Quotes Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse', 
                                fontSize: '0.9rem'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Número</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Cliente</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Total</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Estado</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Fecha</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCotizaciones.map((cotizacion) => (
                                        <tr key={cotizacion.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                                <div style={{ fontWeight: '600', color: '#1a202c' }}>{cotizacion.numero_cotizacion}</div>
                                            </td>
                                            <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#1a202c' }}>{cotizacion.empresa}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#718096' }}>{cotizacion.contacto}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle', fontWeight: '600' }}>
                                                ${cotizacion.total?.toFixed(2) || '0.00'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <span style={{
                                                    background: cotizacion.estado === 'aprobada' ? '#d1fae5' : 
                                                               cotizacion.estado === 'pendiente' ? '#fef3c7' : 
                                                               cotizacion.estado === 'rechazada' ? '#fee2e2' : '#e2e8f0',
                                                    color: cotizacion.estado === 'aprobada' ? '#065f46' : 
                                                           cotizacion.estado === 'pendiente' ? '#92400e' : 
                                                           cotizacion.estado === 'rechazada' ? '#991b1b' : '#4a5568',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {cotizacion.estado}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                {new Date(cotizacion.fecha_creacion).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button 
                                                        onClick={() => handleEdit(cotizacion)}
                                                        style={{
                                                            background: '#667eea',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Edit3 size={14} />
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(cotizacion.id)}
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.5rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Eliminar
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
            </div>
        </div>
    );
}
