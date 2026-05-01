import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ReportePyL = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/reportes/pyl/');
            setData(response.data);
        } catch (error) {
            console.error("Error al cargar P&L:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}><RefreshCw className="animate-spin" /> Analizando Libros Contables...</div>;

    return (
        <div style={{ padding: '2rem', background: '#0f172a', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>Estado de Resultados</h1>
                        <p style={{ color: '#94a3b8' }}>Análisis financiero consolidado periodo {data?.periodo}</p>
                    </div>
                    <button onClick={fetchData} style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                        Actualizar Datos
                    </button>
                </header>

                {/* KPIs Superiores */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <StatCard title="Ingresos Totales" value={data.resumen.ingresos_totales} icon={<TrendingUp color="#10b981" />} color="#064e3b" />
                    <StatCard title="Gastos Totales" value={data.resumen.egresos_totales} icon={<TrendingDown color="#ef4444" />} color="#450a0a" />
                    <StatCard title="Utilidad Neta" value={data.resumen.utilidad_neta} icon={<DollarSign color="#3b82f6" />} color="#172554" />
                    <StatCard title="Margen Bruto" value={`${data.resumen.margen_operativo}%`} icon={<PieChart color="#a855f7" />} color="#2e1065" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                    {/* Gráfico de Tendencia */}
                    <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Tendencia Mensual</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.grafico_tendencia}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="mes" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
                                    <Legend />
                                    <Area type="monotone" dataKey="ingresos" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                                    <Area type="monotone" dataKey="egresos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Desglose por Módulo */}
                    <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '20px', border: '1px solid #334155' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Origen del Gasto/Ingreso</h3>
                        {data.desglose_modulos.map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #334155' }}>
                                <span style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>{m.modulo_origen}</span>
                                <span style={{ color: m.tipo === 'ingreso' ? '#10b981' : '#fca5a5', fontWeight: '600' }}>
                                    {m.tipo === 'ingreso' ? '+' : '-'}$ {m.total.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div style={{ background: color, padding: '1.5rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>{title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{typeof value === 'number' ? `$ ${value.toLocaleString()}` : value}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px' }}>
            {icon}
        </div>
    </div>
);

export default ReportePyL;