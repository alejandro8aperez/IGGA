import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { Download, BarChart2, PieChart, TrendingUp, Users, Package, DollarSign, Calendar, ShoppingCart, Factory, CreditCard, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/';

function Reportes() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPowerBI = async () => {
            try {
                const res = await axiosInstance.get(`${API_BASE}reportes/powerbi/`);
                setData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching PowerBI data:', err);
                setError(err);
                setLoading(false);
            }
        };
        fetchPowerBI();
    }, []);

    const exportToExcel = () => {
        if (!data) return;
        const wb = XLSX.utils.book_new();
        
        // KPIs
        const kpisData = Object.entries(data.kpis).map(([key, value]) => ({
            'KPI': key.replace(/_/g, ' ').toUpperCase(),
            'Valor': value
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kpisData), "KPIs");
        
        // Series mensuales
        if (data.ventas_mensuales?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.ventas_mensuales), "Ventas Mensuales");
        if (data.compras_mensuales?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.compras_mensuales), "Compras Mensuales");
        if (data.produccion_mensual?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.produccion_mensual), "Producción Mensual");
        if (data.contabilidad_mensual?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.contabilidad_mensual), "Contabilidad Mensual");
        if (data.pagos_mensuales?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.pagos_mensuales), "Pagos Mensuales");
        if (data.caja_mensual?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.caja_mensual), "Caja Mensual");
        
        // Listas
        if (data.top_proveedores?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.top_proveedores), "Top Proveedores");
        if (data.categorias_inventario?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.categorias_inventario), "Categorías Inventario");
        if (data.metodos_pago?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.metodos_pago), "Métodos de Pago");
        if (data.estados_ordenes?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.estados_ordenes), "Estados Órdenes");
        if (data.estados_produccion?.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data.estados_produccion), "Estados Producción");
        
        XLSX.writeFile(wb, `Reporte_PowerBI_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (loading) {
        return <div className="container" style={{ position: 'relative' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 99999,
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(255, 0, 0, 0.8)'
                    }}
                >
                    X
                </button><div className="spinner"></div></div>;
    }

    if (!data) {
        return <div className="container" style={{ position: 'relative' }}>
            <button 
                onClick={() => window.location.href = '/'} 
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
            </button><h2>Error al cargar el reporte.</h2></div>;
    }

    // Colores para gráficos
    const COLORS = ['#667eea', '#f56565', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac', '#ecc94b', '#4299e1'];

    return (
        <div className="container">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="header-title">Dashboard Power BI</h1>
                    <p className="header-subtitle">Análisis integral de todas las áreas del ERP</p>
                </div>
                <button className="btn btn-primary" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Exportar a Excel
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #667eea' }}>
                    <div style={{ background: 'rgba(102, 126, 234, 0.1)', padding: '1rem', borderRadius: '50%', color: '#667eea' }}>
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Ventas Hoy</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(data.kpis.total_ventas_hoy || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #48bb78' }}>
                    <div style={{ background: 'rgba(72, 187, 120, 0.1)', padding: '1rem', borderRadius: '50%', color: '#48bb78' }}>
                        <ShoppingCart size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Compras Hoy</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(data.kpis.total_compras_hoy || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #ed8936' }}>
                    <div style={{ background: 'rgba(237, 137, 54, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ed8936' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Valor Inventario</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(data.kpis.valor_inventario || 0).toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #9f7aea' }}>
                    <div style={{ background: 'rgba(159, 122, 234, 0.1)', padding: '1rem', borderRadius: '50%', color: '#9f7aea' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Total Clientes</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{data.kpis.total_clientes || 0}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #f56565' }}>
                    <div style={{ background: 'rgba(245, 101, 101, 0.1)', padding: '1rem', borderRadius: '50%', color: '#f56565' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Bajo Stock</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{data.kpis.productos_bajo_stock || 0}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid #38b2ac' }}>
                    <div style={{ background: 'rgba(56, 178, 172, 0.1)', padding: '1rem', borderRadius: '50%', color: '#38b2ac' }}>
                        <Factory size={32} />
                    </div>
                    <div>
                        <div style={{ color: '#718096', fontSize: '0.875rem' }}>Producción Activa</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{data.kpis.produccion_activa || 0}</div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                {/* Ventas vs Compras Mensuales */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <TrendingUp size={24} color="#667eea" /> Ventas vs Compras Mensuales
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data.ventas_mensuales || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Legend />
                            <Area type="monotone" dataKey="ventas" stackId="1" stroke="#667eea" fill="#667eea" name="Ventas" />
                            <Area type="monotone" dataKey="compras" stackId="2" stroke="#48bb78" fill="#48bb78" name="Compras" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Producción Mensual */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Factory size={24} color="#ed8936" /> Producción Mensual
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.produccion_mensual || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cantidad" fill="#ed8936" name="Unidades Producidas" />
                            <Bar dataKey="ordenes" fill="#9f7aea" name="Órdenes" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Métodos de Pago */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <CreditCard size={24} color="#38b2ac" /> Métodos de Pago
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={data.metodos_pago || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ metodo, percent }) => `${metodo}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="total"
                            >
                                {(data.metodos_pago || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>

                {/* Estados de Órdenes */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <BarChart2 size={24} color="#f56565" /> Estados de Órdenes de Compra
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.estados_ordenes || []} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="estado" type="category" />
                            <Tooltip />
                            <Bar dataKey="cantidad" fill="#f56565" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Tables */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Top Proveedores */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Users size={24} color="#4299e1" /> Top Proveedores
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Proveedor</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Total</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Órdenes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.top_proveedores || []).map((prov, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.75rem' }}>{prov.nombre}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>${Number(prov.total).toLocaleString()}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{prov.ordenes}</td>
                                    </tr>
                                ))}
                                {(!data.top_proveedores || data.top_proveedores.length === 0) && (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                                            No hay datos de proveedores
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Categorías de Inventario */}
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Package size={24} color="#ecc94b" /> Categorías de Inventario
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Categoría</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Stock</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(data.categorias_inventario || []).map((cat, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.75rem' }}>{cat.categoria}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>{cat.stock}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>${Number(cat.valor).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!data.categorias_inventario || data.categorias_inventario.length === 0) && (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#718096' }}>
                                            No hay datos de categorías
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Reportes;
