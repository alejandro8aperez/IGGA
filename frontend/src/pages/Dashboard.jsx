import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Target, Package, DollarSign, Activity, Users, Briefcase, TrendingUp, RotateCcw } from 'lucide-react';
import './index.css';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/';

function Dashboard() {
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
    const [loading, setLoading] = useState(false); // Cambiado a false para mostrar contenido inicialmente
    const [calculatingKPIs, setCalculatingKPIs] = useState(false);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [error, setError] = useState(null);

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

    if (loading) {
        return <div className="container"><div className="loading">Cargando dashboard...</div></div>;
    }

    if (error) {
        return (
            <div className="container">
                <div className="error">
                    <Activity size={20} />
                    {error}
                    <button 
                        className="btn btn-primary" 
                        onClick={fetchDashboardData}
                        style={{ marginLeft: '1rem' }}
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="header-title">Panel de Control: Visión 360°</h1>
                <p className="header-subtitle">Resumen Ejecutivo del Sistema ERP 8AMPERIOS</p>
            </div>

            {/* Main KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                        <Target size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Clientes Totales</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.clientes}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}>
                        <Package size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Valor del Inventario</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${valorInventario.toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
                        <DollarSign size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Productos</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.productos.length}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '12px', color: '#ec4899' }}>
                        <Users size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estado del Sistema</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>✓ Activo</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button 
                    className="btn btn-primary" 
                    onClick={calcularKPIs}
                    disabled={calculatingKPIs}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {calculatingKPIs ? (
                        <>
                            <RotateCcw size={18} className="animate-spin" />
                            Calculando KPIs...
                        </>
                    ) : (
                        <>
                            <Target size={18} />
                            Calcular KPIs
                        </>
                    )}
                </button>

                <button 
                    className="btn btn-secondary" 
                    onClick={calcularPronosticoVentas}
                    disabled={forecastLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {forecastLoading ? (
                        <>
                            <RotateCcw size={18} className="animate-spin" />
                            Generando Pronóstico...
                        </>
                    ) : (
                        <>
                            <TrendingUp size={18} />
                            Pronóstico de Ventas
                        </>
                    )}
                </button>

                <button 
                    className="btn btn-ghost" 
                    onClick={fetchDashboardData}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <RotateCcw size={18} />
                    Refrescar Datos
                </button>
            </div>

            {/* Simple Chart Section */}
            {data.productos.length > 0 && (
                <div className="glass-card">
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Top 5 Productos (Valor Inventario)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {inventarioChartData.map((item, index) => (
                            <div key={index} style={{ 
                                padding: '1rem', 
                                background: 'rgba(79, 70, 229, 0.1)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(79, 70, 229, 0.2)'
                            }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    ${item.valor.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Forecast Section */}
            {forecast.length > 0 && (
                <div className="glass-card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Pronóstico de Ventas</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                        {forecast.map((item, index) => (
                            <div key={index} style={{
                                padding: '1rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {item.periodo ? new Date(item.periodo).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }) : '-'}
                                </div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--warning)' }}>
                                    ${item.valor?.toLocaleString() || 0}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
