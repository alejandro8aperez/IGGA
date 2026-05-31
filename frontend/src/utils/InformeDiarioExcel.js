/**
 * exportInformeDiarioExcel.js
 * Utilidad para exportar Informes Diarios de Obra a Excel
 * Formato F-141-IN (Libro Diario de Obra - Interventoría)
 *
 * Dependencia: npm install exceljs
 */

import ExcelJS from 'exceljs';

// ═══════════════════════════════════════════════════════════════
//  COLORES Y ESTILOS BASE
// ═══════════════════════════════════════════════════════════════
const COLORS = {
  headerBlue:   'FF1F4E79',
  subBlue:      'FF2E75B6',
  lightBlue:    'FFD9E2F3',
  white:        'FFFFFFFF',
  black:        'FF000000',
  gray:         'FFAAAAAA',
  textDark:     'FF1E293B',
  textMuted:    'FF64748B',
  teal:         'FF0D9488',
};

const THIN_BORDER = {
  top:    { style: 'thin', color: { argb: COLORS.black } },
  bottom: { style: 'thin', color: { argb: COLORS.black } },
  left:   { style: 'thin', color: { argb: COLORS.black } },
  right:  { style: 'thin', color: { argb: COLORS.black } },
};

const GRAY_BORDER = {
  top:    { style: 'thin', color: { argb: COLORS.gray } },
  bottom: { style: 'thin', color: { argb: COLORS.gray } },
  left:   { style: 'thin', color: { argb: COLORS.gray } },
  right:  { style: 'thin', color: { argb: COLORS.gray } },
};

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBlue } };
const SUB_FILL    = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.subBlue } };
const LIGHT_FILL  = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightBlue } };

// ═══════════════════════════════════════════════════════════════
//  FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Exporta un Informe Diario de Obra a Excel con formato F-141-IN
 *
 * @param {Object} data - Datos del informe
 * @param {string} [filename] - Nombre base del archivo (sin extensión)
 *
 * Estructura esperada de `data`:
 * {
 *   codigo: 'F-141-IN',
 *   fechaEmision: '27/08/2009',
 *   modo: '00',
 *   obra: 'Ampliación SE LA LOMA 500 kV',
 *   fecha: '31/03/2026',
 *   diaSemana: 'MARTES',
 *   lluviaHoras: { 0: 'X', 1: 'X', 2: 'X', ... }, // hora -> valor
 *   maquinaria: [
 *     { item: 'CAMIONETAS (Siemens)', cantidad: 1, empresa: 'Siemens', notas: '' },
 *     ...
 *   ],
 *   personal: [
 *     { cargo: 'Residente Técnico (Siemens)', cantidad: 1 },
 *     ...
 *   ],
 *   topografia: ['SI', 'NO', 'SI', 'NO'], // 4 checks
 *   observaciones: 'Texto de observaciones...',
 *   estadoInicio: 'Riesgo Físico y Locativo',
 *   estadoFin: 'Riesgo Físico y Locativo',
 *   actividades: [
 *     { categoria: 'ADMINISTRATIVAS Y DOCUMENTALES', actividades: ['Item 1', 'Item 2'] },
 *     ...
 *   ],
 *   recursos: [
 *     { nombre: 'Coordinador de Control Obra', dias: ['1','1',...] }, // 31 días
 *     ...
 *   ],
 *   elaboradoPor: 'Nelson Henao',
 *   revisadoPor: 'Diego León Vélez',
 *   aprobadoPor: 'Diego León Vélez',
 * }
 */
