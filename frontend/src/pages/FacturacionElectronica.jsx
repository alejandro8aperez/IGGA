import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import {
    FileText, Settings, Activity, Send, RefreshCw, CheckCircle,
    XCircle, AlertTriangle, Search, Plus, Edit3, Trash2, X,
    Hash, Lock, Globe, Database, TrendingUp, Clock, Shield
} from 'lucide-react';

const API_URL = 'facturacion-electronica/';

const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Inter, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    title: { fontSize: '2rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' },
    btnPrimary: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)', transition: 'all 0.2s' },
    btnSecondary: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    statCard: { background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' },
    statValue: { fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' },
    statLabel: { fontSize: '0.875rem', color: '#64748b' },
    tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0' },
    tab: (active) => ({ padding: '0.75rem 1.5rem', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600, color: active ? '#667eea' : '#64748b', borderBottom: active ? '2px solid #667eea' : '2px solid transparent', marginBottom: '-2px' }),
    card: { background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '1.5rem' },
    cardHeader: { padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
    td: { padding: '1rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155' },
    badge: (estado) => {
        const colors = {
            pendiente: { bg: '#fef3c7', text: '#92400e' },
            enviada:   { bg: '#dbeafe', text: '#1e40af' },
            aceptada:  { bg: '#d1fae5', text: '#065f46' },
            rechazada: { bg: '#fecaca', text: '#991b1b' },
            error:     { bg: '#fee2e2', text: '#dc2626' }
        };
        const c = colors[estado] || colors.pendiente;
        return { padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.text, display: 'inline-block' };
    },
    modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
    modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    modalHeader: { padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', borderRadius: '16px 16px 0 0' },
    formGroup: { marginBottom: '1.25rem' },
    formLabel: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' },
    formInput: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' },
    formSelect: { width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' },
    btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '6px', color: '#64748b' }
};

function FacturacionElectronica() {
    const [activeTab, setActiveTab] = useState('logs');
    const [logs, setLogs] = useState([]);
    const [config, setConfig] = useState(null);
    const [estadisticas, setEstadisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [configForm, setConfigForm] = useState({
        nombre_config: '',
        nit: '',
        password_hash: '',
        wsdl_demo_ventas: '',
        wsdl_demo_pos: '',
        wsdl_prod_ventas: '',
        wsdl_prod_pos: '',
        ambiente_activo: 'demo',
        activo: true
    });

    const [isHashModalOpen, setIsHashModalOpen] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [hashResult, setHashResult] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [logsRes, configRes, statsRes] = await Promise.all([
                axiosInstance.get(`${API_URL}logs/`),
                axiosInstance.get(`${API_URL}configuracion/activa/`).catch(() => ({ data: null })),
                axiosInstance.get(`${API_URL}estadisticas/`)
            ]);
            setLogs(logsRes.data);
            setConfig(configRes.data);
            setEstadisticas(statsRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error cargando datos:', err);
            setLoading(false);
        }
    };

    const generateHash = async () => {
        try {
            const res = await axiosInstance.get(`${API_URL}hash-password/`, {
                params: { password: passwordInput }
            });
            setHashResult(res.data.hash_sha256);
        } catch (err) {
            console.error('Error generando hash:', err);
        }
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            if (config) {
                await axiosInstance.put(`${API_URL}configuracion/${config.id}/`, configForm);
            } else {
                await axiosInstance.post(`${API_URL}configuracion/`, configForm);
            }
            setIsConfigModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error guardando configuración:', err);
            alert('Error guardando configuración');
        }
    };

    const openConfigModal = () => {
        if (config) {
            setConfigForm({
                nombre_config: config.nombre_config || '',
                nit: config.nit || '',
                password_hash: '',
                wsdl_demo_ventas: config.wsdl_demo_ventas || '',
                wsdl_demo_pos: config.wsdl_demo_pos || '',
                wsdl_prod_ventas: config.wsdl_prod_ventas || '',
                wsdl_prod_pos: config.wsdl_prod_pos || '',
                ambiente_activo: config.ambiente_activo || 'demo',
                activo: config.activo !== false
            });
        } else {
            setConfigForm({
                nombre_config: 'Configuración Principal',
                nit: '',
                password_hash: '',
                wsdl_demo_ventas: '',
                wsdl_demo_pos: '',
                wsdl_prod_ventas: '',
                wsdl_prod_pos: '',
                ambiente_activo: 'demo',
                activo: true
            });
        }
        setIsConfigModalOpen(true);
    };

    const filteredLogs = logs.filter(log =>
        log.factura_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.cufe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.track_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <Activity size={48} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FileText size={32} color="#667eea" />
                    Facturación Electrónica
                </h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={styles.btnSecondary} onClick={() => setIsHashModalOpen(true)}>
                        <Hash size={18} />
                        Generar SHA256
                    </button>
                    <button style={styles.btnPrimary} onClick={openConfigModal}>
                        <Settings size={18} />
                        Configuración
                    </button>
                </div>
            </div>

            {estadisticas && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Database size={20} color="#667eea" />
                            <span style={styles.statLabel}>Total Facturas</span>
                        </div>
                        <div style={styles.statValue}>{estadisticas.total_facturas}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <CheckCircle size={20} color="#10b981" />
                            <span style={styles.statLabel}>Exitosas</span>
                        </div>
                        <div style={{ ...styles.statValue, color: '#10b981' }}>{estadisticas.exitosas}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <XCircle size={20} color="#ef4444" />
                            <span style={styles.statLabel}>Fallidas</span>
                        </div>
                        <div style={{ ...styles.statValue, color: '#ef4444' }}>{estadisticas.fallidas}</div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <TrendingUp size={20} color="#f59e0b" />
                            <span style={styles.statLabel}>Tasa Éxito</span>
                        </div>
                        <div style={{ ...styles.statValue, color: '#f59e0b' }}>{estadisticas.tasa_exito}%</div>
                    </div>
                </div>
            )}

            <div style={{ ...styles.card, marginBottom: '2rem' }}>
                <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: config ? '#d1fae5' : '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {config ? <Shield size={24} color="#065f46" /> : <AlertTriangle size={24} color="#dc2626" />}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1e293b' }}>Estado de Configuración</h3>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>
                            {config ? (
                                <>
                                    <Globe size={14} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                    Ambiente: <strong>{config.ambiente_activo === 'produccion' ? 'Producción' : 'Demo'}</strong>
                                    {' | '}NIT: <strong>{config.nit}</strong>
                                </>
                            ) : (
                                'No hay configuración activa. Configure las credenciales de Facturatech.'
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div style={styles.tabs}>
                <button style={styles.tab(activeTab === 'logs')} onClick={() => setActiveTab('logs')}>
                    <Activity size={16} style={{ marginRight: '0.5rem' }} />
                    Logs de Envío
                </button>
                <button style={styles.tab(activeTab === 'por-estado')} onClick={() => setActiveTab('por-estado')}>
                    <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                    Por Estado
                </button>
            </div>

            {activeTab === 'logs' && (
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>
                            <Activity size={20} color="#667eea" />
                            Historial de Envíos a DIAN
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar por número, CUFE o track ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ ...styles.formInput, paddingLeft: '2.5rem', width: '300px' }}
                                />
                            </div>
                            <button style={styles.btnSecondary} onClick={fetchData}>
                                <RefreshCw size={16} />
                            </button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Factura</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Código Resp.</th>
                                    <th style={styles.th}>CUFE</th>
                                    <th style={styles.th}>Ambiente</th>
                                    <th style={styles.th}>Fecha Envío</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td style={styles.td}><strong>{log.factura_numero || `#${log.id}`}</strong></td>
                                            <td style={styles.td}><span style={styles.badge(log.estado_interno)}>{log.estado_interno}</span></td>
                                            <td style={styles.td}><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{log.codigo_respuesta || '-'}</code></td>
                                            <td style={styles.td}>{log.cufe ? <span title={log.cufe}>{log.cufe.substring(0, 20)}...</span> : '-'}</td>
                                            <td style={styles.td}>
                                                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', background: log.es_produccion ? '#fecaca' : '#dbeafe', color: log.es_produccion ? '#991b1b' : '#1e40af' }}>
                                                    {log.es_produccion ? 'Producción' : 'Demo'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Clock size={14} color="#64748b" />
                                                    {new Date(log.fecha_envio).toLocaleString()}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                {log.estado_interno === 'error' && (
                                                    <button style={styles.btnIcon} onClick={() => axiosInstance.post(`${API_URL}logs/${log.id}/reenviar/`).then(fetchData)} title="Reenviar">
                                                        <Send size={16} color="#667eea" />
                                                    </button>
                                                )}
                                                <button style={styles.btnIcon} onClick={() => alert(`XML: ${log.xml_enviado?.substring(0, 200)}...`)} title="Ver XML">
                                                    <FileText size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                            <p>No hay logs de facturación electrónica</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'por-estado' && estadisticas && (
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardTitle}>
                            <CheckCircle size={20} color="#667eea" />
                            Distribución por Estado
                        </div>
                    </div>
                    <div style={{ padding: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            {estadisticas.por_estado?.map((item) => (
                                <div key={item.estado_interno} style={{ padding: '1.5rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>{item.estado_interno}</span>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginTop: '0.25rem' }}>{item.cantidad}</div>
                                    </div>
                                    <span style={styles.badge(item.estado_interno)}>{Math.round((item.cantidad / estadisticas.total_facturas) * 100)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {isConfigModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{config ? 'Editar Configuración' : 'Nueva Configuración'} Facturatech</h3>
                            <button onClick={() => setIsConfigModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: '#fff' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleConfigSubmit} style={{ padding: '1.5rem' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Nombre Configuración</label>
                                <input type="text" value={configForm.nombre_config} onChange={(e) => setConfigForm({ ...configForm, nombre_config: e.target.value })} style={styles.formInput} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>NIT (sin DV) *</label>
                                    <input type="text" value={configForm.nit} onChange={(e) => setConfigForm({ ...configForm, nit: e.target.value })} style={styles.formInput} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Password Hash SHA256 *</label>
                                    <input type="password" value={configForm.password_hash} onChange={(e) => setConfigForm({ ...configForm, password_hash: e.target.value })} style={styles.formInput} placeholder={config ? 'Dejar en blanco para mantener actual' : ''} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>WSDL Demo Ventas</label>
                                <input type="url" value={configForm.wsdl_demo_ventas} onChange={(e) => setConfigForm({ ...configForm, wsdl_demo_ventas: e.target.value })} style={styles.formInput} placeholder="https://demo.facturatech.co/ws/ventas?wsdl" />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>WSDL Producción Ventas</label>
                                <input type="url" value={configForm.wsdl_prod_ventas} onChange={(e) => setConfigForm({ ...configForm, wsdl_prod_ventas: e.target.value })} style={styles.formInput} placeholder="https://facturatech.co/ws/ventas?wsdl" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Ambiente</label>
                                    <select value={configForm.ambiente_activo} onChange={(e) => setConfigForm({ ...configForm, ambiente_activo: e.target.value })} style={styles.formSelect}>
                                        <option value="demo">Demo / Pruebas</option>
                                        <option value="produccion">Producción</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Estado</label>
                                    <select value={configForm.activo} onChange={(e) => setConfigForm({ ...configForm, activo: e.target.value === 'true' })} style={styles.formSelect}>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setIsConfigModalOpen(false)} style={{ ...styles.btnSecondary, padding: '0.75rem 1.5rem' }}>Cancelar</button>
                                <button type="submit" style={styles.btnPrimary}>
                                    <CheckCircle size={18} />
                                    {config ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isHashModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{ ...styles.modal, maxWidth: '500px' }}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Hash size={24} />
                                Generar SHA256
                            </h3>
                            <button onClick={() => setIsHashModalOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', color: '#fff' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Ingrese la contraseña técnica de Facturatech para generar el hash SHA256 requerido.
                            </p>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Contraseña Facturatech</label>
                                <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={styles.formInput} placeholder="Ingrese la contraseña..." />
                            </div>
                            <button onClick={generateHash} style={{ ...styles.btnPrimary, width: '100%', marginBottom: '1.5rem' }}>
                                <Hash size={18} />
                                Generar Hash
                            </button>
                            {hashResult && (
                                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '1rem' }}>
                                    <label style={{ ...styles.formLabel, color: '#166534' }}>Hash SHA256 Resultante:</label>
                                    <code style={{ display: 'block', background: '#fff', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', wordBreak: 'break-all', fontFamily: 'monospace', border: '1px solid #e2e8f0' }}>
                                        {hashResult}
                                    </code>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>
                                        Copie este valor y guárdelo en FACTURATECH_PASSWORD del archivo .env
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FacturacionElectronica;
