import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Save, ArrowLeft, ChevronDown, ChevronUp,
  FileText, HardHat, Wrench, Leaf, Shield, ClipboardList
} from 'lucide-react';

const CATEGORIAS_DEFAULT = [
  { id: 'admin',     label: 'ADMINISTRATIVAS Y DOCUMENTALES (INGESED)',                      Icon: ClipboardList, color: '#6366f1', actividades: ['Actualización Listado de Pendientes SIEMENS', 'Informes Diarios'] },
  { id: 'siemens',   label: 'CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES (SIEMENS)',          Icon: Wrench,        color: '#f59e0b', actividades: ['Fabricación de marquillas pendientes de colocar', 'Sellado de tapas en Tableros de control de Reactores', 'Cambio de marquillas provisionales en tableros', 'Personal de Phase se retira de la SE La Loma'] },
  { id: 'cte',       label: 'PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES (CTE INTERCOLOMBIA)',  Icon: Wrench,        color: '#f97316', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 'civil',     label: 'OBRA CIVIL EDEMSA',                                              Icon: HardHat,       color: '#8b5cf6', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 'sst',       label: 'GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO (SST)',         Icon: Shield,        color: '#10b981', actividades: ['Seguimiento al ingreso de personal a la SE La Loma', 'Charla "Uso adecuado de las herramientas de trabajo"', 'Delimitación y señalización de las áreas', 'Orden y aseo en las áreas', 'Seguimiento medidas de prevención y control SST', 'Elaboración de informe diario e informe semanal'] },
  { id: 'ambiental', label: 'ACTIVIDADES AMBIENTALES Y SOCIALES',                             Icon: Leaf,          color: '#22c55e', actividades: ['Jornadas de orden y aseo de las áreas de trabajo', 'Delimitación y señalización de las áreas'] },
];

export default function ActividadesDelDia() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT);
  const [collapsed, setCollapsed]   = useState({});
  const [nuevaAct, setNuevaAct]     = useState({});
  const [saved, setSaved]           = useState(false);

  const toggle = (id) => setCollapsed(p => ({ ...p, [id]: !p[id] }));

  const addAct = (catId) => {
    const t = (nuevaAct[catId] || '').trim();
    if (!t) return;
    setCategorias(p => p.map(c => c.id === catId ? { ...c, actividades: [...c.actividades, t] } : c));
    setNuevaAct(p => ({ ...p, [catId]: '' }));
  };

  const removeAct = (catId, idx) =>
    setCategorias(p => p.map(c => c.id === catId ? { ...c, actividades: c.actividades.filter((_, i) => i !== idx) } : c));

  const updateAct = (catId, idx, val) =>
    setCategorias(p => p.map(c => c.id === catId ? { ...c, actividades: c.actividades.map((a, i) => i === idx ? val : a) } : c));

  const handleSave = () => {
    // TODO: PATCH /api/informe-diario/{id}/actividades/
    setSaved(true);
    setTimeout(() => { setSaved(false); navigate(-1); }, 1200);
  };

  return (
    <div style={s.page}>

      {/* TopBar */}
      <div style={s.topBar}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={15} style={{ marginRight: 5 }} />
          Volver al Informe
        </button>
        <h2 style={s.title}>
          <FileText size={18} style={{ marginRight: 8, color: '#6366f1' }} />
          Actividades del Día
        </h2>
        <button style={{ ...s.saveBtn, ...(saved ? s.saveBtnOk : {}) }} onClick={handleSave}>
          <Save size={13} style={{ marginRight: 5 }} />
          {saved ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <p style={s.subtitle}>Edita, agrega o elimina actividades por categoría para el informe de hoy.</p>

      {/* Categorías */}
      <div style={s.list}>
        {categorias.map(cat => {
          const isCollapsed = collapsed[cat.id];
          return (
            <div key={cat.id} style={s.card}>

              {/* Header */}
              <div style={{ ...s.catHeader, borderLeftColor: cat.color }} onClick={() => toggle(cat.id)}>
                <div style={s.catLeft}>
                  <cat.Icon size={14} style={{ color: cat.color, marginRight: 8, flexShrink: 0 }} />
                  <span style={{ ...s.catLabel, color: cat.color }}>{cat.label}</span>
                  <span style={s.count}>{cat.actividades.length}</span>
                </div>
                {isCollapsed ? <ChevronDown size={14} style={{ color: '#94a3b8' }} /> : <ChevronUp size={14} style={{ color: '#94a3b8' }} />}
              </div>

              {/* Body */}
              {!isCollapsed && (
                <div style={s.body}>
                  {cat.actividades.map((act, idx) => (
                    <div key={idx} style={s.actRow}>
                      <span style={s.actNum}>{idx + 1}.</span>
                      <input
                        style={s.actInput}
                        value={act}
                        onChange={e => updateAct(cat.id, idx, e.target.value)}
                      />
                      <button style={s.delBtn} onClick={() => removeAct(cat.id, idx)} title="Eliminar">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {/* Agregar */}
                  <div style={s.addRow}>
                    <input
                      style={s.addInput}
                      placeholder="Nueva actividad..."
                      value={nuevaAct[cat.id] || ''}
                      onChange={e => setNuevaAct(p => ({ ...p, [cat.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addAct(cat.id); }}
                    />
                    <button
                      style={{ ...s.addBtn, borderColor: cat.color, color: cat.color }}
                      onClick={() => addAct(cat.id)}
                    >
                      <Plus size={12} style={{ marginRight: 4 }} />
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page:     { padding: '24px 28px 60px', color: '#1e293b', fontSize: 13, maxWidth: 900, margin: '0 auto' },
  topBar:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 10 },
  backBtn:  { display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  title:    { display: 'flex', alignItems: 'center', margin: 0, fontSize: 16, fontWeight: 800, color: '#1e293b' },
  saveBtn:  { display: 'flex', alignItems: 'center', background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  saveBtnOk:{ background: '#dcfce7', borderColor: '#4ade80', color: '#15803d' },
  subtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 22, marginTop: 4 },
  list:     { display: 'flex', flexDirection: 'column', gap: 12 },
  card:     { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  catHeader:{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', cursor: 'pointer', borderLeft: '3px solid', background: '#f8fafc', userSelect: 'none' },
  catLeft:  { display: 'flex', alignItems: 'center' },
  catLabel: { fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase' },
  count:    { marginLeft: 10, background: '#e2e8f0', color: '#64748b', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 },
  body:     { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 },
  actRow:   { display: 'flex', alignItems: 'center', gap: 7 },
  actNum:   { color: '#cbd5e1', fontSize: 11, minWidth: 18, textAlign: 'right' },
  actInput: { flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 5, color: '#334155', padding: '5px 9px', fontSize: 12, outline: 'none' },
  delBtn:   { background: 'transparent', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s' },
  addRow:   { display: 'flex', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px dashed #e2e8f0' },
  addInput: { flex: 1, background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: 5, color: '#64748b', padding: '5px 9px', fontSize: 12, outline: 'none' },
  addBtn:   { display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid', borderRadius: 5, padding: '4px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
};
