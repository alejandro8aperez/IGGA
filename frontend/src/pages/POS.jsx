import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    MonitorSmartphone, ShoppingCart, Search, X, 
    CreditCard, DollarSign, ArrowLeft, RefreshCw, 
    Plus, Minus, Trash2, Printer, CheckCircle2,
    ChevronRight, Wallet, Coffee, Cake, ShoppingBag,
    Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';

const API_BASE = API.BASE;
const MEDIA_BASE = API_BASE.replace(/\/api$/, ''); // URL base sin /api para archivos media (siempre backend)

console.log('API.BASE:', API.BASE);
console.log('MEDIA_BASE:', MEDIA_BASE);

function POS() {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [montoRecibido, setMontoRecibido] = useState('');
    const [lastSaleReceipt, setLastSaleReceipt] = useState(null);
    
    // Session Management
    const [sesionActiva, setSesionActiva] = useState(null);
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [montoContado, setMontoContado] = useState('');
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, catRes, sesionRes] = await Promise.allSettled([
                axios.get(`${API_BASE}/inventarios/productos/`),
                axios.get(`${API_BASE}/inventarios/categorias/`),
                axios.get(`${API_BASE}/pos/sesiones/activa/`)
            ]);
            
            if (prodRes.status === 'fulfilled') setProductos(prodRes.value.data || []);
            if (catRes.status === 'fulfilled') setCategorias(catRes.value.data || []);
            
            if (sesionRes.status === 'fulfilled') {
                setSesionActiva(sesionRes.value.data);
            } else {
                // Si no hay sesión, intentar abrir una automáticamente
                await handleOpenSession();
            }
        } catch (err) {
            setError('Error al cargar productos del POS.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSession = async () => {
        try {
            const res = await axios.post(`${API_BASE}/pos/sesiones/`, {
                monto_inicial: 50000, // Base sugerida
                estado: 'abierta'
            });
            setSesionActiva(res.data);
        } catch (err) {
            setError('No se pudo abrir la caja. Verifique la conexión.');
        }
    };

    const handleCloseSession = async () => {
        if (!montoContado) return alert('Ingrese el monto contado en caja');
        try {
            await axios.post(`${API_BASE}/pos/sesiones/${sesionActiva.id}/cerrar/`, {
                monto_final_contado: Number(montoContado)
            });
            alert('Caja cerrada con éxito.');
            navigate('/');
        } catch (err) {
            alert('Error al cerrar caja.');
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }
            return [...prev, { ...product, cantidad: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.cantidad + delta);
                return { ...item, cantidad: newQty };
            }
            return item;
        }));
    };

    const subtotalTotal = cart.reduce((sum, item) => sum + (Number(item.precio_venta) * item.cantidad), 0);
    const ivaTotal = subtotalTotal * 0.19;
    const grandTotal = subtotalTotal + ivaTotal;
    const cambio = montoRecibido ? (Number(montoRecibido) - grandTotal) : 0;

    const filteredProducts = productos.filter(p => {
        const matchesCategory = activeCategory === 'Todas' || p.categoria_nombre === activeCategory;
        const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleNumpad = (val) => {
        if (val === 'C') {
            setMontoRecibido('');
        } else if (val === 'back') {
            setMontoRecibido(prev => prev.slice(0, -1));
        } else if (typeof val === 'number') {
            // Quick amount
            setMontoRecibido(val.toString());
        } else {
            // Digit
            setMontoRecibido(prev => prev + val);
        }
    };

    const handleProcessSale = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const payload = {
                items: cart.map(item => ({
                    producto_id: item.id,
                    cantidad: item.cantidad
                })),
                metodo_pago: paymentMethod,
                monto_recibido: Number(montoRecibido) || grandTotal
            };
            
            console.log('Procesando venta:', payload);
            const response = await axios.post(`${API_BASE}/pos/ventas/`, payload);
            setLastSaleReceipt(response.data);
            setCart([]);
            setMontoRecibido('');
            setShowPaymentModal(false);
        } catch (err) {
            alert('Error al procesar la venta: ' + (err.response?.data?.error || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return (
        <div style={{ 
            height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#1e293b', color: 'white' 
        }}>
            <div style={{ textAlign: 'center' }}>
                <RefreshCw size={48} className="animate-spin" />
                <p style={{ marginTop: '1rem', fontSize: '1.2rem' }}>Iniciando Panadería LA BOQUILLA POS...</p>
            </div>
        </div>
    );

    return (
        <div style={{ 
            height: '100vh', display: 'flex', flexDirection: 'column', 
            background: '#f1f5f9', overflow: 'hidden' 
        }}>
            {/* Top Bar */}
            <div style={{ 
                background: '#ffffff', padding: '0.75rem 1.5rem', display: 'flex', 
                alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={iconBtnStyle} title="Regresar">
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MonitorSmartphone size={24} style={{ color: '#ec4899' }} />
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#1e293b' }}>
                                LA BOQUILLA - POS
                            </h1>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Punto de Venta Autorizado</span>
                        </div>
                    </div>
                </div>

                <div style={searchContainerStyle}>
                    <Search size={18} style={{ color: '#94a3b8' }} />
                    <input 
                        type="text" placeholder="Buscar pan, pasteles o SKU..." 
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Cajero: Administrador</div>
                        <div style={{ fontSize: '0.7rem', color: sesionActiva ? '#10b981' : '#ef4444' }}>
                            {sesionActiva ? `● Caja Abierta (ID: ${sesionActiva.id})` : '○ Caja Cerrada'}
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowCloseSessionModal(true)}
                        style={{ ...iconBtnStyle, background: '#fee2e2', color: '#ef4444' }}
                        title="Cerrar Turno / Reporte"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Side: Categories & Products */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
                    {/* Categories Chips */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        <CategoryChip 
                            active={activeCategory === 'Todas'} 
                            onClick={() => setActiveCategory('Todas')} 
                            label="Todas" icon={ShoppingBag} 
                        />
                        {categorias.map(cat => (
                            <CategoryChip 
                                key={cat.id} active={activeCategory === cat.nombre} 
                                onClick={() => setActiveCategory(cat.nombre)} 
                                label={cat.nombre} icon={Coffee} 
                            />
                        ))}
                    </div>

                    {/* Products Grid */}
                    <div style={{ 
                        flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                        gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem'
                    }}>
                        {filteredProducts.map(p => (
                            <ProductCard key={p.id} product={p} onClick={() => addToCart(p)} />
                        ))}
                    </div>
                </div>

                {/* Right Side: Cart */}
                <div style={{ 
                    width: '400px', background: 'white', display: 'flex', 
                    flexDirection: 'column', borderLeft: '1px solid #e2e8f0', boxShadow: '-5px 0 15px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingCart size={20} style={{ color: '#6366f1' }} />
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Carrito de Venta</h2>
                        <span style={{ 
                            marginLeft: 'auto', background: '#fef3c7', color: '#92400e', 
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700' 
                        }}>
                            {cart.reduce((s, i) => s + i.cantidad, 0)} items
                        </span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        {cart.length === 0 ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e0' }}>
                                <ShoppingBag size={64} style={{ opacity: 0.2 }} />
                                <p style={{ marginTop: '1rem', textAlign: 'center' }}>Selecciona productos para iniciar la venta</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {cart.map(item => (
                                    <CartItem 
                                        key={item.id} item={item} 
                                        onRemove={() => removeFromCart(item.id)}
                                        onUpdateQty={(d) => updateQuantity(item.id, d)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                        <div style={summaryRowStyle}>
                            <span>Subtotal</span>
                            <span>${subtotalTotal.toLocaleString()}</span>
                        </div>
                        <div style={summaryRowStyle}>
                            <span>IVA (19%)</span>
                            <span>${ivaTotal.toLocaleString()}</span>
                        </div>
                        <div style={{ ...summaryRowStyle, fontSize: '1.5rem', fontWeight: '800', marginTop: '0.5rem', color: '#1e293b' }}>
                            <span>TOTAL</span>
                            <span>${grandTotal.toLocaleString()}</span>
                        </div>
                        
                        <button 
                            disabled={cart.length === 0}
                            onClick={() => setShowPaymentModal(true)}
                            style={{
                                width: '100%', marginTop: '1.5rem', padding: '1.25rem',
                                borderRadius: '16px', border: 'none', background: cart.length > 0 ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' : '#e2e8f0',
                                color: 'white', fontSize: '1.1rem', fontWeight: '800', cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                                boxShadow: cart.length > 0 ? '0 10px 20px rgba(236, 72, 153, 0.3)' : 'none', transition: 'transform 0.2s'
                            }}
                            onMouseOver={e => cart.length > 0 && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Proceder al Pago
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div style={modalOverlayStyle} onClick={() => setShowPaymentModal(false)}>
                    <div style={paymentModalStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Completar Venta</h2>
                            <button onClick={() => setShowPaymentModal(false)} style={iconBtnStyle}><X size={24}/></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label style={labelStyle}>Medio de Pago</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <PaymentMethodBtn 
                                        active={paymentMethod === 'efectivo'} onClick={() => setPaymentMethod('efectivo')}
                                        label="Efectivo" icon={Wallet} color="#10b981"
                                    />
                                    <PaymentMethodBtn 
                                        active={paymentMethod === 'tarjeta'} onClick={() => setPaymentMethod('tarjeta')}
                                        label="Tarjeta" icon={CreditCard} color="#3b82f6"
                                    />
                                    <PaymentMethodBtn 
                                        active={paymentMethod === 'transferencia'} onClick={() => setPaymentMethod('transferencia')}
                                        label="Transferencia" icon={Smartphone} color="#a855f7"
                                    />
                                </div>
                                
                                {paymentMethod === 'efectivo' && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <label style={labelStyle}>Monto Recibido</label>
                                        <input 
                                            type="number" style={paymentInputStyle} placeholder="Recibido..."
                                            value={montoRecibido} onChange={e => setMontoRecibido(e.target.value)}
                                            autoFocus
                                        />
                                        {cambio >= 0 && montoRecibido && (
                                            <div style={{ marginTop: '1rem', background: '#ecfdf5', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '0.875rem', color: '#059669' }}>Cambio (Vuelto)</div>
                                                <div style={{ fontSize: '2rem', fontWeight: '900', color: '#047857' }}>${cambio.toLocaleString()}</div>
                                            </div>
                                        )}
                                        
                                        {/* Numpad Integration */}
                                        <div style={{ marginTop: '1.5rem' }}>
                                            <Numpad onInput={handleNumpad} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>Resumen de Ticket</h3>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                                    {cart.map(i => (
                                        <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            <span>{i.cantidad}x {i.nombre}</span>
                                            <span>${(i.cantidad * i.precio_venta).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ borderTop: '2px dashed #cbd5e0', paddingTop: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800' }}>
                                        <span>TOTAL</span>
                                        <span>${grandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                                    Genera factura electrónica POS automáticamente
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleProcessSale}
                            disabled={isProcessing || (paymentMethod === 'efectivo' && Number(montoRecibido) < grandTotal)}
                            style={{
                                width: '100%', marginTop: '2rem', padding: '1.25rem', borderRadius: '16px',
                                border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white', fontSize: '1.25rem', fontWeight: '900', cursor: 'pointer',
                                boxShadow: '0 10px 20px rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem'
                            }}
                        >
                            {isProcessing ? <RefreshCw className="animate-spin" /> : <Printer size={24}/>}
                            {isProcessing ? 'Finalizando...' : 'FINALIZAR E IMPRIMIR'}
                        </button>
                    </div>
                </div>
            )}

            {/* Success Modal / Ticket View */}
            {lastSaleReceipt && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...paymentModalStyle, maxWidth: '400px', textAlign: 'center' }}>
                        <CheckCircle2 size={64} style={{ color: '#10b981', marginBottom: '1rem' }} />
                        <h2 style={{ margin: 0 }}>¡Venta Exitosa!</h2>
                        <p style={{ color: '#64748b' }}>Factura {lastSaleReceipt.factura_detalle?.numero_factura} emitida correctamente.</p>
                        
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', margin: '1.5rem 0', textAlign: 'left', fontFamily: 'monospace' }}>
                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>PANADERIA LA BOQUILLA</div>
                            <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>NIT: 79867452-4</div>
                            <div style={{ margin: '1rem 0', fontSize: '0.8rem' }}>
                                Factura: {lastSaleReceipt.factura_detalle?.numero_factura}<br/>
                                Fecha: {new Date().toLocaleString()}<br/>
                                CUFE: {lastSaleReceipt.factura_detalle?.cufe?.slice(0, 20)}...
                            </div>
                            <div style={{ borderTop: '1px dashed #000', paddingTop: '0.5rem' }}>
                                Total: ${lastSaleReceipt.factura_detalle?.total?.toLocaleString()}
                            </div>
                        </div>

                        <button 
                            onClick={() => setLastSaleReceipt(null)}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
                                background: '#1e293b', color: 'white', fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Nueva Venta
                        </button>
                    </div>
                </div>
            )}

            {/* Close Session / Report Modal */}
            {showCloseSessionModal && (
                <div style={modalOverlayStyle} onClick={() => setShowCloseSessionModal(false)}>
                    <div style={{ ...paymentModalStyle, maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <RefreshCw size={24} />
                            Cierre de Caja y Reporte
                        </h2>
                        
                        {sesionActiva && (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                                <div style={summaryRowStyle}>
                                    <span>Base Inicial</span>
                                    <span>${Number(sesionActiva.monto_inicial).toLocaleString()}</span>
                                </div>
                                <div style={summaryRowStyle}>
                                    <span>Ventas en Sistema</span>
                                    <span style={{ fontWeight: 'bold' }}>$Calculando...</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    Sesión abierta desde: {new Date(sesionActiva.fecha_apertura).toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Efectivo Contado en Caja ($)</label>
                            <input 
                                type="number" style={paymentInputStyle} 
                                value={montoContado} onChange={e => setMontoContado(e.target.value)}
                                placeholder="Efectivo real en cajon..."
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            <button 
                                onClick={() => setShowCloseSessionModal(false)}
                                style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white' }}
                            >
                                Seguir Vendiendo
                            </button>
                            <button 
                                onClick={handleCloseSession}
                                style={{ 
                                    flex: 1, padding: '1rem', borderRadius: '12px', border: 'none', 
                                    background: '#ef4444', color: 'white', fontWeight: '800' 
                                }}
                            >
                                CERRAR TURNO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponents
function CategoryChip({ active, onClick, label, icon: Icon }) {
    return (
        <button 
            onClick={onClick}
            style={{
                padding: '0.6rem 1.2rem', borderRadius: '25px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                border: active ? 'none' : '1px solid #e2e8f0', background: active ? '#6366f1' : 'white',
                color: active ? 'white' : '#64748b', fontWeight: '600', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s'
            }}
        >
            <Icon size={16} />
            {label}
        </button>
    );
}

function ProductCard({ product, onClick }) {
    const [isPressed, setIsPressed] = useState(false);
    const imageUrl = product.imagen_url || (product.imagen ? `${MEDIA_BASE}/media/${product.imagen}` : null);
    
    return (
        <div 
            onClick={() => {
                onClick();
                setIsPressed(true);
                setTimeout(() => setIsPressed(false), 150);
            }}
            style={{
                background: 'white', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', 
                justifyContent: 'space-between', border: '1px solid #f1f5f9',
                transform: isPressed ? 'scale(0.95)' : 'none', transition: 'all 0.1s',
                height: '260px'
            }}
        >
            {/* Imagen del producto */}
            <div style={{
                width: '100%', height: '140px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={product.nombre}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                        color: '#8b5cf6', gap: '0.5rem'
                    }}>
                        <Package size={48} />
                        <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>{product.codigo_sku || 'SIN IMG'}</span>
                    </div>
                )}
            </div>
            
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '0.65rem', fontWeight: '800', width: 'fit-content', padding: '2px 8px', borderRadius: '8px', marginBottom: '0.5rem' }}>
                        {product.categoria_nombre || 'PAN'}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: '700', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.nombre}</h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>${Number(product.precio_venta).toLocaleString()}</span>
                    <div style={{ background: '#ec4899', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={18} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CartItem({ item, onRemove, onUpdateQty }) {
    const imageUrl = item.imagen_url || (item.imagen ? `${MEDIA_BASE}/media/${item.imagen}` : null);
    
    return (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#fcfcfc', padding: '0.75rem', borderRadius: '12px' }}>
            {/* Miniatura de imagen */}
            <div style={{
                width: '50px', height: '50px', borderRadius: '8px', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0
            }}>
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={item.nombre}
                        style={{
                            width: '100%', height: '100%', objectFit: 'contain',
                            padding: '4px'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <Package size={24} color="#8b5cf6" />
                )}
            </div>
            
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1e293b' }}>{item.nombre}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>${Number(item.precio_venta).toLocaleString()} / u</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                <button onClick={() => onUpdateQty(-1)} style={qtyBtnStyle}><Minus size={14}/></button>
                <span style={{ fontSize: '0.875rem', fontWeight: '800', width: '20px', textAlign: 'center' }}>{item.cantidad}</span>
                <button onClick={() => onUpdateQty(1)} style={qtyBtnStyle}><Plus size={14}/></button>
            </div>
            <button onClick={onRemove} style={{ ...iconBtnStyle, color: '#ef4444' }}><Trash2 size={16}/></button>
        </div>
    );
}

function PaymentMethodBtn({ active, onClick, label, icon: Icon, color }) {
    return (
        <button 
            onClick={onClick}
            style={{
                flex: 1, padding: '1rem 0.5rem', borderRadius: '12px', border: active ? `2px solid ${color}` : '1px solid #e2e8f0',
                background: active ? `${color}10` : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                alignItems: 'center', gap: '0.5rem', color: active ? color : '#64748b'
            }}
        >
            <Icon size={24} />
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{label}</span>
        </button>
    );
}

// Icons placeholder for Smartphone which I missed in imports
function Smartphone(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
    )
}

function Numpad({ onInput }) {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'back'];
    const quickAmounts = [5000, 10000, 20000, 50000, 100000];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Quick Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                {quickAmounts.map(val => (
                    <button 
                        key={val}
                        onClick={() => onInput(val)}
                        style={{
                            padding: '0.5rem', borderRadius: '10px', border: '1px solid #e2e8f0',
                            background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        ${(val/1000)}k
                    </button>
                ))}
            </div>

            {/* Main Numpad */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem',
                background: '#f1f5f9', padding: '0.5rem', borderRadius: '16px' 
            }}>
                {digits.map(d => (
                    <button 
                        key={d}
                        onClick={() => onInput(d === 'back' ? 'back' : d)}
                        style={{
                            padding: '0.75rem', borderRadius: '10px', border: 'none',
                            background: d === 'C' ? '#fee2e2' : (d === 'back' ? '#f1f5f9' : 'white'),
                            color: d === 'C' ? '#ef4444' : '#1e293b',
                            fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {d === 'back' ? <Trash2 size={20} /> : d}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Styles
const iconBtnStyle = { background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const searchContainerStyle = { background: '#f1f5f9', borderRadius: '12px', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '35%', maxWidth: '500px' };
const searchInputStyle = { background: 'none', border: 'none', outline: 'none', fontSize: '0.9rem', width: '100%' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#64748b', fontSize: '0.95rem' };
const qtyBtnStyle = { background: 'white', border: 'none', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' };
const paymentModalStyle = { background: 'white', borderRadius: '24px', padding: '1.5rem', width: '95%', maxWidth: '720px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', maxHeight: '95vh', overflowY: 'auto' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#475569', marginBottom: '0.75rem' };
const paymentInputStyle = { width: '100%', padding: '1rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', fontSize: '1.5rem', fontWeight: '900', outline: 'none', color: '#1e293b' };
const formGroupStyle = { marginBottom: '1.5rem' };

export default POS;
