import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, AlertCircle, TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

const API_CUENTAS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/cuentas/';
const API_TRANSACCIONES = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/finanzas/transacciones/';

function Finanzas() {
    const [cuentas, setCuentas] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const respCuentas = await axios.get(API_CUENTAS);
            const respTrans = await axios.get(API_TRANSACCIONES);
            setCuentas(respCuentas.data);
            setTransacciones(respTrans.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar datos financieros.');
            setLoading(false);
        }
    };

    const totalActivos = cuentas.filter(c => c.tipo === 'activo').reduce((acc, curr) => acc + parseFloat(curr.balance), 0);
    const totalPasivos = cuentas.filter(c => c.tipo === 'pasivo').reduce((acc, curr) => acc + parseFloat(curr.balance), 0);

    return (
        <div className="container" style={{ position: 'relative' }}>
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
                </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="header-title">Módulo Financiero</h1>
                    <p className="header-subtitle" style={{ marginBottom: 0 }}>Control de Cuentas y Transacciones Registradas</p>
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Activos</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${totalActivos.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--danger)' }}>
                                <TrendingDown size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Pasivos</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${totalPasivos.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
                                <Wallet size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cuentas Registradas</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{cuentas.length}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Cuentas Table */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Catálogo de Cuentas</h2>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Cuenta</th>
                                            <th>Tipo</th>
                                            <th style={{ textAlign: 'right' }}>Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cuentas.map(cuenta => (
                                            <tr key={cuenta.id}>
                                                <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{cuenta.codigo}</td>
                                                <td style={{ fontWeight: 500 }}>{cuenta.nombre}</td>
                                                <td>
                                                    <span className={`badge ${cuenta.tipo === 'activo' || cuenta.tipo === 'ingreso' ? 'badge-success' : cuenta.tipo === 'pasivo' || cuenta.tipo === 'gasto' ? 'badge-danger' : 'badge-warning'}`}>
                                                        {cuenta.tipo.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(cuenta.balance).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Transacciones Recientes */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Transacciones Recientes</h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {transacciones.slice(0, 5).map(trans => (
                                    <div key={trans.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: trans.tipo === 'credito' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: trans.tipo === 'credito' ? 'var(--success)' : 'var(--danger)', padding: '0.5rem', borderRadius: '50%' }}>
                                                <ArrowRightLeft size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{trans.descripcion || 'Sin descripción'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(trans.fecha).toLocaleDateString()} • {trans.cuenta_codigo} - {trans.cuenta_nombre}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: trans.tipo === 'credito' ? 'var(--success)' : 'var(--danger)' }}>
                                            {trans.tipo === 'credito' ? '+' : '-'}${parseFloat(trans.monto).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                {transacciones.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay transacciones registradas.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Finanzas;
