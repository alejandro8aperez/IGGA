import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { 
    DollarSign, AlertCircle, Edit3, Trash2, Plus, X, FileText, 
    Calculator, BookOpen, Search, Filter,
    ArrowUpCircle, ArrowDownCircle, Scale
} from 'lucide-react';

const API_CUENTAS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/contabilidad/cuentas/';
const API_ASIENTOS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/contabilidad/asientos/';

const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { fontSize: '2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' },
    btnPrimary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)', transition: 'all 0.2s' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' },
    statIcon: (color) => ({ width: '50px', height: '50px', borderRadius: '10px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }),
    statValue: { fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 },
    statLabel: { fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' },
    tab: (active) => ({ padding: '0.75rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: active ? '#667eea' : '#64748b', borderBottom: active ? '2px solid #667eea' : '2px solid transparent', marginBottom: '-2px', transition: 'all 0.2s' }),
    searchFilter: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    searchInput: { flex: 1, minWidth: '300px', padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' },
    filterSelect: { padding: '0.75rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' },
    card: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' },
    cardHeader: { padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' },
    badge: (tipo) => ({ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: tipo === 'activo' ? '#dbeafe' : tipo === 'pasivo' ? '#fecaca' : tipo === 'patrimonio' ? '#d1fae5' : tipo === 'ingreso' ? '#dcfce7' : '#fef3c7', color: tipo === 'activo' ? '#1e40af' : tipo === 'pasivo' ? '#991b1b' : tipo === 'patrimonio' ? '#065f46' : tipo === 'ingreso' ? '#166534' : '#92400e' }),
    btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', color: '#64748b', transition: 'all 0.2s' },
    btnIconDanger: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', color: '#64748b', transition: 'all 0.2s' },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    modalHeader: { padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '16px 16px 0 0' },
    modalTitle: { fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    modalCloseBtn: { background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: '#fff', transition: 'all 0.2s' },
    modalBody: { padding: '1.5rem' },
    formGroup: { marginBottom: '1.25rem' },
    formLabel: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' },
    formInput: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' },
    formSelect: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', background: '#fff' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.5rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' },
    btnSecondary: { padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#64748b', transition: 'all 0.2s' },
    loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem', color: '#64748b' },
    errorContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '1rem', color: '#dc2626' }
};

function Contabilidad() {
    const [activeTab, setActiveTab] = useState('cuentas');
    const [cuentas, setCuentas] = useState([]);
    const [asientos, setAsientos] = useState([]);
    const [estadoResultados, setEstadoResultados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTipo, setFilterTipo] = useState('todos');
    const [isCuentaModalOpen, setIsCuentaModalOpen] = useState(false);
    const [currentCuenta, setCurrentCuenta] = useState(null);
    const [cuentaForm, setCuentaForm] = useState({ codigo: '', nombre: '', tipo: 'activo', nivel: 1, padre: null });
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');

    useEffect(() => { fetchData(); }, []);
    useEffect(() => { if (activeTab === 'estado') fetchEstadoResultados(); }, [activeTab]);

    const fetchData = async () => {
        try {
            const [resCuentas, resAsientos] = await Promise.all([axiosInstance.get(API_CUENTAS), axiosInstance.get(API_ASIENTOS)]);
            setCuentas(resCuentas.data);
            setAsientos(resAsientos.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar datos de Contabilidad.');
            setLoading(false);
        }
    };

    const fetchEstadoResultados = async () => {
        try {
            const params = {};
            if (fechaInicio) params.fecha_inicio = fechaInicio;
            if (fechaFin) params.fecha_fin = fechaFin;
            const res = await axiosInstance.get(`${API_ASIENTOS}estado-resultados/`, { params });
            setEstadoResultados(res.data.estado_resultados);
        } catch (err) {
            console.error('Error al cargar estado de resultados:', err);
        }
    };

    const openCuentaModal = (cuenta = null) => {
        if (cuenta) { setCurrentCuenta(cuenta); setCuentaForm(cuenta); }
        else { setCurrentCuenta(null); setCuentaForm({ codigo: '', nombre: '', tipo: 'activo', nivel: 1, padre: null }); }
        setIsCuentaModalOpen(true);
    };

    const handleCuentaSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCuenta) { await axiosInstance.put(`${API_CUENTAS}${currentCuenta.id}/`, cuentaForm); }
            else { await axiosInstance.post(API_CUENTAS, cuentaForm); }
            fetchData();
            setIsCuentaModalOpen(false);
        } catch (err) { console.error('Error al guardar cuenta:', err); }
    };

    const deleteCuenta = async (id) => {
        if (window.confirm('¿Eliminar esta cuenta?')) {
            try { await axiosInstance.delete(`${API_CUENTAS}${id}/`); fetchData(); }
            catch (err) { console.error('Error al eliminar cuenta:', err); }
        }
    };

    const cuentasFiltradas = cuentas.filter(cuenta => {
        const matchSearch = cuenta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || cuenta.codigo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTipo = filterTipo === 'todos' || cuenta.tipo === filterTipo;
        return matchSearch && matchTipo;
    });

    if (loading) return (<div style={styles.loadingContainer}><Calculator size={48} style={{ opacity: 0.5 }} /><div>Cargando Contabilidad...</div></div>);
    if (error) return (<div style={styles.errorContainer}><AlertCircle size={48} /><div>{error}</div></div>);

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}><DollarSign size={32} color='#667eea' />Contabilidad</h1>
                <button style={styles.btnPrimary} onClick={() => openCuentaModal()} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'; }}><Plus size={20} /> Nueva Cuenta</button>
            </div>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}><div style={styles.statIcon('#667eea')}><BookOpen size={24} /></div><div><div style={styles.statValue}>{cuentas.length}</div><div style={styles.statLabel}>Total Cuentas</div></div></div>
                <div style={styles.statCard}><div style={styles.statIcon('#10b981')}><FileText size={24} /></div><div><div style={styles.statValue}>{asientos.length}</div><div style={styles.statLabel}>Asientos Contables</div></div></div>
                <div style={styles.statCard}><div style={styles.statIcon('#f59e0b')}><Scale size={24} /></div><div><div style={styles.statValue}></div><div style={styles.statLabel}>Balance General</div></div></div>
            </div>
            <div style={styles.tabs}>
                <button style={styles.tab(activeTab === 'cuentas')} onClick={() => setActiveTab('cuentas')}><BookOpen size={16} style={{ marginRight: '0.5rem' }} />Plan de Cuentas</button>
                <button style={styles.tab(activeTab === 'asientos')} onClick={() => setActiveTab('asientos')}><FileText size={16} style={{ marginRight: '0.5rem' }} />Asientos Contables</button>
                <button style={styles.tab(activeTab === 'estado')} onClick={() => setActiveTab('estado')}><ArrowUpCircle size={16} style={{ marginRight: '0.5rem' }} />Pérdidas y Ganancias</button>
            </div>
            {activeTab === 'cuentas' && (
                <div style={styles.searchFilter}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}><Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><input type='text' placeholder='Buscar cuenta por nombre o código...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{...styles.searchInput, paddingLeft: '2.5rem'}} /></div>
                    <div style={{ position: 'relative' }}><Filter size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} /><select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} style={{...styles.filterSelect, paddingLeft: '2.5rem', minWidth: '200px'}}><option value='todos'>Todos los tipos</option><option value='activo'>Activos</option><option value='pasivo'>Pasivos</option><option value='patrimonio'>Patrimonio</option><option value='ingreso'>Ingresos</option><option value='gasto'>Gastos</option></select></div>
                </div>
            )}
            {activeTab === 'cuentas' ? (
                <div style={styles.card}>
                    <div style={styles.cardHeader}><div style={styles.cardTitle}><BookOpen size={20} color='#667eea' />Plan de Cuentas</div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>{cuentasFiltradas.length} cuentas</span></div>
                    <table style={styles.table}>
                        <thead><tr><th style={styles.th}>Código</th><th style={styles.th}>Nombre</th><th style={styles.th}>Tipo</th><th style={styles.th}>Nivel</th><th style={styles.th}>Acciones</th></tr></thead>
                        <tbody>
                            {cuentasFiltradas.map(cuenta => (
                                <tr key={cuenta.id} style={{ transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={styles.td}><strong style={{ color: '#667eea', fontFamily: 'monospace' }}>{cuenta.codigo}</strong></td>
                                    <td style={styles.td}>{cuenta.nombre}</td>
                                    <td style={styles.td}><span style={styles.badge(cuenta.tipo)}>{cuenta.tipo}</span></td>
                                    <td style={styles.td}>{cuenta.nivel}</td>
                                    <td style={styles.td}>
                                        <button style={styles.btnIcon} onClick={() => openCuentaModal(cuenta)} onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#667eea'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}><Edit3 size={18} /></button>
                                        <button style={styles.btnIconDanger} onClick={() => deleteCuenta(cuenta.id)} onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={styles.card}>
                    <div style={styles.cardHeader}><div style={styles.cardTitle}><FileText size={20} color='#10b981' />Asientos Contables</div><span style={{ color: '#64748b', fontSize: '0.875rem' }}>{asientos.length} asientos</span></div>
                    <table style={styles.table}>
                        <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Fecha</th><th style={styles.th}>Descripción</th><th style={styles.th}>Total Debe</th><th style={styles.th}>Total Haber</th></tr></thead>
                        <tbody>
                            {asientos.map(asiento => (
                                <tr key={asiento.id} style={{ transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={styles.td}><strong style={{ color: '#667eea' }}>#{asiento.id}</strong></td>
                                    <td style={styles.td}>{asiento.fecha}</td>
                                    <td style={styles.td}>{asiento.descripcion}</td>
                                    <td style={styles.td}><span style={{ color: '#10b981', fontWeight: 600 }}><ArrowUpCircle size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /></span></td>
                                    <td style={styles.td}><span style={{ color: '#ef4444', fontWeight: 600 }}><ArrowDownCircle size={14} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} /></span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {activeTab === 'estado' && (
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}><ArrowUpCircle size={20} color='#f59e0b' />Estado de Resultados (Pérdidas y Ganancias)</div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input type='date' value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{...styles.formInput, width: 'auto'}} placeholder='Fecha Inicio' />
                            <input type='date' value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{...styles.formInput, width: 'auto'}} placeholder='Fecha Fin' />
                            <button style={styles.btnPrimary} onClick={fetchEstadoResultados}><Search size={16} /> Consultar</button>
                        </div>
                    </div>
                    {estadoResultados ? (
                        <div style={{ padding: '1.5rem' }}>
                            {/* Ingresos */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: '#166534', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #dcfce7' }}>INGRESOS</h3>
                                <table style={{...styles.table, marginBottom: '1rem'}}>
                                    <tbody>
                                        {estadoResultados.ingresos.map(ing => (
                                            <tr key={ing.id}>
                                                <td style={{...styles.td, width: '70%'}}>{ing.codigo} - {ing.nombre}</td>
                                                <td style={{...styles.td, textAlign: 'right', fontWeight: 600, color: '#166534'}}>${ing.saldo.toLocaleString('es-CO')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ textAlign: 'right', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600, color: '#166534' }}>Total Ingresos: ${estadoResultados.total_ingresos.toLocaleString('es-CO')}</span>
                                </div>
                            </div>

                            {/* Gastos */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: '#991b1b', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #fecaca' }}>GASTOS</h3>
                                <table style={{...styles.table, marginBottom: '1rem'}}>
                                    <tbody>
                                        {estadoResultados.gastos.map(gas => (
                                            <tr key={gas.id}>
                                                <td style={{...styles.td, width: '70%'}}>{gas.codigo} - {gas.nombre}</td>
                                                <td style={{...styles.td, textAlign: 'right', fontWeight: 600, color: '#991b1b'}}>${gas.saldo.toLocaleString('es-CO')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ textAlign: 'right', padding: '1rem', background: '#fef2f2', borderRadius: '8px' }}>
                                    <span style={{ fontWeight: 600, color: '#991b1b' }}>Total Gastos: ${estadoResultados.total_gastos.toLocaleString('es-CO')}</span>
                                </div>
                            </div>

                            {/* Utilidad Neta */}
                            <div style={{ padding: '1.5rem', borderRadius: '12px', background: estadoResultados.utilidad_neta >= 0 ? '#f0fdf4' : '#fef2f2', border: `2px solid ${estadoResultados.utilidad_neta >= 0 ? '#22c55e' : '#ef4444'}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: estadoResultados.utilidad_neta >= 0 ? '#166534' : '#991b1b' }}>
                                        {estadoResultados.utilidad_neta >= 0 ? 'UTILIDAD NETA' : 'PÉRDIDA NETA'}
                                    </span>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: estadoResultados.utilidad_neta >= 0 ? '#166534' : '#991b1b' }}>
                                        ${Math.abs(estadoResultados.utilidad_neta).toLocaleString('es-CO')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            Seleccione fechas y haga clic en Consultar para ver el reporte
                        </div>
                    )}
                </div>
            )}
            {isCuentaModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <div style={styles.modalTitle}><Calculator size={20} />{currentCuenta ? 'Editar Cuenta' : 'Nueva Cuenta'}</div>
                            <button style={styles.modalCloseBtn} onClick={() => setIsCuentaModalOpen(false)} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCuentaSubmit}>
                            <div style={styles.modalBody}>
                                <div style={styles.formGroup}><label style={styles.formLabel}>Código</label><input type='text' value={cuentaForm.codigo} onChange={(e) => setCuentaForm({...cuentaForm, codigo: e.target.value})} style={styles.formInput} placeholder='Ej: 1.1.01' required /></div>
                                <div style={styles.formGroup}><label style={styles.formLabel}>Nombre</label><input type='text' value={cuentaForm.nombre} onChange={(e) => setCuentaForm({...cuentaForm, nombre: e.target.value})} style={styles.formInput} placeholder='Nombre de la cuenta' required /></div>
                                <div style={styles.formGroup}><label style={styles.formLabel}>Tipo</label><select value={cuentaForm.tipo} onChange={(e) => setCuentaForm({...cuentaForm, tipo: e.target.value})} style={styles.formSelect}><option value='activo'>Activo</option><option value='pasivo'>Pasivo</option><option value='patrimonio'>Patrimonio</option><option value='ingreso'>Ingreso</option><option value='gasto'>Gasto</option></select></div>
                                <div style={styles.formGroup}><label style={styles.formLabel}>Nivel</label><input type='number' value={cuentaForm.nivel} onChange={(e) => setCuentaForm({...cuentaForm, nivel: parseInt(e.target.value) || 1})} style={styles.formInput} min='1' max='5' /></div>
                            </div>
                            <div style={styles.modalActions}>
                                <button type='button' onClick={() => setIsCuentaModalOpen(false)} style={styles.btnSecondary} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.color = '#475569'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}>Cancelar</button>
                                <button type='submit' style={styles.btnPrimary} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'; }}><Plus size={18} /> {currentCuenta ? 'Actualizar' : 'Crear'} Cuenta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Contabilidad;