/**
 * InformeDiarioExcel.js
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
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function colLetter(n) {
  // Convierte índice 0-based a letra de columna: 0=A, 1=B, 25=Z, 26=AA, etc.
  let result = '';
  n++;
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

function applyStyle(cell, style = {}) {
  cell.style = {
    font: { size: 9, ...style.font },
    alignment: { vertical: 'center', wrapText: true, ...style.alignment },
    border: style.border || GRAY_BORDER,
    fill: style.fill || undefined,
  };
}

// ═══════════════════════════════════════════════════════════════
//  FUNCIÓN PRINCIPAL DE EXPORTACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Exporta un Informe Diario de Obra a Excel con formato F-141-IN
 *
 * @param {Object} data - Datos del informe
 * @param {string} [filename] - Nombre base del archivo (sin extensión)
 */
export async function exportInformeDiarioExcel(data, filename = 'Informe_Diario_Obra') {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Informe Diario');

  // Definir suficientes columnas (A=0 hasta AF=31 para los días)
  // Necesitamos: A=ítem, B-AF=días 1-31 = 32 columnas mínimo
  const totalCols = 35;
  ws.columns = Array.from({ length: totalCols }, (_, i) => ({
    width: i === 0 ? 32 : (i <= 31 ? 6 : 10),
  }));

  let r = 1;

  // ═══════════════════════════════════════════════════════════
  //  1. ENCABEZADO PRINCIPAL
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 8);
  const titleCell = ws.getCell(r, 1);
  titleCell.value = 'CONSTRUCCIÓN DE OBRA – LIBRO DIARIO DE OBRA – INTERVENTORÍA';
  applyStyle(titleCell, {
    font: { bold: true, size: 14, color: { argb: COLORS.headerBlue } },
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getRow(r).height = 30;

  r++;
  ws.mergeCells(r, 1, r, 2);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = `COD: ${data.codigo || 'F-141-IN'}`;

  ws.mergeCells(r, 3, r, 5);
  applyStyle(ws.getCell(r, 3), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 3).value = `F. Emisión: ${data.fechaEmision || '27/08/2009'}`;

  ws.mergeCells(r, 6, r, 8);
  applyStyle(ws.getCell(r, 6), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 6).value = `Mod: ${data.modo || '00'}`;

  r++;
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 11 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = `OBRA: ${data.obra || ''}`;

  r++;
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = `FECHA: ${data.fecha || ''}  |  DÍA: ${data.diaSemana || ''}`;
  ws.getRow(r).height = 20;

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  2. REPORTE DE LLUVIA (horas 0-23)
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'REPORTE DE LLUVIA';

  r++;
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  ws.getCell(r, 1).value = 'Hora';

  for (let h = 0; h < 24; h++) {
    const col = h + 2; // empieza en columna B (índice 2)
    applyStyle(ws.getCell(r, col), {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
    ws.getCell(r, col).value = h;
  }

  r++;
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'Lluvia';

  for (let h = 0; h < 24; h++) {
    const col = h + 2;
    const val = data.lluviaHoras && data.lluviaHoras[h] !== undefined
      ? data.lluviaHoras[h]
      : '';
    applyStyle(ws.getCell(r, col), {
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
    });
    ws.getCell(r, col).value = val;
  }

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  3. MAQUINARIA (cols 1-4)  |  PERSONAL (cols 6-8)
  // ═══════════════════════════════════════════════════════════
  const startRow = r;

  // ── Maquinaria ──
  ws.mergeCells(r, 1, r, 4);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'MAQUINARIA – EQUIPOS – HERRAMIENTAS Y VEHÍCULOS';

  r++;
  ['ÍTEM', 'CANT.', 'EMPRESA', 'NOTAS'].forEach((txt, idx) => {
    applyStyle(ws.getCell(r, idx + 1), {
      font: { bold: true, size: 9 },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
    ws.getCell(r, idx + 1).value = txt;
  });

  const maq = data.maquinaria || [];
  maq.forEach((m) => {
    r++;
    applyStyle(ws.getCell(r, 1), { border: THIN_BORDER });
    ws.getCell(r, 1).value = m.item || '';

    applyStyle(ws.getCell(r, 2), { alignment: { horizontal: 'center' }, border: THIN_BORDER });
    ws.getCell(r, 2).value = m.cantidad || 0;

    applyStyle(ws.getCell(r, 3), { border: THIN_BORDER });
    ws.getCell(r, 3).value = m.empresa || '';

    applyStyle(ws.getCell(r, 4), { border: THIN_BORDER });
    ws.getCell(r, 4).value = m.notas || '';
  });

  r++;
  applyStyle(ws.getCell(r, 1), { font: { bold: true }, border: THIN_BORDER });
  ws.getCell(r, 1).value = 'TOTAL';

  applyStyle(ws.getCell(r, 2), {
    font: { bold: true },
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 2).value = maq.reduce((s, m) => s + (parseInt(m.cantidad) || 0), 0);

  ws.mergeCells(r, 3, r, 4);
  applyStyle(ws.getCell(r, 3), { border: THIN_BORDER });
  ws.getCell(r, 3).value = '';

  const endMaq = r;

  // ── Personal (columnas 6-8 = F-H) ──
  r = startRow;
  ws.mergeCells(r, 6, r, 8);
  applyStyle(ws.getCell(r, 6), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 6).value = 'PERSONAL DE OBRA';

  r++;
  ws.mergeCells(r, 6, r, 7);
  applyStyle(ws.getCell(r, 6), {
    font: { bold: true, size: 9 },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  ws.getCell(r, 6).value = 'CARGO';

  applyStyle(ws.getCell(r, 8), {
    font: { bold: true, size: 9 },
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  ws.getCell(r, 8).value = 'CANTIDAD';

  const pers = data.personal || [];
  pers.forEach((p) => {
    r++;
    ws.mergeCells(r, 6, r, 7);
    applyStyle(ws.getCell(r, 6), { border: THIN_BORDER });
    ws.getCell(r, 6).value = p.cargo || '';

    applyStyle(ws.getCell(r, 8), { alignment: { horizontal: 'center' }, border: THIN_BORDER });
    ws.getCell(r, 8).value = p.cantidad || 0;
  });

  r++;
  ws.mergeCells(r, 6, r, 7);
  applyStyle(ws.getCell(r, 6), { font: { bold: true }, border: THIN_BORDER });
  ws.getCell(r, 6).value = 'TOTAL PERSONAL';

  applyStyle(ws.getCell(r, 8), {
    font: { bold: true },
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 8).value = pers.reduce((s, p) => s + (parseInt(p.cantidad) || 0), 0);

  const endPers = r;

  // Igualar altura de ambas tablas
  r = Math.max(endMaq, endPers) + 2;

  // ═══════════════════════════════════════════════════════════
  //  4. COMISIÓN DE TOPOGRAFÍA
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'COMISIÓN DE TOPOGRAFÍA';

  r++;
  const topoLabels = ['Levantamiento', 'Replanteo', 'Nivelación', 'Verificación'];
  topoLabels.forEach((lbl, idx) => {
    const c1 = idx * 2 + 1; // 1, 3, 5, 7
    const c2 = idx * 2 + 2; // 2, 4, 6, 8
    applyStyle(ws.getCell(r, c1), { font: { bold: true }, border: THIN_BORDER });
    ws.getCell(r, c1).value = lbl;

    const val = data.topografia && data.topografia[idx] !== undefined
      ? data.topografia[idx]
      : (idx % 2 === 0 ? 'SI' : 'NO');
    applyStyle(ws.getCell(r, c2), { alignment: { horizontal: 'center' }, border: THIN_BORDER });
    ws.getCell(r, c2).value = val;
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  5. OBSERVACIONES + RIESGO FÍSICO Y LOCATIVO
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 4);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'OBSERVACIONES GENERALES';

  ws.mergeCells(r, 5, r, 8);
  applyStyle(ws.getCell(r, 5), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: SUB_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 5).value = 'RIESGO FÍSICO Y LOCATIVO';

  r++;
  ws.mergeCells(r, 1, r + 2, 4);
  applyStyle(ws.getCell(r, 1), {
    border: THIN_BORDER,
    alignment: { vertical: 'top', wrapText: true },
  });
  ws.getCell(r, 1).value = data.observaciones || '';

  ws.mergeCells(r, 5, r, 8);
  applyStyle(ws.getCell(r, 5), { border: THIN_BORDER });
  ws.getCell(r, 5).value = `Estado Inicio: ${data.estadoInicio || ''}`;

  r++;
  ws.mergeCells(r, 5, r, 8);
  applyStyle(ws.getCell(r, 5), { border: THIN_BORDER });
  ws.getCell(r, 5).value = `Estado Final: ${data.estadoFin || ''}`;

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  6. ACTIVIDADES DEL DÍA
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: HEADER_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'ACTIVIDADES DEL DÍA';

  const acts = data.actividades || [];
  acts.forEach((grupo) => {
    r++;
    ws.mergeCells(r, 1, r, 8);
    applyStyle(ws.getCell(r, 1), {
      font: { bold: true, size: 10, color: { argb: COLORS.white } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } },
      alignment: { horizontal: 'left' },
      border: THIN_BORDER,
    });
    ws.getCell(r, 1).value = grupo.categoria || '';

    (grupo.actividades || []).forEach((a, idx) => {
      r++;
      ws.mergeCells(r, 1, r, 8);
      applyStyle(ws.getCell(r, 1), {
        border: THIN_BORDER,
        alignment: { vertical: 'top', wrapText: true },
      });
      ws.getCell(r, 1).value = `${idx + 1}. ${a}`;
      ws.getRow(r).height = 18;
    });
  });

  r += 2;

  // ═══════════════════════════════════════════════════════════
  //  7. RECURSOS CONTROL OBRA (días 1-31)
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 8);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10, color: { argb: COLORS.white } },
    fill: HEADER_FILL,
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'RECURSOS CONTROL OBRA';

  r++;
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true },
    border: THIN_BORDER,
    fill: LIGHT_FILL,
  });
  ws.getCell(r, 1).value = 'Ítem';

  for (let d = 1; d <= 31; d++) {
    const col = d + 1; // columna B=2 en adelante
    applyStyle(ws.getCell(r, col), {
      font: { bold: true, size: 8 },
      alignment: { horizontal: 'center' },
      border: THIN_BORDER,
      fill: LIGHT_FILL,
    });
    ws.getCell(r, col).value = d;
  }

  const recursos = data.recursos || [];
  recursos.forEach((rec) => {
    r++;
    applyStyle(ws.getCell(r, 1), {
      font: { bold: true },
      border: THIN_BORDER,
    });
    ws.getCell(r, 1).value = rec.nombre || '';

    for (let d = 1; d <= 31; d++) {
      const col = d + 1;
      const val = rec.dias && rec.dias[d - 1] !== undefined ? rec.dias[d - 1] : '';
      applyStyle(ws.getCell(r, col), {
        alignment: { horizontal: 'center' },
        border: THIN_BORDER,
      });
      ws.getCell(r, col).value = val;
    }
  });

  r += 3;

  // ═══════════════════════════════════════════════════════════
  //  8. FIRMAS
  // ═══════════════════════════════════════════════════════════
  ws.mergeCells(r, 1, r, 3);
  applyStyle(ws.getCell(r, 1), {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = 'Elaborado por:';

  ws.mergeCells(r, 4, r, 6);
  applyStyle(ws.getCell(r, 4), {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 4).value = 'Revisado por:';

  ws.mergeCells(r, 7, r, 8);
  applyStyle(ws.getCell(r, 7), {
    font: { bold: true, size: 10 },
    border: THIN_BORDER,
  });
  ws.getCell(r, 7).value = 'Aprobado por:';

  r++;
  ws.mergeCells(r, 1, r, 3);
  applyStyle(ws.getCell(r, 1), {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 1).value = data.elaboradoPor || '';

  ws.mergeCells(r, 4, r, 6);
  applyStyle(ws.getCell(r, 4), {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 4).value = data.revisadoPor || '';

  ws.mergeCells(r, 7, r, 8);
  applyStyle(ws.getCell(r, 7), {
    alignment: { horizontal: 'center' },
    border: THIN_BORDER,
  });
  ws.getCell(r, 7).value = data.aprobadoPor || '';

  r++;
  ws.mergeCells(r, 1, r, 3);
  applyStyle(ws.getCell(r, 1), { alignment: { horizontal: 'center' } });
  ws.getCell(r, 1).value = '_________________________';

  ws.mergeCells(r, 4, r, 6);
  applyStyle(ws.getCell(r, 4), { alignment: { horizontal: 'center' } });
  ws.getCell(r, 4).value = '_________________________';

  ws.mergeCells(r, 7, r, 8);
  applyStyle(ws.getCell(r, 7), { alignment: { horizontal: 'center' } });
  ws.getCell(r, 7).value = '_________________________';

  // ═══════════════════════════════════════════════════════════
  //  9. GENERAR Y DESCARGAR ARCHIVO
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
