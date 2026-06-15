mport { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axiosConfig';
import { 
    LayoutDashboard, Target, Package, DollarSign, Activity, Users, Briefcase, 
    RotateCcw, BarChart3, PieChart, ShoppingCart, AlertCircle, MonitorSmartphone,
    FileText, Wrench, Store
} from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({
        resumen: { total_clientes: 0, total_cotizaciones: 0, ventas_totales: 0, compras_totales: 0, balance: 0 },
        inventario: { total_items: 0, stock_bajo: 0, valor_total: 0 },
        movimientos: [],
        ventas_mensuales: [],
        ventas_categorias: [],
        rrhh: { total_empleados: 0, total_proyectos: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [calculatingKPIs, setCalculatingKPIs] = useState(false);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('mes');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // ═══════════════════════════════════════════════════════════════════════════
    //  FETCH DATA - Usando URLs relativas (axios ya tiene baseURL en /api/)
    // ═══════════════════════════════════════════════════════════════════════════
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usamos URL relativa - axios.defaults.baseURL apunta a /api/
            const response = await axiosInstance.get('dashboard/stats/');
            const stats = response.data;
            setData({
                resumen:          stats.resumen          || {},
                inventario:       stats.inventario       || {},
                movimientos:      stats.movimientos      || [],
                ventas_mensuales: stats.ventas_mensuales || [],
                ventas_categorias:stats.ventas_categorias|| [],
                rrhh:             stats.rrhh             || {},
            });
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del dashboard. Verifica la conexion con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const calcularKPIs = async () => {
        setCalculatingKPIs(true);
        try {
            // URL relativa
            await axiosInstance.post('kpis/calcular/');
            await fetchDashboardData();
        } catch (err) {
            console.error('Error calculating KPIs:', err);
        } finally {
            setCalculatingKPIs(false);
        }
    };

    // Datos reales del API
    const ventasMensuales = data.ventas_mensuales;
    const categoriasData  = data.ventas_categorias;
    const maxVenta = Math.max(...ventasMensuales.map(v => v.ventas), 1);

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
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
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
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea', margin: '0' }}>
                        {data.resumen?.total_clientes ?? 0}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <Users size={14} style={{ color: '#667eea' }} />
                        <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                            {data.resumen?.total_cotizaciones ?? 0} cotizaciones
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
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#48bb78', margin: '0' }}>
                        {data.inventario?.total_items ?? 0}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ color: data.inventario?.stock_bajo > 0 ? '#ef4444' : '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                            {data.inventario?.stock_bajo ?? 0} con stock bajo
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
                        ${(data.inventario?.valor_total || 0).toLocaleString()}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <span style={{ color: data.inventario?.stock_bajo > 0 ? '#ef4444' : '#10b981', fontSize: '0.875rem', fontWeight: '600' }}>
                            {data.inventario?.stock_bajo || 0} items con stock bajo
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
                                Del periodo
                            </p>
                        </div>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#38b2ac', margin: '0' }}>
                        ${(data.resumen?.ventas_totales || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <DollarSign size={14} style={{ color: '#38b2ac' }} />
                        <span style={{ color: '#718096', fontSize: '0.875rem' }}>
                            Compras: ${(data.resumen?.compras_totales || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
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
                    background: 'white', borderRadius: '16px', padding: '1.5rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} style={{ color: '#667eea' }} />
                            Ventas Ultimos 6 Meses
                        </h3>
                        <button onClick={fetchDashboardData} style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <RotateCcw size={14} /> Actualizar
                        </button>
                    </div>
                    {ventasMensuales.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
                            <BarChart3 size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p>Sin ventas en los ultimos 6 meses</p>
                        </div>
                    ) : (
                        <div style={{ height: '270px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '220px', padding: '0 0.5rem' }}>
                                {ventasMensuales.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1, height: '100%', gap: '6px' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: '600' }}>
                                            ${(item.ventas/1000).toFixed(0)}k
                                        </span>
                                        <div style={{ width: '32px', background: 'linear-gradient(180deg,#667eea,#764ba2)', borderRadius: '4px 4px 0 0', height: `${Math.max((item.ventas / maxVenta) * 180, item.ventas > 0 ? 4 : 0)}px`, transition: 'height 0.4s ease' }} />
                                        <span style={{ fontSize: '0.75rem', color: '#4a5568', fontWeight: '600', textAlign: 'center' }}>{item.mes}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Ventas por Categoria */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#2d3748', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={20} style={{ color: '#667eea' }} />
                        Ventas por Categoria
                    </h3>
                    {categoriasData.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                            <PieChart size={36} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>Sin ventas registradas por categoria</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categoriasData.map((cat, index) => (
                                <div key={index}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                        <span style={{ fontSize: '0.875rem', color: '#4a5568', fontWeight: '600' }}>{cat.categoria}</span>
                                        <span style={{ fontSize: '0.875rem', color: '#2d3748', fontWeight: '700' }}>
                                            ${(cat.valor || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${cat.porcentaje}%`, height: '100%', background: `hsl(${index * 55 + 220}, 70%, 55%)`, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                    </div>
                                    <div style={{ textAlign: 'right', marginTop: '0.2rem' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#718096' }}>{cat.porcentaje}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                        <Activity size={20} style={{ color: '#667eea' }} />
                        Movimientos Recientes
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(data.movimientos || []).map((mov, index) => (
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
                                        {mov.producto}
                                    </h4>
                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.8rem' }}>
                                        {mov.tipo}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        fontWeight: '700', 
                                        color: mov.tipo.includes('Entrada') ? '#10b981' : '#ef4444',
                                        margin: 0
                                    }}>
                                        {mov.tipo.includes('Entrada') ? '+' : '-'}{mov.cantidad}
                                    </p>
                                    <span style={{ fontSize: '0.7rem', color: '#a0aec0' }}>
                                        {new Date(mov.fecha).toLocaleDateString()}
                                    </span>
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
                        Acciones Rapidas
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                        {[
                            { label: 'CRM',            icon: Users,             path: '/crm',                  bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102,126,234,0.35)' },
                            { label: 'Ventas',         icon: ShoppingCart,      path: '/ventas',               bg: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', shadow: 'rgba(72,187,120,0.35)'  },
                            { label: 'POS',            icon: MonitorSmartphone, path: '/pos',                  bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', shadow: 'rgba(249,115,22,0.35)'  },
                            { label: 'Inventario',     icon: Package,           path: '/inventario',           bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', shadow: 'rgba(245,158,11,0.35)'  },
                            { label: 'Compras',        icon: Briefcase,         path: '/compras',              bg: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)', shadow: 'rgba(56,178,172,0.35)'  },
                            { label: 'Proveedores',    icon: Store,             path: '/proveedores',          bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', shadow: 'rgba(13,148,136,0.35)'  },
                            { label: 'Operaciones',    icon: Wrench,            path: '/operaciones',          bg: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)', shadow: 'rgba(132,204,22,0.35)'  },
                            { label: 'Informe Diario', icon: FileText,          path: '/informe-diario-proy',  bg: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', shadow: 'rgba(99,102,241,0.35)'  },
                        ].map(({ label, icon: Icon, path, bg, shadow }) => (
                            <button
                                key={label}
                                onClick={() => navigate(path)}
                                style={{
                                    background: bg, color: 'white', border: 'none',
                                    padding: '1rem 0.5rem', borderRadius: '12px',
                                    fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    boxShadow: `0 4px 15px ${shadow}`, transition: 'all 0.2s'
                                }}
                                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 25px ${shadow}`; }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 15px ${shadow}`; }}
                            >
                                <Icon size={22} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
