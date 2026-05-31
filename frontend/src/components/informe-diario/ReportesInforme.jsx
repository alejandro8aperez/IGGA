import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, HardHat, FileText, Wind, Sun,
  Edit3, ChevronRight, CloudRain, CloudOff,
  Map, MapPin, FileSpreadsheet,
} from 'lucide-react';
import ExcelJS from 'exceljs';

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

// ═══════════════════════════════════════════════════════════════
//  EXPORTAR INFORME A EXCEL  (Formato F-141-IN)
// ═══════════════════════════════════════════════════════════════
async function exportarInformeExcel(data) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Informe Diario');

  // ── helpers de estilo ──
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  const subFill    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E75B6' } };
  const lightFill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E2F3' } };
  const thinBorder = {
    top:    { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    left:   { style: 'thin', color: { argb: 'FF000000' } },
    right:  { style: 'thin', color: { argb: 'FF000000' } },
  };
  const grayBorder = {
    top:    { style: 'thin', color: { argb: 'FFAAAAAA' } },
    bottom: { style: 'thin', color: { argb: 'FFAAAAAA' } },
    left:   { style: 'thin', color: { argb: 'FFAAAAAA' } },
    right:  { style: 'thin', color: { argb: 'FFAAAAAA' } },
  };

  const setCell = (cell, value, style = {}) => {
    cell.value = value;
    cell.style = {
      font: { size: 9, ...style.font },
      alignment: { vertical: 'center', wrapText: true, ...style.alignment },
      border: style.border || grayBorder,
      fill: style.fill || undefined,
    };
  };

  let r = 1;

  // ══ ENCABEZADO PRINCIPAL ══
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA – INTERVENTORÍA', {
    font: { bold: true, size: 14, color: { argb: 'FF1F4E79' } },
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });
  ws.getRow(r).height = 30;

  r++;
  ws.mergeCells(`A${r}:B${r}`);
  setCell(ws.getCell(`A${r}`), `COD: ${data.codigo || 'F-141-IN'}`, { font: { bold: true, size: 9 }, border: thinBorder });
  ws.mergeCells(`C${r}:E${r}`);
  setCell(ws.getCell(`C${r}`), `F. Emisión: ${data.fechaEmision || '27/08/2009'}`, { font: { bold: true, size: 9 }, border: thinBorder });
  ws.mergeCells(`F${r}:H${r}`);
  setCell(ws.getCell(`F${r}`), `Mod: ${data.modo || '00'}`, { font: { bold: true, size: 9 }, border: thinBorder });

  r++;
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), `OBRA: ${data.obra || ''}`, { font: { bold: true, size: 11 }, border: thinBorder });

  r++;
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), `FECHA: ${data.fecha || ''}  |  DÍA: ${data.diaSemana || ''}`, { font: { bold: true, size: 9 }, border: thinBorder });
  ws.getRow(r).height = 20;

  r += 2;

  // ══ REPORTE DE LLUVIA ══
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'REPORTE DE LLUVIA', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });

  r++;
  setCell(ws.getCell(`A${r}`), 'Hora', { font: { bold: true, size: 9 }, border: thinBorder, fill: lightFill });
  for (let h = 0; h < 24; h++) {
    const col = String.fromCharCode(66 + h); // B..Y
    if (h < 7) {
      setCell(ws.getCell(`${col}${r}`), h, { alignment: { horizontal: 'center' }, border: thinBorder, fill: lightFill });
    } else {
      // Para horas 7-23 usamos columnas más allá de H, las creamos dinámicamente
      setCell(ws.getCell(`${col}${r}`), h, { alignment: { horizontal: 'center' }, border: thinBorder, fill: lightFill });
    }
  }
  r++;
  setCell(ws.getCell(`A${r}`), 'Lluvia', { font: { bold: true, size: 9 }, border: thinBorder });
  for (let h = 0; h < 24; h++) {
    const col = String.fromCharCode(66 + h);
    const val = data.lluviaHoras && data.lluviaHoras[h] ? data.lluviaHoras[h] : '';
    setCell(ws.getCell(`${col}${r}`), val, { alignment: { horizontal: 'center' }, border: thinBorder });
  }

  r += 2;

  // ══ MAQUINARIA (A-D)  |  PERSONAL (F-H) ══
  const startRow = r;

  // ─ Maquinaria ─
  ws.mergeCells(`A${r}:D${r}`);
  setCell(ws.getCell(`A${r}`), 'MAQUINARIA – EQUIPOS – HERRAMIENTAS Y VEHÍCULOS', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });
  r++;
  ['ÍTEM', 'CANT.', 'EMPRESA', 'NOTAS'].forEach((txt, idx) => {
    const col = String.fromCharCode(65 + idx);
    setCell(ws.getCell(`${col}${r}`), txt, { font: { bold: true, size: 9 }, border: thinBorder, fill: lightFill });
  });

  const maq = data.maquinaria || [];
  maq.forEach((m) => {
    r++;
    setCell(ws.getCell(`A${r}`), m.item || '', { border: thinBorder });
    setCell(ws.getCell(`B${r}`), m.cantidad || 0, { alignment: { horizontal: 'center' }, border: thinBorder });
    setCell(ws.getCell(`C${r}`), m.empresa || '', { border: thinBorder });
    setCell(ws.getCell(`D${r}`), m.notas || '', { border: thinBorder });
  });
  r++;
  setCell(ws.getCell(`A${r}`), 'TOTAL', { font: { bold: true }, border: thinBorder });
  setCell(ws.getCell(`B${r}`), maq.reduce((s, m) => s + (parseInt(m.cantidad) || 0), 0), { font: { bold: true }, alignment: { horizontal: 'center' }, border: thinBorder });
  ws.mergeCells(`C${r}:D${r}`);
  setCell(ws.getCell(`C${r}`), '', { border: thinBorder });
  const endMaq = r;

  // ─ Personal (columnas F-H) ─
  r = startRow;
  ws.mergeCells(`F${r}:H${r}`);
  setCell(ws.getCell(`F${r}`), 'PERSONAL DE OBRA', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });
  r++;
  ws.mergeCells(`F${r}:G${r}`);
  setCell(ws.getCell(`F${r}`), 'CARGO', { font: { bold: true, size: 9 }, border: thinBorder, fill: lightFill });
  setCell(ws.getCell(`H${r}`), 'CANTIDAD', { font: { bold: true, size: 9 }, alignment: { horizontal: 'center' }, border: thinBorder, fill: lightFill });

  const pers = data.personal || [];
  pers.forEach((p) => {
    r++;
    ws.mergeCells(`F${r}:G${r}`);
    setCell(ws.getCell(`F${r}`), p.cargo || '', { border: thinBorder });
    setCell(ws.getCell(`H${r}`), p.cantidad || 0, { alignment: { horizontal: 'center' }, border: thinBorder });
  });
  r++;
  ws.mergeCells(`F${r}:G${r}`);
  setCell(ws.getCell(`F${r}`), 'TOTAL PERSONAL', { font: { bold: true }, border: thinBorder });
  setCell(ws.getCell(`H${r}`), pers.reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0), { font: { bold: true }, alignment: { horizontal: 'center' }, border: thinBorder });
  const endPers = r;

  // Igualar altura de ambas tablas
  r = Math.max(endMaq, endPers) + 2;

  // ══ COMISIÓN DE TOPOGRAFÍA ══
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'COMISIÓN DE TOPOGRAFÍA', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });
  r++;
  const topoLabels = ['Levantamiento', 'Replanteo', 'Nivelación', 'Verificación'];
  topoLabels.forEach((lbl, idx) => {
    const c1 = String.fromCharCode(65 + idx * 2);
    const c2 = String.fromCharCode(66 + idx * 2);
    setCell(ws.getCell(`${c1}${r}`), lbl, { font: { bold: true }, border: thinBorder });
    const val = data.topografia && data.topografia[idx] ? data.topografia[idx] : (idx % 2 === 0 ? 'SI' : 'NO');
    setCell(ws.getCell(`${c2}${r}`), val, { alignment: { horizontal: 'center' }, border: thinBorder });
  });

  r += 2;

  // ══ OBSERVACIONES + RIESGO ══
  ws.mergeCells(`A${r}:D${r}`);
  setCell(ws.getCell(`A${r}`), 'OBSERVACIONES GENERALES', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });
  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), 'RIESGO FÍSICO Y LOCATIVO', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: subFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });

  r++;
  ws.mergeCells(`A${r}:D${r + 2}`);
  setCell(ws.getCell(`A${r}`), data.observaciones || '', { border: thinBorder, alignment: { vertical: 'top', wrapText: true } });

  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), `Estado Inicio: ${data.estadoInicio || ''}`, { border: thinBorder });
  r++;
  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), `Estado Final: ${data.estadoFin || ''}`, { border: thinBorder });

  r += 2;

  // ══ ACTIVIDADES DEL DÍA ══
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'ACTIVIDADES DEL DÍA', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: headerFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });

  const acts = data.actividades || [];
  acts.forEach((grupo) => {
    r++;
    ws.mergeCells(`A${r}:H${r}`);
    setCell(ws.getCell(`A${r}`), grupo.categoria || '', {
      font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } },
      alignment: { horizontal: 'left' },
      border: thinBorder,
    });
    (grupo.actividades || []).forEach((a, idx) => {
      r++;
      ws.mergeCells(`A${r}:H${r}`);
      setCell(ws.getCell(`A${r}`), `${idx + 1}. ${a}`, { border: thinBorder, alignment: { vertical: 'top', wrapText: true } });
      ws.getRow(r).height = 18;
    });
  });

  r += 2;

  // ══ RECURSOS CONTROL OBRA ══
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'RECURSOS CONTROL OBRA', {
    font: { bold: true, size: 10, color: { argb: 'FFFFFFFF' } },
    fill: headerFill,
    alignment: { horizontal: 'center' },
    border: thinBorder,
  });

  r++;
  setCell(ws.getCell(`A${r}`), 'Ítem', { font: { bold: true }, border: thinBorder, fill: lightFill });
  for (let d = 1; d <= 31; d++) {
    const col = String.fromCharCode(66 + d - 1);
    setCell(ws.getCell(`${col}${r}`), d, { font: { bold: true, size: 8 }, alignment: { horizontal: 'center' }, border: thinBorder, fill: lightFill });
  }

  const recursos = data.recursos || [
    { nombre: 'Coordinador de Control Obra', dias: [] },
    { nombre: 'Ingeniero Electricista', dias: [] },
    { nombre: 'Profesional SST', dias: [] },
  ];
  recursos.forEach((rec) => {
    r++;
    setCell(ws.getCell(`A${r}`), rec.nombre || '', { font: { bold: true }, border: thinBorder });
    for (let d = 1; d <= 31; d++) {
      const col = String.fromCharCode(66 + d - 1);
      const val = rec.dias && rec.dias[d - 1] ? rec.dias[d - 1] : '';
      setCell(ws.getCell(`${col}${r}`), val, { alignment: { horizontal: 'center' }, border: thinBorder });
    }
  });

  r += 3;

  // ══ FIRMAS ══
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), 'Elaborado por:', { font: { bold: true, size: 10 }, border: thinBorder });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), 'Revisado por:', { font: { bold: true, size: 10 }, border: thinBorder });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), 'Aprobado por:', { font: { bold: true, size: 10 }, border: thinBorder });

  r++;
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), data.elaboradoPor || '', { alignment: { horizontal: 'center' }, border: thinBorder });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), data.revisadoPor || '', { alignment: { horizontal: 'center' }, border: thinBorder });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), data.aprobadoPor || '', { alignment: { horizontal: 'center' }, border: thinBorder });

  r++;
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), '_________________________', { alignment: { horizontal: 'center' } });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), '_________________________', { alignment: { horizontal: 'center' } });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), '_________________________', { alignment: { horizontal: 'center' } });

  // ── ajustar anchos ──
  ws.columns = [
    { width: 32 }, { width: 8 }, { width: 12 }, { width: 14 },
    { width: 4 },  // columna E vacía separadora
    { width: 22 }, { width: 14 }, { width: 10 },
  ];

  // ── generar buffer y descargar ──
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.filename || 'Informe_Diario'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════

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

  // ── helper para armar payload de exportación ──
  const handleExportExcel = () => {
    const payload = {
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
      filename: `Informe_Diario_${informe?.obra_nombre || 'Obra'}`,
    };
    exportarInformeExcel(payload);
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
    marginLeft: 'auto', // empuja a la derecha cuando hay espacio
    boxShadow: '0 2px 6px rgba(31,78,121,0.25)',
  },
};
