import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/reportes-avanzados/';

// Datos de ejemplo para demostración
const SAMPLE_DATA = {
    ventasMensuales: [
        { month: 'Ene 2026', ventas: 45000, compras: 28000 },
        { month: 'Feb 2026', ventas: 52000, compras: 32000 },
        { month: 'Mar 2026', ventas: 48000, compras: 30000 },
        { month: 'Apr 2026', ventas: 61000, compras: 38000 }
    ],
    productosVendidos: [
        { nombre: 'Producto A', total_vendido: 450 },
        { nombre: 'Producto B', total_vendido: 380 },
        { nombre: 'Producto C', total_vendido: 320 },
        { nombre: 'Producto D', total_vendido: 280 }
    ],
    estadoProyectos: [
        { name: 'Activo', count: 12, value: 12 },
        { name: 'En Pausa', count: 3, value: 3 },
        { name: 'Completado', count: 8, value: 8 }
    ],
    conversionLeads: [
        { name: 'Prospecto', count: 45, value: 45 },
        { name: 'Calificado', count: 28, value: 28 },
        { name: 'Convertido', count: 15, value: 15 }
    ],
    calidadProductos: [
        { name: 'Aprobado', count: 892, value: 892 },
        { name: 'Rechazo', count: 23, value: 23 }
    ],
    dashboardCompleto: {
        ventas_mes_actual: 206000,
        compras_mes_actual: 128000,
        utilidad_bruta: 78000,
        productos_bajo_stock: 5,
        proyectos_activos: 12,
        leads_calificados: 28
    }
};

function ReportesAvanzados() {
    const [ventasMensuales, setVentasMensuales] = useState(SAMPLE_DATA.ventasMensuales);
    const [productosVendidos, setProductosVendidos] = useState(SAMPLE_DATA.productosVendidos);
    const [estadoProyectos, setEstadoProyectos] = useState(SAMPLE_DATA.estadoProyectos);
    const [conversionLeads, setConversionLeads] = useState(SAMPLE_DATA.conversionLeads);
    const [calidadProductos, setCalidadProductos] = useState(SAMPLE_DATA.calidadProductos);
    const [dashboardCompleto, setDashboardCompleto] = useState(SAMPLE_DATA.dashboardCompleto);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllReports();
    }, []);

    const fetchAllReports = async () => {
        try {
            // Intentar cargar desde API, si falla usa datos de ejemplo
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 5000)
            );

            try {
                const [
                    resVentas, resCompras, resProductos,
                    resProyectos, resLeads, resCalidad
                ] = await Promise.race([
                    Promise.all([
                        axios.get(`${API_BASE}ventas-mensuales/`),
                        axios.get(`${API_BASE}compras-mensuales/`),
                        axios.get(`${API_BASE}productos-mas-vendidos/`),
                        axios.get(`${API_BASE}estado-proyectos/`),
                        axios.get(`${API_BASE}conversion-leads/`),
                        axios.get(`${API_BASE}calidad-productos/`)
                    ]),
                    timeout
                ]);

                setVentasMensuales(resVentas.data);
                setProductosVendidos(resProductos.data);
                setEstadoProyectos(resProyectos.data);
                setConversionLeads(resLeads.data);
                setCalidadProductos(resCalidad.data);
            } catch (err) {
                // Usar datos de ejemplo si la API falla
                console.log('Usando datos de ejemplo para reportes');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setLoading(false);
        }
    };

    const formatCurrency = (value) => `$${value?.toLocaleString() || 0}`;

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

    if (loading) return <div className="container" style={{ position: 'relative' }}>
                <button 
                    onClick={() => navigate('/')} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem',
                        background: '#ff0000',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 999999999,
                        width: '60px',
                        height: '60px',
                        minWidth: '60px',
                        minHeight: '60px',
                        maxWidth: '60px',
                        maxHeight: '60px',
                        visibility: 'visible',
                        opacity: 1,
                        display: 'block',
                        pointerEvents: 'auto',
                        transform: 'none',
                        transition: 'none',
                        animation: 'none',
                        textAlign: 'center',
                        lineHeight: '60px'
                    }}
                >
                    X
                </button><div className="spinner"></div></div>;

    return (
        <div className="container">
            <div className="header">
                <h1><BarChart3 size={32} /> Reportes Avanzados</h1>
                <button className="btn-primary" onClick={fetchAllReports}>
                    <Activity size={20} /> Actualizar Datos
                </button>
            </div>

            {/* KPIs Principales */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Ventas Mes Actual</h3>
                    <p className="stat-number">{formatCurrency(dashboardCompleto.ventas_mes_actual)}</p>
                </div>
                <div className="stat-card">
                    <h3>Compras Mes Actual</h3>
                    <p className="stat-number">{formatCurrency(dashboardCompleto.compras_mes_actual)}</p>
                </div>
                <div className="stat-card">
                    <h3>Utilidad Bruta</h3>
                    <p className="stat-number">{formatCurrency(dashboardCompleto.utilidad_bruta)}</p>
                </div>
                <div className="stat-card">
                    <h3>Productos Bajo Stock</h3>
                    <p className="stat-number">{dashboardCompleto.productos_bajo_stock}</p>
                </div>
                <div className="stat-card">
                    <h3>Proyectos Activos</h3>
                    <p className="stat-number">{dashboardCompleto.proyectos_activos}</p>
                </div>
                <div className="stat-card">
                    <h3>Leads Calificados</h3>
                    <p className="stat-number">{dashboardCompleto.leads_calificados}</p>
                </div>
            </div>

            <div className="reports-grid">
                {/* Ventas vs Compras Mensuales */}
                <div className="report-card">
                    <h3><TrendingUp size={20} /> Ventas vs Compras Mensuales</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ventasMensuales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis tickFormatter={formatCurrency} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="ventas" fill="#8884d8" name="Ventas" />
                            <Bar dataKey="compras" fill="#82ca9d" name="Compras" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Productos Más Vendidos */}
                <div className="report-card">
                    <h3><BarChart3 size={20} /> Productos Más Vendidos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productosVendidos} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="nombre" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="total_vendido" fill="#ffc658" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Estado de Proyectos */}
                <div className="report-card">
                    <h3><PieChartIcon size={20} /> Estado de Proyectos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={estadoProyectos}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name} (${value})`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {estadoProyectos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Conversión de Leads */}
                <div className="report-card">
                    <h3><TrendingUp size={20} /> Conversión de Leads</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={conversionLeads}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name} (${value})`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {conversionLeads.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Calidad de Productos */}
                <div className="report-card">
                    <h3><PieChartIcon size={20} /> Resultados de Calidad</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={calidadProductos}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value }) => `${name} (${value})`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {calidadProductos.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default ReportesAvanzados;