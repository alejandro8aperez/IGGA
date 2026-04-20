import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, Plus, Trash2, Search, Download, Save, Send, 
    User, Calendar, DollarSign, Package, Percent, Clock,
    Shield, Building, Mail, Phone, MapPin, Eye, Printer,
    ChevronLeft, ChevronRight, AlertCircle, CheckCircle, Gear
} from 'lucide-react';

const API_URL = 'http://127.0.0.1:8000/api/crm/cotizaciones/';
const CLIENTES_URL = 'http://127.0.0.1:8000/api/crm/clientes/';
const PRODUCTOS_URL = 'http://127.0.0.1:8000/api/inventarios/productos/';

export default function CotizadorProfesional() {
    // Estados principales
    const [cotizacion, setCotizacion] = useState({
        numero: `COT-${Date.now().toString().slice(-6)}`,
        fecha: new Date().toISOString().split('T')[0],
        validez: '30 días',
        forma_pago: '50% anticipo, 50% contraentrega',
        garantia: '1 año',
        entrega: '15 días hábiles',
        cliente: null,
        items: [],
        subtotal: 0,
        iva: 19,
        total_iva: 0,
        gran_total: 0,
        notas: '',
        estado: 'borrador'
    });

    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [vistaPrevia, setVistaPrevia] = useState(false);
    const [buscandoProducto, setBuscandoProducto] = useState('');
    const [modalProducto, setModalProducto] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatos();
    }, []);

    // Cálculos automáticos
    useEffect(() => {
        const subtotal = cotizacion.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
        const total_iva = subtotal * (cotizacion.iva / 100);
        const gran_total = subtotal + total_iva;
        
        setCotizacion(prev => ({
            ...prev,
            subtotal,
            total_iva,
            gran_total
        }));
    }, [cotizacion.items, cotizacion.iva]);

    const cargarDatos = async () => {
        try {
            const [clientesRes, productosRes] = await Promise.all([
                axios.get(CLIENTES_URL),
                axios.get(PRODUCTOS_URL)
            ]);
            setClientes(clientesRes.data);
            setProductos(productosRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error al cargar datos:", err);
            setError("Error al cargar los datos iniciales");
            setLoading(false);
        }
    };

    const seleccionarCliente = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        setCotizacion(prev => ({ ...prev, cliente }));
    };

    const agregarItem = (producto) => {
        const nuevoItem = {
            id: Date.now(),
            producto: producto.nombre,
            codigo: producto.codigo || '',
            descripcion: producto.descripcion || '',
            cantidad: 1,
            unidad: producto.unidad || 'Und',
            precio_unitario: producto.precio_venta || 0,
            descuento: 0,
            total: producto.precio_venta || 0
        };
        
        setCotizacion(prev => ({
            ...prev,
            items: [...prev.items, nuevoItem]
        }));
        
        setModalProducto(false);
        setBuscandoProducto('');
    };

    const actualizarItem = (itemId, campo, valor) => {
        setCotizacion(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    const itemActualizado = { ...item, [campo]: valor };
                    
                    // Recalcular total si cambia cantidad, precio o descuento
                    if (campo === 'cantidad' || campo === 'precio_unitario' || campo === 'descuento') {
                        const subtotal = itemActualizado.cantidad * itemActualizado.precio_unitario;
                        const descuento = subtotal * (itemActualizado.descuento / 100);
                        itemActualizado.total = subtotal - descuento;
                    }
                    
                    return itemActualizado;
                }
                return item;
            })
        }));
    };

    const eliminarItem = (itemId) => {
        setCotizacion(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== itemId)
        }));
    };

    const guardarCotizacion = async () => {
        try {
            const datosGuardar = {
                ...cotizacion,
                cliente: cotizacion.cliente?.id,
                detalles: cotizacion.items.map((item, index) => ({
                    item: index + 1,
                    producto: item.producto,
                    descripcion: item.descripcion,
                    unidad: item.unidad,
                    cantidad: item.cantidad,
                    valor_unitario: item.precio_unitario,
                    valor_total: item.total
                }))
            };
            
            await axios.post(API_URL, datosGuardar);
            alert('Cotización guardada exitosamente');
        } catch (err) {
            console.error("Error al guardar:", err);
            alert('Error al guardar la cotización');
        }
    };

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(buscandoProducto.toLowerCase()) ||
        producto.codigo?.toLowerCase().includes(buscandoProducto.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        border: '4px solid rgba(102, 126, 234, 0.2)', 
                        borderTop: '4px solid #667eea', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <div style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1rem' }}>
                        Cargando cotizador profesional...
                    </div>
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
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1a202c',
                            margin: '0 0 0.5rem 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <FileText size={32} style={{ color: '#667eea' }} />
                            Cotizador Profesional
                        </h1>
                        <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                            Crea cotizaciones profesionales con diseño moderno
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setVistaPrevia(!vistaPrevia)}
                            style={{
                                background: '#667eea',
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
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#5a67d8';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#667eea';
                            }}
                        >
                            <Eye size={18} />
                            {vistaPrevia ? 'Editar' : 'Vista Previa'}
                        </button>
                        <button
                            onClick={guardarCotizacion}
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
                            <Save size={18} />
                            Guardar Cotización
                        </button>
                    </div>
                </div>
            </div>

            {!vistaPrevia ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
                    {/* Formulario Principal */}
                    <div>
                        {/* Información del Cliente */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
                                <User size={20} style={{ color: '#667eea' }} />
                                Información del Cliente
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                        Cliente *
                                    </label>
                                    <select
                                        value={cotizacion.cliente?.id || ''}
                                        onChange={(e) => seleccionarCliente(parseInt(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    >
                                        <option value="">Seleccionar cliente</option>
                                        {clientes.map(cliente => (
                                            <option key={cliente.id} value={cliente.id}>
                                                {cliente.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>
                                        Número Cotización
                                    </label>
                                    <input
                                        type="text"
                                        value={cotizacion.numero}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            background: '#f8fafc',
                                            color: '#4a5568'
                                        }}
                                    />
                                </div>
                            </div>

                            {cotizacion.cliente && (
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={14} style={{ color: '#718096' }} />
                                            <span style={{ color: '#4a5568' }}>{cotizacion.cliente.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} style={{ color: '#718096' }} />
                                            <span style={{ color: '#4a5568' }}>{cotizacion.cliente.telefono}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
                                            <MapPin size={14} style={{ color: '#718096' }} />
                                            <span style={{ color: '#4a5568' }}>{cotizacion.cliente.direccion}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items de la Cotización */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{
                                    fontSize: '1.2rem',
                                    fontWeight: '600',
                                    color: '#2d3748',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <Package size={20} style={{ color: '#667eea' }} />
                                    Items de la Cotización
                                </h3>
                                <button
                                    onClick={() => setModalProducto(true)}
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
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#5a67d8'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
                                >
                                    <Plus size={14} />
                                    Agregar Producto
                                </button>
                            </div>

                            {/* Tabla de Items */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Producto</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Cantidad</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Precio</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Descuento</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Total</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cotizacion.items.map((item, index) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.9rem' }}>
                                                            {item.producto}
                                                        </div>
                                                        {item.descripcion && (
                                                            <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                                {item.descripcion}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <input
                                                        type="number"
                                                        value={item.cantidad}
                                                        onChange={(e) => actualizarItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '80px',
                                                            padding: '0.5rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <input
                                                        type="number"
                                                        value={item.precio_unitario}
                                                        onChange={(e) => actualizarItem(item.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                                                        style={{
                                                            width: '100px',
                                                            padding: '0.5rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '4px',
                                                            textAlign: 'center',
                                                            fontSize: '0.875rem'
                                                        }}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <input
                                                            type="number"
                                                            value={item.descuento}
                                                            onChange={(e) => actualizarItem(item.id, 'descuento', parseFloat(e.target.value) || 0)}
                                                            style={{
                                                                width: '60px',
                                                                padding: '0.5rem',
                                                                border: '1px solid #e2e8f0',
                                                                borderRadius: '4px',
                                                                textAlign: 'center',
                                                                fontSize: '0.875rem'
                                                            }}
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                        />
                                                        <span style={{ color: '#718096', fontSize: '0.8rem' }}>%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                                                    ${item.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => eliminarItem(item.id)}
                                                        style={{
                                                            background: '#e53e3e',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '0.25rem 0.5rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.75rem',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                
                                {cotizacion.items.length === 0 && (
                                    <div style={{
                                        padding: '3rem',
                                        textAlign: 'center',
                                        color: '#718096',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '2px dashed #e2e8f0'
                                    }}>
                                        <Package size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
                                        <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                            No hay productos agregados
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            Agrega productos para comenzar tu cotización
                                        </div>
                                        <button
                                            onClick={() => setModalProducto(true)}
                                            style={{
                                                background: '#667eea',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Plus size={16} />
                                            Agregar Primer Producto
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho - Configuración */}
                    <div>
                        {/* Configuración de Cotización */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
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
                                <Gear size={18} style={{ color: '#667eea' }} />
                                Configuración
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={cotizacion.fecha}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, fecha: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <Clock size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Validez de Oferta
                                    </label>
                                    <input
                                        type="text"
                                        value={cotizacion.validez}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, validez: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <DollarSign size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Forma de Pago
                                    </label>
                                    <textarea
                                        value={cotizacion.forma_pago}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, forma_pago: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem',
                                            resize: 'vertical',
                                            minHeight: '60px'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <Shield size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Garantía
                                    </label>
                                    <input
                                        type="text"
                                        value={cotizacion.garantia}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, garantia: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <Clock size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Tiempo de Entrega
                                    </label>
                                    <input
                                        type="text"
                                        value={cotizacion.entrega}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, entrega: e.target.value }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                </div>
                                
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568', fontSize: '0.875rem' }}>
                                        <Percent size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        IVA (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={cotizacion.iva}
                                        onChange={(e) => setCotizacion(prev => ({ ...prev, iva: parseFloat(e.target.value) || 0 }))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '0.9rem'
                                        }}
                                        min="0"
                                        max="100"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Resumen de Totales */}
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
                        }}>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <DollarSign size={18} />
                                Resumen de Totales
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.9 }}>Subtotal:</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                                        ${cotizacion.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ opacity: 0.9 }}>IVA ({cotizacion.iva}%):</span>
                                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                                        ${cotizacion.total_iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{
                                    height: '1px',
                                    background: 'rgba(255,255,255,0.3)',
                                    margin: '0.5rem 0'
                                }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '600' }}>Total:</span>
                                    <span style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                                        ${cotizacion.gran_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Vista Previa de Impresión */
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    maxWidth: '800px',
                    margin: '0 auto'
                }}>
                    {/* Header de Cotización */}
                    <div style={{ 
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '2rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                            <div>
                                <h1 style={{ 
                                    fontSize: '2rem', 
                                    fontWeight: '700', 
                                    color: '#1a202c',
                                    margin: '0 0 0.5rem 0'
                                }}>
                                    8AMPERIOS SAS
                                </h1>
                                <p style={{ color: '#718096', margin: 0, fontSize: '0.9rem' }}>
                                    Ingeniería y Soluciones Eléctricas
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    background: '#667eea',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem'
                                }}>
                                    COTIZACIÓN
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d3748' }}>
                                    {cotizacion.numero}
                                </div>
                                <div style={{ color: '#718096', fontSize: '0.9rem' }}>
                                    Fecha: {new Date(cotizacion.fecha).toLocaleDateString('es-CO')}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
                                    Datos del Cliente:
                                </h3>
                                {cotizacion.cliente ? (
                                    <div style={{ fontSize: '0.9rem', color: '#2d3748' }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                            {cotizacion.cliente.nombre}
                                        </div>
                                        <div style={{ color: '#718096' }}>
                                            {cotizacion.cliente.email}
                                        </div>
                                        <div style={{ color: '#718096' }}>
                                            {cotizacion.cliente.telefono}
                                        </div>
                                        <div style={{ color: '#718096' }}>
                                            {cotizacion.cliente.direccion}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ color: '#718096', fontStyle: 'italic' }}>
                                        Cliente no seleccionado
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
                                    Condiciones:
                                </h3>
                                <div style={{ fontSize: '0.9rem', color: '#2d3748' }}>
                                    <div style={{ marginBottom: '0.25rem' }}>
                                        <strong>Validez:</strong> {cotizacion.validez}
                                    </div>
                                    <div style={{ marginBottom: '0.25rem' }}>
                                        <strong>Entrega:</strong> {cotizacion.entrega}
                                    </div>
                                    <div style={{ marginBottom: '0.25rem' }}>
                                        <strong>Garantía:</strong> {cotizacion.garantia}
                                    </div>
                                    <div>
                                        <strong>Pago:</strong> {cotizacion.forma_pago}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Items */}
                    <div style={{ marginBottom: '2rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Item</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Descripción</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>Cantidad</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#4a5568', fontWeight: '600' }}>Valor Unitario</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#4a5568', fontWeight: '600' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cotizacion.items.map((item, index) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                            {index + 1}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: '600', color: '#2d3748' }}>
                                                {item.producto}
                                            </div>
                                            {item.descripcion && (
                                                <div style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                                    {item.descripcion}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            {item.cantidad} {item.unidad}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            ${item.precio_unitario.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#667eea' }}>
                                            ${item.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Resumen de Totales */}
                    <div style={{ 
                        background: '#f8fafc',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ minWidth: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#4a5568' }}>Subtotal:</span>
                                    <span style={{ fontWeight: '600', color: '#2d3748' }}>
                                        ${cotizacion.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#4a5568' }}>IVA ({cotizacion.iva}%):</span>
                                    <span style={{ fontWeight: '600', color: '#2d3748' }}>
                                        ${cotizacion.total_iva.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <div style={{ 
                                    height: '1px', 
                                    background: '#e2e8f0', 
                                    margin: '0.75rem 0' 
                                }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#2d3748' }}>Total:</span>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#667eea' }}>
                                        ${cotizacion.gran_total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notas */}
                    {cotizacion.notas && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>
                                Notas:
                            </h3>
                            <div style={{ 
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                color: '#2d3748',
                                whiteSpace: 'pre-line'
                            }}>
                                {cotizacion.notas}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ 
                        textAlign: 'center',
                        paddingTop: '2rem',
                        borderTop: '1px solid #e2e8f0',
                        color: '#718096',
                        fontSize: '0.8rem'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                            Gracias por su confianza en 8AMPERIOS SAS
                        </p>
                        <p style={{ margin: 0 }}>
                            NIT: 901.234.567-8 | Tel: +57 1 234 5678 | www.8amperios.com
                        </p>
                    </div>
                </div>
            )}

            {/* Modal de Selección de Productos */}
            {modalProducto && (
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
                }} onClick={() => setModalProducto(false)}>
                    <div 
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '800px',
                            maxHeight: '80vh',
                            overflow: 'auto',
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
                                Seleccionar Producto
                            </h2>
                            <button 
                                onClick={() => setModalProducto(false)}
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
                                onMouseOver={(e) => e.target.style.backgroundColor = '#cbd5e0'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ 
                                    position: 'absolute', 
                                    left: '1rem', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    color: '#718096'
                                }} />
                                <input
                                    type="text"
                                    placeholder="Buscar producto por nombre o código..."
                                    value={buscandoProducto}
                                    onChange={(e) => setBuscandoProducto(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem 0.75rem 3rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>
                        </div>

                        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                            {productosFiltrados.length > 0 ? (
                                productosFiltrados.map(producto => (
                                    <div
                                        key={producto.id}
                                        onClick={() => agregarItem(producto)}
                                        style={{
                                            padding: '1rem',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px',
                                            marginBottom: '0.75rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#667eea';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ 
                                                    fontWeight: '600', 
                                                    color: '#2d3748',
                                                    marginBottom: '0.25rem',
                                                    fontSize: '1rem'
                                                }}>
                                                    {producto.nombre}
                                                </div>
                                                {producto.codigo && (
                                                    <div style={{ 
                                                        color: '#718096', 
                                                        fontSize: '0.875rem',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        Código: {producto.codigo}
                                                    </div>
                                                )}
                                                {producto.descripcion && (
                                                    <div style={{ 
                                                        color: '#4a5568', 
                                                        fontSize: '0.875rem',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {producto.descripcion}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ 
                                                textAlign: 'right',
                                                marginLeft: '1rem'
                                            }}>
                                                <div style={{ 
                                                    fontSize: '1.1rem',
                                                    fontWeight: '700',
                                                    color: '#667eea'
                                                }}>
                                                    ${(producto.precio_venta || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                                <div style={{ 
                                                    color: '#718096', 
                                                    fontSize: '0.8rem'
                                                }}>
                                                    {producto.unidad || 'Und'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '3rem',
                                    color: '#718096'
                                }}>
                                    <Search size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                        No se encontraron productos
                                    </div>
                                    <div>
                                        Intenta con otra búsqueda
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
