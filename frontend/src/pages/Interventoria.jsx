import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { API } from '../config/api';
import {
    ClipboardList, AlertCircle, Edit3, Trash2, Plus, X, Search,
    Calendar, FileText, Shield, User, CheckCircle, Clock,
    Flag, ChevronDown, ChevronUp, Save
} from 'lucide-react';

const NIVEL_RIESGO = [
    { value: 'bajo', label: 'Bajo', color: '#22c55e' },
    { value: 'medio', label: 'Medio', color: '#f59e0b' },
    { value: 'alto', label: 'Alto', color: '#ef4444' },
    { value: 'critico', label: 'Crítico', color: '#7c3aed' },
];

export default function Interventoria() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('contratos');
    const [contratos, setContratos] = useState([]);
    const [visitas, setVisitas] = useState([]);
    const [hallazgos, setHallazgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [expandedVisita, setExpandedVisita] = useState(null);

    const emptyContrato = {
        codigo: '', nombre: '', descripcion: '', fecha_inicio: '',
        fecha_fin: '', presupuesto: '', interventor_encargado: null, activo: true,
    };
    const emptyVisita = {
        contrato: '', fecha: '', ubicacion: '', observaciones: '',
    };
    const emptyHallazgo = {
        visita: '', descripcion: '', nivel_riesgo: 'bajo',
        plan_accion: '', cerrado: false, fecha_cierre: '',
    };
    const [formData, setFormData] = useState(emptyContrato);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cRes, vRes, hRes] = await Promise.all([
                axiosInstance.get(API.INTERVENTORIA.CONTRATOS),
                axiosInstance.get(API.INTERVENTORIA.VISITAS),
                axiosInstance.get(API.INTERVENTORIA.HALLAZGOS),
            ]);
            setContratos(cRes.data);
            setVisitas(vRes.data);
            setHallazgos(hRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar datos de Interventoría.');
            setLoading(false);
        }
    };

    const getTabData = () => {
        switch (activeTab) {
            case 'contratos': return contratos;
            case 'visitas': return visitas;
            case 'hallazgos': return hallazgos;
            default: return [];
        }
    };

    const filtered = getTabData().filter(item => {
        const s = searchTerm.toLowerCase();
        if (activeTab === 'contratos') return item.nombre?.toLowerCase().includes(s) || item.codigo?.toLowerCase().includes(s);
        if (activeTab === 'visitas') return item.ubicacion?.toLowerCase().includes(s) || item.observaciones?.toLowerCase().includes(s);
        if (activeTab === 'hallazgos') return item.descripcion?.toLowerCase().includes(s) || item.nivel_riesgo?.toLowerCase().includes(s);
        return true;
    });

    const openModal = (item = null) => {
        if (item) {
            setCurrentItem(item);
            if (activeTab === 'contratos') {
                setFormData({
                    codigo: item.codigo, nombre: item.nombre, descripcion: item.descripcion || '',
                    fecha_inicio: item.fecha_inicio, fecha_fin: item.fecha_fin,
                    presupuesto: item.presupuesto, interventor_encargado: item.interventor_encargado,
                    activo: item.activo !== false,
                });
            } else if (activeTab === 'visitas') {
                setFormData({
                    contrato: item.contrato, fecha: item.fecha?.slice(0, 16) || '', ubicacion: item.ubicacion,
                    observaciones: item.observaciones,
                });
            } else {
                setFormData({
                    visita: item.visita, descripcion: item.descripcion, nivel_riesgo: item.nivel_riesgo,
                    plan_accion: item.plan_accion || '', cerrado: item.cerrado,
                    fecha_cierre: item.fecha_cierre || '',
                });
            }
        } else {
            setCurrentItem(null);
            if (activeTab === 'contratos') setFormData(emptyContrato);
            else if (activeTab === 'visitas') setFormData(emptyVisita);
            else setFormData(emptyHallazgo);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = API.INTERVENTORIA[activeTab.toUpperCase()];
            const data = { ...formData };
            if (activeTab === 'contratos') {
                data.presupuesto = Number(data.presupuesto) || 0;
            }
            if (currentItem) {
                await axiosInstance.patch(`${endpoint}${currentItem.id}/`, data);
            } else {
                await axiosInstance.post(endpoint, data);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Error al guardar: ${detail}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este registro?')) return;
        try {
            await axiosInstance.delete(`${API.INTERVENTORIA[activeTab.toUpperCase()]}${id}/`);
            fetchData();
        } catch { alert('No se pudo eliminar.'); }
    };

    const handleFieldChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const getContratoNombre = (id) => contratos.find(c => c.id === id)?.nombre || `ID: ${id}`;
    const getVisitaHallazgos = (visitaId) => hallazgos.filter(h => h.visita === visitaId);
    const getNivelInfo = (nivel) => NIVEL_RIESGO.find(n => n.value === nivel) || NIVEL_RIESGO[0];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ animation: 'spin 1s linear infinite', width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#667eea', borderRadius: '50%' }} />
        </div>
    );

    if (error) return (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444' }}>
            <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <p>{error}</p>
            <button onClick={fetchData} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Reintentar</button>
        </div>
    );

    const TABS = [
        { key: 'contratos', label: 'Contratos', icon: FileText, count: contratos.length },
        { key: 'visitas', label: 'Visitas', icon: Calendar, count: visitas.length },
        { key: 'hallazgos', label: 'Hallazgos', icon: Flag, count: hallazgos.length },
    ];

    const card = { background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' };
    const cardHead = { padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' };
    const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', background: '#fff' };
    const label = { fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '0.3rem', display: 'block' };
    const btnPrimary = { padding: '0.5rem 1.25rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' };
    const btnDanger = { ...btnPrimary, background: '#ef4444' };
    const btnOutline = { padding: '0.4rem 0.8rem', background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' };

    const renderForm = () => {
        if (activeTab === 'contratos') return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={label}>Código *</label>
                        <input style={inputStyle} value={formData.codigo} onChange={e => handleFieldChange('codigo', e.target.value)} required />
                    </div>
                    <div>
                        <label style={label}>Nombre *</label>
                        <input style={inputStyle} value={formData.nombre} onChange={e => handleFieldChange('nombre', e.target.value)} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={label}>Descripción</label>
                        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formData.descripcion} onChange={e => handleFieldChange('descripcion', e.target.value)} />
                    </div>
                    <div>
                        <label style={label}>Fecha Inicio *</label>
                        <input type="date" style={inputStyle} value={formData.fecha_inicio} onChange={e => handleFieldChange('fecha_inicio', e.target.value)} required />
                    </div>
                    <div>
                        <label style={label}>Fecha Fin *</label>
                        <input type="date" style={inputStyle} value={formData.fecha_fin} onChange={e => handleFieldChange('fecha_fin', e.target.value)} required />
                    </div>
                    <div>
                        <label style={label}>Presupuesto</label>
                        <input type="number" style={inputStyle} value={formData.presupuesto} onChange={e => handleFieldChange('presupuesto', e.target.value)} />
                    </div>
                    <div>
                        <label style={label}>Activo</label>
                        <select style={inputStyle} value={formData.activo} onChange={e => handleFieldChange('activo', e.target.value === 'true')}>
                            <option value="true">Sí</option>
                            <option value="false">No</option>
                        </select>
                    </div>
                </div>
            </>
        );
        if (activeTab === 'visitas') return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={label}>Contrato *</label>
                        <select style={inputStyle} value={formData.contrato} onChange={e => handleFieldChange('contrato', Number(e.target.value))} required>
                            <option value="">Seleccionar...</option>
                            {contratos.map(c => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={label}>Fecha y Hora *</label>
                        <input type="datetime-local" style={inputStyle} value={formData.fecha} onChange={e => handleFieldChange('fecha', e.target.value)} required />
                    </div>
                    <div>
                        <label style={label}>Ubicación *</label>
                        <input style={inputStyle} value={formData.ubicacion} onChange={e => handleFieldChange('ubicacion', e.target.value)} required />
                    </div>
                    <div>
                        <label style={label}>Observaciones</label>
                        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formData.observaciones} onChange={e => handleFieldChange('observaciones', e.target.value)} />
                    </div>
                </div>
            </>
        );
        return (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label style={label}>Visita *</label>
                        <select style={inputStyle} value={formData.visita} onChange={e => handleFieldChange('visita', Number(e.target.value))} required>
                            <option value="">Seleccionar...</option>
                            {visitas.map(v => <option key={v.id} value={v.id}>Visita #{v.id} — {v.ubicacion} ({v.fecha?.slice(0, 10)})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={label}>Nivel de Riesgo *</label>
                        <select style={inputStyle} value={formData.nivel_riesgo} onChange={e => handleFieldChange('nivel_riesgo', e.target.value)}>
                            {NIVEL_RIESGO.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={label}>Descripción *</label>
                        <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.descripcion} onChange={e => handleFieldChange('descripcion', e.target.value)} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={label}>Plan de Acción</label>
                        <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={formData.plan_accion} onChange={e => handleFieldChange('plan_accion', e.target.value)} />
                    </div>
                    <div>
                        <label style={label}>Cerrado</label>
                        <select style={inputStyle} value={formData.cerrado} onChange={e => handleFieldChange('cerrado', e.target.value === 'true')}>
                            <option value="false">No</option>
                            <option value="true">Sí</option>
                        </select>
                    </div>
                    <div>
                        <label style={label}>Fecha Cierre</label>
                        <input type="date" style={inputStyle} value={formData.fecha_cierre} onChange={e => handleFieldChange('fecha_cierre', e.target.value)} />
                    </div>
                </div>
            </>
        );
    };

    const renderRow = (item, idx) => {
        if (activeTab === 'contratos') {
            const vCount = visitas.filter(v => v.contrato === item.id).length;
            return (
                <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: '#667eea', fontSize: '0.8rem' }}>{item.codigo}</td>
                    <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.fecha_inicio} → {item.fecha_fin}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>${Number(item.presupuesto).toLocaleString()}</td>
                    <td>{item.activo ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>Activo</span> : <span style={{ background: '#fef2f2', color: '#991b1b', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>Inactivo</span>}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{vCount} visita{vCount !== 1 ? 's' : ''}</td>
                    <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button style={btnOutline} onClick={() => openModal(item)}><Edit3 size={12} /></button>
                            <button style={{ ...btnOutline, color: '#ef4444' }} onClick={() => handleDelete(item.id)}><Trash2 size={12} /></button>
                        </div>
                    </td>
                </tr>
            );
        }
        if (activeTab === 'visitas') {
            const hCount = hallazgos.filter(h => h.visita === item.id).length;
            const isExpanded = expandedVisita === item.id;
            return (
                <>
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedVisita(isExpanded ? null : item.id)}>
                        <td style={{ fontWeight: 600 }}>{getContratoNombre(item.contrato)}</td>
                        <td style={{ fontSize: '0.85rem' }}>{item.fecha?.slice(0, 16).replace('T', ' ')}</td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.ubicacion}</td>
                        <td style={{ fontSize: '0.75rem', color: '#64748b' }}>{hCount} hallazgo{hCount !== 1 ? 's' : ''}</td>
                        <td>
                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                <button style={btnOutline} onClick={e => { e.stopPropagation(); openModal(item); }}><Edit3 size={12} /></button>
                                <button style={{ ...btnOutline, color: '#ef4444' }} onClick={e => { e.stopPropagation(); handleDelete(item.id); }}><Trash2 size={12} /></button>
                            </div>
                        </td>
                    </tr>
                    {isExpanded && (
                        <tr key={`h-${item.id}`}>
                            <td colSpan={5} style={{ padding: '0 1rem 1rem' }}>
                                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}><strong>Observaciones:</strong> {item.observaciones || 'Ninguna'}</p>
                                    {hCount > 0 && (
                                        <>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Hallazgos:</p>
                                            {hallazgos.filter(h => h.visita === item.id).map(h => {
                                                const ni = getNivelInfo(h.nivel_riesgo);
                                                return (
                                                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                                        <span style={{ background: ni.color, color: '#fff', padding: '1px 6px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>{ni.label}</span>
                                                        <span style={{ flex: 1 }}>{h.descripcion}</span>
                                                        {h.cerrado && <CheckCircle size={12} color="#22c55e" />}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </>
            );
        }
        const ni = getNivelInfo(item.nivel_riesgo);
        return (
            <tr key={item.id}>
                <td style={{ fontSize: '0.8rem' }}>{getContratoNombre(visitas.find(v => v.id === item.visita)?.contrato)}</td>
                <td style={{ fontSize: '0.8rem', color: '#667eea' }}>Visita #{item.visita}</td>
                <td><span style={{ background: ni.color, color: '#fff', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{ni.label}</span></td>
                <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.descripcion}</td>
                <td>{item.cerrado ? <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}><CheckCircle size={14} /> Cerrado</span> : <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Abierto</span>}</td>
                <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button style={btnOutline} onClick={() => openModal(item)}><Edit3 size={12} /></button>
                        <button style={{ ...btnOutline, color: '#ef4444' }} onClick={() => handleDelete(item.id)}><Trash2 size={12} /></button>
                    </div>
                </td>
            </tr>
        );
    };

    const columns = {
        contratos: ['Código', 'Nombre', 'Vigencia', 'Presupuesto', 'Estado', 'Visitas', 'Acciones'],
        visitas: ['Contrato', 'Fecha', 'Ubicación', 'Hallazgos', ''],
        hallazgos: ['Contrato', 'Visita', 'Riesgo', 'Descripción', 'Estado', 'Acciones'],
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Interventoría</h1>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>Gestión de contratos, visitas y hallazgos</p>
                </div>
                <button style={btnPrimary} onClick={() => openModal()}>
                    <Plus size={16} /> Nuevo {activeTab === 'contratos' ? 'Contrato' : activeTab === 'visitas' ? 'Visita' : 'Hallazgo'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchTerm(''); }}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', background: activeTab === tab.key ? '#667eea' : '#f1f5f9', color: activeTab === tab.key ? '#fff' : '#475569' }}>
                        <tab.icon size={16} />
                        {tab.label}
                        <span style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#e2e8f0', padding: '1px 7px', borderRadius: 20, fontSize: '0.65rem' }}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <div style={card}>
                <div style={cardHead}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={16} color="#94a3b8" />
                        <input placeholder={`Buscar en ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', fontSize: '0.85rem', color: '#1e293b', width: 250, background: 'transparent' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                {columns[activeTab].map(col => (
                                    <th key={col} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={columns[activeTab].length} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    No hay registros de {activeTab} aún. Crea el primero.
                                </td></tr>
                            ) : filtered.map((item, idx) => renderRow(item, idx))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setIsModalOpen(false)}>
                    <div style={{ background: '#fff', borderRadius: 16, maxWidth: 600, width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '1.5rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>
                                {currentItem ? 'Editar' : 'Nuevo'} {activeTab === 'contratos' ? 'Contrato' : activeTab === 'visitas' ? 'Visita' : 'Hallazgo'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {renderForm()}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>Cancelar</button>
                                <button type="submit" style={btnPrimary}><Save size={14} /> {currentItem ? 'Actualizar' : 'Crear'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
