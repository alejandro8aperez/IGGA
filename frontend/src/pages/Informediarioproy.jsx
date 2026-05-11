// =============================================================================
// Informediarioproy.jsx — ERP 8AMPERIOS
// Módulo Informe Diario de Obra (Formato F-141-IN)
// Conectado al backend Django app `informe_diario` en /api/informe-diario/
// Incluye: Dashboard, Lista, Formulario completo, Catálogos en una sola página.
// =============================================================================
import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    FileText, Plus, X, Edit3, Trash2, Calendar, Users, Truck, ClipboardList,
    Download, FileSpreadsheet, LayoutDashboard, Settings, Save, ArrowLeft,
    Upload, CloudRain, Filter, Image as ImageIcon,
} from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { API } from '../config/api';

const ID = API.INFORME_DIARIO;
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

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
        create: (d) => axios.post(ID.OBRAS, d).then(r => r.data),
        update: (id, d) => axios.put(`${ID.OBRAS}${id}/`, d).then(r => r.data),
        remove: (id) => axios.delete(`${ID.OBRAS}${id}/`),
    },
    catRec: {
        list: () => axios.get(ID.CATEGORIAS_RECURSOS).then(r => r.data),
        create: (d) => axios.post(ID.CATEGORIAS_RECURSOS, d).then(r => r.data),
        update: (id, d) => axios.put(`${ID.CATEGORIAS_RECURSOS}${id}/`, d).then(r => r.data),
        remove: (id) => axios.delete(`${ID.CATEGORIAS_RECURSOS}${id}/`),
    },
    recursos: {
        list: () => axios.get(ID.RECURSOS).then(r => r.data),
        create: (d) => axios.post(ID.RECURSOS, d).then(r => r.data),
        update: (id, d) => axios.put(`${ID.RECURSOS}${id}/`, d).then(r => r.data),
        remove: (id) => axios.delete(`${ID.RECURSOS}${id}/`),
    },
    catAct: {
        list: () => axios.get(ID.CATEGORIAS_ACTIVIDADES).then(r => r.data),
        create: (d) => axios.post(ID.CATEGORIAS_ACTIVIDADES, d).then(r => r.data),
        update: (id, d) => axios.put(`${ID.CATEGORIAS_ACTIVIDADES}${id}/`, d).then(r => r.data),
        remove: (id) => axios.delete(`${ID.CATEGORIAS_ACTIVIDADES}${id}/`),
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
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Cargando…</td></tr>
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
    });
    const [anexos, setAnexos] = useState([]);
    const [nuevoAnexo, setNuevoAnexo] = useState({ descripcion: '', seccion: 'actividades', file: null });

    useEffect(() => {
        if (!isEdit) {
            const detallesIniciales = recursos.map(r => ({
                recurso: r.id,
                cantidad: 0
            }));
            setForm(prev => ({
                ...prev,
                detalles: detallesIniciales
            }));
        } else {
            api.informes.get(informeId).then(d => {
                setForm({
                    ...d,
                    detalles: d.detalles || [],
                    reportes_lluvia: d.reportes_lluvia || [],
                    actividades: d.actividades || [],
                });
                setAnexos(d.anexos || []);
            });
        }
    }, [informeId, isEdit, recursos]);

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
        recursos.forEach(r => { if (!map[r.categoria]) map[r.categoria] = []; map[r.categoria].push(r); });
        return map;
    }, [categoriasRec, recursos]);

    const guardar = async () => {
        setSaving(true); setError('');
        try {
            const payload = {
                ...form,
                detalles: form.detalles.filter(d => d.recurso).map(d => ({ recurso: d.recurso, cantidad: Number(d.cantidad || 0) })),
                actividades: form.actividades.filter(a => a.descripcion?.trim()).map((a, i) => ({ categoria: a.categoria, descripcion: a.descripcion, orden: i })),
                reportes_lluvia: (form.reportes_lluvia || []).filter(r => r.con_lluvia),
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button style={btnGhost} onClick={onBack}><ArrowLeft size={14} /></button>
                    <div>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                            {isEdit ? `Editar Informe #${informeId}` : 'Nuevo Informe Diario'}
                        </h2>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Libro Diario de Obra · Formato {form.codigo_formato}</div>
                    </div>
                </div>
                <button style={btnPrimary} onClick={guardar} disabled={saving}>
                    <Save size={14} /> {saving ? 'Guardando…' : 'Guardar Informe'}
                </button>
            </div>

            {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                    {error}
                </div>
            )}

            <Seccion title="Datos generales">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={label}>Obra *</label>
                        <select required value={form.obra} onChange={e => setForm({ ...form, obra: e.target.value })} style={input}>
                            <option value="">Seleccione obra…</option>
                            {obras.map(o => <option key={o.id} value={o.id}>{o.codigo} - {o.nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={label}>Fecha *</label>
                        <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} style={input} />
                    </div>
                    <div>
                        <label style={label}>N° páginas</label>
                        <input type="number" min={1} value={form.numero_paginas} onChange={e => setForm({ ...form, numero_paginas: parseInt(e.target.value || 1, 10) })} style={input} />
                    </div>
                </div>
            </Seccion>

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

            <Seccion title={<><Truck size={14} style={{ display: 'inline', marginRight: 6 }} />Maquinaria, equipos, vehículos y personal</>}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Agrega cantidades por recurso. Configura los recursos en la pestaña Catálogos.</span>
                    <button type="button" style={btnGhost}
                        onClick={() => setForm({ ...form, detalles: [...form.detalles, { recurso: '', cantidad: 0 }] })}>
                        <Plus size={12} /> Agregar fila
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead style={{ background: '#f8fafc' }}>
                        <tr>
                            <th style={{ padding: '0.6rem', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>Recurso</th>
                            <th style={{ padding: '0.6rem', textAlign: 'right', color: '#64748b', fontWeight: 600, width: '120px' }}>Cantidad</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.detalles.length === 0 && (
                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>Sin recursos asignados.</td></tr>
                        )}
                        {form.detalles.map((d, idx) => (
                            <tr key={idx} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.4rem' }}>
                                    <select value={d.recurso || ''} onChange={e => {
                                        const c = [...form.detalles]; c[idx] = { ...c[idx], recurso: e.target.value }; setForm({ ...form, detalles: c });
                                    }} style={input}>
                                        <option value="">— Seleccione recurso —</option>
                                        {categoriasRec.map(cat => (
                                            <optgroup key={cat.id} label={cat.nombre}>
                                                {(recursosPorCategoria[cat.id] || []).map(r => (
                                                    <option key={r.id} value={r.id}>{r.nombre}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '0.4rem' }}>
                                    <input type="number" step="0.01" value={d.cantidad}
                                        onChange={e => {
                                            const c = [...form.detalles]; c[idx] = { ...c[idx], cantidad: e.target.value }; setForm({ ...form, detalles: c });
                                        }}
                                        style={{ ...input, textAlign: 'right' }} />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button type="button" onClick={() => setForm({ ...form, detalles: form.detalles.filter((_, i) => i !== idx) })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.3rem' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Seccion>

            <Seccion title="Observaciones generales">
                <textarea rows={3} value={form.observaciones_generales}
                    onChange={e => setForm({ ...form, observaciones_generales: e.target.value })}
                    style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                    placeholder="Observaciones generales del día…" />
            </Seccion>

            <Seccion title="Estado del terreno o zona de trabajo">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={label}>Al inicio de la jornada</label>
                        <textarea rows={3} value={form.estado_terreno_inicio}
                            onChange={e => setForm({ ...form, estado_terreno_inicio: e.target.value })}
                            style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Riesgo físico y locativo al inicio…" />
                    </div>
                    <div>
                        <label style={label}>Al final de la jornada</label>
                        <textarea rows={3} value={form.estado_terreno_final}
                            onChange={e => setForm({ ...form, estado_terreno_final: e.target.value })}
                            style={{ ...input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                            placeholder="Riesgo físico y locativo al final…" />
                    </div>
                </div>
            </Seccion>

            <Seccion title={<><ClipboardList size={14} style={{ display: 'inline', marginRight: 6 }} />Actividades del día</>}>
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
                                                    placeholder="Describa la actividad…" />
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

            <Seccion title="Firmas">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div><label style={label}>Elaborado por</label><input style={input} value={form.elaborado_por} onChange={e => setForm({ ...form, elaborado_por: e.target.value })} /></div>
                    <div><label style={label}>Cargo</label><input style={input} value={form.cargo_elaborado} onChange={e => setForm({ ...form, cargo_elaborado: e.target.value })} /></div>
                    <div><label style={label}>Revisado por</label><input style={input} value={form.revisado_por} onChange={e => setForm({ ...form, revisado_por: e.target.value })} /></div>
                    <div><label style={label}>Cargo</label><input style={input} value={form.cargo_revisado} onChange={e => setForm({ ...form, cargo_revisado: e.target.value })} /></div>
                </div>
            </Seccion>

            {isEdit ? (
                <Seccion title={<><ImageIcon size={14} style={{ display: 'inline', marginRight: 6 }} />Anexos fotográficos</>}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                        <div>
                            <label style={label}>Sección</label>
                            <select style={input} value={nuevoAnexo.seccion} onChange={e => setNuevoAnexo({ ...nuevoAnexo, seccion: e.target.value })}>
                                <option value="actividades">Actividades</option>
                                <option value="sst">SST y Medio Ambiente</option>
                            </select>
                        </div>
                        <div>
                            <label style={label}>Descripción</label>
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
                    💡 Guarda primero el informe para poder subir anexos fotográficos.
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SUB-VISTA: Catálogos (CRUD inline)
// =============================================================================
function Catalogo({ titulo, items, columns, onCreate, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(null);
    const start = () => {
        const empty = {}; columns.forEach(c => empty[c.key] = c.default ?? '');
        setEditing({ ...empty, __new: true });
    };
    const save = async () => {
        const d = { ...editing }; delete d.__new;
        if (editing.__new) await onCreate(d); else await onUpdate(editing.id, d);
        setEditing(null);
    };

    return (
        <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{titulo}</h3>
                <button style={btnPrimary} onClick={start}><Plus size={14} /> Nuevo</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead style={{ background: '#f8fafc' }}>
                    <tr>
                        {columns.map(c => <th key={c.key} style={{ padding: '0.6rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{c.label}</th>)}
                        <th style={{ width: '100px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {editing?.__new && (
                        <tr style={{ background: '#fef3c7' }}>
                            {columns.map(c => (
                                <td key={c.key} style={{ padding: '0.4rem' }}>
                                    {c.type === 'select' ? (
                                        <select style={input} value={editing[c.key] ?? ''} onChange={e => setEditing({ ...editing, [c.key]: e.target.value })}>
                                            <option value="">—</option>
                                            {c.options?.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                        </select>
                                    ) : c.type === 'boolean' ? (
                                        <input type="checkbox" checked={!!editing[c.key]} onChange={e => setEditing({ ...editing, [c.key]: e.target.checked })} />
                                    ) : (
                                        <input type={c.type === 'number' ? 'number' : 'text'} style={input} value={editing[c.key] ?? ''} onChange={e => setEditing({ ...editing, [c.key]: e.target.value })} />
                                    )}
                                </td>
                            ))}
                            <td style={{ textAlign: 'right' }}>
                                <button onClick={save} style={{ ...btnGhost, background: '#dcfce7', color: '#15803d', marginRight: '0.25rem' }}><Save size={12} /></button>
                                <button onClick={() => setEditing(null)} style={btnGhost}><X size={12} /></button>
                            </td>
                        </tr>
                    )}
                    {items.map(item => editing?.id === item.id ? (
                        <tr key={item.id} style={{ background: '#fef3c7' }}>
                            {columns.map(c => (
                                <td key={c.key} style={{ padding: '0.4rem' }}>
                                    {c.type === 'select' ? (
                                        <select style={input} value={editing[c.key] ?? ''} onChange={e => setEditing({ ...editing, [c.key]: e.target.value })}>
                                            <option value="">—</option>
                                            {c.options?.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                        </select>
                                    ) : c.type === 'boolean' ? (
                                        <input type="checkbox" checked={!!editing[c.key]} onChange={e => setEditing({ ...editing, [c.key]: e.target.checked })} />
                                    ) : (
                                        <input type={c.type === 'number' ? 'number' : 'text'} style={input} value={editing[c.key] ?? ''} onChange={e => setEditing({ ...editing, [c.key]: e.target.value })} />
                                    )}
                                </td>
                            ))}
                            <td style={{ textAlign: 'right' }}>
                                <button onClick={save} style={{ ...btnGhost, background: '#dcfce7', color: '#15803d', marginRight: '0.25rem' }}><Save size={12} /></button>
                                <button onClick={() => setEditing(null)} style={btnGhost}><X size={12} /></button>
                            </td>
                        </tr>
                    ) : (
                        <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            {columns.map(c => (
                                <td key={c.key} style={{ padding: '0.7rem', color: '#475569' }}>
                                    {c.render ? c.render(item) : c.type === 'boolean' ? (item[c.key] ? 'Sí' : 'No') : item[c.key]}
                                </td>
                            ))}
                            <td style={{ textAlign: 'right', padding: '0.5rem' }}>
                                <button style={{ ...btnGhost, background: '#fffbeb', color: '#b45309', marginRight: '0.25rem' }} onClick={() => setEditing({ ...item })}><Edit3 size={12} /></button>
                                <button style={{ ...btnGhost, background: '#fef2f2', color: '#b91c1c' }} onClick={() => { if (window.confirm('¿Eliminar?')) onDelete(item.id); }}><Trash2 size={12} /></button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && !editing?.__new && (
                        <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>Sin registros.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function VistaCatalogos({ obras, catRec, recursos, catAct, reload }) {
    const [tab, setTab] = useState('obras');
    const tabs = [
        { key: 'obras', label: 'Obras' },
        { key: 'catRec', label: 'Cat. Recursos' },
        { key: 'recursos', label: 'Recursos' },
        { key: 'catAct', label: 'Cat. Actividades' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #e2e8f0' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(tab === t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>
            {tab === 'obras' && (
                <Catalogo titulo="Obras" items={obras}
                    columns={[
                        { key: 'codigo', label: 'Código' },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'ubicacion', label: 'Ubicación' },
                        { key: 'cliente', label: 'Cliente' },
                        { key: 'activo', label: 'Activo', type: 'boolean', default: true },
                    ]}
                    onCreate={d => api.obras.create(d).then(reload)}
                    onUpdate={(id, d) => api.obras.update(id, d).then(reload)}
                    onDelete={id => api.obras.remove(id).then(reload)} />
            )}
            {tab === 'catRec' && (
                <Catalogo titulo="Categorías de Recursos" items={catRec}
                    columns={[
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'orden', label: 'Orden', type: 'number', default: 0 },
                    ]}
                    onCreate={d => api.catRec.create(d).then(reload)}
                    onUpdate={(id, d) => api.catRec.update(id, d).then(reload)}
                    onDelete={id => api.catRec.remove(id).then(reload)} />
            )}
            {tab === 'recursos' && (
                <Catalogo titulo="Recursos" items={recursos}
                    columns={[
                        { key: 'categoria', label: 'Categoría', type: 'select',
                            options: catRec.map(c => ({ id: c.id, label: c.nombre })),
                            render: item => item.categoria_nombre },
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'unidad', label: 'Unidad', default: 'unidad' },
                        { key: 'orden', label: 'Orden', type: 'number', default: 0 },
                        { key: 'activo', label: 'Activo', type: 'boolean', default: true },
                    ]}
                    onCreate={d => api.recursos.create(d).then(reload)}
                    onUpdate={(id, d) => api.recursos.update(id, d).then(reload)}
                    onDelete={id => api.recursos.remove(id).then(reload)} />
            )}
            {tab === 'catAct' && (
                <Catalogo titulo="Categorías de Actividades" items={catAct}
                    columns={[
                        { key: 'nombre', label: 'Nombre' },
                        { key: 'orden', label: 'Orden', type: 'number', default: 0 },
                        { key: 'activo', label: 'Activo', type: 'boolean', default: true },
                    ]}
                    onCreate={d => api.catAct.create(d).then(reload)}
                    onUpdate={(id, d) => api.catAct.update(id, d).then(reload)}
                    onDelete={id => api.catAct.remove(id).then(reload)} />
            )}
        </div>
    );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================
const Informediarioproy = () => {
    const [vista, setVista] = useState('dashboard'); // dashboard | lista | form | catalogos
    const [informeId, setInformeId] = useState(null);
    const [obraFiltro, setObraFiltro] = useState('');

    // Catálogos cargados en memoria
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
        { key: 'catalogos', label: 'Catálogos', icon: Settings },
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
                            Libro Diario de Obra · Formato F-141-IN · Interventoría
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
                    onSaved={(id) => { setInformeId(id); /* permanece en form para subir anexos */ }} />
            )}
            {vista === 'catalogos' && (
                <VistaCatalogos obras={obras} catRec={catRec} recursos={recursos} catAct={catAct}
                    reload={reloadCatalogos} />
            )}
        </div>
    );
};

export default Informediarioproy;
