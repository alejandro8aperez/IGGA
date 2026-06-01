// exportInformeExcel.js
// Ubicación: frontend/src/utils/exportInformeExcel.js
// Usa SheetJS (xlsx) — ya incluido en el proyecto React, NO requiere npm install

import * as XLSX from 'xlsx';

export function exportarInformeExcel({
  informe, maquinaria, personal, actividades,
  lluvia, topografia, estadoInicio, estadoFin,
}) {
  const wb = XLSX.utils.book_new();
  const ws = {};
  const merges = [];
  let R = 0;

  const enc = (r, col) => XLSX.utils.encode_cell({ r, c: col });
  const mrg = (rs, re, cs, ce) => ({ s: { r: rs, c: cs }, e: { r: re, c: ce } });

  function mk(v, opts = {}) {
    const {
      bold = false, bg = null, center = false,
      sz = 9, color = null, italic = false, border = true,
    } = opts;
    const font = { name: 'Arial', sz, bold, italic };
    if (color) font.color = { rgb: color };
    const s = {
      font,
      alignment: {
        horizontal: center ? 'center' : 'left',
        vertical: 'center',
        wrapText: true,
      },
    };
    if (bg) s.fill = { fgColor: { rgb: bg }, patternType: 'solid' };
    if (border) {
      const b = { style: 'thin', color: { rgb: 'CCCCCC' } };
      s.border = { top: b, bottom: b, left: b, right: b };
    }
    return { v: v ?? '', t: typeof v === 'number' ? 'n' : 's', s };
  }

  // ── LOGO / ENCABEZADO ──────────────────────────────────────────────
  // Bloque IGGA (A1:B4)
  ws[enc(R, 0)] = mk('IGGA', { bold: true, bg: '1B3A5C', center: true, sz: 18, color: 'FFFFFF' });
  merges.push(mrg(R, R + 2, 0, 1));

  // Título principal (C1:J1)
  ws[enc(R, 2)] = mk('"CONSTRUCCIÓN DE OBRA — LIBRO DIARIO DE OBRA INTERVENTORÍA"',
    { bold: true, bg: '1F3A5F', center: true, sz: 12, color: 'FFFFFF' });
  merges.push(mrg(R, R, 2, 9));
  R++;

  ws[enc(R, 2)] = mk('COD: F-141-IN  |  F. Emisión: 27/08/2009  |  Mod: 00',
    { bg: 'D9E1F2', center: true, sz: 8 });
  merges.push(mrg(R, R, 2, 9));
  R++;

  ws[enc(R, 2)] = mk('INTERVENTORÍA', { bold: true, bg: '2E75B6', center: true, sz: 10, color: 'FFFFFF' });
  merges.push(mrg(R, R, 2, 9));
  R++;

  // Obra / Fecha
  ws[enc(R, 0)] = mk('OBRA:', { bold: true, bg: 'D9E1F2', sz: 9 });
  ws[enc(R, 1)] = mk(informe?.obra_nombre || 'Ampliación SE LA LOMA 500 kV',
    { bold: true, sz: 11 });
  merges.push(mrg(R, R, 1, 6));
  ws[enc(R, 7)] = mk('FECHA:', { bold: true, bg: 'D9E1F2', center: true, sz: 9 });
  ws[enc(R, 8)] = mk(informe?.fecha || new Date().toLocaleDateString('es-CO'),
    { center: true, sz: 10 });
  merges.push(mrg(R, R, 8, 9));
  R++;

  // Lluvia / Topografía
  ws[enc(R, 0)] = mk('REPORTE DE LLUVIA:', { bold: true, bg: 'D9E1F2', sz: 9 });
  merges.push(mrg(R, R, 0, 1));
  ws[enc(R, 2)] = mk(lluvia ? '✓  SI' : '○  NO',
    { bg: lluvia ? 'C6EFCE' : 'FFFFFF', center: true, sz: 10,
      color: lluvia ? '006100' : '555555' });
  merges.push(mrg(R, R, 2, 3));
  ws[enc(R, 4)] = mk('COMISIÓN DE TOPOGRAFÍA:', { bold: true, bg: 'D9E1F2', sz: 9 });
  merges.push(mrg(R, R, 4, 6));
  ws[enc(R, 7)] = mk(topografia ? '✓  SI' : '○  NO',
    { bg: topografia ? 'C6EFCE' : 'FFFFFF', center: true, sz: 10,
      color: topografia ? '006100' : '555555' });
  merges.push(mrg(R, R, 7, 9));
  R++; R++;

  // ── MAQUINARIA + PERSONAL (lado a lado) ──────────────────────────
  ws[enc(R, 0)] = mk('MAQUINARIA — EQUIPOS — HERRAMIENTAS DE PODER Y VEHÍCULOS',
    { bold: true, bg: '1F3A5F', center: true, sz: 9, color: 'FFFFFF' });
  merges.push(mrg(R, R, 0, 4));
  ws[enc(R, 5)] = mk('PERSONAL DE OBRA',
    { bold: true, bg: '1F3A5F', center: true, sz: 9, color: 'FFFFFF' });
  merges.push(mrg(R, R, 5, 9));
  R++;

  // Sub-headers
  ws[enc(R, 0)] = mk('ÍTEM', { bold: true, bg: '2E75B6', center: true, sz: 9, color: 'FFFFFF' });
  merges.push(mrg(R, R, 0, 2));
  ws[enc(R, 3)] = mk('EMPRESA', { bold: true, bg: '2E75B6', center: true, sz: 9, color: 'FFFFFF' });
  ws[enc(R, 4)] = mk('CANT.', { bold: true, bg: '2E75B6', center: true, sz: 9, color: 'FFFFFF' });
  ws[enc(R, 5)] = mk('CARGO', { bold: true, bg: '2E75B6', center: true, sz: 9, color: 'FFFFFF' });
  merges.push(mrg(R, R, 5, 8));
  ws[enc(R, 9)] = mk('CANT.', { bold: true, bg: '2E75B6', center: true, sz: 9, color: 'FFFFFF' });
  R++;

  const maxRows = Math.max(maquinaria.length, personal.length);
  for (let i = 0; i < maxRows; i++) {
    const m = maquinaria[i];
    const p = personal[i];
    const stripe = i % 2 === 0 ? 'FFFFFF' : 'F2F7FF';

    if (m) {
      ws[enc(R, 0)] = mk(m.item, { bg: stripe, sz: 9 });
      merges.push(mrg(R, R, 0, 2));
      ws[enc(R, 3)] = mk(m.empresa || '', { bg: stripe, center: true, sz: 8, italic: true });
      ws[enc(R, 4)] = mk(m.cantidad,
        { bg: m.cantidad > 0 ? 'E2EFDA' : stripe, center: true, sz: 9,
          color: m.cantidad > 0 ? '375623' : '999999', bold: m.cantidad > 0 });
    } else {
      ws[enc(R, 0)] = mk('', { bg: stripe });
      merges.push(mrg(R, R, 0, 4));
    }

    if (p) {
      ws[enc(R, 5)] = mk(p.cargo, { bg: stripe, sz: 9 });
      merges.push(mrg(R, R, 5, 8));
      ws[enc(R, 9)] = mk(p.cantidad,
        { bg: p.cantidad > 0 ? 'E2EFDA' : stripe, center: true, sz: 9,
          color: p.cantidad > 0 ? '375623' : '999999', bold: p.cantidad > 0 });
    } else {
      ws[enc(R, 5)] = mk('', { bg: stripe });
      merges.push(mrg(R, R, 5, 9));
    }
    R++;
  }

  // Totales
  const totM = maquinaria.reduce((s, m) => s + (m.cantidad || 0), 0);
  const totP = personal.reduce((s, p) => s + (p.cantidad || 0), 0);
  ws[enc(R, 0)] = mk('TOTAL EQUIPOS', { bold: true, bg: 'BDD7EE', center: true, sz: 9 });
  merges.push(mrg(R, R, 0, 3));
  ws[enc(R, 4)] = mk(totM, { bold: true, bg: '2E75B6', center: true, sz: 11, color: 'FFFFFF' });
  ws[enc(R, 5)] = mk('TOTAL PERSONAL', { bold: true, bg: 'BDD7EE', center: true, sz: 9 });
  merges.push(mrg(R, R, 5, 8));
  ws[enc(R, 9)] = mk(totP, { bold: true, bg: '2E75B6', center: true, sz: 11, color: 'FFFFFF' });
  R++; R++;

  // ── ESTADO DEL TERRENO ────────────────────────────────────────────
  ws[enc(R, 0)] = mk('ESTADO DEL TERRENO — INICIO DE JORNADA',
    { bold: true, bg: 'FFF2CC', sz: 9 });
  merges.push(mrg(R, R, 0, 4));
  ws[enc(R, 5)] = mk('ESTADO DEL TERRENO — FINAL DE JORNADA',
    { bold: true, bg: 'FFF2CC', sz: 9 });
  merges.push(mrg(R, R, 5, 9));
  R++;
  ws[enc(R, 0)] = mk(estadoInicio || 'Riesgo Físico y Locativo', { sz: 9 });
  merges.push(mrg(R, R, 0, 4));
  ws[enc(R, 5)] = mk(estadoFin || 'Riesgo Físico y Locativo', { sz: 9 });
  merges.push(mrg(R, R, 5, 9));
  R++; R++;

  // ── ACTIVIDADES DEL DÍA ──────────────────────────────────────────
  ws[enc(R, 0)] = mk('ACTIVIDADES DEL DÍA',
    { bold: true, bg: '1F3A5F', center: true, sz: 11, color: 'FFFFFF' });
  merges.push(mrg(R, R, 0, 9));
  R++;

  const CAT_COLORS = {
    admin:    { hdr: '4F46E5', bg: 'EEF2FF' },
    siemens:  { hdr: 'D97706', bg: 'FFFBEB' },
    cte:      { hdr: 'EA580C', bg: 'FFF7ED' },
    civil:    { hdr: '7C3AED', bg: 'F5F3FF' },
    sst:      { hdr: '059669', bg: 'ECFDF5' },
    ambiental:{ hdr: '16A34A', bg: 'F0FDF4' },
  };

  for (const grupo of actividades) {
    const cc = CAT_COLORS[grupo.id] || { hdr: '475569', bg: 'F8FAFC' };
    ws[enc(R, 0)] = mk(grupo.categoria,
      { bold: true, bg: cc.hdr, sz: 9, color: 'FFFFFF' });
    merges.push(mrg(R, R, 0, 9));
    R++;
    grupo.actividades.forEach((a, i) => {
      ws[enc(R, 0)] = mk(`${i + 1}.`, { bg: cc.bg, center: true, sz: 9 });
      ws[enc(R, 1)] = mk(a, { bg: cc.bg, sz: 9 });
      merges.push(mrg(R, R, 1, 9));
      R++;
    });
    R++;
  }

  // ── OBSERVACIONES GENERALES ───────────────────────────────────────
  ws[enc(R, 0)] = mk('OBSERVACIONES GENERALES',
    { bold: true, bg: 'F1F5F9', sz: 9 });
  merges.push(mrg(R, R, 0, 9));
  R++;
  ws[enc(R, 0)] = mk(informe?.observaciones || '', { sz: 9 });
  merges.push(mrg(R, R + 1, 0, 9));
  R += 2; R++;

  // ── FIRMAS ────────────────────────────────────────────────────────
  ['Elaborado por:', 'Revisado por:', 'Aprobado por:'].forEach((lbl, i) => {
    const col = i * 3 + (i === 2 ? 1 : 0);
    ws[enc(R, col)] = mk(lbl, { bold: true, bg: 'F1F5F9', sz: 9 });
    merges.push(i < 2 ? mrg(R, R, col, col + 2) : mrg(R, R, col, 9));
  });
  R++;
  [
    informe?.elaborado_por || 'Nelson Henao',
    informe?.revisado_por  || 'Diego León Vélez',
    informe?.aprobado_por  || 'Diego León Vélez',
  ].forEach((f, i) => {
    const col = i * 3 + (i === 2 ? 1 : 0);
    ws[enc(R, col)] = mk(f, { bold: true, sz: 9 });
    merges.push(i < 2 ? mrg(R, R, col, col + 2) : mrg(R, R, col, 9));
  });
  R++;
  ws[enc(R, 0)] = mk('INGENIERO ELECTRICISTA',
    { bold: true, bg: 'D9E1F2', center: true, sz: 9 });
  merges.push(mrg(R, R, 0, 4));
  ws[enc(R, 5)] = mk('COORDINADOR DE INTERVENTORÍA',
    { bold: true, bg: 'D9E1F2', center: true, sz: 9 });
  merges.push(mrg(R, R, 5, 9));

  // ── Config ────────────────────────────────────────────────────────
  ws['!merges'] = merges;
  ws['!cols'] = [
    { wch: 24 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 7  },
    { wch: 26 }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 7 },
  ];
  ws['!rows'] = Array.from({ length: R + 1 }, (_, i) => ({ hpt: i < 3 ? 22 : 18 }));
  ws['!ref']  = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: R, c: 9 } });
  ws['!pageSetup'] = { orientation: 'landscape', fitToWidth: 1, fitToPage: true };

  XLSX.utils.book_append_sheet(wb, ws, 'Informe Diario');

  const fecha = (informe?.fecha || new Date().toLocaleDateString('es-CO')).replace(/\//g, '-');
  const obra  = (informe?.obra_nombre || 'Informe').replace(/\s+/g, '_').substring(0, 25);
  XLSX.writeFile(wb, `Informe_Diario_${obra}_${fecha}.xlsx`);
}
