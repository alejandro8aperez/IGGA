import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Save, ArrowLeft, ChevronDown, ChevronUp,
  FileText, HardHat, Wrench, Leaf, Shield, ClipboardList
} from 'lucide-react';

// ──────────────────────────────────────────────
// Categorías fijas del informe diario
// ──────────────────────────────────────────────
const CATEGORIAS_DEFAULT = [
  {
    id: 'admin',
    label: 'ADMINISTRATIVAS Y DOCUMENTALES (INGESED)',
    icon: 'ClipboardList',
    color: '#93c5fd',
    actividades: [
      'Actualización Listado de Pendientes SIEMENS',
      'Informes Diarios',
    ],
  },
  {
    id: 'siemens',
    label: 'CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES (SIEMENS)',
    icon: 'Wrench',
    color: '#fbbf24',
    actividades: [
      'Fabricación de marquillas pendientes de colocar',
      'Sellado de las tapas en Tableros de control de los Reactores',
      'Cambio de marquillas provisionales en tableros',
      'Personal de Phase se retira de la SE La Loma',
    ],
  },
  {
    id: 'cte',
    label: 'PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES (CTE INTERCOLOMBIA)',
    icon: 'Wrench',
    color: '#f97316',
    actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'],
  },
  {
    id: 'civil',
    label: 'OBRA CIVIL EDEMSA',
    icon: 'HardHat',
    color: '#a78bfa',
    actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'],
  },
  {
    id: 'sst',
    label: 'GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO (SST)',
    icon: 'Shield',
    color: '#34d399',
    actividades: [
      'Seguimiento al ingreso de personal a la SE La Loma',
      'Charla "Uso adecuado de las herramientas de trabajo", divulgación de peligros, riesgos y controles',
      'Delimitación y señalización de las áreas',
      'Orden y aseo en las áreas de trabajo',
      'Seguimiento y aseguramiento de medidas de prevención y control en SST',
      'Elaboración de informe diario e informe semanal',
    ],
  },
  {
    id: 'ambiental',
    label: 'ACTIVIDADES AMBIENTALES Y SOCIALES',
    icon: 'Leaf',
    color: '#86efac',
    actividades: [
      'Jornadas de orden y aseo de las áreas de trabajo',
      'Delimitación y señalización de las áreas',
    ],
  },
];

const ICON_MAP = {
  ClipboardList,
  Wrench,
  HardHat,
  Shield,
  Leaf,
  FileText,
};

