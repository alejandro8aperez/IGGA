import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axiosConfig';
import { API } from '../config/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, Plus, Eye, Trash2, Save, Loader2, Calendar,
  FileText, ClipboardList, ChevronDown, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

const C = {
  bg: '#0f172a',
  card: '#1e293b',
  border: '#1e3a5f',
  accent: 'linear-gradient(135deg,#667eea,#764ba2)',
  text: '#e2e8f0',
  textSec: '#94a3b8',
  inputBg: '#0f172a',
  inputBorder: '#1e3a5f',
  danger: '#ef4444',
  success: '#22c55e',
  blue: '#3b82f6',
  headerBg: '#1e293b',
};

const inpStyle = {
  background: C.inputBg, border: `1px solid ${C.inputBorder}`, color: C.text,
  padding: '0.55rem 0.75rem', borderRadius: 8, fontSize: '0.85rem', width: '100%',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle = { color: C.textSec, fontSize: '0.75rem', fontWeight: 600, marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.03em' };

export default function InformeSemanalPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('list');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [formData, setFormData] = useState({ proyecto_id: '', fecha_inicio: '', fecha_fin: '' });
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchReports();
    fetchProyectos();
    fetchEmpleados();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(API.INFORME_PERIODICO.SEMANALES);
      setReports(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      setError('Error al cargar informes semanales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProyectos = async () => {
    try {
      const res = await axiosInstance.get(API.OPERACIONES.PROYECTOS);
      setProyectos(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('Error cargando proyectos:', err);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axiosInstance.get(API.RRHH.EMPLEADOS);
      setEmpleados(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error('Error cargando empleados:', err);
    }
  };

  const goToList = () => {
    setMode('list');
    setSelectedReport(null);
    setEditData({});
    setError(null);
    fetchReports();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.proyecto_id || !formData.fecha_inicio || !formData.fecha_fin) return;
    try {
      setGenerating(true);
      setError(null);
      const res = await axiosInstance.post(API.INFORME_PERIODICO.GENERAR_SEMANAL, {
        proyecto_id: formData.proyecto_id,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
      });
      const report = res.data;
      setSelectedReport(report);
      setEditData({ ...report });
      setMode('view');
    } catch (err) {
      setError('Error al generar informe semanal');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(API.INFORME_PERIODICO.SEMANAL_DETAIL(id));
      const report = res.data;
      setSelectedReport(report);
      setEditData({ ...report });
      setMode('view');
    } catch (err) {
      setError('Error al cargar detalle del informe');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este informe semanal?')) return;
    try {
      await axiosInstance.delete(API.INFORME_PERIODICO.SEMANAL_DETAIL(id));
      fetchReports();
    } catch (err) {
      setError('Error al eliminar informe');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedReport?.id) return;
    try {
      setSaving(true);
      setError(null);
      const payload = {
        resumen_ejecutivo: editData.resumen_ejecutivo || '',
        logros_principales: editData.logros_principales || '',
        dificultades: editData.dificultades || '',
        observaciones: editData.observaciones || '',
        estado_del_terreno: editData.estado_del_terreno || '',
        status: editData.status || 'borrador',
        firma_elaborado: editData.firma_elaborado || null,
        firma_revisado: editData.firma_revisado || null,
        firma_profesional1: editData.firma_profesional1 || null,
        firma_profesional2: editData.firma_profesional2 || null,
      };
      const res = await axiosInstance.put(API.INFORME_PERIODICO.SEMANAL_DETAIL(selectedReport.id), payload);
      setSelectedReport(res.data);
      setEditData({ ...res.data });
    } catch (err) {
      setError('Error al guardar informe');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const statusColors = {
    borrador: '#94a3b8',
    enviado: '#3b82f6',
    aprobado: '#22c55e',
  };

  const renderStatusBadge = (status) => {
    const color = statusColors[status] || '#94a3b8';
    return (
      <span style={{
        background: color + '22', color, padding: '2px 10px', borderRadius: 12,
        fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
        border: `1px solid ${color}44`,
      }}>
        {status || 'borrador'}
      </span>
    );
  };

  if (mode === 'list') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', padding: '0.25rem' }}>
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ClipboardList size={24} style={{ color: '#667eea' }} />
                  Informes Semanales
                </h1>
                <p style={{ margin: '2px 0 0', color: C.textSec, fontSize: '0.8rem' }}>Curva S - Reportes semanales de avance</p>
              </div>
            </div>
            <button
              onClick={() => setMode('generate')}
              style={{
                background: C.accent, border: 'none', color: '#fff', padding: '0.6rem 1.2rem',
                borderRadius: 10, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              <Plus size={18} />
              Generar Nuevo
            </button>
          </div>

          {error && (
            <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Semana</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Proyecto</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Fecha inicio</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Fecha fin</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Avance Programado</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Avance Ejecutado</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: C.textSec, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center' }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#667eea' }} />
                        <p style={{ color: C.textSec, marginTop: '0.5rem' }}>Cargando informes...</p>
                      </td>
                    </tr>
                  ) : reports.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: C.textSec }}>
                        <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                        <p>No hay informes semanales registrados</p>
                      </td>
                    </tr>
                  ) : reports.map((r, i) => (
                    <tr key={r.id || i} style={{
                      borderBottom: `1px solid ${C.border}33`,
                      background: i % 2 === 1 ? '#ffffff04' : 'transparent',
                    }}>
                      <td style={{ padding: '0.7rem 1rem', fontWeight: 700 }}>{r.semana || '-'}</td>
                      <td style={{ padding: '0.7rem 1rem', color: C.textSec }}>{r.proyecto_nombre || r.proyecto || '-'}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{r.fecha_inicio || '-'}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{r.fecha_fin || '-'}</td>
                      <td style={{ padding: '0.7rem 1rem' }}>{renderStatusBadge(r.status)}</td>
                      <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                        <span style={{ color: C.success, fontWeight: 700 }}>{r.avance_programado != null ? `${r.avance_programado}%` : '-'}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                        <span style={{ color: C.blue, fontWeight: 700 }}>{r.avance_ejecutado != null ? `${r.avance_ejecutado}%` : '-'}</span>
                      </td>
                      <td style={{ padding: '0.7rem 1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button onClick={() => handleView(r.id)} style={{
                            background: '#667eea22', border: '1px solid #667eea44', color: '#667eea',
                            padding: '0.3rem 0.6rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600,
                          }}>
                            <Eye size={14} /> Ver
                          </button>
                          <button onClick={() => handleDelete(r.id)} style={{
                            background: '#ef444422', border: '1px solid #ef444444', color: C.danger,
                            padding: '0.3rem 0.6rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600,
                          }}>
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'generate') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button onClick={goToList} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', padding: '0.25rem' }}>
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={24} style={{ color: '#667eea' }} />
              Generar Nuevo Informe Semanal
            </h1>
          </div>

          {error && (
            <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Proyecto</label>
              <select
                value={formData.proyecto_id}
                onChange={e => setFormData(p => ({ ...p, proyecto_id: e.target.value }))}
                style={inpStyle}
                required
              >
                <option value="">Seleccionar proyecto...</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre || p.codigo || p.id}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Fecha inicio</label>
                <input
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={e => setFormData(p => ({ ...p, fecha_inicio: e.target.value }))}
                  style={inpStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Fecha fin</label>
                <input
                  type="date"
                  value={formData.fecha_fin}
                  onChange={e => setFormData(p => ({ ...p, fecha_fin: e.target.value }))}
                  style={inpStyle}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={generating}
              style={{
                background: C.accent, border: 'none', color: '#fff', padding: '0.7rem 1.5rem',
                borderRadius: 10, fontWeight: 700, fontSize: '0.9rem', cursor: generating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: generating ? 0.7 : 1, width: '100%',
                justifyContent: 'center',
              }}
            >
              {generating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Calendar size={18} />}
              {generating ? 'Generando informe...' : 'Generar Informe desde Diarios'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(editData.curva_s_data) ? editData.curva_s_data.map((p, i) => ({
    fecha: p.fecha || `Día ${i + 1}`,
    programado: p.programado ?? 0,
    ejecutado: p.ejecutado ?? 0,
  })) : [];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, padding: '1.5rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={goToList} style={{ background: 'none', border: 'none', color: C.textSec, cursor: 'pointer', padding: '0.25rem' }}>
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={24} style={{ color: '#667eea' }} />
                Informe Semanal {selectedReport?.semana ? `#${selectedReport.semana}` : ''}
              </h1>
              <p style={{ margin: '2px 0 0', color: C.textSec, fontSize: '0.8rem' }}>
                {selectedReport?.proyecto_nombre || selectedReport?.proyecto || ''}
                {' — '}
                {selectedReport?.fecha_inicio || ''} a {selectedReport?.fecha_fin || ''}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {renderStatusBadge(editData.status || selectedReport?.status)}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: C.accent, border: 'none', color: '#fff', padding: '0.6rem 1.2rem',
                borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '0.75rem 1rem', color: '#ef4444', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} style={{ color: '#667eea' }} />
              Detalles del Informe
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Resumen ejecutivo</label>
                <textarea
                  rows={3}
                  value={editData.resumen_ejecutivo || ''}
                  onChange={e => handleEditChange('resumen_ejecutivo', e.target.value)}
                  style={{ ...inpStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Logros principales</label>
                <textarea
                  rows={3}
                  value={editData.logros_principales || ''}
                  onChange={e => handleEditChange('logros_principales', e.target.value)}
                  style={{ ...inpStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Dificultades</label>
                <textarea
                  rows={3}
                  value={editData.dificultades || ''}
                  onChange={e => handleEditChange('dificultades', e.target.value)}
                  style={{ ...inpStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Observaciones</label>
                <textarea
                  rows={3}
                  value={editData.observaciones || ''}
                  onChange={e => handleEditChange('observaciones', e.target.value)}
                  style={{ ...inpStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Estado del terreno</label>
                <textarea
                  rows={3}
                  value={editData.estado_del_terreno || ''}
                  onChange={e => handleEditChange('estado_del_terreno', e.target.value)}
                  style={{ ...inpStyle, resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={editData.status || 'borrador'}
                  onChange={e => handleEditChange('status', e.target.value)}
                  style={inpStyle}
                >
                  <option value="borrador">Borrador</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprobado">Aprobado</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} style={{ color: '#667eea' }} />
              Curva S
            </h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                  <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} unit="%" />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e3a5f', borderRadius: 8, color: '#e2e8f0' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="programado" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} name="Programado" />
                  <Line type="monotone" dataKey="ejecutado" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#3b82f6', r: 4 }} name="Ejecutado" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: C.textSec }}>
                <p>No hay datos de curva S disponibles</p>
              </div>
            )}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} style={{ color: '#667eea' }} />
              Firmas
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Elaborado por</label>
                <select
                  value={editData.firma_elaborado || ''}
                  onChange={e => handleEditChange('firma_elaborado', e.target.value || null)}
                  style={inpStyle}
                >
                  <option value="">Seleccionar...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Revisado por</label>
                <select
                  value={editData.firma_revisado || ''}
                  onChange={e => handleEditChange('firma_revisado', e.target.value || null)}
                  style={inpStyle}
                >
                  <option value="">Seleccionar...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Profesional 1</label>
                <select
                  value={editData.firma_profesional1 || ''}
                  onChange={e => handleEditChange('firma_profesional1', e.target.value || null)}
                  style={inpStyle}
                >
                  <option value="">Seleccionar...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Profesional 2</label>
                <select
                  value={editData.firma_profesional2 || ''}
                  onChange={e => handleEditChange('firma_profesional2', e.target.value || null)}
                  style={inpStyle}
                >
                  <option value="">Seleccionar...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.id}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
