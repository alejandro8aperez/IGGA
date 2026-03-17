import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, BarChart2, PieChart, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

const API_BASE = 'http://localhost:8000/api/';

function Reportes() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const res = await axios.get(`${API_BASE}reportes/general/`);
                setReportData(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching report data:', error);
                setLoading(false);
            }
        };

        fetchReportData();
    }, []);

    const exportToExcel = () => {
        if (!reportData) return;

        // Crear una hoja de cálculo con los datos principales
        const summaryData = [
            { Metrica: 'Total Clientes', Valor: reportData.total_clientes },
            { Metrica: 'Valor de Inventario', Valor: reportData.valor_inventario },
            { Metrica: 'Total Transacciones de Caja', Valor: reportData.total_transacciones },
            { Metrica: 'Valor Pipeline Oportunidades', Valor: reportData.valor_oportunidades },
            { Metrica: 'Proyectos Activos', Valor: reportData.proyectos_activos }
        ];

        const wb = XLSX.utils.book_new();

        const summaryWs = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen General");

        // Hoja para top productos
        if (reportData.top_productos && reportData.top_productos.length > 0) {
            const productsWs = XLSX.utils.json_to_sheet(reportData.top_productos);
            XLSX.utils.book_append_sheet(wb, productsWs, "Top Productos en Stock");
        }

        XLSX.writeFile(wb, "Reporte_General_8AMPERIOS.xlsx");
    };

    if (loading) {
        return <div className="container"><div className="spinner"></div></div>;
    }

    if (!reportData) {
        return <div className="container"><h2>Error al cargar el reporte.</h2></div>;
    }

    return (
        <div className="container">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="header-title">Reportes Consolidados</h1>
                    <p className="header-subtitle">Análisis global de las principales métricas del sistema</p>
                </div>
                <button className="btn btn-primary" onClick={exportToExcel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={18} /> Exportar a Excel
                </button>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--primary)' }}>
                    <div style={{ background: 'rgba(79, 70, 229, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
                        <Users size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total de Clientes</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{reportData.total_clientes}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--success)' }}>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
                        <Package size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Valor Inventario</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(reportData.valor_inventario).toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--warning)' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--warning)' }}>
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Pipeline (CRM)</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(reportData.valor_oportunidades).toLocaleString()}</div>
                    </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '4px solid var(--danger)' }}>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--danger)' }}>
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Transacciones Contables</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${Number(reportData.total_transacciones).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="glass-card">
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart2 size={24} color="var(--primary)" /> Top 10 Productos por Volumen de Stock
                    </h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Stock Actual</th>
                                    <th>Valor Estimado (Total)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.top_productos && reportData.top_productos.map((prod, index) => (
                                    <tr key={index}>
                                        <td>{prod.nombre}</td>
                                        <td>{prod.stock}</td>
                                        <td style={{ fontWeight: '500' }}>${Number(prod.valor).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {(!reportData.top_productos || reportData.top_productos.length === 0) && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>No hay datos de productos.</td>
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
