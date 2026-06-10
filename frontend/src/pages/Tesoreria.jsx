import { useState, useEffect } from 'react';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';
import { 
    Landmark, ArrowUpCircle, ArrowDownCircle, Plus, Search, 
    X, Wallet, FileText, RefreshCw, AlertCircle, TrendingUp,
    TrendingDown, Calendar, CreditCard, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = BASE_URL;

function Tesoreria() {
    const navigate = useNavigate();
    const [cuentas, setCuentas] = useState([]);
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [form, setForm] = useState({ 
        cuenta: '', 
        monto: '', 
        tipo: 'debito', 
        descripcion: '' 
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cuentasRes, transRes] = await Promise.allSettled([
                axiosInstance.get(`${API_BASE}/finanzas/cuentas/`),
                axiosInstance.get(`${API_BASE}/finanzas/transacciones/`)
            ]);

            if (cuentasRes.status === 'fulfilled') setCuentas(cuentasRes.value.data);
            if (transRes.status === 'fulfilled') setTransacciones(transRes.value.data);

            if (cuentasRes.status === 'rejected' && transRes.status === 'rejected') {
                setError('No se pudo conectar con el servidor de Finanzas.');
            }
        } catch (err) {
            setError('Error inesperado al cargar los datos de Tesorería.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form, monto: Number(form.monto) };
            await axiosInstance.post(`${API_BASE}/finanzas/transacciones/`, payload);
            setIsModalOpen(false);
            setForm({ cuenta: '', monto: '', tipo: 'debito', descripcion: '' });
            fetchData();
        } catch (err) {
            alert('No se pudo registrar la transacción. Verifica los datos.');
        }
    };

    const totalDebitos = transacciones
        .filter((t) => t.tipo === 'debito')
        .reduce((sum, t) => sum + Number(t.monto), 0);
    
    const totalCreditos = transacciones
        .filter((t) => t.tipo === 'credito')
        .reduce((sum, t) => sum + Number(t.monto), 0);

    const balance = totalDebitos - totalCreditos;

    const filteredTransactions = transacciones.filter(t => 
        t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cuenta_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cuenta_codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && transacciones.length === 0) {
        return (
            <div style={{ 
                display: 'flex', justifyContent: 'center', alignItems: 'center', 
                height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '60px', height: '60px', borderTopColor: 'white' }}></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500', marginTop: '1rem' }}>Cargando Tesorería...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem', fontWeight: '700', color: '#1a202c', margin: '0 0 0.5rem 0'
                        }}>
                            Tesorería Avanzada
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#718096', margin: 0 }}>
                            Gestión de Flujo de Caja y Transacciones Bancarias
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px',
                            fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                        }}
                    >
                        <X size={18} />
                        Cerrar Módulo
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ 
                    background: '#fed7d7', border: '1px solid #feb2b2', borderRadius: '12px',
                    padding: '1rem', marginBottom: '2rem', color: '#c53030', display: 'flex',
                    alignItems: 'center', gap: '1rem'
                }}>
                    <AlertCircle size={20} />
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Stats Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '1.5rem', 
                marginBottom: '2rem' 
            }}>
                <StatCard 
                    title="Balance General" 
                    value={balance} 
                    icon={Wallet} 
                    color="#6366f1" 
                    prefix="$"
                />
                <StatCard 
                    title="Ingresos (Debito)" 
                    value={totalDebitos} 
                    icon={TrendingUp} 
                    color="#10b981" 
                    prefix="$"
                />
                <StatCard 
                    title="Egresos (Credito)" 
                    value={totalCreditos} 
                    icon={TrendingDown} 
                    color="#f59e0b" 
                    prefix="$"
                />
                <StatCard 
                    title="Cuentas Activas" 
                    value={cuentas.length} 
                    icon={Landmark} 
                    color="#3b82f6" 
                />
            </div>

            {/* Main Content Area */}
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
                        <Search style={{ 
                            position: 'absolute', left: '12px', top: '50%', 
                            transform: 'translateY(-50%)', color: '#94a3b8' 
                        }} size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por cuenta, descripción o monto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
                                borderRadius: '12px', border: '1px solid #e2e8f0',
                                fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button 
                            onClick={fetchData}
                            style={{
                                background: 'white', color: '#64748b', border: '1px solid #e2e8f0',
                                padding: '0.75rem', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}
                            title="Refrescar datos"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                                borderRadius: '12px', fontSize: '1rem', fontWeight: '600',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            <Plus size={20} />
                            Nueva Transacción
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Cuenta</th>
                                <th style={thStyle}>Descripción</th>
                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, idx) => (
                                <tr key={t.id} style={{ 
                                    borderBottom: '1px solid #f1f5f9',
                                    transition: 'background 0.2s',
                                    backgroundColor: idx % 2 === 0 ? 'white' : '#fcfcfc'
                                }}>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                                            <Calendar size={14} />
                                            {new Date(t.fecha).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{t.cuenta_nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.cuenta_codigo}</div>
                                    </td>
                                    <td style={tdStyle}>{t.descripcion || '-'}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                                            background: t.tipo === 'debito' ? '#dcfce7' : '#fee2e2',
                                            color: t.tipo === 'debito' ? '#166534' : '#991b1b',
                                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                                        }}>
                                            {t.tipo === 'debito' ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                                            {t.tipo.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, fontWeight: '700', color: t.tipo === 'debito' ? '#10b981' : '#ef4444' }}>
                                        {t.tipo === 'debito' ? '+' : '-'}{Number(t.monto).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTransactions.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>No se encontraron transacciones con los criterios de búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)}>
                    <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                                Nueva Transacción
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={closeBtnStyle}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Cuenta de Origen/Destino</label>
                                <div style={{ position: 'relative' }}>
                                    <Landmark style={inputIconStyle} size={18} />
                                    <select 
                                        name="cuenta" value={form.cuenta} onChange={handleInputChange} required
                                        style={inputStyle}
                                    >
                                        <option value="">Seleccione una cuenta</option>
                                        {cuentas.map(c => (
                                            <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Monto</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign style={inputIconStyle} size={18} />
                                        <input 
                                            name="monto" type="number" step="0.01" value={form.monto} 
                                            onChange={handleInputChange} required style={inputStyle}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={labelStyle}>Tipo de Operación</label>
                                    <div style={{ position: 'relative' }}>
                                        <CreditCard style={inputIconStyle} size={18} />
                                        <select 
                                            name="tipo" value={form.tipo} onChange={handleInputChange}
                                            style={inputStyle}
                                        >
                                            <option value="debito">Débito (Ingreso)</option>
                                            <option value="credito">Crédito (Egreso)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Descripción / Concepto</label>
                                <textarea 
                                    name="descripcion" value={form.descripcion} onChange={handleInputChange}
                                    style={{ ...inputStyle, height: '80px', paddingTop: '0.75rem', paddingLeft: '1rem' }}
                                    placeholder="Ej: Pago de facturas, Transferencia interna..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    style={{ 
                                        flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid #e2e8f0',
                                        background: 'white', color: '#64748b', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        flex: 1, padding: '0.75rem', borderRadius: '12px', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                        color: 'white', fontWeight: '600', cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    Registrar Transacción
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Subcomponente para cards de estadísticas
function StatCard({ title, value, icon: Icon, color, prefix = '' }) {
    return (
        <div style={{
            background: 'white', borderRadius: '16px', padding: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9'
        }}>
            <div style={{
                background: `${color}15`, color: color, padding: '0.75rem',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={24} />
            </div>
            <div>
                <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontWeight: '500' }}>{title}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                    {prefix}{typeof value === 'number' && prefix ? value.toLocaleString() : value}
                </div>
            </div>
        </div>
    );
}

// Estilos locales de soporte
const thStyle = { padding: '1rem', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '1rem', fontSize: '0.9rem', color: '#334155' };
const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '500px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const closeBtnStyle = { background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: '#64748b' };
const formGroupStyle = { marginBottom: '1.25rem' };
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#f8fafc' };
const inputIconStyle = { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' };

export default Tesoreria;
