import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, HardHat, FileText, Wind, Sun,
  Edit3, ChevronRight, CloudRain, CloudOff,
  Map, MapPin, FileSpreadsheet,
} from 'lucide-react';
import { exportInformeDiarioExcel, prepararDatosExport } from '../../utils/InformeDiarioExcel';

const C = {
  white: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#1e293b',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  teal: '#0d9488',
  tealLight: '#f0fdfa',
  tealBorder: '#99f6e4',
  blue: '#3b82f6',
  blueLight: '#eff6ff',
  indigo: '#6366f1',
  cardShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

const MAQUINARIA_DEFAULT = [
  { id: 1, item: 'CAMIONETAS (Siemens)',                        cantidad: 1, empresa: 'Siemens',        notas: '' },
  { id: 2, item: 'BUSETA - VANS',                              cantidad: 0, empresa: '',               notas: '' },
  { id: 3, item: 'GENERADOR DE ENERGÍA',                       cantidad: 0, empresa: '',               notas: '' },
  { id: 4, item: 'CAMIÓN GRÚA (CTE Intercolombia)',            cantidad: 0, empresa: 'Intercolombia',  notas: '' },
  { id: 5, item: 'GRÚA (CTE Intercolombia)',                   cantidad: 0, empresa: 'Intercolombia',  notas: '' },
  { id: 6, item: 'PLATAFORMA ELEVADORA "MANLIFT" (Edemsa)',    cantidad: 0, empresa: 'Edemsa',         notas: '' },
  { id: 7, item: 'EQUIPO DE GENERACIÓN FOTOVOLTAICA',          cantidad: 0, empresa: '',               notas: '' },
  { id: 8, item: 'CAMIONETAS (Edemsa)',                        cantidad: 0, empresa: 'Edemsa',         notas: '' },
  { id: 9, item: 'CAMIONETAS (CTE Intercolombia)',             cantidad: 0, empresa: 'Intercolombia',  notas: '' },
  { id: 10, item: 'RETROCARGADOR',                              cantidad: 0, empresa: '',               notas: '' },
];

const PERSONAL_DEFAULT = [
  { id: 1,  cargo: 'Coordinadora SST',                    cantidad: 0 },
  { id: 2,  cargo: 'Director de Proyecto (Siemens)',      cantidad: 0 },
  { id: 3,  cargo: 'Supervisor S.S.T (Siemens)',          cantidad: 0 },
  { id: 4,  cargo: 'Residente Técnico (Siemens)',         cantidad: 1 },
  { id: 5,  cargo: 'Ing. Ambiental y Sup. Ambiental',     cantidad: 0 },
  { id: 6,  cargo: 'Oficial de Obra Civil',               cantidad: 0 },
  { id: 7,  cargo: 'Ayudante Técnico (Siemens)',          cantidad: 1 },
  { id: 8,  cargo: 'Guarda de Seguridad',                 cantidad: 0 },
  { id: 9,  cargo: 'Supervisor QA-QC',                    cantidad: 0 },
  { id: 10, cargo: 'Almacenista',                         cantidad: 0 },
  { id: 11, cargo: 'Topógrafo',                           cantidad: 0 },
  { id: 12, cargo: 'Programación y Planeación',           cantidad: 0 },
  { id: 13, cargo: 'Operador de Grúa',                    cantidad: 0 },
  { id: 14, cargo: 'Aux Administrativo',                  cantidad: 0 },
  { id: 15, cargo: 'Conductor (Siemens)',                  cantidad: 0 },
];

const ACTIVIDADES_DEFAULT = [
  { id: 'admin',    categoria: 'ADMINISTRATIVAS Y DOCUMENTALES (INGESED)',                    color: '#6366f1', actividades: ['Actualización Listado de Pendientes SIEMENS', 'Informes Diarios'] },
  { id: 'siemens',  categoria: 'CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES (SIEMENS)',       color: '#f59e0b', actividades: ['Fabricación de marquillas pendientes de colocar', 'Sellado de tapas en Tableros de control de Reactores', 'Cambio de marquillas provisionales en tableros', 'Personal de Phase se retira de la SE La Loma'] },
  { id: 'cte',      categoria: 'PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES (CTE INTERCOLOMBIA)', color: '#f97316', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 'civil',    categoria: 'OBRA CIVIL EDEMSA',                                           color: '#8b5cf6', actividades: ['NO HAY PROGRAMACIÓN DE ACTIVIDADES'] },
  { id: 'sst',      categoria: 'GESTIÓN SST',                                                 color: '#10b981', actividades: ['Seguimiento al ingreso de personal', 'Charla "Uso adecuado de herramientas de trabajo"', 'Delimitación y señalización de áreas', 'Orden y aseo', 'Seguimiento medidas de prevención SST', 'Elaboración de informe diario e informe semanal'] },
  { id: 'ambiental',categoria: 'ACTIVIDADES AMBIENTALES Y SOCIALES',                          color: '#22c55e', actividades: ['Jornadas de orden y aseo', 'Delimitación y señalización de áreas'] },
];

// ─────────────────────────────────────────────
export default function ReportesInforme({ informeId, informe }) {
  const navigate = useNavigate();

  const [lluvia, setLluvia]           = useState(true);
  const [topografia, setTopografia]   = useState(false);
  const [estadoInicio, setEstadoInicio] = useState('Riesgo Físico y Locativo');
  const [estadoFin, setEstadoFin]     = useState('Riesgo Físico y Locativo');

  const [maquinaria, setMaquinaria]   = useState(MAQUINARIA_DEFAULT);
  const [personal, setPersonal]       = useState(PERSONAL_DEFAULT);
  const [actividades]                 = useState(ACTIVIDADES_DEFAULT);
  const [editMaq, setEditMaq]         = useState(null);

  const totalPersonal   = personal.reduce((s, p) => s + (p.cantidad || 0), 0);
  const totalMaquinaria = maquinaria.reduce((s, m) => s + (m.cantidad || 0), 0);

  const updateMaq = (id, field, value) =>
    setMaquinaria(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));

  const updatePersonal = (id, value) =>
    setPersonal(prev => prev.map(p => p.id === id ? { ...p, cantidad: parseInt(value) || 0 } : p));

  // ── handler para exportar a Excel ──
  const handleExportExcel = () => {
    const datos = prepararDatosExport({
      codigo: 'F-141-IN',
      fechaEmision: '27/08/2009',
      modo: '00',
      obra: informe?.obra_nombre || 'Ampliación SE LA LOMA 500 kV',
      fecha: informe?.fecha || new Date().toLocaleDateString('es-CO'),
      diaSemana: new Date().toLocaleDateString('es-CO', { weekday: 'long' }).toUpperCase(),
      lluviaHoras: lluvia ? { 0: 'X', 1: 'X', 2: 'X' } : {},
      maquinaria,
      personal,
      topografia: topografia ? ['SI', 'NO', 'SI', 'NO'] : ['NO', 'NO', 'NO', 'NO'],
      observaciones: '',
      estadoInicio,
      estadoFin,
      actividades,
      recursos: [
        { nombre: 'Coordinador de Control Obra', dias: Array(31).fill('1') },
        { nombre: 'Ingeniero Electricista', dias: Array(31).fill('1') },
        { nombre: 'Profesional SST', dias: Array(31).fill('1') },
      ],
      elaboradoPor: 'Nelson Henao',
      revisadoPor: 'Diego León Vélez',
      aprobadoPor: 'Diego León Vélez',
    });
    exportInformeDiarioExcel(datos, `Informe_Diario_${informe?.obra_nombre || 'Obra'}`);
  };

  return (
    <div style={{ color: C.text, fontSize: 13 }}>

      {/* ── Barra de estado rápido ── */}
      <div style={s.strip}>
        <TogglePair label="LLUVIA"     value={lluvia}     onChange={setLluvia} />
        <TogglePair label="TOPOGRAFÍA" value={topografia} onChange={setTopografia} />
        <StatBadge label="TOTAL PERSONAL"   value={totalPersonal} />
        <StatBadge label="TOTAL EQUIPOS"    value={totalMaquinaria} />

        {/* ══ BOTÓN EXPORTAR EXCEL ══ */}
        <button
          onClick={handleExportExcel}
          style={s.exportBtn}
          onMouseEnter={e => { e.currentTarget.style.background = '#15355A'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1F4E79'; }}
          title="Exportar informe a Excel (formato F-141-IN)"
        >
          <FileSpreadsheet size={16} />
          <span>Exportar Excel</span>
        </button>
      </div>

      {/* ── Estado del terreno ── */}
      <div style={s.row2col}>
        <FieldBlock label={<><Sun size={13} style={{ marginRight: 5 }} />ESTADO TERRENO — INICIO</>}>
          <input style={s.input} value={estadoInicio} onChange={e => setEstadoInicio(e.target.value)} />
        </FieldBlock>
        <FieldBlock label={<><Wind size={13} style={{ marginRight: 5 }} />ESTADO TERRENO — FINAL</>}>
          <input style={s.input} value={estadoFin} onChange={e => setEstadoFin(e.target.value)} />
        </FieldBlock>
      </div>

      {/* ── MAQUINARIA ── */}
      <Section title={<><Wrench size={13} style={{ marginRight: 6 }} />MAQUINARIA — EQUIPOS — HERRAMIENTAS Y VEHÍCULOS</>}>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <Th w="36%">ÍTEM</Th>
                <Th w="10%" center>CANT.</Th>
                <Th w="20%">EMPRESA</Th>
                <Th w="29%">NOTAS</Th>
                <Th w="5%"></Th>
              </tr>
            </thead>
            <tbody>
              {maquinaria.map(m => (
                <tr key={m.id} style={s.tr}>
                  <Td>{m.item}</Td>
                  <Td center>
                    {editMaq === m.id
                      ? <input type="number" min={0} style={s.inlineNum} value={m.cantidad} onChange={e => updateMaq(m.id, 'cantidad', parseInt(e.target.value) || 0)} autoFocus />
                      : <span style={m.cantidad > 0 ? s.numOn : s.numOff}>{m.cantidad}</span>
                    }
                  </Td>
                  <Td>
                    {editMaq === m.id
                      ? <input style={s.inlineText} value={m.empresa} onChange={e => updateMaq(m.id, 'empresa', e.target.value)} placeholder="Empresa..." />
                      : <span style={s.empresa}>{m.empresa || '—'}</span>
                    }
                  </Td>
                  <Td>
                    {editMaq === m.id
                      ? <input style={s.inlineText} value={m.notas} onChange={e => updateMaq(m.id, 'notas', e.target.value)} placeholder="Notas..." />
                      : <span style={s.notas}>{m.notas || '—'}</span>
                    }
                  </Td>
                  <Td>
                    <button style={s.editBtn} onClick={() => setEditMaq(editMaq === m.id ? null : m.id)}>
                      <Edit3 size={12} />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={s.tfoot}>TOTAL</td>
                <td style={{ ...s.tfoot, textAlign: 'center', color: C.teal, fontWeight: 800 }}>{totalMaquinaria}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* ── PERSONAL ── */}
      <Section title={<><HardHat size={13} style={{ marginRight: 6 }} />PERSONAL DE OBRA</>}>
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <Th w="75%">CARGO</Th>
                <Th w="25%" center>CANTIDAD</Th>
              </tr>
            </thead>
            <tbody>
              {personal.map(p => (
                <tr key={p.id} style={s.tr}>
                  <Td>{p.cargo}</Td>
                  <Td center>
                    <input
                      type="number" min={0}
                      style={{ ...s.inlineNum, width: 56 }}
                      value={p.cantidad}
                      onChange={e => updatePersonal(p.id, e.target.value)}
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={s.tfoot}>TOTAL PERSONAL</td>
                <td style={{ ...s.tfoot, textAlign: 'center', color: C.teal, fontWeight: 800 }}>{totalPersonal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {/* ── ACTIVIDADES DEL DÍA ── */}
      <Section
        title={<><FileText size={13} style={{ marginRight: 6 }} />ACTIVIDADES DEL DÍA</>}
        action={
          <button style={s.actionBtn} onClick={() => navigate('/interventoria/actividades-del-dia')}>
            <Edit3 size={12} style={{ marginRight: 4 }} />
            Editar actividades
            <ChevronRight size={12} style={{ marginLeft: 2 }} />
          </button>
        }
      >
        {actividades.map(grupo => (
          <div key={grupo.id} style={{ ...s.actGrupo, borderLeftColor: grupo.color }}>
            <span style={{ ...s.actCat, color: grupo.color }}>{grupo.categoria}</span>
            <ul style={s.actList}>
              {grupo.actividades.map((a, i) => (
                <li key={i} style={s.actItem}>
                  <ChevronRight size={10} style={{ marginRight: 5, color: grupo.color, flexShrink: 0 }} />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

    </div>
  );
}

// ── Helpers de UI ─────────────────────────────
function Section({ title, action, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHead}>
        <span style={s.sectionTitle}>{title}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div style={s.fieldBlock}>
      <span style={s.fieldLabel}>{label}</span>
      {children}
    </div>
  );
}

function TogglePair({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={s.stripLabel}>{label}</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {['SI', 'NO'].map(opt => (
          <button
            key={opt}
            style={{ ...s.tog, ...(value === (opt === 'SI') ? s.togOn : {}) }}
            onClick={() => onChange(opt === 'SI')}
          >{opt}</button>
        ))}
      </div>
    </div>
  );
}

function StatBadge({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={s.stripLabel}>{label}</span>
      <span style={s.bigNum}>{value}</span>
    </div>
  );
}

function Th({ children, w, center }) {
  return <th style={{ ...s.th, width: w, textAlign: center ? 'center' : 'left' }}>{children}</th>;
}
function Td({ children, center }) {
  return <td style={{ ...s.td, textAlign: center ? 'center' : 'left' }}>{children}</td>;
}

// ── Styles ────────────────────────────────────
const s = {
  strip: {
    display: 'flex', gap: 20, flexWrap: 'wrap',
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: 12, padding: '12px 18px', marginBottom: 18,
    alignItems: 'center',
  },
  stripLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: '#94a3b8', textTransform: 'uppercase' },
  bigNum: { fontSize: 24, fontWeight: 900, color: '#0d9488', lineHeight: 1 },
  tog: {
    padding: '3px 10px', fontSize: 11, fontWeight: 700,
    border: '1px solid #e2e8f0', borderRadius: 5,
    background: 'transparent', color: '#94a3b8', cursor: 'pointer',
  },
  togOn: { background: '#f0fdfa', borderColor: '#0d9488', color: '#0d9488' },
  row2col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 },
  fieldBlock: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px' },
  fieldLabel: { display: 'flex', alignItems: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase', marginBottom: 6 },
  input: { width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, color: '#1e293b', padding: '7px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' },
  section: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 18 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#0d9488', textTransform: 'uppercase' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '7px 10px', borderBottom: '1px solid #e2e8f0' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '7px 10px', color: '#334155', verticalAlign: 'middle' },
  tfoot: { padding: '8px 10px', fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', borderTop: '1px solid #e2e8f0' },
  inlineNum: { background: '#fff', border: '1px solid #0d9488', borderRadius: 4, color: '#1e293b', padding: '3px 6px', fontSize: 12, outline: 'none', width: 70, textAlign: 'center' },
  inlineText: { background: '#fff', border: '1px solid #0d9488', borderRadius: 4, color: '#1e293b', padding: '3px 8px', fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' },
  numOn: { fontWeight: 800, color: '#0d9488' },
  numOff: { color: '#cbd5e1' },
  empresa: { color: '#3b82f6', fontSize: 11 },
  notas: { color: '#94a3b8', fontStyle: 'italic' },
  editBtn: { background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 3, borderRadius: 4, display: 'flex', alignItems: 'center' },
  actionBtn: { display: 'flex', alignItems: 'center', background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0d9488', borderRadius: 6, padding: '5px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  actGrupo: { borderLeft: '2px solid', paddingLeft: 12, marginBottom: 12 },
  actCat: { fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 },
  actList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 3 },
  actItem: { display: 'flex', alignItems: 'flex-start', color: '#334155', fontSize: 12, lineHeight: 1.4 },

  // ══ ESTILO BOTÓN EXPORTAR EXCEL ══
  exportBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: '#1F4E79',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.03em',
    transition: 'background 0.2s, transform 0.1s',
    marginLeft: 'auto',
    boxShadow: '0 2px 6px rgba(31,78,121,0.25)',
  },
};
