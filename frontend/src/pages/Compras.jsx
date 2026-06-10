import { useState, useEffect } from 'react';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';
import { 
    ShoppingCart, AlertCircle, Edit3, Trash2, Plus, X, Truck, FileText, Palette,
    Users, DollarSign, Package, CheckCircle, Clock, TrendingUp,
    Search, Filter, Calendar, CreditCard
} from 'lucide-react';

const API_PROV = BASE_URL + '/compras/proveedores/';
const API_ORD = BASE_URL + '/compras/ordenes/';
const API_RECEPCION = BASE_URL + '/compras/recepciones/';
const API_PAGO = BASE_URL + '/compras/pagos/';
const API_PROD_PROV = BASE_URL + '/compras/productos-proveedor/';
const API_PRODUCTOS = BASE_URL + '/inventarios/productos/';

export default function Compras() {
    const [proveedores, setProveedores] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [recepciones, setRecepciones] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [productosProveedor, setProductosProveedor] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
    const [productosDisponibles, setProductosDisponibles] = useState([]);
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
        estado: 'activo',
        tipo_documento: 'NIT',
        digito_verificacion: '',
        codigo_barras: '',
        actividad_economica_ciiu: '',
        responsabilidades_fiscales: '',
        matricula_mercantil: '',
        correo_facturacion_electronica: '',
        regimen_tributario: 'comun',
        responsable_iva: false,
        gran_contribuyente: false,
        agente_retenedor: false
    });

    // Modal Recepciones
    const [isRecepModalOpen, setIsRecepModalOpen] = useState(false);
    const [currentRecep, setCurrentRecep] = useState(null);
    const [recepForm, setRecepForm] = useState({
        orden: '',
        cantidad_recibida: '',
        fecha_recepcion: new Date().toISOString().split('T')[0],
        estado: 'recibida'
    });

    // Modal Pagos
    const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
    const [pagoForm, setPagoForm] = useState({
        orden: '',
        monto: '',
        metodo: 'transferencia',
        referencia: ''
    });

    // Modal Producto-Proveedor
    const [isProdProvModalOpen, setIsProdProvModalOpen] = useState(false);
    const [currentProdProv, setCurrentProdProv] = useState(null);
    const [prodProvForm, setProdProvForm] = useState({
        producto: '',
        proveedor: '',
        codigo_proveedor: '',
        precio_proveedor: '',
        tiempo_entrega_dias: 7,
        es_proveedor_principal: false,
        notas: ''
    });

    // Modal Órdenes de Compra
    const [isOrdModalOpen, setIsOrdModalOpen] = useState(false);
    const [currentOrd, setCurrentOrd] = useState(null);
    const [ordForm, setOrdForm] = useState({
        proveedor: '',
        fecha_entrega_esperada: '',
        estado: 'borrador',
        condicion_pago: '',
        observaciones: '',
        porcentaje_iva: 19,
        descuento: 0,
        detalles: []
    });
    const [productosProveedorActual, setProductosProveedorActual] = useState([]);
    const [soloProductosProveedor, setSoloProductosProveedor] = useState(true);
    const [filtroTipoProducto, setFiltroTipoProducto] = useState('materia_prima');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (activeTab === 'productos-proveedor' && proveedorSeleccionado) {
            fetchProductosPorProveedor();
        }
    }, [activeTab, proveedorSeleccionado]);

    const fetchData = async () => {
        try {
            const [resProv, resOrd, resRecep, resPagos] = await Promise.all([
                axiosInstance.get(API_PROV),
                axiosInstance.get(API_ORD),
                axiosInstance.get(API_RECEPCION),
                axiosInstance.get(API_PAGO)
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

    const fetchProductosPorProveedor = async () => {
        try {
            const res = await axiosInstance.get(`${API_PROD_PROV}?proveedor=${proveedorSeleccionado}`);
            setProductosProveedor(res.data);
        } catch (err) {
            console.error('Error fetching productos por proveedor:', err);
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
                estado: 'activo',
                tipo_documento: 'NIT',
                digito_verificacion: '',
                codigo_barras: '',
                actividad_economica_ciiu: '',
                responsabilidades_fiscales: '',
                matricula_mercantil: '',
                correo_facturacion_electronica: '',
                regimen_tributario: 'comun',
                responsable_iva: false,
                gran_contribuyente: false,
                agente_retenedor: false
            });
        }
        setIsProvModalOpen(true);
    };

    const handleProvSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProv) {
                await axiosInstance.put(`${API_PROV}${currentProv.id}/`, provForm);
            } else {
                await axiosInstance.post(API_PROV, provForm);
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
                await axiosInstance.delete(`${API_PROV}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar proveedor:', err);
                setError('Error al eliminar proveedor. Es probable que tenga órdenes de compra asociadas.');
            }
        }
    };

    const openRecepModal = (rec = null) => {
        if (rec) {
            setCurrentRecep(rec);
            // Intentar obtener la cantidad desde el primer detalle si no está en el objeto principal
            const cant = rec.cantidad_recibida || (rec.detalles_recepcion?.[0]?.cantidad_recibida) || 0;
            setRecepForm({
                orden: rec.orden,
                cantidad_recibida: cant,
                fecha_recepcion: rec.fecha || rec.fecha_recepcion || new Date().toISOString().split('T')[0],
                estado: rec.estado || 'recibida'
            });
        } else {
            setCurrentRecep(null);
            setRecepForm({
                orden: '',
                cantidad_recibida: '',
                fecha_recepcion: new Date().toISOString().split('T')[0],
                estado: 'recibida'
            });
        }
        setIsRecepModalOpen(true);
    };

    const handleRecepSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...recepForm,
                orden: Number(recepForm.orden),
                cantidad_recibida: Number(recepForm.cantidad_recibida)
            };

            if (currentRecep) {
                await axiosInstance.put(`${API_RECEPCION}${currentRecep.id}/`, payload);
            } else {
                await axiosInstance.post(API_RECEPCION, payload);
            }
            setIsRecepModalOpen(false);
            fetchData();
            alert(`Recepción ${currentRecep ? 'actualizada' : 'registrada'} correctamente.`);
        } catch (err) {
            console.error('Error al guardar recepción:', err);
            setError(err.response?.data?.detail || 'Error al guardar recepción');
        }
    };

    const registrarRecepcion = async (orden) => {
        if (orden.estado === 'cancelada') {
            setError('No se puede recibir una orden cancelada.');
            return;
        }

        const cantidad = Number(prompt(`Cantidad a recibir para la orden ${orden.numero}:`, orden.cantidad || 0));
        if (isNaN(cantidad) || cantidad <= 0) return;

        try {
            await axiosInstance.post(API_RECEPCION, {
                orden: orden.id,
                cantidad_recibida: cantidad,
                fecha_recepcion: new Date().toISOString().split('T')[0],
                estado: 'recibida'
            });
            fetchData();
            alert('Recepción registrada correctamente.');
        } catch (err) {
            console.error('Error al registrar recepción:', err);
            setError(err.response?.data?.detail || 'Error al registrar recepción');
        }
    };

    const handleRecepcionDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta recepción? Esto afectará el saldo pendiente de la orden.')) {
            try {
                await axiosInstance.delete(`${API_RECEPCION}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar recepción:', err);
                setError('Error al eliminar recepción.');
            }
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
            const cleanMonto = typeof pagoForm.monto === 'string' 
                ? pagoForm.monto.replace(/\./g, '').replace(',', '.') 
                : pagoForm.monto;

            const montoNum = Number(cleanMonto);
            if (isNaN(montoNum) || montoNum <= 0) {
                setError('El monto debe ser un número válido mayor a cero.');
                return;
            }

            await axiosInstance.post(API_PAGO, {
                orden: Number(pagoForm.orden),
                monto: montoNum,
                metodo: pagoForm.metodo,
                referencia: pagoForm.referencia,
                fecha: new Date().toISOString().split('T')[0]
            });
            setIsPagoModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error al registrar pago:', err);
            const errorMsg = err.response?.data 
                ? JSON.stringify(err.response.data) 
                : 'Error al registrar pago';
            setError(errorMsg);
        }
    };

    // Funciones Producto-Proveedor
    const openProdProvModal = async (pp = null) => {
        // Cargar productos disponibles
        try {
            const res = await axiosInstance.get(API_PRODUCTOS);
            setProductosDisponibles(res.data);
        } catch (err) {
            console.error('Error cargando productos:', err);
        }

        if (pp) {
            setCurrentProdProv(pp);
            setProdProvForm({
                producto: pp.producto,
                proveedor: pp.proveedor,
                codigo_proveedor: pp.codigo_proveedor || '',
                precio_proveedor: pp.precio_proveedor || '',
                tiempo_entrega_dias: pp.tiempo_entrega_dias || 7,
                es_proveedor_principal: pp.es_proveedor_principal || false,
                notas: pp.notas || ''
            });
        } else {
            setCurrentProdProv(null);
            setProdProvForm({
                producto: '',
                proveedor: proveedorSeleccionado,
                codigo_proveedor: '',
                precio_proveedor: '',
                tiempo_entrega_dias: 7,
                es_proveedor_principal: false,
                notas: ''
            });
        }
        setIsProdProvModalOpen(true);
    };

    const handleProdProvSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...prodProvForm,
                producto: Number(prodProvForm.producto),
                proveedor: Number(prodProvForm.proveedor),
                precio_proveedor: prodProvForm.precio_proveedor ? Number(prodProvForm.precio_proveedor) : null,
                tiempo_entrega_dias: Number(prodProvForm.tiempo_entrega_dias)
            };

            if (currentProdProv) {
                await axiosInstance.put(`${API_PROD_PROV}${currentProdProv.id}/`, data);
            } else {
                await axiosInstance.post(API_PROD_PROV, data);
            }
            setIsProdProvModalOpen(false);
            fetchProductosPorProveedor();
        } catch (err) {
            console.error('Error al guardar producto-proveedor:', err);
            setError(err.response?.data?.detail || 'Error al guardar relación producto-proveedor');
        }
    };

    const handleProdProvDelete = async (id) => {
        if (window.confirm('¿Eliminar este producto del proveedor?')) {
            try {
                await axiosInstance.delete(`${API_PROD_PROV}${id}/`);
                fetchProductosPorProveedor();
            } catch (err) {
                console.error('Error al eliminar producto-proveedor:', err);
                setError('Error al eliminar relación');
            }
        }
    };

    // Funciones Órdenes de Compra
    const fetchProductosProveedorActual = async (proveedorId) => {
        if (!proveedorId) {
            setProductosProveedorActual([]);
            return;
        }
        try {
            const res = await axiosInstance.get(`${API_PROD_PROV}?proveedor=${proveedorId}`);
            setProductosProveedorActual(res.data);
        } catch (err) {
            console.error('Error cargando productos del proveedor:', err);
        }
    };

    const openOrdModal = async (ord = null) => {
        try {
            const res = await axiosInstance.get(API_PRODUCTOS);
            setProductosDisponibles(res.data);
        } catch (err) { console.error('Error cargando productos:', err); }

        if (ord) {
            setCurrentOrd(ord);
            const provId = ord.proveedor?.id || ord.proveedor;
            fetchProductosProveedorActual(provId);
            setOrdForm({
                proveedor: provId || '',
                fecha_entrega_esperada: ord.fecha_entrega_esperada || '',
                estado: ord.estado,
                condicion_pago: ord.condicion_pago || '',
                observaciones: ord.observaciones || '',
                porcentaje_iva: ord.porcentaje_iva || 19,
                descuento: ord.descuento || 0,
                detalles: (ord.detalles || []).map(d => ({
                    id: d.id || Math.random(),
                    producto: d.producto?.id || d.producto || '',
                    nombre_producto: d.producto_nombre || '',
                    unidad: d.unidad_medida || d.unidad || 'UND',
                    cantidad: d.cantidad || 1,
                    precio_unitario: d.precio_unitario || 0,
                    notas: d.notas || ''
                }))
            });
        } else {
            setCurrentOrd(null);
            const initialProv = proveedorSeleccionado || '';
            if (initialProv) fetchProductosProveedorActual(initialProv);
            setOrdForm({
                proveedor: initialProv,
                fecha_entrega_esperada: '',
                estado: 'borrador',
                condicion_pago: '',
                observaciones: '',
                porcentaje_iva: 19,
                descuento: 0,
                detalles: []
            });
        }
        setIsOrdModalOpen(true);
    };

    const addProductoToOrden = () => {
        setOrdForm({
            ...ordForm,
            detalles: [...ordForm.detalles, { 
                id: Math.random(), 
                producto: '', 
                nombre_producto: '', 
                unidad: 'UND',
                cantidad: 1, 
                precio_unitario: 0, 
                notas: '' 
            }]
        });
    };

    const removeProductoFromOrden = (id) => {
        setOrdForm({
            ...ordForm,
            detalles: ordForm.detalles.filter(d => d.id !== id)
        });
    };

    const updateProductoInOrden = (id, field, value) => {
        const newDetalles = ordForm.detalles.map(d => {
            if (d.id === id) {
                const update = { ...d, [field]: value };
                if (field === 'producto') {
                    const prod = productosDisponibles.find(p => p.id === Number(value));
                    if (prod) {
                        update.nombre_producto = prod.nombre;
                        update.precio_unitario = prod.precio_compra || 0;
                        update.unidad = prod.unidad_medida || 'UND';
                    }
                }
                return update;
            }
            return d;
        });
        setOrdForm({ ...ordForm, detalles: newDetalles });
    };

    const handleOrdSubmit = async (e) => {
        e.preventDefault();
        if (ordForm.detalles.length === 0) {
            alert('Debe agregar al menos un producto');
            return;
        }
        try {
            // Limpiar detalles para el backend
            const cleanDetalles = ordForm.detalles.map(d => ({
                producto: parseInt(d.producto),
                cantidad: parseFloat(d.cantidad),
                precio_unitario: parseFloat(d.precio_unitario),
                notas: d.notas || ''
            }));

            const payload = { 
                ...ordForm, 
                proveedor: parseInt(ordForm.proveedor),
                detalles: cleanDetalles 
            };

            if (currentOrd) {
                await axiosInstance.put(`${API_ORD}${currentOrd.id}/`, payload);
            } else {
                await axiosInstance.post(API_ORD, payload);
            }
            setIsOrdModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error al guardar orden:', err);
            const errorMsg = err.response?.data 
                ? JSON.stringify(err.response.data) 
                : 'Error al guardar orden de compra';
            setError(errorMsg);
        }
    };

    const handleOrdDelete = async (id) => {
        if (window.confirm('¿Eliminar orden de compra?')) {
            try {
                await axiosInstance.delete(`${API_ORD}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar orden:', err);
                setError('Error al eliminar orden.');
            }
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
        const term = searchTerm.toLowerCase();
        const matchesSearch = (ord.numero || '').toLowerCase().includes(term) ||
                            (ord.proveedor_nombre || '').toLowerCase().includes(term);
        return matchesSearch;
    });

    const filteredRecepciones = recepciones.filter(rec => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (rec.numero || '').toLowerCase().includes(term) ||
                            (rec.proveedor_nombre || '').toLowerCase().includes(term);
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
                    onClick={() => {
                        if (activeTab === 'ordenes') openOrdModal();
                        else if (activeTab === 'recepciones') openRecepModal();
                        else if (activeTab === 'pagos') openPagoModal();
                        else if (activeTab === 'productos-proveedor') openProdProvModal();
                        else openProvModal();
                    }}
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
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                    }}
                >
                    <Plus size={20} />
                    {activeTab === 'ordenes' ? 'Nueva Orden' : 
                     activeTab === 'recepciones' ? 'Nueva Recepción' :
                     activeTab === 'pagos' ? 'Nuevo Pago' :
                     activeTab === 'productos-proveedor' ? 'Agregar Producto' :
                     'Nuevo Proveedor'}
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
                    <button 
                        style={{
                            background: activeTab === 'productos-proveedor' 
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === 'productos-proveedor' ? 'white' : '#4a5568',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (activeTab !== 'productos-proveedor') {
                                e.target.style.backgroundColor = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (activeTab !== 'productos-proveedor') {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                        onClick={() => setActiveTab('productos-proveedor')}
                    >
                        <Package size={16} />
                        Productos por Proveedor
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
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>OC-{ord.numero || ord.id}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {ord.proveedor_nombre}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {ord.fecha_emision ? new Date(ord.fecha_emision).toLocaleDateString() : '-'}
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
                                                    onClick={() => openOrdModal(ord)}
                                                    style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Editar Orden"
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
                                                    onClick={() => registrarRecepcion(ord)}
                                                    title="Recibir Mercancía"
                                                >
                                                    <Package size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOrdDelete(ord.id)}
                                                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                                    title="Eliminar Orden"
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
                                    <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecepciones.map((rec) => (
                                    <tr key={rec.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>{rec.orden_numero}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={16} style={{ color: '#718096' }} />
                                                {rec.proveedor_nombre}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#4a5568' }}>
                                            {rec.fecha ? new Date(rec.fecha).toLocaleDateString() : '-'}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>
                                            {rec.cantidad_total || 0}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                ...(rec.estado?.toLowerCase() === 'recibida' 
                                                    ? { background: '#d1fae5', color: '#065f46' }
                                                    : { background: '#fbbf24', color: '#92400e' })
                                            }}>
                                                {rec.estado || 'Recibida'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => openRecepModal(rec)}
                                                    style={{ 
                                                        background: '#e0e7ff', 
                                                        color: '#4338ca', 
                                                        border: 'none', 
                                                        padding: '0.5rem', 
                                                        borderRadius: '8px', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#c7d2fe'}
                                                    onMouseOut={(e) => e.target.style.background = '#e0e7ff'}
                                                    title="Editar Recepción"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRecepcionDelete(rec.id)}
                                                    style={{ 
                                                        background: '#fee2e2', 
                                                        color: '#991b1b', 
                                                        border: 'none', 
                                                        padding: '0.5rem', 
                                                        borderRadius: '8px', 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#fecaca'}
                                                    onMouseOut={(e) => e.target.style.background = '#fee2e2'}
                                                    title="Eliminar Recepción"
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
                            <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#2d3748' }}>Información DIAN</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Tipo de Documento</label>
                                        <select value={provForm.tipo_documento} onChange={(e) => setProvForm({...provForm, tipo_documento: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="NIT">NIT</option>
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                            <option value="PAS">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Dígito Verificación</label>
                                        <input type="text" value={provForm.digito_verificacion} onChange={(e) => setProvForm({...provForm, digito_verificacion: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Código de Barras</label>
                                        <input type="text" value={provForm.codigo_barras} onChange={(e) => setProvForm({...provForm, codigo_barras: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Actividad Económica (CIIU)</label>
                                        <input type="text" value={provForm.actividad_economica_ciiu} onChange={(e) => setProvForm({...provForm, actividad_economica_ciiu: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Responsabilidades Fiscales</label>
                                        <input type="text" value={provForm.responsabilidades_fiscales} onChange={(e) => setProvForm({...provForm, responsabilidades_fiscales: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Matrícula Mercantil</label>
                                        <input type="text" value={provForm.matricula_mercantil} onChange={(e) => setProvForm({...provForm, matricula_mercantil: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Correo Facturación Electrónica</label>
                                        <input type="email" value={provForm.correo_facturacion_electronica} onChange={(e) => setProvForm({...provForm, correo_facturacion_electronica: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>Régimen Tributario</label>
                                        <select value={provForm.regimen_tributario} onChange={(e) => setProvForm({...provForm, regimen_tributario: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="comun">Régimen Común</option>
                                            <option value="simplificado">Régimen Simplificado</option>
                                            <option value="especial">Régimen Especial</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2d3748' }}>
                                            <input type="checkbox" checked={provForm.responsable_iva} onChange={(e) => setProvForm({...provForm, responsable_iva: e.target.checked})} />
                                            Responsable IVA
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2d3748' }}>
                                            <input type="checkbox" checked={provForm.gran_contribuyente} onChange={(e) => setProvForm({...provForm, gran_contribuyente: e.target.checked})} />
                                            Gran contribuyente
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2d3748' }}>
                                            <input type="checkbox" checked={provForm.agente_retenedor} onChange={(e) => setProvForm({...provForm, agente_retenedor: e.target.checked})} />
                                            Agente retenedor
                                        </label>
                                    </div>
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

            {activeTab === 'productos-proveedor' && (
                <div>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1a202c', fontSize: '1.25rem', fontWeight: '600' }}>
                                Productos por Proveedor
                            </h3>
                            <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>
                                Consulta qué productos vende cada proveedor
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select
                                value={proveedorSeleccionado}
                                onChange={(e) => setProveedorSeleccionado(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '10px',
                                    fontSize: '0.95rem',
                                    minWidth: '250px',
                                    background: 'white'
                                }}
                            >
                                <option value="">Seleccione un proveedor...</option>
                                {proveedores.map((prov) => (
                                    <option key={prov.id} value={prov.id}>
                                        {prov.razon_social} ({prov.nit})
                                    </option>
                                ))}
                            </select>
                            {proveedorSeleccionado && (
                                <button
                                    onClick={() => openProdProvModal()}
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Plus size={18} />
                                    Agregar Producto
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Productos Table */}
                    {proveedorSeleccionado && (
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
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Producto</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Código SKU</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Código Proveedor</th>
                                            <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Precio Proveedor</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Entrega (días)</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Principal</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', fontSize: '0.875rem' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productosProveedor.length > 0 ? (
                                            productosProveedor.map((pp) => (
                                                <tr key={pp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                                        {pp.producto_nombre}
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#4a5568', fontFamily: 'monospace' }}>
                                                        {pp.producto_codigo_sku}
                                                    </td>
                                                    <td style={{ padding: '1rem', color: '#4a5568' }}>
                                                        {pp.codigo_proveedor || '-'}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#2d3748', fontWeight: '600' }}>
                                                        {pp.precio_proveedor ? `$${parseFloat(pp.precio_proveedor).toLocaleString()}` : '-'}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', color: '#4a5568' }}>
                                                        {pp.tiempo_entrega_dias} días
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        {pp.es_proveedor_principal ? (
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '9999px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: '#c6f6d5',
                                                                color: '#22543d'
                                                            }}>
                                                                Sí
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                padding: '4px 12px',
                                                                borderRadius: '9999px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '600',
                                                                background: '#e2e8f0',
                                                                color: '#4a5568'
                                                            }}>
                                                                No
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => openProdProvModal(pp)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0.5rem',
                                                                borderRadius: '6px',
                                                                color: '#667eea',
                                                                marginRight: '0.5rem'
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleProdProvDelete(pp.id)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                padding: '0.5rem',
                                                                borderRadius: '6px',
                                                                color: '#ef4444'
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                                                    No hay productos registrados para este proveedor.
                                                    <br />
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        Agregue productos desde el módulo de Compras.
                                                    </span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                                <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                                    Total: {productosProveedor.length} producto(s)
                                </span>
                            </div>
                        </div>
                    )}

                    {!proveedorSeleccionado && (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '3rem',
                            textAlign: 'center',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}>
                            <Package size={48} style={{ color: '#cbd5e0', marginBottom: '1rem' }} />
                            <h3 style={{ color: '#4a5568', margin: '0 0 0.5rem 0' }}>Seleccione un proveedor</h3>
                            <p style={{ color: '#718096', margin: 0 }}>
                                Use el selector arriba para ver los productos de un proveedor específico.
                            </p>
                        </div>
                    )}
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

            {/* Modal Producto-Proveedor */}
            {isProdProvModalOpen && (
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
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#1a202c', fontSize: '1.25rem', fontWeight: '600' }}>
                                {currentProdProv ? 'Editar Producto del Proveedor' : 'Agregar Producto al Proveedor'}
                            </h3>
                            <button
                                onClick={() => setIsProdProvModalOpen(false)}
                                style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleProdProvSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Proveedor *
                                    </label>
                                    <select
                                        value={prodProvForm.proveedor}
                                        onChange={(e) => setProdProvForm({...prodProvForm, proveedor: e.target.value})}
                                        required
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Seleccione un proveedor...</option>
                                        {proveedores.map((prov) => (
                                            <option key={prov.id} value={prov.id}>
                                                {prov.razon_social} ({prov.nit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Producto *
                                    </label>
                                    <select
                                        value={prodProvForm.producto}
                                        onChange={(e) => setProdProvForm({...prodProvForm, producto: e.target.value})}
                                        required
                                        disabled={currentProdProv}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', background: 'white' }}
                                    >
                                        <option value="">Seleccione un producto...</option>
                                        {productosDisponibles.map((prod) => (
                                            <option key={prod.id} value={prod.id}>
                                                [{prod.codigo_sku}] {prod.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                            Código Proveedor
                                        </label>
                                        <input
                                            type="text"
                                            value={prodProvForm.codigo_proveedor}
                                            onChange={(e) => setProdProvForm({...prodProvForm, codigo_proveedor: e.target.value})}
                                            placeholder="Código usado por el proveedor"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                            Precio Proveedor
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={prodProvForm.precio_proveedor}
                                            onChange={(e) => setProdProvForm({...prodProvForm, precio_proveedor: e.target.value})}
                                            placeholder="0.00"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                            Tiempo de Entrega (días)
                                        </label>
                                        <input
                                            type="number"
                                            value={prodProvForm.tiempo_entrega_dias}
                                            onChange={(e) => setProdProvForm({...prodProvForm, tiempo_entrega_dias: e.target.value})}
                                            min="1"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '2rem' }}>
                                        <input
                                            type="checkbox"
                                            id="es_principal"
                                            checked={prodProvForm.es_proveedor_principal}
                                            onChange={(e) => setProdProvForm({...prodProvForm, es_proveedor_principal: e.target.checked})}
                                            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                        />
                                        <label htmlFor="es_principal" style={{ fontWeight: '600', color: '#2d3748', cursor: 'pointer' }}>
                                            Proveedor Principal
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2d3748' }}>
                                        Notas
                                    </label>
                                    <textarea
                                        value={prodProvForm.notas}
                                        onChange={(e) => setProdProvForm({...prodProvForm, notas: e.target.value})}
                                        placeholder="Notas adicionales..."
                                        rows="3"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsProdProvModalOpen(false)}
                                    style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
                                >
                                    {currentProdProv ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Orden de Compra */}
            {isRecepModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', width: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>
                                {currentRecep ? 'Editar Recepción' : 'Registrar Recepción'}
                            </h3>
                            <button onClick={() => setIsRecepModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleRecepSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Orden de Compra</label>
                                <select
                                    value={recepForm.orden}
                                    onChange={(e) => setRecepForm({...recepForm, orden: e.target.value})}
                                    required
                                    disabled={!!currentRecep}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px', background: currentRecep ? '#f8fafc' : 'white' }}
                                >
                                    <option value="">Seleccione una orden...</option>
                                    {currentRecep ? (
                                        <option value={currentRecep.orden}>OC-{currentRecep.orden_numero}</option>
                                    ) : (
                                        ordenes
                                            .filter(o => o.estado !== 'cancelada' && o.estado !== 'recibida')
                                            .map(o => (
                                                <option key={o.id} value={o.id}>
                                                    OC-{o.numero} - {o.proveedor_nombre} (Total: ${o.total?.toLocaleString()})
                                                </option>
                                            ))
                                    )}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Fecha de Recepción</label>
                                <input
                                    type="date"
                                    value={recepForm.fecha_recepcion}
                                    onChange={(e) => setRecepForm({...recepForm, fecha_recepcion: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Cantidad Total Recibida</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={recepForm.cantidad_recibida}
                                    onChange={(e) => setRecepForm({...recepForm, cantidad_recibida: e.target.value})}
                                    required
                                    placeholder="Ej: 100"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '10px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button type="button" onClick={() => setIsRecepModalOpen(false)} style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}>
                                    {currentRecep ? 'Actualizar Cambios' : 'Guardar Recepción'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {isOrdModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)', display: 'flex',
                    justifyContent: 'center', alignItems: 'center', zIndex: 1100
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '2rem',
                        width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                                {currentOrd ? 'Editar Orden de Compra' : 'Nueva Orden de Compra'}
                            </h3>
                            <button
                                onClick={() => setIsOrdModalOpen(false)}
                                style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleOrdSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Proveedor *</label>
                                    <select
                                        value={ordForm.proveedor}
                                        onChange={(e) => {
                                            const provId = e.target.value;
                                            setOrdForm({...ordForm, proveedor: provId});
                                            fetchProductosProveedorActual(provId);
                                        }}
                                        required
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    >
                                        <option value="">Seleccione...</option>
                                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Fecha Entrega</label>
                                    <input
                                        type="date"
                                        value={ordForm.fecha_entrega_esperada}
                                        onChange={(e) => setOrdForm({...ordForm, fecha_entrega_esperada: e.target.value})}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>Estado</label>
                                    <select
                                        value={ordForm.estado}
                                        onChange={(e) => setOrdForm({...ordForm, estado: e.target.value})}
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                    >
                                        <option value="borrador">Borrador</option>
                                        <option value="enviada">Enviada</option>
                                        <option value="confirmada">Confirmada</option>
                                        <option value="cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: '#4a5568', fontWeight: '700' }}>Productos en la Orden</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input 
                                                type="checkbox" 
                                                id="solo_prov" 
                                                checked={soloProductosProveedor} 
                                                onChange={(e) => setSoloProductosProveedor(e.target.checked)} 
                                            />
                                            <label htmlFor="solo_prov" style={{ fontSize: '0.85rem', color: '#4a5568', cursor: 'pointer' }}>Solo productos de este proveedor</label>
                                        </div>
                                        {!soloProductosProveedor && (
                                            <select 
                                                value={filtroTipoProducto} 
                                                onChange={(e) => setFiltroTipoProducto(e.target.value)}
                                                style={{ padding: '0.3rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #cbd5e0' }}
                                            >
                                                <option value="todos">Todos los tipos</option>
                                                <option value="materia_prima">Materia Prima</option>
                                                <option value="insumo">Insumos</option>
                                                <option value="producto_terminado">Producto Terminado</option>
                                                <option value="empaque">Empaque</option>
                                            </select>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addProductoToOrden}
                                        style={{ background: '#667eea', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
                                    >
                                        + Agregar Producto
                                    </button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#edf2f7' }}>
                                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4a5568' }}>Producto</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4a5568' }}>UN</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4a5568' }}>Cant.</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4a5568' }}>V. Unitario</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#4a5568' }}>Subtotal</th>
                                            <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordForm.detalles.map((det) => (
                                            <tr key={det.id}>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <select
                                                        value={String(det.producto || '')}
                                                        onChange={(e) => updateProductoInOrden(det.id, 'producto', e.target.value)}
                                                        required
                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                                    >
                                                        <option value="">Seleccione...</option>
                                                        {soloProductosProveedor ? (
                                                            productosProveedorActual.map(pp => (
                                                                <option key={pp.producto} value={pp.producto}>
                                                                    {pp.producto_nombre} ({pp.producto_codigo_sku}) - ${parseFloat(pp.precio_proveedor).toLocaleString()}
                                                                </option>
                                                            ))
                                                        ) : (
                                                            productosDisponibles
                                                                .filter(p => filtroTipoProducto === 'todos' || p.tipo_producto === filtroTipoProducto)
                                                                .map(p => (
                                                                    <option key={p.id} value={p.id}>
                                                                        [{p.tipo_producto?.replace('_', ' ')}] {p.nombre}
                                                                    </option>
                                                                ))
                                                        )}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>
                                                    {det.unidad}
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input
                                                        type="number"
                                                        value={det.cantidad}
                                                        onChange={(e) => updateProductoInOrden(det.id, 'cantidad', e.target.value)}
                                                        min="0.01" step="0.01" required
                                                        style={{ width: '80px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.5rem' }}>
                                                    <input
                                                        type="number"
                                                        value={det.precio_unitario}
                                                        onChange={(e) => updateProductoInOrden(det.id, 'precio_unitario', e.target.value)}
                                                        min="0" step="0.01" required
                                                        style={{ width: '120px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'right' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600' }}>
                                                    ${(det.cantidad * det.precio_unitario).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                                    <button type="button" onClick={() => removeProductoFromOrden(det.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ordForm.detalles.length === 0 && (
                                            <tr>
                                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                                                    Haga clic en "+ Agregar Producto" para empezar
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Observaciones</label>
                                    <textarea
                                        value={ordForm.observaciones}
                                        onChange={(e) => setOrdForm({...ordForm, observaciones: e.target.value})}
                                        rows="4"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none' }}
                                    />
                                </div>
                                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>Subtotal:</span>
                                        <span style={{ fontWeight: '600' }}>${ordForm.detalles.reduce((s, d) => s + (d.cantidad * d.precio_unitario), 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>IVA ({ordForm.porcentaje_iva}%):</span>
                                        <span style={{ fontWeight: '600' }}>${(ordForm.detalles.reduce((s, d) => s + (d.cantidad * d.precio_unitario), 0) * (ordForm.porcentaje_iva / 100)).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e2e8f0', marginTop: '1rem', paddingTop: '1rem', fontSize: '1.2rem', color: '#1a202c' }}>
                                        <strong>Total:</strong>
                                        <strong>${(ordForm.detalles.reduce((s, d) => s + (d.cantidad * d.precio_unitario), 0) * (1 + ordForm.porcentaje_iva / 100)).toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsOrdModalOpen(false)}
                                    style={{ background: '#f3f4f6', color: '#4a5568', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '0.75rem 2rem', borderRadius: '10px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' }}
                                >
                                    {currentOrd ? 'Actualizar Orden' : 'Crear Orden'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
