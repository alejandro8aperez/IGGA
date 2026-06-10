import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit3, Trash2, FileText, TrendingUp, AlertCircle, 
    DollarSign, ShoppingCart, Users, Calendar, CheckCircle, 
    Clock, X, Eye, Download, Filter, Search, Package,
    BarChart3, Box, AlertTriangle, Power
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { API } from '../config/api';

const API_BASE = API.INVENTARIOS.PRODUCTOS.replace('productos/', '');

export default function Inventario() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('productos');
    
    // Modal Categoria
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [currentCat, setCurrentCat] = useState(null);
    const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });
    const [isProdModalOpen, setIsProdModalOpen] = useState(false);
    const [currentProd, setCurrentProd] = useState(null);
    const [prodForm, setProdForm] = useState({
        codigo_sku: '', 
        nombre: '', 
        descripcion: '', 
        categoria: '',
        precio_compra: 0,
        precio_venta: 0,
        stock_actual: 0,
        stock_minimo: 0,
        unidad_medida: 'unidad',
        activo: true,
        tipo_producto: 'producto_terminado'
    });

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('todos');
    const [filterStock, setFilterStock] = useState('todos');

    // Modal Unidad Medida
    const [unidadesMedida, setUnidadesMedida] = useState([]);
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [unitForm, setUnitForm] = useState({ nombre: '', abreviatura: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const handleQuickCategoryUpdate = async (productId, categoryId) => {
        try {
            await axiosInstance.patch(`${API.INVENTARIOS.PRODUCTOS}${productId}/`, { categoria: categoryId });
            setProductos(productos.map(p => p.id === productId ? { ...p, categoria: categoryId, categoria_nombre: categorias.find(c => c.id === parseInt(categoryId))?.nombre } : p));
        } catch (err) {
            console.error("Error al actualizar categoría:", err);
            setError("No se pudo actualizar la categoría rápidamente.");
        }
    };

    const fetchKPIs = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                axiosInstance.get(`${API_BASE}productos/`),
                axiosInstance.get(`${API_BASE}categorias/`)
            ]);
            setProductos(prodRes.data);
            setCategorias(catRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching productos:', err);
            setError('Error al cargar productos del inventario');
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes, unitRes] = await Promise.all([
                axiosInstance.get(`${API_BASE}productos/`),
                axiosInstance.get(`${API_BASE}categorias/`),
                axiosInstance.get(`${API_BASE}unidades-medida/`)
            ]);
            setProductos(prodRes.data);
            setCategorias(catRes.data);
            setUnidadesMedida(unitRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos del inventario');
            setLoading(false);
        }
    };

    const handleUnitSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post(`${API_BASE}unidades-medida/`, unitForm);
            setUnidadesMedida([...unidadesMedida, res.data]);
            setProdForm({ ...prodForm, unidad_medida: res.data.nombre });
            setIsUnitModalOpen(false);
            setUnitForm({ nombre: '', abreviatura: '' });
        } catch (err) {
            alert('Error al crear unidad de medida');
        }
    };

    const openProdModal = (prod = null) => {
        if (prod) {
            setCurrentProd(prod);
            setProdForm({
                codigo_sku: prod.codigo_sku || '',
                nombre: prod.nombre,
                descripcion: prod.descripcion,
                categoria: typeof prod.categoria === 'object' ? prod.categoria.id : prod.categoria,
                precio_compra: prod.precio_compra,
                precio_venta: prod.precio_venta,
                stock_actual: prod.stock_actual,
                stock_minimo: prod.stock_minimo,
                unidad_medida: prod.unidad_medida || 'UN',
                activo: prod.activo ?? true,
                tipo_producto: prod.tipo_producto || 'producto_terminado',
                imagen: null
            });
        } else {
            setCurrentProd(null);
            setProdForm({ 
                codigo_sku: '', 
                nombre: '', 
                descripcion: '', 
                categoria: '',
                precio_compra: 0,
                precio_venta: 0,
                stock_actual: 0,
                stock_minimo: 0,
                unidad_medida: 'UN',
                activo: true,
                tipo_producto: 'producto_terminado',
                imagen: null
            });
        }
        setIsProdModalOpen(true);
    };

    const handleProdSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        
        // Preparar los datos asegurando que la categoría sea un ID numérico válido
        const data = { ...prodForm };
        if (data.categoria) {
            // Si es un objeto (de un serializador anidado), extraer el ID
            if (typeof data.categoria === 'object') {
                data.categoria = data.categoria.id;
            } else {
                // Asegurar que sea un número para el backend
                data.categoria = parseInt(data.categoria);
            }
        }

        Object.keys(data).forEach(key => {
            if (key === 'imagen') {
                if (data[key] instanceof File) {
                    formData.append(key, data[key]);
                }
            } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        try {
            const url = currentProd 
                ? `${API_BASE}productos/${currentProd.id}/` 
                : `${API_BASE}productos/`;
            
            // Usar PATCH para actualizaciones para evitar enviar campos no modificados
            const method = currentProd ? 'patch' : 'post';
            
            await axiosInstance({
                method: method,
                url: url,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            fetchData();
            setIsProdModalOpen(false);
        } catch (err) {
            console.error('Error al guardar producto:', err);
            setError('Error al guardar el producto');
        }
    };

    const toggleActivo = async (product) => {
        try {
            await axiosInstance.patch(`${API_BASE}productos/${product.id}/`, {
                activo: !product.activo
            });
            fetchData();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            setError('No se pudo cambiar el estado del producto');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const deleteProd = async (id) => {
        if (window.confirm('¿Eliminar este producto?')) {
            try {
                await axiosInstance.delete(`${API_BASE}productos/${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar producto:', err);
                const msg = err.response?.data?.error || 'Error al eliminar el producto';
                setError(msg);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleCatSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = currentCat ? `${API_BASE}categorias/${currentCat.id}/` : `${API_BASE}categorias/`;
            const method = currentCat ? 'put' : 'post';
            await axiosInstance({ method, url, data: catForm });
            fetchData();
            setIsCatModalOpen(false);
        } catch (err) {
            setError('Error al guardar la categoría');
        }
    };

    const deleteCat = async (id) => {
        if (window.confirm('¿Eliminar esta categoría?')) {
            try {
                await axiosInstance.delete(`${API_BASE}categorias/${id}/`);
                fetchData();
            } catch (err) {
                setError('No se puede eliminar la categoría porque tiene productos asociados');
            }
        }
    };

    const getStockStatus = (actual, minimo) => {
        if (actual <= minimo) {
            return { text: 'Bajo Stock', bg: '#fed7d7', color: '#c53030' };
        } else if (actual <= minimo * 1.5) {
            return { text: 'Stock Medio', bg: '#fef5e7', color: '#d69e2e' };
        } else {
            return { text: 'Stock OK', bg: '#c6f6d5', color: '#276749' };
        }
    };

    // Calculate statistics
    const totalProductos = productos.length;
    const productosBajoStock = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
    const valorTotalInventario = productos.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0);
    const margenPromedio = productos.length > 0 
        ? Math.round(productos.reduce((sum, p) => sum + ((p.precio_venta - p.precio_compra) / p.precio_compra * 100), 0) / productos.length)
        : 0;

    // Filter products
    const filteredProductos = productos.filter(product => {
        const matchesSearch = product.codigo_sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'todos' || product.categoria_nombre === filterCategory;
        const matchesStock = filterStock === 'todos' || 
                            (filterStock === 'bajo' && product.stock_actual <= product.stock_minimo) ||
                            (filterStock === 'normal' && product.stock_actual > product.stock_minimo);
        return matchesSearch && matchesCategory && matchesStock;
    });

    const totalVentas = productos.reduce((sum, p) => sum + (p.precio_venta * p.stock_actual), 0);
    const ordenesPendientes = productos.filter(p => p.stock_actual <= p.stock_minimo).length;

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
                    <p style={{ color: '#718096', fontSize: '1rem' }}>Cargando inventario...</p>
                </div>
            </div>
        );
    }

    if (error && productos.length === 0) {
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
                        onClick={fetchData}
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
                        <Package size={32} style={{ color: '#667eea' }} />
                        Gestión de Inventario
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button 
                            onClick={() => setActiveTab('productos')}
                            style={{
                                background: activeTab === 'productos' ? '#667eea' : 'white',
                                color: activeTab === 'productos' ? 'white' : '#718096',
                                border: '1px solid #e2e8f0',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Productos
                        </button>
                        <button 
                            onClick={() => setActiveTab('categorias')}
                            style={{
                                background: activeTab === 'categorias' ? '#667eea' : 'white',
                                color: activeTab === 'categorias' ? 'white' : '#718096',
                                border: '1px solid #e2e8f0',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Categorías
                        </button>
                    </div>
                </div>
                {activeTab === 'productos' ? (
                    <button
                        onClick={() => openProdModal()}
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
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setCurrentCat(null);
                            setCatForm({ nombre: '', descripcion: '' });
                            setIsCatModalOpen(true);
                        }}
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
                            boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)'
                        }}
                    >
                        <Plus size={20} />
                        Nueva Categoría
                    </button>
                )}
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
                                Total Inventario
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Valor en stock
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
                                Productos Bajo Stock
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Necesitan reposición
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
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
                                Margen Promedio
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Sobre costo
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#f59e0b',
                        margin: '0'
                    }}>
                        {margenPromedio}%
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
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
                                Total Productos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                En catálogo
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#ef4444',
                        margin: '0'
                    }}>
                        {totalProductos}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'productos' ? (
                <>
                    {/* Stats Grid y Buscador - Aquí iría el código existente de productos */}
                    {/* Search and Filters */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        position: 'relative',
                        flex: '1',
                        minWidth: '300px'
                    }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                        <input
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem 0.75rem 3rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            placeholder="Buscar por código, nombre, descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <select
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            minWidth: '180px'
                        }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="todos">Todas las categorías</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                        ))}
                    </select>
                    <select
                        style={{
                            padding: '0.75rem 1rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            background: 'white',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                    >
                        <option value="todos">Todo el stock</option>
                        <option value="bajo">Bajo stock</option>
                        <option value="normal">Stock normal</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div style={{ 
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                width: '100%'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                        width: '100%', 
                        minWidth: '1100px',
                        borderCollapse: 'collapse', 
                        fontSize: '0.9rem',
                        tableLayout: 'fixed'
                    }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '6%' }}>Foto</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Código</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '25%' }}>Producto</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '12%' }}>Categoría</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Tipo</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Stock Actual</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Stock Mínimo</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '8%' }}>Unidad</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '11%' }}>Precio Venta</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '10%' }}>Estado</th>
                                <th style={{ padding: '1.25rem 0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600', verticalAlign: 'middle', whiteSpace: 'nowrap', width: '8%' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProductos.map((product, index) => {
                                const stockStatus = getStockStatus(product.stock_actual, product.stock_minimo);
                                return (
                                    <tr key={product.id} style={{ 
                                        borderBottom: '1px solid #e2e8f0',
                                        backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                    }}>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                background: '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #e2e8f0',
                                                margin: '0 auto'
                                            }}>
                                                {product.imagen_url ? (
                                                    <img 
                                                        src={product.imagen_url} 
                                                        alt="" 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Package size={20} color="#cbd5e0" />
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: '#2d3748', textAlign: 'center', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            <span style={{ fontSize: '0.85rem' }}>{product.codigo_sku}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Box size={12} style={{ color: '#718096', flexShrink: 0 }} />
                                                <div style={{ overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        {product.nombre}
                                                        {!product.activo && (
                                                            <span style={{ background: '#feb2b2', color: '#9b2c2c', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>INACTIVO</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#718096', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.descripcion}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background: '#f0f4ff',
                                                color: '#667eea',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-block',
                                                border: '1px solid #dce4ff'
                                            }}>
                                                {product.categoria_nombre || 'Sin Categoría'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#718096', textTransform: 'capitalize' }}>
                                                {product.tipo_producto?.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                                                <Package size={14} style={{ color: '#718096', flexShrink: 0 }} />
                                                <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '0.85rem' }}>{product.stock_actual}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', color: '#718096', fontSize: '0.85rem' }}>{product.stock_minimo}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle', color: '#718096', fontSize: '0.85rem', textTransform: 'capitalize' }}>{product.unidad_medida || 'unidad'}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: 600, fontSize: '0.85rem' }}>${product.precio_venta?.toLocaleString() || 0}</td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background: stockStatus.bg,
                                                color: stockStatus.color,
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '8px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                display: 'inline-block'
                                            }}>
                                                {stockStatus.text}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => openProdModal(product)}
                                                    style={{
                                                        background: '#667eea',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#5a67d8'}
                                                    onMouseOut={(e) => e.target.style.background = '#667eea'}
                                                >
                                                    <Edit3 size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => toggleActivo(product)}
                                                    title={product.activo ? 'Desactivar' : 'Activar'}
                                                    style={{
                                                        background: product.activo ? '#48bb78' : '#718096',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <Power size={12} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteProd(product.id)}
                                                    title="Borrar"
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '0.4rem',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'background 0.2s',
                                                        flexShrink: 0
                                                    }}
                                                    onMouseOver={(e) => e.target.style.background = '#dc2626'}
                                                    onMouseOut={(e) => e.target.style.background = '#ef4444'}
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#4a5568' }}>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Descripción</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorias.map(cat => (
                                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{cat.nombre}</td>
                                    <td style={{ padding: '1rem', color: '#718096' }}>{cat.descripcion}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => {
                                                    setCurrentCat(cat);
                                                    setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion });
                                                    setIsCatModalOpen(true);
                                                }}
                                                style={{ background: '#667eea', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => deleteCat(cat.id)}
                                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isProdModalOpen && (
                <div 
                    onClick={() => setIsProdModalOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                >
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.25rem 2rem',
                            width: '95%',
                            maxWidth: '1200px',
                            maxHeight: '90vh',
                            overflow: 'auto'
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '1rem',
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: '0.75rem'
                        }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#1a202c', fontSize: '1.5rem', fontWeight: '800' }}>
                                    {currentProd ? 'Editar Producto' : 'Nuevo Producto'}
                                </h2>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                {/* Previsualización de imagen en la esquina superior derecha */}
                                {currentProd?.imagen_url && (
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden', 
                                        border: '2px solid white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        background: '#f8fafc'
                                    }}>
                                        <img 
                                            src={currentProd.imagen_url} 
                                            alt="Preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                )}
                                <button 
                                    onClick={() => setIsProdModalOpen(false)}
                                    style={{
                                        background: '#f1f5f9',
                                        border: 'none',
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                                    onMouseOut={e => e.currentTarget.style.background = '#f1f5f9'}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        
                        <form onSubmit={handleProdSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                                {/* Fila 1 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Código SKU</label>
                                    <input
                                        type="text"
                                        value={prodForm.codigo_sku}
                                        onChange={(e) => setProdForm({...prodForm, codigo_sku: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Nombre del Producto</label>
                                    <input
                                        type="text"
                                        value={prodForm.nombre}
                                        onChange={(e) => setProdForm({...prodForm, nombre: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Estado e Imagen</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', height: '35px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                            <input
                                                type="checkbox"
                                                checked={prodForm.activo}
                                                onChange={(e) => setProdForm({...prodForm, activo: e.target.checked})}
                                                style={{ width: '16px', height: '16px' }}
                                            />
                                            Activo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setProdForm({...prodForm, imagen: e.target.files[0]})}
                                            style={{ fontSize: '0.65rem', width: '100%' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Tipo de Producto</label>
                                    <select
                                        value={prodForm.tipo_producto}
                                        onChange={(e) => setProdForm({...prodForm, tipo_producto: e.target.value})}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    >
                                        <option value="materia_prima">Materia Prima</option>
                                        <option value="producto_terminado">Producto Terminado</option>
                                        <option value="insumo">Insumo / Empaque</option>
                                        <option value="semielaborado">Semielaborado</option>
                                        <option value="activo_fijo">Activo Fijo</option>
                                    </select>
                                </div>

                                {/* Fila 2: Descripción */}
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Descripción / Notas</label>
                                    <textarea
                                        value={prodForm.descripcion}
                                        onChange={(e) => setProdForm({...prodForm, descripcion: e.target.value})}
                                        placeholder="Características o ingredientes..."
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', minHeight: '40px', maxHeight: '60px', resize: 'vertical' }}
                                    />
                                </div>

                                {/* Fila 3: Clasificación */}
                                <div style={{ gridColumn: 'span 1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Categoría</label>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <select
                                            value={prodForm.categoria}
                                            onChange={(e) => setProdForm({...prodForm, categoria: e.target.value})}
                                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                        >
                                            <option value="">Categoría...</option>
                                            {categorias.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                            ))}
                                        </select>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setCurrentCat(null);
                                                setCatForm({ nombre: '', descripcion: '' });
                                                setIsCatModalOpen(true);
                                            }}
                                            style={{ background: '#48bb78', color: 'white', border: 'none', padding: '0 0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ gridColumn: 'span 1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Unidad Medida</label>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <select
                                            value={prodForm.unidad_medida}
                                            onChange={(e) => setProdForm({...prodForm, unidad_medida: e.target.value})}
                                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                        >
                                            <option value="">Unidad...</option>
                                            {unidadesMedida.map(u => (
                                                <option key={u.id} value={u.nombre}>{u.nombre}</option>
                                            ))}
                                            <option value="Unidad">Unidad</option>
                                            <option value="Kilogramo">Kilogramo</option>
                                        </select>
                                        <button 
                                            type="button"
                                            onClick={() => setIsUnitModalOpen(true)}
                                            style={{ background: '#48bb78', color: 'white', border: 'none', padding: '0 0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>P. Compra</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={prodForm.precio_compra}
                                        onChange={(e) => setProdForm({...prodForm, precio_compra: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>P. Venta</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={prodForm.precio_venta}
                                        onChange={(e) => setProdForm({...prodForm, precio_venta: parseFloat(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>

                                {/* Fila 4: Inventario */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Stock Actual</label>
                                    <input
                                        type="number"
                                        value={prodForm.stock_actual}
                                        onChange={(e) => setProdForm({...prodForm, stock_actual: parseInt(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.2rem', color: '#4a5568', fontWeight: '600', fontSize: '0.8rem' }}>Stock Mínimo</label>
                                    <input
                                        type="number"
                                        value={prodForm.stock_minimo}
                                        onChange={(e) => setProdForm({...prodForm, stock_minimo: parseInt(e.target.value) || 0})}
                                        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem' }}
                                    />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    {/* Espacio libre para mantener alineación o añadir campos futuros */}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setIsProdModalOpen(false)}
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.6rem 1.25rem',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {currentProd ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Categoria */}
            {isCatModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{currentCat ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                        <form onSubmit={handleCatSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre</label>
                                <input 
                                    type="text" 
                                    value={catForm.nombre} 
                                    onChange={(e) => setCatForm({...catForm, nombre: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Descripción</label>
                                <textarea 
                                    value={catForm.descripcion} 
                                    onChange={(e) => setCatForm({...catForm, descripcion: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsCatModalOpen(false)} style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', border: 'none', background: '#667eea', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Nueva Unidad de Medida */}
            {isUnitModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Nueva Unidad</h2>
                            <button onClick={() => setIsUnitModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleUnitSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre (ej: Mililitro)</label>
                                <input
                                    type="text"
                                    required
                                    value={unitForm.nombre}
                                    onChange={(e) => setUnitForm({...unitForm, nombre: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Abreviatura (ej: ml)</label>
                                <input
                                    type="text"
                                    value={unitForm.abreviatura}
                                    onChange={(e) => setUnitForm({...unitForm, abreviatura: e.target.value})}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                                Guardar Unidad
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
