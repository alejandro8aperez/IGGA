import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FileText, Plus, Save, Send, Trash2, CheckCircle, AlertCircle, 
    ArrowLeft, Search, Filter, Download, X, TrendingUp, DollarSign,
    Calendar, User, Package, CreditCard, Receipt, ShieldCheck, Globe,
    RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';

// API Facturación Electrónica (Facturatech)
const API_FE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/facturacion-electronica';

// Usar directamente las URLs de la configuración API

function Facturacion() {
    const navigate = useNavigate();
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [resolucion, setResolucion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [showNewForm, setShowNewForm] = useState(false);
    const [formData, setFormData] = useState({
        cliente: '',
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        observaciones: '',
        retefuente_pct: 0,
        reteica_pct: 0,
        detalles: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resFacturas, resClientes, resProd, resRes] = await Promise.all([
                axios.get(API.FACTURACION.FACTURAS),
                axios.get(API.CRM.CLIENTES),
                axios.get(API.INVENTARIOS.PRODUCTOS),
                axios.get(API.FACTURACION.RESOLUCIONES)
            ]);
            setFacturas(resFacturas.data);
            setClientes(resClientes.data);
            setProductos(resProd.data);
            if (resRes.data.length > 0) {
                setResolucion(resRes.data.find(r => r.activa) || resRes.data[0]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de facturación.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDetalle = () => {
        setFormData({
            ...formData,
            detalles: [...formData.detalles, { producto: '', cantidad: 1, precio_unitario: 0, porcentaje_iva: 19 }]
        });
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index][field] = value;

        if (field === 'producto') {
            const prod = productos.find(p => p.id === parseInt(value));
            if (prod) {
                newDetalles[index].precio_unitario = prod.precio_venta;
            }
        }

        setFormData({ ...formData, detalles: newDetalles });
    };

    const handleRemoveDetalle = (index) => {
        const newDetalles = [...formData.detalles];
        newDetalles.splice(index, 1);
        setFormData({ ...formData, detalles: newDetalles });
    };

    // Cálculos en vivo
    const subtotalCalc = formData.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);
    const ivaCalc = formData.detalles.reduce((acc, d) => acc + ((d.cantidad * d.precio_unitario) * (d.porcentaje_iva / 100)), 0);
    const retefuenteCalc = subtotalCalc * (formData.retefuente_pct / 100);
    const reteicaCalc = subtotalCalc * (formData.reteica_pct / 100);
    const totalCalc = subtotalCalc + ivaCalc - retefuenteCalc - reteicaCalc;

    const saveBorrador = async () => {
        if (!formData.cliente || formData.detalles.length === 0) {
            alert('Debe seleccionar cliente y al menos un producto.');
            return;
        }

        try {
            await axios.post(API.FACTURACION.FACTURAS, formData);
            setShowNewForm(false);
            setFormData({
                cliente: '', fecha_vencimiento: new Date().toISOString().split('T')[0],
                observaciones: '', retefuente_pct: 0, reteica_pct: 0, detalles: []
            });
            fetchData();
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error al guardar el borrador.');
        }
    };

    const emitirFactura = async (id) => {
        if (window.confirm('¿Desea emitir esta factura? Esta acción descontará inventario y generará el número de factura.')) {
            try {
                await axios.post(`${API.FACTURACION.FACTURAS}${id}/emitir/`);
                alert('Factura emitida exitosamente.');
                fetchData();
            } catch (error) {
                console.error('Error emiting invoice:', error);
                alert(error.response?.data?.error || 'Error al emitir factura');
            }
        }
    };

    // Enviar factura a DIAN via Facturatech
    const enviarADIAN = async (factura) => {
        if (window.confirm(`¿Enviar factura ${factura.numero_factura} a la DIAN via Facturatech?`)) {
            try {
                // Primero generamos el XML UBL
                const xmlData = {
                    encabezado: {
                        tipo_operacion: '10',
                        tipo_documento: '01',
                        prefijo: factura.numero_factura?.split('-')[0] || '',
                        numero: factura.numero_factura?.split('-')[1] || '',
                        fecha_emision: factura.fecha_emision,
                        hora_emision: new Date().toISOString().split('T')[1].split('.')[0],
                        moneda: 'COP',
                        fecha_vencimiento: factura.fecha_vencimiento,
                        forma_pago: '1',
                        tipo_facturacion: '1',
                        ambiente: '2' // 2 = Pruebas por defecto
                    },
                    emisor: {
                        nit: factura.emisor_nit || '',
                        razon_social: factura.emisor_razon_social || '',
                        // ... otros datos del emisor
                    },
                    adquiriente: {
                        nit: factura.cliente_ruc || '',
                        razon_social: factura.cliente_nombre || '',
                        // ... otros datos del cliente
                    },
                    items: factura.detalles?.map(d => ({
                        cantidad: d.cantidad,
                        precio_unitario: d.precio_unitario,
                        descuento: 0,
                        cargo: 0,
                        impuestos: d.valor_iva || 0,
                        descripcion: d.producto_nombre
                    })) || [],
                    totales: {
                        subtotal: factura.subtotal,
                        iva: factura.iva,
                        total: factura.total
                    }
                };

                // Generar XML
                const xmlRes = await axios.post(`${API_FE}/generar-xml/`, xmlData);
                const xmlContent = xmlRes.data.xml;

                // Enviar a Facturatech
                const envioRes = await axios.post(`${API_FE}/enviar/`, {
                    factura_id: factura.id,
                    factura_numero: factura.numero_factura,
                    xml_content: xmlContent,
                    tipo: 'ventas'
                });

                if (envioRes.data.exito) {
                    alert(`✅ Factura enviada exitosamente a la DIAN!\n\nCUFE: ${envioRes.data.cufe || 'Pendiente'}\nTrack ID: ${envioRes.data.track_id || 'Pendiente'}`);
                } else {
                    alert(`⚠️ Factura enviada pero con advertencias:\n${envioRes.data.mensaje || envioRes.data.error || 'Verifique el estado en el módulo de Facturación Electrónica'}`);
                }
                
                fetchData();
            } catch (error) {
                console.error('Error enviando a DIAN:', error);
                alert(`❌ Error enviando a DIAN:\n${error.response?.data?.error || error.message || 'Error desconocido'}\n\nVerifique la configuración en el módulo de Facturación Electrónica.`);
            }
        }
    };

    const createResolution = async () => {
        try {
            await axios.post(API.FACTURACION.RESOLUCIONES, {
                prefijo: 'FE', numero_inicial: 1, numero_final: 10000, numero_actual: 1,
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem',
                color: 'white'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '4px solid rgba(255,255,255,0.3)',
                    borderTop: '4px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Cargando Facturación...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    maxWidth: '400px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Error de conexión</h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error}</p>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header Moderno */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        <Receipt size={30} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>
                            Facturación Electrónica
                        </h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
                            Emisión y control de facturas DIAN
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            background: '#f1f5f9',
                            color: '#64748b',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#e2e8f0';
                            e.currentTarget.style.color = '#475569';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#64748b';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Volver
                    </button>
                    {!showNewForm && (
                        <button
                            onClick={() => setShowNewForm(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <Plus size={20} />
                            Nueva Factura
                        </button>
                    )}
                </div>
            </div>

            {!resolucion && (
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    borderLeft: '4px solid #f59e0b',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f59e0b'
                    }}>
                        <AlertCircle size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b', fontSize: '1.1rem' }}>Resolución de Facturación Requerida</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Necesitas crear una resolución para poder emitir facturas electrónicas.</p>
                    </div>
                    <button 
                        onClick={createResolution}
                        style={{
                            padding: '0.75rem 1.25rem',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#d97706'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f59e0b'}
                    >
                        Crear Resolución
                    </button>
                </div>
            )}

            {showNewForm ? (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <FileText size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Nueva Factura de Venta</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <User size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Cliente
                            </label>
                            <select 
                                value={formData.cliente} 
                                onChange={e => setFormData({ ...formData, cliente: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    background: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.identificacion})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Calendar size={14} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Fecha Vencimiento
                            </label>
                            <input 
                                type="date" 
                                value={formData.fecha_vencimiento} 
                                onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>

                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        margin: '2rem 0 1rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Package size={20} />
                        Detalle de Productos
                    </h3>
                    <div style={{ 
                        background: '#f8fafc', 
                        borderRadius: '12px', 
                        padding: '1.5rem',
                        marginBottom: '1rem'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Producto</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Cantidad</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Precio Unit.</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>IVA</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Subtotal</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.detalles.map((det, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <select 
                                                value={det.producto} 
                                                onChange={e => handleDetalleChange(index, 'producto', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="">Seleccione...</option>
                                                {productos.filter(p => p.stock_actual > 0).map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={det.cantidad} 
                                                onChange={e => handleDetalleChange(index, 'cantidad', parseFloat(e.target.value))}
                                                style={{
                                                    width: '80px',
                                                    padding: '0.5rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input 
                                                type="number" 
                                                value={det.precio_unitario} 
                                                onChange={e => handleDetalleChange(index, 'precio_unitario', parseFloat(e.target.value))}
                                                style={{
                                                    width: '120px',
                                                    padding: '0.5rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    textAlign: 'right',
                                                    fontSize: '0.9rem'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <select 
                                                value={det.porcentaje_iva} 
                                                onChange={e => handleDetalleChange(index, 'porcentaje_iva', parseFloat(e.target.value))}
                                                style={{
                                                    width: '80px',
                                                    padding: '0.5rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    textAlign: 'center',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <option value="19">19%</option>
                                                <option value="5">5%</option>
                                                <option value="0">0%</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>
                                            ${((det.cantidad || 0) * (det.precio_unitario || 0)).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleRemoveDetalle(index)}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    padding: '0.5rem',
                                                    borderRadius: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button 
                            onClick={handleAddDetalle}
                            style={{
                                marginTop: '1rem',
                                padding: '0.75rem 1.5rem',
                                background: 'transparent',
                                border: '2px dashed #667eea',
                                borderRadius: '8px',
                                color: '#667eea',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Plus size={18} /> Agregar Producto
                        </button>
                    </div>

                    {/* Totales y Retenciones */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' }}>
                                <CreditCard size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Retenciones Aplicables
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Retefuente (%)</label>
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        value={formData.retefuente_pct} 
                                        onChange={e => setFormData({ ...formData, retefuente_pct: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>ReteICA (%)</label>
                                    <input 
                                        type="number" 
                                        step="0.001" 
                                        value={formData.reteica_pct} 
                                        onChange={e => setFormData({ ...formData, reteica_pct: parseFloat(e.target.value) || 0 })}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '8px',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#64748b' }}>Observaciones (Opcional)</label>
                                <textarea 
                                    value={formData.observaciones} 
                                    onChange={e => setFormData({ ...formData, observaciones: e.target.value })}
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                ></textarea>
                            </div>
                        </div>

                        {/* Totales */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '2rem', 
                            borderRadius: '16px',
                            color: 'white'
                        }}>
                            <h3 style={{ 
                                margin: '0 0 1.5rem 0', 
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                borderBottom: '1px solid rgba(255,255,255,0.3)',
                                paddingBottom: '1rem'
                            }}>
                                Resumen de Totales
                            </h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1rem' }}>
                                <span style={{ opacity: 0.9 }}>Subtotal:</span>
                                <span style={{ fontWeight: 600 }}>${subtotalCalc.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1rem' }}>
                                <span style={{ opacity: 0.9 }}>IVA:</span>
                                <span style={{ fontWeight: 600 }}>${ivaCalc.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '1rem', color: '#fecaca' }}>
                                <span>Retefuente:</span>
                                <span style={{ fontWeight: 600 }}>-${retefuenteCalc.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1rem', color: '#fecaca' }}>
                                <span>ReteICA:</span>
                                <span style={{ fontWeight: 600 }}>-${reteicaCalc.toLocaleString()}</span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontWeight: 700, 
                                fontSize: '1.5rem', 
                                borderTop: '2px dashed rgba(255,255,255,0.5)',
                                paddingTop: '1rem'
                            }}>
                                <span>Total a Pagar:</span>
                                <span>${totalCalc.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
                        <button 
                            onClick={() => setShowNewForm(false)}
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e2e8f0';
                                e.currentTarget.style.color = '#475569';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                                e.currentTarget.style.color = '#64748b';
                            }}
                        >
                            <X size={18} style={{ marginRight: '0.5rem' }} />
                            Cancelar
                        </button>
                        <button 
                            onClick={saveBorrador}
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: '#f1f5f9',
                                color: '#475569',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#e2e8f0';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f1f5f9';
                            }}
                        >
                            <Save size={18} />
                            Guardar Borrador
                        </button>
                        <button 
                            onClick={emitirFactura}
                            style={{
                                padding: '0.875rem 1.75rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1rem',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <Send size={18} />
                            Emitir a DIAN
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <h2 style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700, 
                        color: '#1e293b',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(102, 126, 234, 0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#667eea'
                        }}>
                            <FileText size={22} />
                        </div>
                        Historial de Facturación
                    </h2>
                    
                    <div style={{ overflow: 'auto' }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'separate',
                            borderSpacing: '0 0.5rem'
                        }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Factura No.</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</th>
                                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>RUC/NIT</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emisión</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado DIAN</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturas.map(f => (
                                    <tr key={f.id} style={{ 
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        transition: 'all 0.2s'
                                    }}>
                                        <td style={{ 
                                            padding: '1rem', 
                                            fontWeight: 700,
                                            color: '#1e293b',
                                            borderRadius: '12px 0 0 12px'
                                        }}>
                                            {f.numero_factura || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Borrador #{f.id}</span>}
                                        </td>
                                        <td style={{ padding: '1rem', color: '#475569' }}>{f.cliente_nombre}</td>
                                        <td style={{ padding: '1rem', color: '#64748b', fontFamily: 'monospace', fontSize: '0.9rem' }}>{f.cliente_ruc}</td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                                            {new Date(f.fecha_emision).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                                            ${Number(f.total).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                backgroundColor: f.estado_dian === 'validada' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                color: f.estado_dian === 'validada' ? '#16a34a' : '#d97706',
                                                border: `1px solid ${f.estado_dian === 'validada' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                                            }}>
                                                {f.estado_dian === 'validada' ? (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <CheckCircle size={12} /> Validada
                                                    </span>
                                                ) : 'Borrador'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', borderRadius: '0 12px 12px 0' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                                {f.estado_dian === 'borrador' ? (
                                                    <button 
                                                        onClick={() => emitirFactura(f.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: 600,
                                                            fontSize: '0.8rem',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <Send size={14} /> Emitir
                                                    </button>
                                                ) : (
                                                    <>
                                                        {/* Botón Enviar a DIAN via Facturatech */}
                                                        <button
                                                            onClick={() => enviarADIAN(f)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                transition: 'all 0.2s',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1.05)';
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.transform = 'scale(1)';
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }}
                                                            title="Enviar a DIAN via Facturatech"
                                                        >
                                                            <Globe size={14} /> Enviar a DIAN
                                                        </button>
                                                        
                                                        {/* Estado Firmada */}
                                                        <span 
                                                            title={`CUFE: ${f.cufe || 'Pendiente'}`}
                                                            style={{ 
                                                                padding: '0.5rem 0.75rem',
                                                                background: 'rgba(34, 197, 94, 0.15)',
                                                                borderRadius: '8px',
                                                                color: '#16a34a', 
                                                                display: 'flex', 
                                                                alignItems: 'center', 
                                                                justifyContent: 'center',
                                                                gap: '0.25rem', 
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                border: '1px solid rgba(34, 197, 94, 0.3)'
                                                            }}
                                                        >
                                                            <ShieldCheck size={14} /> Firmada
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {facturas.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ 
                                            textAlign: 'center',
                                            padding: '3rem',
                                            color: '#94a3b8'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '1rem'
                                            }}>
                                                <div style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    background: '#f1f5f9',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#94a3b8'
                                                }}>
                                                    <FileText size={32} />
                                                </div>
                                                <p style={{ margin: 0, fontSize: '1rem' }}>No existen facturas en el sistema.</p>
                                                <button
                                                    onClick={() => setShowNewForm(true)}
                                                    style={{
                                                        padding: '0.75rem 1.5rem',
                                                        background: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.background = '#5a67d8'}
                                                    onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
                                                >
                                                    Crear primera factura
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Facturacion;