export async function exportInformeDiarioExcel(data, filename = 'Informe_Diario_Obra') {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Informe Diario');

  // ── helper para aplicar estilo a celda ──
  const setCell = (cell, value, style = {}) => {
    cell.value = value;
    cell.style = {
      font: { size: 9, ...style.font },
      alignment: { vertical: 'center', wrapText: true, ...style.alignment },
      border: style.border || GRAY_BORDER,
      fill: style.fill || undefined,
    };
  };

  let r = 1;

  // ═══════════════════════════════════════════════════════════
  //  1. ENCABEZADO PRINCIPAL
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`),
    'CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA – INTERVENTORÍA',
    {
      font: { bold: true, size: 14, color: { argb: COLORS.headerBlue } },
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    }
  );
  ws.getRow(r).height = 30;

  r++;
  ws.mergeCells(`A${r}:B${r}`);
  setCell(ws.getCell(`A${r}`), `COD: ${data.codigo || 'F-141-IN'}`, {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.mergeCells(`C${r}:E${r}`);
  setCell(ws.getCell(`C${r}`), `F. Emisión: ${data.fechaEmision || '27/08/2009'}`, {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.mergeCells(`F${r}:H${r}`);
  setCell(ws.getCell(`F${r}`), `Mod: ${data.modo || '00'}`, {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), `OBRA: ${data.obra || ''}`, {
    font: { bold: true, size: 11 },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), `FECHA: ${data.fecha || ''}  |  DÍA: ${data.diaSemana || ''}`, {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getRow(r).height = 20;

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  2. REPORTE DE LLUVIA (horas 0-23)
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'REPORTE DE LLUVIA', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  setCell(ws.getCell(`A${r}`), 'Hora', {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  for (let h = 0; h < 24; h++) {
    const col = String.fromCharCode(66 + h); // B, C, D... Y
    setCell(ws.getCell(`${col}${r}`), h, {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
  }

  r++;
  setCell(ws.getCell(`A${r}`), 'Lluvia', {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  for (let h = 0; h < 24; h++) {
    const col = String.fromCharCode(66 + h);
    const val = data.lluviaHoras && data.lluviaHoras[h] !== undefined
      ? data.lluviaHoras[h]
      : '';
    setCell(ws.getCell(`${col}${r}`), val, {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    });
  }

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  3. MAQUINARIA (cols A-D)  |  PERSONAL (cols F-H)
  // ═══════════════════════════════════════════════════════════
  const startRow = r;

  // ── Maquinaria ──
  ws.mergeCells(`A${r}:D${r}`);
  setCell(ws.getCell(`A${r}`),
    'MAQUINARIA – EQUIPOS – HERRAMIENTAS Y VEHÍCULOS',
    {
      font: { bold: true, size: 10, color: { argb: COLORS.white } },
      fill: SUB_FILL,
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    }
  );

  r++;
  ['ÍTEM', 'CANT.', 'EMPRESA', 'NOTAS'].forEach((txt, idx) => {
    const col = String.fromCharCode(65 + idx);
    setCell(ws.getCell(`${col}${r}`), txt, {
      font: { bold: true, size: 9 },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
  });

  const maq = data.maquinaria || [];
  maq.forEach((m) => {
    r++;
    setCell(ws.getCell(`A${r}`), m.item || '', { border: THIN_BORDER });
    setCell(ws.getCell(`B${r}`), m.cantidad || 0, {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    });
    setCell(ws.getCell(`C${r}`), m.empresa || '', { border: THIN_BORDER });
    setCell(ws.getCell(`D${r}`), m.notas || '', { border: THIN_BORDER });
  });

  r++;
  setCell(ws.getCell(`A${r}`), 'TOTAL', {
    font: { bold: true },
    border: THIN_BORDER,
  });
  setCell(ws.getCell(`B${r}`),
    maq.reduce((s, m) => s + (parseInt(m.cantidad) || 0), 0),
    {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    }
  );
  ws.mergeCells(`C${r}:D${r}`);
  setCell(ws.getCell(`C${r}`), '', { border: THIN_BORDER });
  const endMaq = r;

  // ── Personal (columnas F-H) ──
  r = startRow;
  ws.mergeCells(`F${r}:H${r}`);
  setCell(ws.getCell(`F${r}`), 'PERSONAL DE OBRA', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`F${r}:G${r}`);
  setCell(ws.getCell(`F${r}`), 'CARGO', {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  setCell(ws.getCell(`H${r}`), 'CANTIDAD', {
    font: { bold: true, size: 9 },
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });

  const pers = data.personal || [];
  pers.forEach((p) => {
    r++;
    ws.mergeCells(`F${r}:G${r}`);
    setCell(ws.getCell(`F${r}`), p.cargo || '', { border: THIN_BORDER });
    setCell(ws.getCell(`H${r}`), p.cantidad || 0, {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    });
  });

  r++;
  ws.mergeCells(`F${r}:G${r}`);
  setCell(ws.getCell(`F${r}`), 'TOTAL PERSONAL', {
    font: { bold: true },
    border: THIN_BORDER,
  });
  setCell(ws.getCell(`H${r}`),
    pers.reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0),
    {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    }
  );
  const endPers = r;

  // Igualar altura de ambas tablas
  r = Math.max(endMaq, endPers) + 2;

  // ═══════════════════════════════════════════════════════════
  //  4. COMISIÓN DE TOPOGRAFÍA
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'COMISIÓN DE TOPOGRAFÍA', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  const topoLabels = ['Levantamiento', 'Replanteo', 'Nivelación', 'Verificación'];
  topoLabels.forEach((lbl, idx) => {
    const c1 = String.fromCharCode(65 + idx * 2); // A, C, E, G
    const c2 = String.fromCharCode(66 + idx * 2); // B, D, F, H
    setCell(ws.getCell(`${c1}${r}`), lbl, {
      font: { bold: true },
      border: THIN_BORDER,
    });
    const val = data.topografia && data.topografia[idx] !== undefined
      ? data.topografia[idx]
      : (idx % 2 === 0 ? 'SI' : 'NO');
    setCell(ws.getCell(`${c2}${r}`), val, {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    });
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  5. OBSERVACIONES + RIESGO FÍSICO Y LOCATIVO
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:D${r}`);
  setCell(ws.getCell(`A${r}`), 'OBSERVACIONES GENERALES', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), 'RIESGO FÍSICO Y LOCATIVO', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`A${r}:D${r + 2}`);
  setCell(ws.getCell(`A${r}`), data.observaciones || '', {
    border: THIN_BORDER,
    alignment: { vertical: 'top', wrapText: true },
  });

  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), `Estado Inicio: ${data.estadoInicio || ''}`, {
    border: THIN_BORDER,
  });
  r++;
  ws.mergeCells(`E${r}:H${r}`);
  setCell(ws.getCell(`E${r}`), `Estado Final: ${data.estadoFin || ''}`, {
    border: THIN_BORDER,
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  6. ACTIVIDADES DEL DÍA
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'ACTIVIDADES DEL DÍA', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: HEADER_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  const acts = data.actividades || [];
  acts.forEach((grupo) => {
    r++;
    ws.mergeCells(`A${r}:H${r}`);
    setCell(ws.getCell(`A${r}`), grupo.categoria || '', {
      font: { bold: true, size: 10, color: { argb: COLORS.white } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } },
      alignment: { horizontal: 'left' },
      border: THIN_BORDER,
    });

    (grupo.actividades || []).forEach((a, idx) => {
      r++;
      ws.mergeCells(`A${r}:H${r}`);
      setCell(ws.getCell(`A${r}`), `${idx + 1}. ${a}`, {
        border: THIN_BORDER,
        alignment: { vertical: 'top', wrapText: true },
      });
      ws.getRow(r).height = 18;
    });
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  7. RECURSOS CONTROL OBRA (días 1-31)
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:H${r}`);
  setCell(ws.getCell(`A${r}`), 'RECURSOS CONTROL OBRA', {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: HEADER_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  setCell(ws.getCell(`A${r}`), 'Ítem', {
    font: { bold: true },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  for (let d = 1; d <= 31; d++) {
    const col = String.fromCharCode(66 + d - 1);
    setCell(ws.getCell(`${col}${r}`), d, {
      font: { bold: true, size: 8 },
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
  }

  const recursos = data.recursos || [];
  recursos.forEach((rec) => {
    r++;
    setCell(ws.getCell(`A${r}`), rec.nombre || '', {
      font: { bold: true },
      border: THIN_BORDER,
    });
    for (let d = 1; d <= 31; d++) {
      const col = String.fromCharCode(66 + d - 1);
      const val = rec.dias && rec.dias[d - 1] !== undefined ? rec.dias[d - 1] : '';
      setCell(ws.getCell(`${col}${r}`), val, {
        alignment: { horizontal: 'center' },
        border: THIN_BORDER,
      });
    }
  });

  r += 3;

  // ═══════════════════════════════════════════════════════════
  //  8. FIRMAS
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), 'Elaborado por:', {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), 'Revisado por:', {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), 'Aprobado por:', {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), data.elaboradoPor || '', {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), data.revisadoPor || '', {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), data.aprobadoPor || '', {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });

  r++;
  ws.mergeCells(`A${r}:C${r}`);
  setCell(ws.getCell(`A${r}`), '_________________________', {
    alignment: { horizontal: 'center' },
  });
  ws.mergeCells(`D${r}:F${r}`);
  setCell(ws.getCell(`D${r}`), '_________________________', {
    alignment: { horizontal: 'center' },
  });
  ws.mergeCells(`G${r}:H${r}`);
  setCell(ws.getCell(`G${r}`), '_________________________', {
    alignment: { horizontal: 'center' },
  });

  // ═══════════════════════════════════════════════════════════
  //  9. AJUSTAR ANCHOS DE COLUMNA
  // ═══════════════════════════════════════════════════════════
  ws.columns = [
    { width: 32 }, // A
    { width: 8 },  // B
    { width: 12 }, // C
    { width: 14 }, // D
    { width: 4 },  // E (separador vacía)
    { width: 22 }, // F
    { width: 14 }, // G
    { width: 10 }, // H
  ];

  // Asegurar que las columnas I en adelante existan para las horas de lluvia
  for (let c = 9; c <= 26; c++) {
    ws.getColumn(c).width = 6;
  }

  // ═══════════════════════════════════════════════════════════
  //  10. GENERAR Y DESCARGAR ARCHIVO
  // ═══════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════
//  HELPER: prepararDatosExport
// ═══════════════════════════════════════════════════════════════

/**
 * Prepara los datos del estado de React para pasarlos a exportInformeDiarioExcel.
 * Solo incluye las propiedades que reciba; el resto queda con valores por defecto.
 *
 * @param {Object} state - Estado del componente (maquinaria, personal, actividades, etc.)
 * @returns {Object} Datos formateados listos para exportar
 */
export function prepararDatosExport(state = {}) {
  return {
    codigo: state.codigo || 'F-141-IN',
    fechaEmision: state.fechaEmision || '27/08/2009',
    modo: state.modo || '00',
    obra: state.obra || state.obra_nombre || '',
    fecha: state.fecha || '',
    diaSemana: state.diaSemana || '',
    lluviaHoras: state.lluviaHoras || {},
    maquinaria: state.maquinaria || [],
    personal: state.personal || [],
    topografia: state.topografia || [],
    observaciones: state.observaciones || '',
    estadoInicio: state.estadoInicio || '',
    estadoFin: state.estadoFin || '',
    actividades: state.actividades || [],
    recursos: state.recursos || [],
    elaboradoPor: state.elaboradoPor || '',
    revisadoPor: state.revisadoPor || '',
    aprobadoPor: state.aprobadoPor || '',
  };
}

// ═══════════════════════════════════════════════════════════════
//  EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════
export default {
  exportInformeDiarioExcel,
  prepararDatosExport,
};