// ──────────────────────────────────────────────
export default function ActividadesDelDia() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState(CATEGORIAS_DEFAULT);
  const [collapsed, setCollapsed] = useState({});
  const [nuevaActividad, setNuevaActividad] = useState({});
  const [guardado, setGuardado] = useState(false);

  const toggleCollapse = (id) => {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addActividad = (catId) => {
    const texto = (nuevaActividad[catId] || '').trim();
    if (!texto) return;
    setCategorias(prev => prev.map(c =>
      c.id === catId
        ? { ...c, actividades: [...c.actividades, texto] }
        : c
    ));
    setNuevaActividad(prev => ({ ...prev, [catId]: '' }));
  };

  const removeActividad = (catId, idx) => {
    setCategorias(prev => prev.map(c =>
      c.id === catId
        ? { ...c, actividades: c.actividades.filter((_, i) => i !== idx) }
        : c
    ));
  };

  const updateActividad = (catId, idx, value) => {
    setCategorias(prev => prev.map(c =>
      c.id === catId
        ? { ...c, actividades: c.actividades.map((a, i) => i === idx ? value : a) }
        : c
    ));
  };

  const handleGuardar = () => {
    // Aquí iría la llamada al backend: PATCH /api/informe-diario/{id}/actividades/
    setGuardado(true);
    setTimeout(() => {
      setGuardado(false);
      navigate(-1);
    }, 1200);
  };

  return (
    <div style={styles.page}>

      {/* ── TopBar ── */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Volver al Informe
        </button>
        <h2 style={styles.pageTitle}>
          <FileText size={18} style={{ marginRight: 8 }} />
          Actividades del Día
        </h2>
        <button
          style={{ ...styles.saveBtn, ...(guardado ? styles.saveBtnOk : {}) }}
          onClick={handleGuardar}
        >
          <Save size={14} style={{ marginRight: 5 }} />
          {guardado ? '¡Guardado!' : 'Guardar Cambios'}
        </button>
      </div>

      <p style={styles.subtitle}>
        Edita, agrega o elimina actividades por categoría para el informe diario de hoy.
      </p>

      {/* ── Categorías ── */}
      <div style={styles.categoriasList}>
        {categorias.map((cat) => {
          const IconComp = ICON_MAP[cat.icon] || FileText;
          const isCollapsed = collapsed[cat.id];
          return (
            <div key={cat.id} style={styles.categoriaCard}>
              {/* Header */}
              <div
                style={{ ...styles.catHeader, borderLeftColor: cat.color }}
                onClick={() => toggleCollapse(cat.id)}
              >
                <div style={styles.catHeaderLeft}>
                  <IconComp size={15} style={{ color: cat.color, marginRight: 8 }} />
                  <span style={{ ...styles.catLabel, color: cat.color }}>{cat.label}</span>
                  <span style={styles.catCount}>{cat.actividades.length}</span>
                </div>
                {isCollapsed
                  ? <ChevronDown size={15} style={{ color: '#64748b' }} />
                  : <ChevronUp size={15} style={{ color: '#64748b' }} />
                }
              </div>

              {/* Actividades */}
              {!isCollapsed && (
                <div style={styles.catBody}>
                  {cat.actividades.map((act, idx) => (
                    <div key={idx} style={styles.actRow}>
                      <span style={styles.actNum}>{idx + 1}.</span>
                      <input
                        style={styles.actInput}
                        value={act}
                        onChange={e => updateActividad(cat.id, idx, e.target.value)}
                      />
                      <button
                        style={styles.deleteBtn}
                        onClick={() => removeActividad(cat.id, idx)}
                        title="Eliminar actividad"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Agregar nueva */}
                  <div style={styles.addRow}>
                    <input
                      style={styles.addInput}
                      placeholder="Nueva actividad..."
                      value={nuevaActividad[cat.id] || ''}
                      onChange={e => setNuevaActividad(prev => ({ ...prev, [cat.id]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addActividad(cat.id); }}
                    />
                    <button
                      style={{ ...styles.addBtn, borderColor: cat.color, color: cat.color }}
                      onClick={() => addActividad(cat.id)}
                    >
                      <Plus size={13} style={{ marginRight: 4 }} />
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

// ──────────────────────────────────────────────
const styles = {
  page: {
    padding: '24px 28px 60px',
    color: '#e2e8f0',
    fontSize: 13,
    maxWidth: 900,
    margin: '0 auto',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: '1px solid rgba(148,163,184,0.25)',
    color: '#94a3b8',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 12,
    cursor: 'pointer',
  },
  pageTitle: {
    display: 'flex',
    alignItems: 'center',
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#e2e8f0',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(45,212,191,0.12)',
    border: '1px solid rgba(45,212,191,0.4)',
    color: '#2dd4bf',
    borderRadius: 6,
    padding: '6px 16px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  saveBtnOk: {
    background: 'rgba(52,211,153,0.2)',
    borderColor: '#34d399',
    color: '#34d399',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 24,
    marginTop: 4,
  },
  categoriasList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  categoriaCard: {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(148,163,184,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  catHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    cursor: 'pointer',
    borderLeft: '3px solid',
    userSelect: 'none',
    background: 'rgba(15,23,42,0.4)',
  },
  catHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  catLabel: {
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  catCount: {
    marginLeft: 10,
    background: 'rgba(148,163,184,0.15)',
    color: '#94a3b8',
    borderRadius: 10,
    padding: '1px 7px',
    fontSize: 10,
    fontWeight: 700,
  },
  catBody: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  actRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  actNum: {
    color: '#475569',
    fontSize: 11,
    minWidth: 18,
    textAlign: 'right',
  },
  actInput: {
    flex: 1,
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(148,163,184,0.15)',
    borderRadius: 5,
    color: '#e2e8f0',
    padding: '6px 10px',
    fontSize: 12,
    outline: 'none',
  },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  addRow: {
    display: 'flex',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTop: '1px dashed rgba(148,163,184,0.1)',
  },
  addInput: {
    flex: 1,
    background: 'rgba(15,23,42,0.5)',
    border: '1px dashed rgba(148,163,184,0.2)',
    borderRadius: 5,
    color: '#94a3b8',
    padding: '6px 10px',
    fontSize: 12,
    outline: 'none',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'transparent',
    border: '1px solid',
    borderRadius: 5,
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
