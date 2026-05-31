import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Users, CloudRain, Sun, ChevronRight,
  Plus, Trash2, Edit3, CheckSquare, Square,
  Wrench, HardHat, FileText, Wind
} from 'lucide-react';

// ──────────────────────────────────────────────
// Datos iniciales de ejemplo (en producción
// vendrían del backend / props del informe)
// ──────────────────────────────────────────────
const MAQUINARIA_INICIAL = [
  { id: 1, item: 'CAMIONETAS (Siemens)', cantidad: 1, empresa: 'Siemens', notas: '' },
  { id: 2, item: 'BUSETA - VANS', cantidad: 0, empresa: '', notas: '' },
  { id: 3, item: 'GENERADOR DE ENERGÍA', cantidad: 0, empresa: '', notas: '' },
  { id: 4, item: 'CAMIÓN GRÚA (CTE Intercolombia)', cantidad: 0, empresa: 'Intercolombia', notas: '' },
  { id: 5, item: 'GRÚA (CTE Intercolombia)', cantidad: 0, empresa: 'Intercolombia', notas: '' },
  { id: 6, item: 'PLATAFORMA ELEVADORA "MANLIFT" (Edemsa)', cantidad: 0, empresa: 'Edemsa', notas: '' },
  { id: 7, item: 'EQUIPO DE GENERACIÓN FOTOVOLTAICA', cantidad: 0, empresa: '', notas: '' },
  { id: 8, item: 'CAMIONETAS (Edemsa)', cantidad: 0, empresa: 'Edemsa', notas: '' },
  { id: 9, item: 'CAMIONETAS (CTE Intercolombia)', cantidad: 0, empresa: 'Intercolombia', notas: '' },
  { id: 10, item: 'RETROCARGADOR', cantidad: 0, empresa: '', notas: '' },
];

const PERSONAL_INICIAL = [
  { id: 1, cargo: 'Coordinadora SST', cantidad: 0 },
  { id: 2, cargo: 'Director de Proyecto (Siemens)', cantidad: 0 },
  { id: 3, cargo: 'Supervisor S.S.T (Siemens)', cantidad: 0 },
  { id: 4, cargo: 'Residente Técnico (Siemens)', cantidad: 1 },
  { id: 5, cargo: 'Ing. Ambiental y Supervisor Ambiental', cantidad: 0 },
  { id: 6, cargo: 'Oficial de Obra Civil', cantidad: 0 },
  { id: 7, cargo: 'Ayudante Técnico (Siemens)', cantidad: 1 },
  { id: 8, cargo: 'Guarda de Seguridad', cantidad: 0 },
  { id: 9, cargo: 'Supervisor QA-QC', cantidad: 0 },
  { id: 10, cargo: 'Almacenista', cantidad: 0 },
  { id: 11, cargo: 'Topógrafo', cantidad: 0 },
  { id: 12, cargo: 'Programación y Planeación', cantidad: 0 },
  { id: 13, cargo: 'Operador de Grúa', cantidad: 0 },
  { id: 14, cargo: 'Aux Administrativo', cantidad: 0 },
  { id: 15, cargo: 'Conductor (Siemens)', cantidad: 0 },
];

