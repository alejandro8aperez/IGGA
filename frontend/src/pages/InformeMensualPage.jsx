import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { API } from '../config/api';
import {
    FileText, Plus, ArrowLeft, Save, AlertCircle,
    Calendar, Briefcase, User, CheckCircle, Clock,
    Edit3, Trash2, BarChart3, Loader, ChevronDown, X
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Dot
} from 'recharts';

const mesNames = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const statusOptions = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'aprobado', label: 'Aprobado' },
];

const s = {
    page: { background: '#0f172a', minHeight: '100vh', color: '#e2e8f0', padding: '1.5rem' },
    container: { maxWidth: 1400, margin: '0 auto' },
    card: { background: '#1e293b', borderRadius: 16, border: '1px solid #1e3a5f', padding: '1.5rem', marginBottom: '1.5rem' },
    cardNoPad: { background: '#1e293b', borderRadius: 16, border: '1px solid #1e3a5f', overflow: 'hidden', marginBottom: '1.5rem' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' },
    title: { margin: 0, fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' },
    subtitle: { margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' },
    inp: { width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
    inpLg: { width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', minHeight: 80, resize: 'vertical' },
    select: { width: '100%', padding: '0.6rem 0.75rem', background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' },
    lbl: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' },
    btnPri: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap' },
    btnSec: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', background: 'transparent', color: '#94a3b8', border: '1px solid #1e3a5f', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' },
    btnDanger: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' },
    badge: (color, bg) => ({ background: bg || '#1e3a5f', color: color || '#94a3b8', padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }),
    th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', borderBottom: '1px solid #1e3a5f' },
    td: { padding: '0.75rem 1rem', fontSize: '0.85rem', borderBottom: '1px solid #1e3a5f', color: '#e2e8f0' },
    sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1e3a5f', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
    grid4: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' },
};

export default function InformeMensualPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('list');
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [proyectos, setProyectos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ proyecto_id: '', mes: '', anio: new Date().getFullYear() });
    const [editData, setEditData] = useState(null);
    const [sCurveData, setSCurveData] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [rRes, pRes, eRes] = await Promise.all([
                axiosInstance.get(API.INFORME_PERIODICO.MENSUALES).catch(() => ({ data: [] })),
                axiosInstance.get(API.OPERACIONES.PROYECTOS).catch(() => ({ data: [] })),
                axiosInstance.get(API.RRHH.EMPLEADOS).catch(() => ({ data: [] })),
            ]);
            setReports(Array.isArray(rRes.data) ? rRes.data : rRes.data.results || []);
            setProyectos(Array.isArray(pRes.data) ? pRes.data : pRes.data.results || []);
            setEmpleados(Array.isArray(eRes.data) ? eRes.data : eRes.data.results || []);
            setError(null);
        } catch (err) {
            setError('Error al cargar datos iniciales.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            const rRes = await axiosInstance.get(API.INFORME_PERIODICO.MENSUALES);
            setReports(Array.isArray(rRes.data) ? rRes.data : rRes.data.results || []);
        } catch { }
    };

    const fetchReportDetail = async (id) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(API.INFORME_PERIODICO.MENSUAL_DETAIL(id));
            const report = res.data;
            setSelectedReport(report);
            setEditData({
                resumen_ejecutivo: report.resumen_ejecutivo || '',
                logros_principales: report.logros_principales || '',
                dificultades: report.dificultades || '',
                observaciones: report.observaciones || '',
                estado_terreno: report.estado_terreno || '',
                status: report.status || 'borrador',
                elaborado_por: report.elaborado_por || '',
                revisado_por: report.revisado_por || '',
                profesional_1: report.profesional_1 || '',
                profesional_2: report.profesional_2 || '',
            });
            setSCurveData(Array.isArray(report.curva_s_data) ? report.curva_s_data : []);
            setMode('view');
            setError(null);
        } catch (err) {
            setError('Error al cargar detalle del informe.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.proyecto_id || !formData.mes || !formData.anio) {
            alert('Completa todos los campos para generar el informe.');
            return;
        }
        try {
            setGenerating(true);
            const res = await axiosInstance.post(API.INFORME_PERIODICO.GENERAR_MENSUAL, {
                proyecto_id: Number(formData.proyecto_id),
                mes: Number(formData.mes),
                anio: Number(formData.anio),
            });
            await fetchReports();
            setGenerating(false);
            fetchReportDetail(res.data.id);
        } catch (err) {
            setGenerating(false);
            const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Error al generar informe: ${detail}`);
        }
    };

    const handleSave = async () => {
        if (!selectedReport?.id) return;
        try {
            setSaving(true);
            const payload = { ...editData };
            await axiosInstance.put(API.INFORME_PERIODICO.MENSUAL_DETAIL(selectedReport.id), payload);
            await fetchReports();
            setSaving(false);
        } catch (err) {
            setSaving(false);
            const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
            alert(`Error al guardar: ${detail}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este informe mensual?')) return;
        try {
            await axiosInstance.delete(API.INFORME_PERIODICO.MENSUAL_DETAIL(id));
            fetchReports();
        } catch {
            alert('No se pudo eliminar.');
        }
    };

    const handleEditField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const getStatusBadge = (status) => {
        const map = {
            borrador: { color: '#94a3b8', bg: '#1e293b', icon: Clock },
            enviado: { color: '#3b82f6', bg: '#172554', icon: Clock },
            aprobado: { color: '#22c55e', bg: '#052e16', icon: CheckCircle },
        };
        const s2 = map[status] || map.borrador;
        const Icon = s2.icon;
        return <span style={s.badge(s2.color, s2.bg)}><Icon size={12} /> {(statusOptions.find(o => o.value === status) || {}).label || status}</span>;
    };

    const getProyectoNombre = (id) => {
        const p = proyectos.find(x => x.id === id);
        return p ? p.nombre : `ID: ${id}`;
    };

    const goToList = () => {
        setMode('list');
        setSelectedReport(null);
        setEditData(null);
        setSCurveData([]);
        setFormData({ proyecto_id: '', mes: '', anio: new Date().getFullYear() });
        fetchReports();
    };

    const renderDot = (isProgramado) => (props) => {
        const { cx, cy, payload, index } = props;
        if (payload && payload.destacado) {
            return (
                <svg x={cx - 4} y={cy - 4} width={8} height={8}>
                    <circle cx={4} cy={4} r={4} fill={isProgramado ? '#22c55e' : '#3b82f6'} stroke="#fff" strokeWidth={1.5} />
                </svg>
            );
        }
        return <Dot {...props} r={3} fill={isProgramado ? '#22c55e' : '#3b82f6'} />;
    };

    if (loading && mode === 'list') return (
        <div style={s.page}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div style={{ animation: 'spin 1s linear infinite', width: 32, height: 32, border: '3px solid #1e3a5f', borderTopColor: '#667eea', borderRadius: '50%' }} />
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error && mode === 'list') return (
        <div style={s.page}>
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#ef4444' }} />
                <p style={{ color: '#ef4444' }}>{error}</p>
                <button onClick={fetchInitialData} style={s.btnPri}>Reintentar</button>
            </div>
        </div>
    );

    return (
        <div style={s.page}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            <div style={s.container}>
                {mode === 'list' && renderList()}
                {mode === 'generate' && renderGenerate()}
                {mode === 'view' && renderView()}
            </div>
        </div>
    );

    function renderList() {
        const formatMesAnio = (r) => `${mesNames[r.mes] || r.mes} ${r.anio}`;
        return (
            <>
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}><BarChart3 size={28} /> Informes Mensuales</h1>
                        <p style={s.subtitle}>Gestión de reportes mensuales con curva S</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={s.btnPri} onClick={() => setMode('generate')}><Plus size={16} /> Generar Nuevo</button>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div style={s.card}>
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No hay informes mensuales aún</p>
                            <p style={{ fontSize: '0.85rem' }}>Genera el primer informe desde el botón "Generar Nuevo"</p>
                        </div>
                    </div>
                ) : (
                    <div style={s.cardNoPad}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>Mes/Año</th>
                                        <th style={s.th}>Proyecto</th>
                                        <th style={s.th}>Fecha inicio</th>
                                        <th style={s.th}>Fecha fin</th>
                                        <th style={s.th}>Status</th>
                                        <th style={s.th}>Avance Programado</th>
                                        <th style={s.th}>Avance Ejecutado</th>
                                        <th style={s.th}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r, idx) => (
                                        <tr key={r.id} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                            <td style={s.td}>{formatMesAnio(r)}</td>
                                            <td style={s.td}>{getProyectoNombre(r.proyecto)}</td>
                                            <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.8rem' }}>{r.fecha_inicio || '-'}</td>
                                            <td style={{ ...s.td, color: '#94a3b8', fontSize: '0.8rem' }}>{r.fecha_fin || '-'}</td>
                                            <td style={s.td}>{getStatusBadge(r.status)}</td>
                                            <td style={s.td}>{r.avance_programado != null ? `${r.avance_programado}%` : '-'}</td>
                                            <td style={s.td}>{r.avance_ejecutado != null ? `${r.avance_ejecutado}%` : '-'}</td>
                                            <td style={s.td}>
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <button style={{ ...s.btnSec, padding: '0.35rem 0.6rem' }} onClick={() => fetchReportDetail(r.id)} title="Ver/Editar">
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button style={{ ...s.btnDanger, padding: '0.35rem 0.6rem' }} onClick={() => handleDelete(r.id)} title="Eliminar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={s.btnSec} onClick={() => navigate('/')}><ArrowLeft size={16} /> Volver</button>
                </div>
            </>
        );
    }

    function renderGenerate() {
        return (
            <>
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}><Plus size={28} /> Generar Informe Mensual</h1>
                        <p style={s.subtitle}>Crea un informe mensual a partir de reportes semanales</p>
                    </div>
                </div>

                <div style={s.card}>
                    <form onSubmit={handleGenerate}>
                        <div style={s.grid3}>
                            <div>
                                <label style={s.lbl}>Proyecto</label>
                                <select style={s.select} value={formData.proyecto_id} onChange={e => setFormData(prev => ({ ...prev, proyecto_id: e.target.value }))} required>
                                    <option value="">Seleccionar proyecto...</option>
                                    {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={s.lbl}>Mes</label>
                                <input type="number" min={1} max={12} style={s.inp} value={formData.mes} onChange={e => setFormData(prev => ({ ...prev, mes: e.target.value }))} placeholder="1-12" required />
                            </div>
                            <div>
                                <label style={s.lbl}>Año</label>
                                <input type="number" min={2000} max={2100} style={s.inp} value={formData.anio} onChange={e => setFormData(prev => ({ ...prev, anio: e.target.value }))} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #1e3a5f', paddingTop: '1rem' }}>
                            <button type="button" style={s.btnSec} onClick={() => setMode('list')}><ArrowLeft size={16} /> Cancelar</button>
                            <button type="submit" style={s.btnPri} disabled={generating}>
                                {generating ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</> : <><Plus size={16} /> Generar Informe</>}
                            </button>
                        </div>
                    </form>
                </div>
            </>
        );
    }

    function renderView() {
        if (!selectedReport) return null;
        const r = selectedReport;
        const formatMesAnio = `${mesNames[r.mes] || r.mes} ${r.anio}`;

        const firmasRoles = [
            { field: 'elaborado_por', label: 'Elabora' },
            { field: 'revisado_por', label: 'Revisa' },
            { field: 'profesional_1', label: 'Profesional 1' },
            { field: 'profesional_2', label: 'Profesional 2' },
        ];

        return (
            <>
                <div style={s.header}>
                    <div>
                        <h1 style={s.title}><FileText size={28} /> {formatMesAnio}</h1>
                        <p style={s.subtitle}>{getProyectoNombre(r.proyecto)} · {r.fecha_inicio || '-'} → {r.fecha_fin || '-'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button style={s.btnSec} onClick={goToList}><ArrowLeft size={16} /> Volver</button>
                        <button style={s.btnPri} onClick={handleSave} disabled={saving}>
                            {saving ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</> : <><Save size={16} /> Guardar</>}
                        </button>
                    </div>
                </div>

                <div style={s.card}>
                    <h3 style={s.sectionTitle}><FileText size={16} /> Contenido del Informe</h3>
                    <div style={s.grid2}>
                        <div>
                            <label style={s.lbl}>Resumen Ejecutivo</label>
                            <textarea style={s.inpLg} value={editData?.resumen_ejecutivo || ''} onChange={e => handleEditField('resumen_ejecutivo', e.target.value)} />
                        </div>
                        <div>
                            <label style={s.lbl}>Logros Principales</label>
                            <textarea style={s.inpLg} value={editData?.logros_principales || ''} onChange={e => handleEditField('logros_principales', e.target.value)} />
                        </div>
                        <div>
                            <label style={s.lbl}>Dificultades</label>
                            <textarea style={s.inpLg} value={editData?.dificultades || ''} onChange={e => handleEditField('dificultades', e.target.value)} />
                        </div>
                        <div>
                            <label style={s.lbl}>Observaciones</label>
                            <textarea style={s.inpLg} value={editData?.observaciones || ''} onChange={e => handleEditField('observaciones', e.target.value)} />
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem' }}>
                        <label style={s.lbl}>Estado del Terreno</label>
                        <textarea style={{ ...s.inpLg, maxWidth: 400 }} value={editData?.estado_terreno || ''} onChange={e => handleEditField('estado_terreno', e.target.value)} />
                    </div>
                </div>

                <div style={s.card}>
                    <h3 style={s.sectionTitle}><BarChart3 size={16} /> Curva S</h3>
                    {sCurveData.length > 0 ? (
                        <div style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <LineChart data={sCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                                    <XAxis dataKey="fecha" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                                    <Tooltip
                                        contentStyle={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }}
                                        labelStyle={{ color: '#e2e8f0', fontWeight: 700 }}
                                    />
                                    <Legend
                                        wrapperStyle={{ color: '#e2e8f0' }}
                                        formatter={(value) => <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{value}</span>}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="programado"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={renderDot(true)}
                                        name="Programado"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="ejecutado"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={renderDot(false)}
                                        name="Ejecutado"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                            <BarChart3 size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                            <p>No hay datos de curva S disponibles para este informe.</p>
                            <p style={{ fontSize: '0.8rem' }}>Los datos se generan automáticamente al crear el informe desde semanales.</p>
                        </div>
                    )}
                </div>

                <div style={s.card}>
                    <h3 style={s.sectionTitle}><User size={16} /> Firmas</h3>
                    <div style={s.grid4}>
                        {firmasRoles.map(role => (
                            <div key={role.field}>
                                <label style={s.lbl}>{role.label}</label>
                                <select style={s.select} value={editData?.[role.field] || ''} onChange={e => handleEditField(role.field, e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {empleados.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || `#${emp.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={s.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={s.lbl}>Status</label>
                        <select style={{ ...s.select, width: 'auto', minWidth: 180 }} value={editData?.status || 'borrador'} onChange={e => handleEditField('status', e.target.value)}>
                            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>
            </>
        );
    }
}
