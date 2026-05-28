import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LayoutDashboard,
    Target,
    Package,
    DollarSign,
    Activity,
    Users,
    TrendingUp,
    RotateCcw
} from 'lucide-react';

import './index.css';

// =============================================================================
// BASE URL
// =============================================================================

const BASE =
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000';

// =============================================================================
// API URLS
// =============================================================================

const API_CLIENTES =
    `${BASE}/api/crm/clientes/`;

const API_PRODUCTOS =
    `${BASE}/api/inventario/productos/`;

const API_KPIS_CALCULAR =
    `${BASE}/api/kpis/kpis/calcular_todos/`;

const API_KPIS_FORECAST =
    `${BASE}/api/kpis/kpis/predecir_ventas/`;

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

    const [loading, setLoading] = useState(false);

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

            // ✅ FIX ENDPOINTS
            const [resClientes, resProd] = await Promise.all([

                axios
                    .get(API_CLIENTES)
                    .catch(() => ({ data: [] })),

                axios
                    .get(API_PRODUCTOS)
                    .catch(() => ({ data: [] }))

            ]);

            setData({
                clientes: resClientes.data.length || 0,
                productos: resProd.data || [],
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

            // ✅ FIX URL
            await axios.post(API_KPIS_CALCULAR);

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

            // ✅ FIX URL
            const res = await axios.post(
                API_KPIS_FORECAST,
                { meses: 6 }
            );

            setForecast(res.data?.pronosticos || []);

        } catch (err) {

            console.error('Error calculating sales forecast:', err);

            setError('Error al generar pronóstico');

            setForecast([]);

        } finally {

            setForecastLoading(false);

        }
    };

    // =============================================================================
    // INVENTARIO
    // =============================================================================

    const valorInventario = data.productos.reduce(

        (acc, prod) =>

            acc +
            (
                parseFloat(prod.precio_venta || 0) *
                (prod.stock_actual || 0)
            ),

        0

    );

    const inventarioChartData =
        data.productos
            .slice(0, 5)
            .map(p => ({
                name:
                    (p.nombre || 'Producto')
                        .substring(0, 15) + '...',
                valor:
                    parseFloat(p.precio_venta || 0) *
                    (p.stock_actual || 0)
            }));

    // =============================================================================
    // LOADING
    // =============================================================================

    if (loading) {

        return (
            <div className="container">
                <div className="loading">
                    Cargando dashboard...
                </div>
            </div>
        );
    }

    // =============================================================================
    // ERROR
    // =============================================================================

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

    // =============================================================================
    // RENDER
    // =============================================================================

    return (

        <div className="container">

            <div style={{ marginBottom: '2rem' }}>

                <h1 className="header-title">
                    Panel de Control: Visión 360°
                </h1>

                <p className="header-subtitle">
                    Resumen Ejecutivo del Sistema ERP 8AMPERIOS
                </p>

            </div>

            {/* KPI CARDS */}

            <div style={{
                display: 'grid',
                gridTemplateColumns:
                    'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>

                {/* CLIENTES */}

                <div
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >

                    <div style={{
                        background: 'rgba(79, 70, 229, 0.2)',
                        padding: '1rem',
                        borderRadius: '12px',
                        color: 'var(--primary)'
                    }}>
                        <Target size={28} />
                    </div>

                    <div>

                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Clientes Totales
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            {data.clientes}
                        </div>

                    </div>

                </div>

                {/* INVENTARIO */}

                <div
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >

                    <div style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        padding: '1rem',
                        borderRadius: '12px',
                        color: 'var(--warning)'
                    }}>
                        <Package size={28} />
                    </div>

                    <div>

                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Valor del Inventario
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            ${valorInventario.toLocaleString()}
                        </div>

                    </div>

                </div>

                {/* PRODUCTOS */}

                <div
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >

                    <div style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        padding: '1rem',
                        borderRadius: '12px',
                        color: 'var(--success)'
                    }}>
                        <DollarSign size={28} />
                    </div>

                    <div>

                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Total Productos
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            {data.productos.length}
                        </div>

                    </div>

                </div>

                {/* SISTEMA */}

                <div
                    className="glass-card"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}
                >

                    <div style={{
                        background: 'rgba(236, 72, 153, 0.2)',
                        padding: '1rem',
                        borderRadius: '12px',
                        color: '#ec4899'
                    }}>
                        <Users size={28} />
                    </div>

                    <div>

                        <div style={{
                            fontSize: '0.875rem',
                            color: 'var(--text-muted)'
                        }}>
                            Estado del Sistema
                        </div>

                        <div style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--success)'
                        }}>
                            ✓ Activo
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;
```