const ACTIVIDADES_INICIAL = [
  { id: 1, categoria: 'ADMINISTRATIVAS Y DOCUMENTALES (INGESED)', actividades: ['Actualización Listado de Pendientes SIEMENS', 'Informes Diarios'] },
  { id: 2, categoria: 'CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES (SIEMENS)', actividades: ['Fabricación de marquillas pendientes de colocar', 'Sellado de las tapas en Tableros de control de los Reactores', 'Cambio de marquillas provisionales en tableros', 'Personal de Phase se retira de la SE La Loma'] },
  { id: 3, categoria: 'PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES (CTE INTERCOLOMBIA)', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 4, categoria: 'OBRA CIVIL EDEMSA', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 5, categoria: 'GESTIÓN SST', actividades: ['Seguimiento al ingreso de personal a la SE La Loma', 'Charla "Uso adecuado de las herramientas de trabajo"', 'Delimitación y señalización de las áreas', 'Orden y aseo en las áreas', 'Seguimiento medidas de prevención y control SST', 'Elaboración de informe diario e informe semanal'] },
  { id: 6, categoria: 'ACTIVIDADES AMBIENTALES Y SOCIALES', actividades: ['Jornadas de orden y aseo de las áreas de trabajo', 'Delimitación y señalización de las áreas'] },
];

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function Reportes({ informeId }) {
  const navigate = useNavigate();

  const [lluvia, setLluvia] = useState(true);
  const [estadoInicio, setEstadoInicio] = useState('Riesgo Físico y Locativo');
  const [estadoFin, setEstadoFin] = useState('Riesgo Físico y Locativo');
  const [topografia, setTopografia] = useState(false);

  const [maquinaria, setMaquinaria] = useState(MAQUINARIA_INICIAL);
  const [personal, setPersonal] = useState(PERSONAL_INICIAL);
  const [actividades] = useState(ACTIVIDADES_INICIAL);

  // edición inline maquinaria
  const [editMaq, setEditMaq] = useState(null); // id en edición

  const totalPersonal = personal.reduce((s, p) => s + (p.cantidad || 0), 0);
  const totalMaquinaria = maquinaria.reduce((s, m) => s + (m.cantidad || 0), 0);

  const updateMaq = (id, field, value) => {
    setMaquinaria(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const updatePersonal = (id, value) => {
    setPersonal(prev => prev.map(p => p.id === id ? { ...p, cantidad: parseInt(value) || 0 } : p));
  };

  return (
    <div style={styles.container}>

      {/* ── Encabezado info rápida ── */}
      <div style={styles.headerStrip}>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>LLUVIA</span>
          <div style={styles.toggleGroup}>
            <button
              style={{ ...styles.toggleBtn, ...(lluvia ? styles.toggleActive : {}) }}
              onClick={() => setLluvia(true)}
            >SI</button>
            <button
              style={{ ...styles.toggleBtn, ...(!lluvia ? styles.toggleActive : {}) }}
              onClick={() => setLluvia(false)}
            >NO</button>
          </div>
        </div>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>TOPOGRAFÍA</span>
          <div style={styles.toggleGroup}>
            <button
              style={{ ...styles.toggleBtn, ...(topografia ? styles.toggleActive : {}) }}
              onClick={() => setTopografia(true)}
            >SI</button>
            <button
              style={{ ...styles.toggleBtn, ...(!topografia ? styles.toggleActive : {}) }}
              onClick={() => setTopografia(false)}
            >NO</button>
          </div>
        </div>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>TOTAL PERSONAL</span>
          <span style={styles.headerValue}>{totalPersonal}</span>
        </div>
        <div style={styles.headerItem}>
          <span style={styles.headerLabel}>TOTAL EQUIPOS</span>
          <span style={styles.headerValue}>{totalMaquinaria}</span>
        </div>
      </div>

      {/* ── Estado del terreno ── */}
      <div style={styles.sectionRow}>
        <div style={styles.halfSection}>
          <div style={styles.sectionTitle}>
            <Sun size={14} style={{ marginRight: 6 }} />
            ESTADO DEL TERRENO — INICIO DE JORNADA
          </div>
          <input
            style={styles.inputField}
            value={estadoInicio}
            onChange={e => setEstadoInicio(e.target.value)}
            placeholder="Describa el estado al inicio..."
          />
        </div>
        <div style={styles.halfSection}>
          <div style={styles.sectionTitle}>
            <Wind size={14} style={{ marginRight: 6 }} />
            ESTADO DEL TERRENO — FINAL DE JORNADA
          </div>
          <input
            style={styles.inputField}
            value={estadoFin}
            onChange={e => setEstadoFin(e.target.value)}
            placeholder="Describa el estado al final..."
          />
        </div>
      </div>

      {/* ── MAQUINARIA / EQUIPOS / HERRAMIENTAS ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            <Wrench size={14} style={{ marginRight: 6 }} />
            MAQUINARIA — EQUIPOS — HERRAMIENTAS DE PODER Y VEHÍCULOS
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '35%' }}>ÍTEM</th>
                <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>CANT.</th>
                <th style={{ ...styles.th, width: '20%' }}>EMPRESA</th>
                <th style={{ ...styles.th, width: '30%' }}>NOTAS</th>
                <th style={{ ...styles.th, width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {maquinaria.map((m) => (
                <tr key={m.id} style={styles.tr}>
                  <td style={styles.td}>{m.item}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    {editMaq === m.id ? (
                      <input
                        type="number"
                        min={0}
                        style={styles.inlineInput}
                        value={m.cantidad}
                        onChange={e => updateMaq(m.id, 'cantidad', parseInt(e.target.value) || 0)}
                        autoFocus
                      />
                    ) : (
                      <span style={m.cantidad > 0 ? styles.cantActive : styles.cantZero}>
                        {m.cantidad}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {editMaq === m.id ? (
                      <input
                        style={styles.inlineInput}
                        value={m.empresa}
                        onChange={e => updateMaq(m.id, 'empresa', e.target.value)}
                        placeholder="Empresa..."
                      />
                    ) : (
                      <span style={styles.empresaTag}>{m.empresa || '—'}</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {editMaq === m.id ? (
                      <input
                        style={styles.inlineInput}
                        value={m.notas}
                        onChange={e => updateMaq(m.id, 'notas', e.target.value)}
                        placeholder="Observaciones..."
                      />
                    ) : (
                      <span style={styles.notasText}>{m.notas || '—'}</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.editBtn}
                      onClick={() => setEditMaq(editMaq === m.id ? null : m.id)}
                      title={editMaq === m.id ? 'Guardar' : 'Editar'}
                    >
                      <Edit3 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={styles.tfootTd} colSpan={4}>TOTAL</td>
                <td style={{ ...styles.tfootTd, textAlign: 'center', color: '#2dd4bf' }}>{totalMaquinaria}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── PERSONAL DE OBRA ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            <HardHat size={14} style={{ marginRight: 6 }} />
            PERSONAL DE OBRA
          </div>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: '75%' }}>CARGO</th>
                <th style={{ ...styles.th, width: '25%', textAlign: 'center' }}>CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.cargo}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <input
                      type="number"
                      min={0}
                      style={{ ...styles.inlineInput, width: 60, textAlign: 'center' }}
                      value={p.cantidad}
                      onChange={e => updatePersonal(p.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={styles.tfootTd}>TOTAL PERSONAL</td>
                <td style={{ ...styles.tfootTd, textAlign: 'center', color: '#2dd4bf' }}>{totalPersonal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── ACTIVIDADES DEL DÍA ── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>
            <FileText size={14} style={{ marginRight: 6 }} />
            ACTIVIDADES DEL DÍA
          </div>
          <button
            style={styles.actionBtn}
            onClick={() => navigate('/interventoria/actividades-del-dia')}
          >
            <Edit3 size={13} style={{ marginRight: 5 }} />
            Editar Actividades
            <ChevronRight size={13} style={{ marginLeft: 4 }} />
          </button>
        </div>

        {actividades.map((grupo) => (
          <div key={grupo.id} style={styles.actividadGrupo}>
            <div style={styles.actividadCategoria}>{grupo.categoria}</div>
            <ul style={styles.actividadList}>
              {grupo.actividades.map((act, idx) => (
                <li key={idx} style={styles.actividadItem}>
                  <ChevronRight size={11} style={{ marginRight: 6, color: '#2dd4bf', flexShrink: 0 }} />
                  {act}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  );
}

// ──────────────────────────────────────────────
// Estilos inline (paleta dark navy + teal ERP)
// ──────────────────────────────────────────────
const styles = {
  container: {
    padding: '0 0 40px 0',
    color: '#e2e8f0',
    fontSize: 13,
  },
  headerStrip: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(45,212,191,0.15)',
    borderRadius: 10,
    padding: '12px 18px',
    marginBottom: 20,
    alignItems: 'center',
  },
  headerItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  headerValue: {
    fontSize: 22,
    fontWeight: 700,
    color: '#2dd4bf',
    lineHeight: 1,
  },
  toggleGroup: {
    display: 'flex',
    gap: 4,
  },
  toggleBtn: {
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 600,
    border: '1px solid rgba(148,163,184,0.3)',
    borderRadius: 4,
    background: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  toggleActive: {
    background: 'rgba(45,212,191,0.15)',
    borderColor: '#2dd4bf',
    color: '#2dd4bf',
  },
  sectionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  },
  halfSection: {
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(45,212,191,0.12)',
    borderRadius: 10,
    padding: '14px 16px',
  },
  section: {
    background: 'rgba(15,23,42,0.5)',
    border: '1px solid rgba(45,212,191,0.12)',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 20,
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.07em',
    color: '#2dd4bf',
    textTransform: 'uppercase',
  },
  inputField: {
    width: '100%',
    background: 'rgba(15,23,42,0.7)',
    border: '1px solid rgba(148,163,184,0.2)',
    borderRadius: 6,
    color: '#e2e8f0',
    padding: '7px 10px',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    background: 'rgba(45,212,191,0.08)',
    color: '#94a3b8',
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '8px 10px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(45,212,191,0.15)',
  },
  tr: {
    borderBottom: '1px solid rgba(148,163,184,0.08)',
  },
  td: {
    padding: '7px 10px',
    color: '#cbd5e1',
    verticalAlign: 'middle',
  },
  tfootTd: {
    padding: '8px 10px',
    fontWeight: 700,
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    borderTop: '1px solid rgba(45,212,191,0.2)',
  },
  inlineInput: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(45,212,191,0.4)',
    borderRadius: 4,
    color: '#e2e8f0',
    padding: '4px 7px',
    fontSize: 12,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  cantActive: {
    fontWeight: 700,
    color: '#2dd4bf',
  },
  cantZero: {
    color: '#475569',
  },
  empresaTag: {
    color: '#93c5fd',
    fontSize: 11,
  },
  notasText: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  editBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(45,212,191,0.1)',
    border: '1px solid rgba(45,212,191,0.3)',
    color: '#2dd4bf',
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    gap: 2,
    transition: 'all 0.15s',
  },
  actividadGrupo: {
    marginBottom: 14,
    borderLeft: '2px solid rgba(45,212,191,0.3)',
    paddingLeft: 12,
  },
  actividadCategoria: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#7dd3fc',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  actividadList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  actividadItem: {
    display: 'flex',
    alignItems: 'flex-start',
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 1.4,
  },
};
