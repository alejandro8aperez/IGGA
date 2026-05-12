// =============================================================================
// Informediarioproy.jsx — ERP 8AMPERIOS
// Módulo Informe Diario de Obra (Formato F-141-IN)
// Conectado al backend Django app `informe_diario` en /api/informe-diario/
// Incluye: Dashboard, Lista, Formulario completo en una sola página.
// =============================================================================
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    FileText, Plus, X, Edit3, Trash2, Calendar, Users, Truck, ClipboardList,
    Download, FileSpreadsheet, LayoutDashboard, Save, ArrowLeft,
    Upload, CloudRain, Filter, Image as ImageIcon,
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { API } from '../config/api';

const ID = API.INFORME_DIARIO;
const HORAS = Array.from({ length: 24 }, (_, i) => i);

// ─── Estilos reusables ───────────────────────────────────────────────────────
const card = {
    background: 'white', borderRadius: '16px', padding: '1.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
};
const input = {
    width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e0',
    borderRadius: '8px', fontSize: '0.9rem', background: 'white',
};
const label = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600,
    color: '#475569', marginBottom: '0.35rem', textTransform: 'uppercase',
    letterSpacing: '0.04em',
};
const btnPrimary = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white', border: 'none', padding: '0.6rem 1.2rem',
    borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
};
const btnSecondary = {
    ...btnPrimary,
    background: 'white', color: '#475569', border: '1px solid #cbd5e0',
    boxShadow: 'none',
};
const btnGhost = {
    ...btnPrimary,
    background: '#f1f5f9', color: '#475569',
    padding: '0.4rem 0.7rem', fontSize: '0.78rem', boxShadow: 'none',
};
const tabStyle = (active) => ({
    padding: '0.7rem 1.25rem', fontSize: '0.92rem', fontWeight: 600,
    color: active ? '#667eea' : '#64748b', border: 'none', background: 'none',
    cursor: 'pointer', borderBottom: `3px solid ${active ? '#667eea' : 'transparent'}`,
    transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
});

// ─── Helpers API ─────────────────────────────────────────────────────────────
const api = {
    obras: {
        list: () => axios.get(ID.OBRAS).then(r => r.data),
    },
    catRec: {
        list: () => axios.get(ID.CATEGORIAS_RECURSOS).then(r => r.data),
    },
    recursos: {
        list: () => axios.get(ID.RECURSOS).then(r => r.data),
    },
    catAct: {
        list: () => axios.get(ID.CATEGORIAS_ACTIVIDADES).then(r => r.data),
    },
    informes: {
        list: (params) => axios.get(ID.INFORMES, { params }).then(r => r.data),
        get: (id) => axios.get(`${ID.INFORMES}${id}/`).then(r => r.data),
        create: (d) => axios.post(ID.INFORMES, d).then(r => r.data),
        update: (id, d) => axios.put(`${ID.INFORMES}${id}/`, d).then(r => r.data),
        remove: (id) => axios.delete(`${ID.INFORMES}${id}/`),
        pdfUrl: (id) => `${ID.INFORMES}${id}/exportar-pdf/`,
        excelUrl: (id) => `${ID.INFORMES}${id}/exportar-excel/`,
        subirAnexo: (id, fd) => axios.post(`${ID.INFORMES}${id}/subir-anexo/`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }).then(r => r.data),
    },
    dashboard: {
        resumen: (params) => axios.get(ID.DASHBOARD_RESUMEN, { params }).then(r => r.data),
        lluvia: (params) => axios.get(ID.DASHBOARD_LLUVIA, { params }).then(r => r.data),
        personal: (params) => axios.get(ID.DASHBOARD_PERSONAL, { params }).then(r => r.data),
    },
};

