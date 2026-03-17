import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { LayoutDashboard, Target, Package, DollarSign, Activity, Users, Briefcase } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000/api/';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function Dashboard() {
    const [data, setData] = useState({
        clientes: 0,
        productos: [],
        oportunidades: [],
        cuentas: [],
        transaccionesCaja: 0,
        empleados: 0,
        proyectos: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [resClientes, resProd, resOpt, resCuentas, resTrans, resEmp, resProy] = await Promise.all([
                axios.get(`${API_BASE}crm/clientes/`),
                axios.get(`${API_BASE}inventarios/productos/`),
                axios.get(`${API_BASE}crm/oportunidades/`),
                axios.get(`${API_BASE}finanzas/cuentas/`),
                axios.get(`${API_BASE}finanzas/transacciones/`),
                axios.get(`${API_BASE}rrhh/empleados/`),
                axios.get(`${API_BASE}operaciones/proyectos/`)
            ]);

            setData({
                clientes: resClientes.data.length,
                productos: resProd.data,
                oportunidades: resOpt.data,
                cuentas: resCuentas.data,
                transaccionesCaja: resTrans.data.reduce((acc, curr) => acc + parseFloat(curr.monto), 0),
                empleados: resEmp.data.length,
                proyectos: resProy.data.length
            });
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    // Prepare Chart Data
    const valorInventario = data.productos.reduce((acc, prod) => acc + (parseFloat(prod.precio_venta) * prod.stock_actual), 0);
    const valorOportunidades = data.oportunidades.reduce((acc, opt) => acc + parseFloat(opt.valor_estimado), 0);

    const inventarioChartData = data.productos.slice(0, 5).map(p => ({
        name: p.nombre.substring(0, 15) + '...',
        stock: p.stock_actual,
        valor: parseFloat(p.precio_venta) * p.stock_actual
    }));

    const cuentasChartData = data.cuentas.map(c => ({
        name: c.nombre,
        value: parseFloat(c.balance)
    })).filter(c => c.value > 0);

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="header-title">Panel de Control: Visión 360°</h1>
                <p className="header-subtitle">Resumen Ejecutivo del Sistema ERP 8AMPERIOS</p>
            </div>

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <>
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
                            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
                                <DollarSign size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pipeline Comercial</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${valorOportunidades.toLocaleString()}</div>
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
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--danger)' }}>
                                <Activity size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Volumen Transaccional</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${data.transaccionesCaja.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '1rem', borderRadius: '12px', color: '#ec4899' }}>
                                <Users size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Empleados</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.empleados}</div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '1rem', borderRadius: '12px', color: '#38bdf8' }}>
                                <Briefcase size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Proyectos Activos</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.proyectos}</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem' }}>
                        {/* Bar Chart - Inventario */}
                        <div className="glass-card" style={{ minHeight: '400px' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top 5 Productos por Valor de Stock Activo</h2>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={inventarioChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickMargin={10} />
                                        <YAxis stroke="#94A3B8" fontSize={12} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
                                        <Legend />
                                        <Bar dataKey="valor" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Valor ($)" />
                                        <Bar dataKey="stock" fill="#10B981" radius={[4, 4, 0, 0]} name="Unidades (Stock)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Pie Chart - Finanzas */}
                        <div className="glass-card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Distribución de Capital (Balance)</h2>
                            <div style={{ width: '100%', height: 300, flex: 1 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={cuentasChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {cuentasChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
