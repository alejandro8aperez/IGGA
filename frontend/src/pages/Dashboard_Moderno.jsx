import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    LayoutDashboard, Target, Package, DollarSign, Activity, Users, Briefcase, 
    TrendingUp, TrendingDown, RotateCcw, BarChart3, PieChart, 
    ShoppingCart, Truck, FileText, AlertCircle, Eye, Download,
    Calendar, Clock, CheckCircle, ArrowUp, ArrowDown
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/';

export default function Dashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        clientes: 0,
        productos: [],
        oportunidades: [],
        cuentas: [],
        transaccionesCaja: 0,
        empleados: 0,
        proyectos: 0,
        kpis: []
    });
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [calculatingKPIs, setCalculatingKPIs] = useState(false);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('mes');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Simplificado - solo datos básicos para evitar errores
            const [resClientes, resProd] = await Promise.all([
                axios.get(`${API_BASE}crm/clientes/`).catch(() => ({ data: [] })),
                axios.get(`${API_BASE}inventarios/productos/`).catch(() => ({ data: [] }))
            ]);

            setData({
                clientes: resClientes.data.length,
                productos: resProd.data,
                oportunidades: [],
                cuentas: [],
                transaccionesCaja: 0,
                empleados: 0,
                proyectos: 0,
                kpis: []
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const calcularKPIs = async () => {
        setCalculatingKPIs(true);
        try {
            await axios.post(`${API_BASE}kpis/kpis/calcular_todos/`);
            await fetchDashboardData();
        } catch (err) {
            console.error('Error calculating KPIs:', err);
            setError('Error al calcular KPIs');
        } finally {
            setCalculatingKPIs(false);
        }
    };

    const calcularPronosticoVentas = async () => {
        setForecastLoading(true);
        try {
            const res = await axios.post(`${API_BASE}kpis/kpis/predecir_ventas/`, { meses: 6 });
            setForecast(res.data.pronosticos || []);
        } catch (err) {
            console.error('Error calculating sales forecast:', err);
            setError('Error al generar pronóstico');
            setForecast([]);
        } finally {
            setForecastLoading(false);
        }
    };

    // Chart data simples
    const valorInventario = data.productos.reduce((acc, prod) => acc + (parseFloat(prod.precio_venta || 0) * (prod.stock_actual || 0)), 0);
    const inventarioChartData = data.productos.slice(0, 5).map(p => ({
        name: (p.nombre || 'Producto').substring(0, 15) + '...',
        valor: parseFloat(p.precio_venta || 0) * (p.stock_actual || 0)
    }));

    // Datos de ejemplo para gráficos
    const ventasMensuales = [
        { mes: 'Ene', ventas: 45000, meta: 50000 },
        { mes: 'Feb', ventas: 52000, meta: 50000 },
        { mes: 'Mar', ventas: 48000, meta: 55000 },
        { mes: 'Abr', ventas: 61000, meta: 55000 },
        { mes: 'May', ventas: 58000, meta: 60000 },
        { mes: 'Jun', ventas: 67000, meta: 60000 }
    ];

    const categoriasData = [
        { categoria: 'Electrónicos', valor: 45000, porcentaje: 35 },
        { categoria: 'Transformadores', valor: 38000, porcentaje: 30 },
        { categoria: 'Accesorios', valor: 25000, porcentaje: 20 },
        { categoria: 'Otros', valor: 19000, porcentaje: 15 }
    ];

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
                        Cargando dashboard...
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
                        Error en Dashboard
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
                        <LayoutDashboard size={32} style={{ color: '#667eea' }} />
                        Dashboard Principal
                    </h2>
                    <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                        Vista general del negocio
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
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
                        <option value="hoy">Hoy</option>
                        <option value="semana">Esta Semana</option>
                        <option value="mes">Este Mes</option>
                        <option value="año">Este Año</option>
                    </select>
                    <button
                        onClick={calcularKPIs}
                        disabled={calculatingKPIs}
                        style={{
                            background: calculatingKPIs 
                                ? '#9ca3af' 
                                : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: calculatingKPIs ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: calculatingKPIs 
                                ? 'none' 
                                : '0 4px 15px rgba(72, 187, 120, 0.3)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            if (!calculatingKPIs) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!calculatingKPIs) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
                            }
                        }}
                    >
                        <RotateCcw size={20} />
                        {calculatingKPIs ? 'Calculando...' : 'Actualizar KPIs'}
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
                                Clientes
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Total registrados
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#667eea',
                        margin: '0'
                    }}>
                        {data.clientes}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <ArrowUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                            +12% este mes
                        </span>
                    </div>
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
                            <Package size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Productos
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                En inventario
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#48bb78',
                        margin: '0'
                    }}>
                        {data.productos.length}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <ArrowUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                            +8% este mes
                        </span>
                    </div>
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
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Valor Inventario
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Total en stock
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#f59e0b',
                        margin: '0'
                    }}>
                        ${valorInventario.toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <ArrowDown size={16} style={{ color: '#ef4444' }} />
                        <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: '600' }}>
                            -3% este mes
                        </span>
                    </div>
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
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 style={{ 
                                fontSize: '1.1rem', 
                                fontWeight: '600', 
                                color: '#2d3748',
                                margin: '0 0 0.25rem 0'
                            }}>
                                Transacciones
                            </h3>
                            <p style={{ color: '#718096', margin: 0, fontSize: '0.875rem' }}>
                                Del período
                            </p>
                        </div>
                    </div>
                    <p style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#38b2ac',
                        margin: '0'
                    }}>
                        {data.transaccionesCaja}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <ArrowUp size={16} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                            +15% este mes
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                {/* Ventas Mensuales Chart */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '1.5rem' 
                    }}>
                        <h3 style={{ 
                            fontSize: '1.2rem', 
                            fontWeight: '600', 
                            color: '#2d3748',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <BarChart3 size={20} style={{ color: '#667eea' }} />
                            Ventas vs Metas
                        </h3>
                        <button
                            onClick={calcularPronosticoVentas}
                            disabled={forecastLoading}
                            style={{
                                background: forecastLoading 
                                    ? '#9ca3af' 
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: forecastLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <TrendingUp size={16} />
                            {forecastLoading ? 'Generando...' : 'Pronóstico'}
                        </button>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                        {/* Simple bar chart representation */}
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-end', 
                            justifyContent: 'space-around', 
                            height: '250px',
                            padding: '0 1rem'
                        }}>
                            {ventasMensuales.map((item, index) => (
                                <div key={index} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    flex: 1,
                                    height: '100%'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '200px' }}>
                                        {/* Sales Bar */}
                                        <div style={{ 
                                            width: '25px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '4px 4px 0 0',
                                            height: `${(item.ventas / 70000) * 200}px`
                                        }}></div>
                                        {/* Goal Bar */}
                                        <div style={{ 
                                            width: '25px',
                                            background: '#e2e8f0',
                                            borderRadius: '4px 4px 0 0',
                                            height: `${(item.meta / 70000) * 200}px`
                                        }}></div>
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.75rem', 
                                        color: '#4a5568', 
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        marginTop: '0.5rem'
                                    }}>
                                        {item.mes}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            gap: '2rem',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '2px'
                                }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#4a5568' }}>Ventas</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ 
                                    width: '12px', 
                                    height: '12px', 
                                    background: '#e2e8f0',
                                    borderRadius: '2px'
                                }}></div>
                                <span style={{ fontSize: '0.875rem', color: '#4a5568' }}>Metas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categorías Chart */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        margin: '0 0 1.5rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <PieChart size={20} style={{ color: '#667eea' }} />
                        Ventas por Categoría
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {categoriasData.map((cat, index) => (
                            <div key={index}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    marginBottom: '0.5rem' 
                                }}>
                                    <span style={{ fontSize: '0.875rem', color: '#4a5568', fontWeight: '600' }}>
                                        {cat.categoria}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: '#2d3748', fontWeight: '700' }}>
                                        ${cat.valor.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ 
                                    width: '100%', 
                                    height: '8px', 
                                    background: '#e2e8f0', 
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        width: `${cat.porcentaje}%`, 
                                        height: '100%', 
                                        background: `hsl(${index * 60}, 70%, 50%)`,
                                        borderRadius: '4px',
                                        transition: 'width 0.3s ease'
                                    }}></div>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#718096' }}>
                                        {cat.porcentaje}% del total
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1.5rem' 
            }}>
                {/* Top Products */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Package size={20} style={{ color: '#667eea' }} />
                        Productos con Mayor Valor
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {inventarioChartData.map((product, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div>
                                    <h4 style={{ 
                                        fontSize: '0.9rem', 
                                        fontWeight: '600', 
                                        color: '#2d3748',
                                        margin: '0 0 0.25rem 0'
                                    }}>
                                        {product.name}
                                    </h4>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>
                                        #{index + 1} en valor
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: '700', 
                                        color: '#667eea',
                                        margin: 0
                                    }}>
                                        ${product.valor.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '600', 
                        color: '#2d3748',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Target size={20} style={{ color: '#667eea' }} />
                        Acciones Rápidas
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <button
                            onClick={() => navigate('/crm')}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
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
                            <Users size={24} />
                            CRM
                        </button>
                        <button
                            onClick={() => navigate('/ventas')}
                            style={{
                                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
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
                            <ShoppingCart size={24} />
                            Ventas
                        </button>
                        <button
                            onClick={() => navigate('/inventario')}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
                            }}
                        >
                            <Package size={24} />
                            Inventario
                        </button>
                        <button
                            onClick={() => navigate('/compras')}
                            style={{
                                background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(56, 178, 172, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(56, 178, 172, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(56, 178, 172, 0.3)';
                            }}
                        >
                            <Briefcase size={24} />
                            Compras
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