// =============================================================================
// SUB-VISTA: Dashboard
// =============================================================================
function VistaDashboard({ obras, obraFiltro, setObraFiltro }) {
    const [resumen, setResumen] = useState(null);
    const [lluvia, setLluvia] = useState([]);
    const [personal, setPersonal] = useState([]);

    useEffect(() => {
        const params = obraFiltro ? { obra: obraFiltro } : {};
        api.dashboard.resumen(params).then(setResumen).catch(() => {});
        api.dashboard.lluvia(params).then(setLluvia).catch(() => setLluvia([]));
        api.dashboard.personal(params).then(setPersonal).catch(() => setPersonal([]));
    }, [obraFiltro]);

    const kpis = [
        { icon: FileText, label: 'Total Informes', value: resumen?.total_informes ?? 0, color: '#667eea' },
        { icon: Calendar, label: 'Últimos 30 días', value: resumen?.informes_ultimos_30_dias ?? 0, color: '#f59e0b' },
        { icon: CloudRain, label: 'Horas lluvia (30d)', value: resumen?.horas_lluvia_ultimos_30_dias ?? 0, color: '#0284c7' },
        { icon: Users, label: 'Personal prom. (30d)', value: resumen?.personal_promedio_ultimos_30_dias ?? 0, color: '#10b981' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <select value={obraFiltro} onChange={e => setObraFiltro(e.target.value)}
                    style={{ ...input, maxWidth: '320px' }}>
                    <option value="">Todas las obras</option>
                    {obras.map(o => <option key={o.id} value={o.id}>{o.codigo} - {o.nombre}</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {kpis.map((k, idx) => (
                    <div key={idx} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            background: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <k.icon size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b' }}>{k.value}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1rem' }}>
                <div style={card}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                        Horas de lluvia por mes
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={lluvia}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="mes" fontSize={11} />
                            <YAxis fontSize={11} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="horas" stroke="#0284c7" strokeWidth={2} name="Horas con lluvia" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={card}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem' }}>
                        Personal por rol (Top 8)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={personal.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="rol" fontSize={9} angle={-25} textAnchor="end" height={70} />
                            <YAxis fontSize={11} />
                            <Tooltip />
                            <Bar dataKey="total" fill="#667eea" name="Personas-día" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// SUB-VISTA: Lista de Informes
// =============================================================================
function VistaLista({ obras, onNuevo, onEditar }) {
    const [informes, setInformes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtros, setFiltros] = useState({ obra: '', fecha_desde: '', fecha_hasta: '' });

    const load = useCallback(() => {
        setLoading(true);
        const params = {};
        Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v; });
        api.informes.list(params)
            .then(d => setInformes(Array.isArray(d) ? d : d.results || []))
            .finally(() => setLoading(false));
    }, [filtros]);

    useEffect(() => { load(); }, [load]);

    const eliminar = async (id) => {
        if (!window.confirm('¿Eliminar este informe?')) return;
        await api.informes.remove(id);
        load();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...card, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                    <label style={label}>Obra</label>
                    <select style={input} value={filtros.obra} onChange={e => setFiltros({ ...filtros, obra: e.target.value })}>
                        <option value="">Todas</option>
                        {obras.map(o => <option key={o.id} value={o.id}>{o.codigo} - {o.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label style={label}>Desde</label>
                    <input type="date" style={input} value={filtros.fecha_desde} onChange={e => setFiltros({ ...filtros, fecha_desde: e.target.value })} />
                </div>
                <div>
                    <label style={label}>Hasta</label>
                    <input type="date" style={input} value={filtros.fecha_hasta} onChange={e => setFiltros({ ...filtros, fecha_hasta: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={btnSecondary} onClick={() => setFiltros({ obra: '', fecha_desde: '', fecha_hasta: '' })}>
                        <Filter size={14} /> Limpiar
                    </button>
                    <button style={btnPrimary} onClick={onNuevo}>
                        <Plus size={14} /> Nuevo
                    </button>
                </div>
            </div>

            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            {['Fecha', 'Día', 'Obra', 'Elaborado por', 'Personal', 'H. Lluvia', 'Acciones'].map(h => (
                                <th key={h} style={{ padding: '0.85rem 1rem', textAlign: h === 'Acciones' ? 'right' : 'left', color: '#475569', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Cargando...</td></tr>
                        ) : informes.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                <FileText size={40} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
                                <div>No hay informes. <button onClick={onNuevo} style={{ background: 'none', border: 'none', color: '#667eea', textDecoration: 'underline', cursor: 'pointer' }}>Crear el primero</button></div>
                            </td></tr>
                        ) : informes.map(inf => (
                            <tr key={inf.id} style={{ borderTop: '1px solid #f1f5f9' }}
                                onMouseOver={e => e.currentTarget.style.background = '#fafbff'}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                <td style={{ padding: '0.8rem 1rem', fontWeight: 500 }}>{inf.fecha}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>{inf.dia_semana}</td>
                                <td style={{ padding: '0.8rem 1rem' }}>
                                    <div style={{ fontWeight: 500 }}>{inf.obra_codigo}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{inf.obra_nombre}</div>
                                </td>
                                <td style={{ padding: '0.8rem 1rem', color: '#64748b' }}>{inf.elaborado_por || '—'}</td>
                                <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>{inf.total_personal}</td>
                                <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>{inf.total_horas_lluvia}</td>
                                <td style={{ padding: '0.8rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                    <a href={api.informes.pdfUrl(inf.id)} target="_blank" rel="noopener noreferrer"
                                        style={{ ...btnGhost, background: '#fef2f2', color: '#b91c1c', textDecoration: 'none', marginRight: '0.25rem' }}>
                                        <FileText size={12} /> PDF
                                    </a>
                                    <a href={api.informes.excelUrl(inf.id)} target="_blank" rel="noopener noreferrer"
                                        style={{ ...btnGhost, background: '#f0fdf4', color: '#15803d', textDecoration: 'none', marginRight: '0.25rem' }}>
                                        <FileSpreadsheet size={12} /> Excel
                                    </a>
                                    <button style={{ ...btnGhost, background: '#fffbeb', color: '#b45309', marginRight: '0.25rem' }} onClick={() => onEditar(inf.id)}>
                                        <Edit3 size={12} />
                                    </button>
                                    <button style={{ ...btnGhost, background: '#fef2f2', color: '#b91c1c' }} onClick={() => eliminar(inf.id)}>
                                        <Trash2 size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// =============================================================================
// SUB-VISTA: Formulario
// =============================================================================
function VistaFormulario({ informeId, obras, recursos, categoriasRec, categoriasAct, onBack, onSaved }) {
    const isEdit = !!informeId;
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        obra: '', fecha: new Date().toISOString().substring(0, 10),
        numero_paginas: 1, codigo_formato: 'F-141-IN',
        observaciones_generales: '', estado_terreno_inicio: '', estado_terreno_final: '',
        elaborado_por: '', cargo_elaborado: '', revisado_por: '', cargo_revisado: '',
        detalles: [], reportes_lluvia: [], actividades: [],
        items_obra: [],
        comision_topografia: false,
    });
    const [anexos, setAnexos] = useState([]);
    const [nuevoAnexo, setNuevoAnexo] = useState({ descripcion: '', seccion: 'actividades', file: null });

    useEffect(() => {
        if (!isEdit) {
            setForm(prev => ({ ...prev, comision_topografia: false }));
        } else {
            api.informes.get(informeId).then(d => {
                setForm({
                    ...d,
                    detalles: d.detalles || [],
                    reportes_lluvia: d.reportes_lluvia || [],
                    actividades: d.actividades || [],
                    items_obra: d.items_obra || [],
                    comision_topografia: d.comision_topografia ?? false,
                });
                setAnexos(d.anexos || []);
            });
        }
    }, [informeId, isEdit]);

    const horasLluvia = useMemo(() => {
        const map = {};
        (form.reportes_lluvia || []).forEach(r => map[r.hora] = r.con_lluvia);
        return map;
    }, [form.reportes_lluvia]);

    const toggleHora = (h) => {
        const ex = (form.reportes_lluvia || []).find(r => r.hora === h);
        const nuevos = ex
            ? form.reportes_lluvia.map(r => r.hora === h ? { ...r, con_lluvia: !r.con_lluvia } : r)
            : [...(form.reportes_lluvia || []), { hora: h, con_lluvia: true }];
        setForm({ ...form, reportes_lluvia: nuevos });
    };

    const recursosPorCategoria = useMemo(() => {
        const map = {};
        categoriasRec.forEach(c => map[c.id] = []);
        recursos.forEach(r => {
            if (!map[r.categoria]) map[r.categoria] = [];
            map[r.categoria].push(r);
        });
        return map;
    }, [categoriasRec, recursos]);

    const getCantidadRecurso = (recursoId) => {
        const det = form.detalles.find(d => d.recurso === recursoId);
        return det ? det.cantidad : 0;
    };

    const setCantidadRecurso = (recursoId, cantidad) => {
        setForm(prevForm => {
            const detallesActuales = prevForm.detalles || [];
            const indiceExistente = detallesActuales.findIndex(d => d.recurso === recursoId);
            let nuevosDetalles;
            if (indiceExistente >= 0) {
                nuevosDetalles = detallesActuales.map((d, idx) =>
                    idx === indiceExistente ? { ...d, cantidad } : d
                );
            } else {
                nuevosDetalles = [...detallesActuales, { recurso: recursoId, cantidad }];
            }
            return { ...prevForm, detalles: nuevosDetalles };
        });
    };

    const totalMaquinaria = useMemo(() => {
        const maquinariaCategoria = categoriasRec.find(c =>
            c.nombre.toUpperCase().includes('MAQUINARIA') ||
            c.nombre.toUpperCase().includes('EQUIPO') ||
            c.nombre.toUpperCase().includes('VEHICULO')
        );
        if (!maquinariaCategoria) return 0;
        return recursosPorCategoria[maquinariaCategoria.id]?.reduce((sum, recurso) => {
            const det = form.detalles.find(d => d.recurso === recurso.id);
            return sum + (det ? Number(det.cantidad) || 0 : 0);
        }, 0) || 0;
    }, [form.detalles, categoriasRec, recursosPorCategoria]);

    const totalPersonal = useMemo(() => {
        const personalCategoria = categoriasRec.find(c => c.nombre.toUpperCase().includes('PERSONAL'));
        if (!personalCategoria) return 0;
        return recursosPorCategoria[personalCategoria.id]?.reduce((sum, recurso) => {
            const det = form.detalles.find(d => d.recurso === recurso.id);
            return sum + (det ? Number(det.cantidad) || 0 : 0);
        }, 0) || 0;
    }, [form.detalles, categoriasRec, recursosPorCategoria]);

    const guardar = async () => {
        setSaving(true); setError('');
        try {
            const payload = {
                ...form,
                detalles: form.detalles.filter(d => d.recurso).map(d => ({ recurso: d.recurso, cantidad: Number(d.cantidad || 0) })),
                actividades: form.actividades.filter(a => a.descripcion?.trim()).map((a, i) => ({ categoria: a.categoria, descripcion: a.descripcion, orden: i })),
                reportes_lluvia: (form.reportes_lluvia || []).filter(r => r.con_lluvia),
                items_obra: (form.items_obra || []).filter(i => i.descripcion?.trim()),
                comision_topografia: form.comision_topografia,
            };
            const saved = isEdit
                ? await api.informes.update(informeId, payload)
                : await api.informes.create(payload);
            onSaved(saved.id);
        } catch (err) {
            setError(err.response?.data ? JSON.stringify(err.response.data) : err.message);
        } finally { setSaving(false); }
    };

    const subirFoto = async () => {
        if (!isEdit || !nuevoAnexo.file) return;
        const fd = new FormData();
        fd.append('imagen', nuevoAnexo.file);
        fd.append('descripcion', nuevoAnexo.descripcion);
        fd.append('seccion', nuevoAnexo.seccion);
        const saved = await api.informes.subirAnexo(informeId, fd);
        setAnexos([...anexos, saved]);
        setNuevoAnexo({ descripcion: '', seccion: 'actividades', file: null });
    };

    const Seccion = ({ title, children }) => (
        <div style={card}>
            <h3 style={{
                fontSize: '0.8rem', fontWeight: 700, color: '#667eea',
                marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem',
            }}>{title}</h3>
            {children}
        </div>
    );

    const thStyle = {
        padding: '0.55rem 0.75rem',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        color: 'white', fontWeight: 700, fontSize: '0.72rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        textAlign: 'left',
    };
    const thQty = { ...thStyle, textAlign: 'center', width: '80px' };
    const tdName = (bold) => ({
        padding: '0.45rem 0.75rem', fontSize: '0.82rem',
        color: bold ? '#1e293b' : '#334155',
        fontWeight: bold ? 700 : 400,
        borderBottom: '1px solid #e2e8f0',
    });
    const tdQtyInput = {
        padding: '0.35rem', border: '1px solid #cbd5e0', borderRadius: '6px',
        width: '58px', textAlign: 'center', fontSize: '0.85rem',
        fontWeight: 600, background: 'white',
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button style={btnGhost} onClick={onBack}><ArrowLeft size={14} /></button>
                    <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            {isEdit ? `Editar Informe #${informeId}` : 'Nuevo Informe Diario'}
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Libro Diario de Obra - Formato {form.codigo_formato}</div>
                    </div>
                </div>
                <button style={btnPrimary} onClick={guardar} disabled={saving}>
                    <Save size={14} /> {saving ? 'Guardando...' : 'Guardar Informe'}
                </button>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            {/* Datos generales */}
            <Seccion title="Datos generales">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={label}>Obra *</label>
                        <select required value={form.obra} onChange={e => setForm({ ...form, obra: e.target.value })} style={input}>
                            <option value="">Seleccione obra...</option>
                            {obras.map(o => <option key={o.id} value={o.id}>{o.codigo} - {o.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={label}>Fecha *</label>
                        <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={input} />
                    </div>
                    <div>
                        <label style={label}>N Paginas</label>
                        <input type="number" min={1} value={form.numero_paginas} onChange={e => setForm({ ...form, numero_paginas: parseInt(e.target.value || 1, 10) })} style={input} />
                    </div>
                </div>
            </Seccion>

            {/* Reporte de lluvia */}
            <Seccion title={<><CloudRain size={14} style={{ display: 'inline', marginRight: 6 }} />Reporte de lluvia (horas con lluvia)</>}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {HORAS.map(h => {
                        const active = horasLluvia[h];
                        return (
                            <button type="button" key={h} onClick={() => toggleHora(h)}
                                title={`${h}:00 - ${h + 1}:00`}
                                style={{
                                    width: '48px', height: '48px', borderRadius: '10px',
                                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.15s',
                                    background: active ? 'linear-gradient(135deg, #0284c7 0%, #075985 100%)' : 'white',
                                    color: active ? 'white' : '#475569',
                                    border: `1px solid ${active ? '#0284c7' : '#cbd5e0'}`,
                                    boxShadow: active ? '0 4px 12px rgba(2,132,199,0.3)' : 'none',
                                }}>{h}</button>
                        );
                    })}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#64748b' }}>
                    Total horas con lluvia: <strong>{Object.values(horasLluvia).filter(Boolean).length}</strong>
                </div>
            </Seccion>

            {/* ── Maquinaria, Equipos y Herramientas ── */}
            <div style={{ ...card, padding: '1.25rem' }}>
                <h3 style={{
                    fontSize: '0.8rem', fontWeight: 700, color: '#667eea',
                    marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    <Truck size={14} /> Maquinaria Equipo Herramientas
                </h3>

                {categoriasRec.length === 0 && (
                    <div style={{
                        background: '#fef3c7', border: '1px solid #fcd34d',
                        color: '#92400e', padding: '1rem', borderRadius: '10px',
                        marginBottom: '1rem', fontSize: '0.9rem',
                    }}>
                        <strong>No hay categorias de recursos configuradas.</strong><br />
                        Configura los catálogos desde el backend o el admin de Django.
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowX: 'auto' }}>

                    {/* ── Tabla: Maquinaria ── */}
                    <div>
                        {categoriasRec
                            .filter(c => !c.nombre.toUpperCase().includes('PERSONAL'))
                            .map((categoria) => {
                                const recursosCat = recursosPorCategoria[categoria.id] || [];
                                if (recursosCat.length === 0) return null;
                                const esMaquinaria = categoria.nombre.toUpperCase().includes('MAQUINARIA') ||
                                    categoria.nombre.toUpperCase().includes('EQUIPO') ||
                                    categoria.nombre.toUpperCase().includes('VEHICULO');
                                return (
                                    <table key={categoria.id} style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem' }}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>{categoria.nombre}</th>
                                                <th style={thQty}>Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recursosCat.map((recurso, idx) => (
                                                <tr key={recurso.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                                    <td style={tdName(false)}>{recurso.nombre}</td>
                                                    <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                        <input
                                                            type="number" min={0} step={1}
                                                            value={getCantidadRecurso(recurso.id)}
                                                            onChange={e => setCantidadRecurso(recurso.id, parseInt(e.target.value) || 0)}
                                                            style={tdQtyInput}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            {esMaquinaria && (
                                                <tr style={{ background: '#dbeafe' }}>
                                                    <td style={{ ...tdName(true), color: '#1e40af', borderTop: '2px solid #93c5fd' }}>
                                                        TOTAL
                                                    </td>
                                                    <td style={{ padding: '0.45rem 0.5rem', borderTop: '2px solid #93c5fd', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#1e40af' }}>
                                                        {totalMaquinaria}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                );
                            })}
                    </div>

                    {/* ── Tabla: Personal de Obra ── */}
                    <div>
                        {(() => {
                            const personalCategoria = categoriasRec.find(c => c.nombre.toUpperCase().includes('PERSONAL'));
                            if (!personalCategoria) return null;
                            const recursosCat = recursosPorCategoria[personalCategoria.id] || [];
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#667eea', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Personal de Obra</h4>
                                        <button type="button" style={btnGhost}
                                            onClick={() => setForm(f => ({
                                                ...f,
                                                detalles: [...(f.detalles || []), { recurso: '', cantidad: 0, nombre_custom: '' }],
                                            }))}>
                                            <Plus size={12} /> Agregar fila
                                        </button>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <thead>
                                            <tr>
                                                <th style={thStyle}>Descripcion</th>
                                                <th style={thQty}>Cantidad</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recursosCat.map((recurso, idx) => (
                                                <tr key={recurso.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                                    <td style={tdName(false)}>{recurso.nombre}</td>
                                                    <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                                        <input
                                                            type="number" min={0} step={1}
                                                            value={getCantidadRecurso(recurso.id)}
                                                            onChange={e => setCantidadRecurso(recurso.id, parseInt(e.target.value) || 0)}
                                                            style={tdQtyInput}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr style={{ background: '#f0fdf4' }}>
                                                <td style={{ ...tdName(true), color: '#15803d', borderTop: '2px solid #86efac' }}>
                                                    Total Personal
                                                </td>
                                                <td style={{ padding: '0.45rem 0.5rem', borderTop: '2px solid #86efac', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem', color: '#15803d' }}>
                                                    {totalPersonal}
                                                </td>
                                            </tr>
                                            <tr style={{ background: '#fffbeb' }}>
                                                <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.82rem', fontWeight: 600, color: '#92400e', borderBottom: '1px solid #fcd34d' }}>
                                                    COMISION DE TOPOGRAFIA
                                                </td>
                                                <td style={{ padding: '0.45rem 0.5rem', borderBottom: '1px solid #fcd34d', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 600 }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: '#15803d' }}>
                                                            <input type="radio" name="comision_topografia"
                                                                checked={form.comision_topografia === true}
                                                                onChange={() => setForm(f => ({ ...f, comision_topografia: true }))} />
                                                            SI
                                                        </label>
                                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', color: '#dc2626' }}>
                                                            <input type="radio" name="comision_topografia"
                                                                checked={form.comision_topografia === false}
                                                                onChange={() => setForm(f => ({ ...f, comision_topografia: false }))} />
                                                            NO
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* ── Tabla ITEM / DESCRIPCION / EMPRESA / CANTIDAD ── */}
            <div style={{ ...card, padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{
                        fontSize: '0.8rem', fontWeight: 700, color: '#667eea',
                        textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
                    }}>
                        <ClipboardList size={14} style={{ display: 'inline', marginRight: 6 }} />
                        Items de Obra
                    </h3>
                    <button type="button" style={btnGhost}
                        onClick={() => setForm(f => ({
                            ...f,
                            items_obra: [...(f.items_obra || []), { item: '', descripcion: '', empresa: '', cantidad: 0 }],
                        }))}>
                        <Plus size={12} /> Agregar fila
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <thead>
                        <tr>
                            <th style={{ ...thStyle, width: '80px' }}>Item</th>
                            <th style={thStyle}>Descripción</th>
                            <th style={{ ...thStyle, width: '180px' }}>Empresa</th>
                            <th style={{ ...thQty }}>Cantidad</th>
                            <th style={{ ...thStyle, width: '40px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {(form.items_obra || []).length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    Sin items. Haz clic en "Agregar fila".
                                </td>
                            </tr>
                        ) : (form.items_obra || []).map((it, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                                <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <input
                                        type="text"
                                        value={it.item}
                                        onChange={e => {
                                            const arr = [...form.items_obra];
                                            arr[idx] = { ...arr[idx], item: e.target.value };
                                            setForm(f => ({ ...f, items_obra: arr }));
                                        }}
                                        style={{ ...tdQtyInput, width: '60px' }}
                                        placeholder="1"
                                    />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <input
                                        type="text"
                                        value={it.descripcion}
                                        onChange={e => {
                                            const arr = [...form.items_obra];
                                            arr[idx] = { ...arr[idx], descripcion: e.target.value };
                                            setForm(f => ({ ...f, items_obra: arr }));
                                        }}
                                        style={{ ...input, padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                                        placeholder="Descripción del item..."
                                    />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0' }}>
                                    <input
                                        type="text"
                                        value={it.empresa}
                                        onChange={e => {
                                            const arr = [...form.items_obra];
                                            arr[idx] = { ...arr[idx], empresa: e.target.value };
                                            setForm(f => ({ ...f, items_obra: arr }));
                                        }}
                                        style={{ ...input, padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                                        placeholder="Empresa..."
                                    />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <input
                                        type="number" min={0}
                                        value={it.cantidad}
                                        onChange={e => {
                                            const arr = [...form.items_obra];
                                            arr[idx] = { ...arr[idx], cantidad: parseFloat(e.target.value) || 0 };
                                            setForm(f => ({ ...f, items_obra: arr }));
                                        }}
                                        style={tdQtyInput}
                                    />
                                </td>
                                <td style={{ padding: '0.35rem 0.5rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <button type="button"
                                        onClick={() => setForm(f => ({ ...f, items_obra: f.items_obra.filter((_, i) => i !== idx) }))}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.25rem' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Observaciones generales */}
            <Seccion title="Observaciones generales">
                <textarea rows={3} value={form.observaciones_generales}
                    onChange={e => setForm({ ...form, observaciones_generales: e.target.value })}
                    style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="Observaciones generales del dia..." />
            </Seccion>

            {/* Estado del terreno */}
            <Seccion title="Estado del terreno o zona de trabajo">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={label}>Al inicio de la jornada</label>
                        <textarea rows={3} value={form.estado_terreno_inicio}
                            onChange={e => setForm({ ...form, estado_terreno_inicio: e.target.value })}
                            style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Riesgo fisico y locativo al inicio..." />
                    </div>
                    <div>
                        <label style={label}>Al final de la jornada</label>
                        <textarea rows={3} value={form.estado_terreno_final}
                            onChange={e => setForm({ ...form, estado_terreno_final: e.target.value })}
                            style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Riesgo fisico y locativo al final..." />
                    </div>
                </div>
            </Seccion>

            {/* Actividades del día */}
            <Seccion title={<><ClipboardList size={14} style={{ display: 'inline', marginRight: 6 }} />Actividades del dia</>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {categoriasAct.filter(c => c.activo !== false).map(cat => {
                        const items = form.actividades.map((a, idx) => ({ a, idx })).filter(({ a }) => String(a.categoria) === String(cat.id));
                        return (
                            <div key={cat.id} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{cat.nombre}</h4>
                                    <button type="button" style={btnGhost}
                                        onClick={() => setForm({ ...form, actividades: [...form.actividades, { categoria: cat.id, descripcion: '', orden: form.actividades.length }] })}>
                                        <Plus size={12} /> Agregar
                                    </button>
                                </div>
                                {items.length === 0 ? (
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Sin actividades.</p>
                                ) : (
                                    <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {items.map(({ a, idx }) => (
                                            <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                <textarea rows={1} value={a.descripcion}
                                                    onChange={e => { const c = [...form.actividades]; c[idx] = { ...c[idx], descripcion: e.target.value }; setForm({ ...form, actividades: c }); }}
                                                    style={{ ...input, flex: 1, minHeight: '38px', fontFamily: 'inherit', resize: 'vertical' }}
                                                    placeholder="Describa la actividad..." />
                                                <button type="button" onClick={() => setForm({ ...form, actividades: form.actividades.filter((_, i) => i !== idx) })}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.5rem' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Seccion>

            {/* Firmas */}
            <Seccion title="Firmas">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div><label style={label}>Elaborado por</label><input style={input} value={form.elaborado_por} onChange={e => setForm({ ...form, elaborado_por: e.target.value })} /></div>
                    <div><label style={label}>Cargo</label><input style={input} value={form.cargo_elaborado} onChange={e => setForm({ ...form, cargo_elaborado: e.target.value })} /></div>
                    <div><label style={label}>Revisado por</label><input style={input} value={form.revisado_por} onChange={e => setForm({ ...form, revisado_por: e.target.value })} /></div>
                    <div><label style={label}>Cargo</label><input style={input} value={form.cargo_revisado} onChange={e => setForm({ ...form, cargo_revisado: e.target.value })} /></div>
                </div>
            </Seccion>

            {/* Anexos fotográficos */}
            {isEdit ? (
                <Seccion title={<><ImageIcon size={14} style={{ display: 'inline', marginRight: 6 }} />Anexos fotograficos</>}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                        <div>
                            <label style={label}>Seccion</label>
                            <select style={input} value={nuevoAnexo.seccion} onChange={e => setNuevoAnexo({ ...nuevoAnexo, seccion: e.target.value })}>
                                <option value="actividades">Actividades</option>
                                <option value="sst">SST y Medio Ambiente</option>
                            </select>
                        </div>
                        <div>
                            <label style={label}>Descripcion</label>
                            <input style={input} value={nuevoAnexo.descripcion} onChange={e => setNuevoAnexo({ ...nuevoAnexo, descripcion: e.target.value })} />
                        </div>
                        <div>
                            <label style={label}>Archivo</label>
                            <input type="file" accept="image/*" onChange={e => setNuevoAnexo({ ...nuevoAnexo, file: e.target.files?.[0] || null })}
                                style={{ ...input, padding: '0.4rem' }} />
                        </div>
                        <button type="button" style={btnPrimary} onClick={subirFoto} disabled={!nuevoAnexo.file}>
                            <Upload size={14} /> Subir foto
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '1.25rem' }}>
                        {anexos.map(a => (
                            <div key={a.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white' }}>
                                {a.imagen_url ? (
                                    <img src={a.imagen_url} alt={a.descripcion} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ height: '120px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ImageIcon size={28} color="#94a3b8" />
                                    </div>
                                )}
                                <div style={{ padding: '0.5rem' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#667eea', textTransform: 'uppercase' }}>{a.seccion}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.descripcion}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Seccion>
            ) : (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    Guarda primero el informe para poder subir anexos fotograficos.
                </div>
            )}
        </div>
    );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
const Informediarioproy = () => {
    const [vista, setVista] = useState('dashboard');
    const [informeId, setInformeId] = useState(null);
    const [obraFiltro, setObraFiltro] = useState('');

    const [obras, setObras] = useState([]);
    const [catRec, setCatRec] = useState([]);
    const [recursos, setRecursos] = useState([]);
    const [catAct, setCatAct] = useState([]);

    const reloadCatalogos = useCallback(() => {
        api.obras.list().then(setObras).catch(() => {});
        api.catRec.list().then(setCatRec).catch(() => {});
        api.recursos.list().then(setRecursos).catch(() => {});
        api.catAct.list().then(setCatAct).catch(() => {});
    }, []);

    useEffect(() => { reloadCatalogos(); }, [reloadCatalogos]);

    const tabs = [
        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { key: 'lista', label: 'Informes', icon: FileText },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '1.5rem' }}>
            <div style={{ ...card, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            Informe Diario de Obra
                        </h1>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                            Libro Diario de Obra - Formato F-141-IN - Interventoria
                        </p>
                    </div>
                </div>
                {vista !== 'form' && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                        {tabs.map(t => (
                            <button key={t.key} onClick={() => setVista(t.key)} style={tabStyle(vista === t.key)}>
                                <t.icon size={14} /> {t.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {vista === 'dashboard' && (
                <VistaDashboard obras={obras} obraFiltro={obraFiltro} setObraFiltro={setObraFiltro} />
            )}
            {vista === 'lista' && (
                <VistaLista obras={obras}
                    onNuevo={() => { setInformeId(null); setVista('form'); }}
                    onEditar={id => { setInformeId(id); setVista('form'); }} />
            )}
            {vista === 'form' && (
                <VistaFormulario informeId={informeId} obras={obras}
                    recursos={recursos} categoriasRec={catRec} categoriasAct={catAct}
                    onBack={() => setVista('lista')}
                    onSaved={(id) => { setInformeId(id); }} />
            )}
        </div>
    );
};

export default Informediarioproy;
