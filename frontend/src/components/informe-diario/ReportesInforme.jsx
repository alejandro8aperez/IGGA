import { useQuery } from '@tanstack/react-query';
import { informeDiarioService } from '@/services/informeDiarioApi';
import { useMemo } from 'react';
import { toast } from 'sonner';

const CAT_MAQ = 'MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS';
const CAT_PER = 'PERSONAL DE OBRA';

const SECCIONES_ACTIVIDADES = [
  { titulo: "ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES",         keywords: ["admin", "documental", "ingesed"] },
  { titulo: "ACTIVIDADES DE CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES", keywords: ["cableado", "conexionado", "pruebas funcionales", "siemens"] },
  { titulo: "ACTIVIDADES DE PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES",   keywords: ["pruebas de equipo", "montaje", "reactor", "cte"] },
  { titulo: "ACTIVIDADES DE OBRA CIVIL",                                     keywords: ["civil", "edemsa"] },
  { titulo: "GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO",             keywords: ["seguridad", "salud", "sst"] },
  { titulo: "ACTIVIDADES AMBIENTALES Y SOCIALES",                            keywords: ["ambiental", "social"] },
];

function normalizarCatNombre(cat) {
  if (!cat) return 'General';
  const n = cat.toLowerCase();
  for (const sec of SECCIONES_ACTIVIDADES) {
    if (sec.keywords.some(k => n.includes(k))) return sec.titulo;
  }
  return cat;
}

function normalizar(data) {
  if (!data) return null;

  let horasLluvia = Array(24).fill(false);
  if (Array.isArray(data.horas_lluvia)) {
    horasLluvia = data.horas_lluvia.map(h =>
      typeof h === 'boolean' ? h : Boolean(h?.con_lluvia ?? h)
    );
  } else if (Array.isArray(data.reportes_lluvia)) {
    data.reportes_lluvia.forEach(r => {
      if (r.hora >= 0 && r.hora < 24) horasLluvia[r.hora] = Boolean(r.con_lluvia);
    });
  }

  let recursos = [];
  if (Array.isArray(data.recursos) && data.recursos.length > 0) {
    recursos = data.recursos;
  } else {
    const detalles = (data.detalles || []).map(d => ({
      id: d.recurso || d.id,
      descripcion: d.recurso_nombre || d.descripcion || '',
      categoria: d.categoria_nombre || d.recurso_categoria || d.categoria || '',
      cantidad: parseFloat(d.cantidad) || 0,
      empresa: d.empresa || '',
      notas: d.notas || '',
    }));
    const maqLibre = (data.maquinaria_libre || []).map((d, i) => ({
      id: `ml-${i}`,
      descripcion: d.descripcion || '',
      categoria: CAT_MAQ,
      cantidad: parseFloat(d.cantidad) || 0,
      empresa: d.empresa || '',
      notas: d.notas || '',
    }));
    const perLibre = (data.personal_libre || []).map((d, i) => ({
      id: `pl-${i}`,
      descripcion: d.descripcion || '',
      categoria: CAT_PER,
      cantidad: parseFloat(d.cantidad) || 0,
      empresa: d.empresa || '',
      notas: d.notas || '',
    }));
    recursos = [...detalles, ...maqLibre, ...perLibre];
  }

  const actsRaw = Array.isArray(data.actividades) ? data.actividades : [];
  const actsMap = {};
  actsRaw.forEach(a => {
    const cat = normalizarCatNombre(a.categoria_nombre || a.categoria || '');
    if (!actsMap[cat]) actsMap[cat] = { id: cat, categoria: cat, actividades: [] };
    const desc = a.descripcion || '';
    if (desc) actsMap[cat].actividades.push(desc);
  });

  return {
    ...data,
    horasLluvia,
    maquinaria: recursos.filter(r => r.categoria === CAT_MAQ),
    personal: recursos.filter(r => r.categoria === CAT_PER),
    actividadesAgrupadas: Object.values(actsMap),
  };
}

function ReportesInforme({ informeId, informe, formSnapshot }) {
  const { data: rawDetalle, isLoading } = useQuery({
    queryKey: ['informe-detalle', informeId],
    queryFn: () => informeDiarioService.get(informeId),
    enabled: !!informeId && !formSnapshot,
    staleTime: 30_000,
  });

  const fuente = formSnapshot || rawDetalle || informe;
  const d = useMemo(() => normalizar(fuente), [fuente]);

  if (!informeId && !informe && !formSnapshot) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, color: '#94a3b8', gap: 14 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Sin informe seleccionado</p>
        <p style={{ margin: 0, fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
          Abre un informe desde el <strong>Panel</strong> para ver el reporte.
        </p>
      </div>
    );
  }

  if (isLoading && !d) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, color: '#94a3b8', gap: 10 }}>
        <div style={{ width: 22, height: 22, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'rspin 0.7s linear infinite' }} />
        <style>{`@keyframes rspin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontSize: 14 }}>Cargando...</span>
      </div>
    );
  }

  const horasLluvia = d?.horasLluvia || [];
  const lluvia = horasLluvia.filter(Boolean).length;
  const topografia = Boolean(d?.comision_topografia);
  const maquinaria = d?.maquinaria || [];
  const personal = d?.personal || [];
  const actividades = d?.actividadesAgrupadas || [];
  const totalPers = personal.reduce((s, p) => s + (parseFloat(p.cantidad) || 0), 0);
  const totalMaq = maquinaria.reduce((s, m) => s + (parseFloat(m.cantidad) || 0), 0);

  return (
    <div style={{ fontFamily: "'Courier New', Courier, monospace", color: '#1e293b', fontSize: 11, lineHeight: 1.4, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ border: '2px solid #1e293b', padding: '20px 24px', background: 'white' }}>

        {/* Encabezado documento */}
        <div style={{ marginBottom: 16, borderBottom: '2px solid #1e293b', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logotipo.png" alt="Logo" style={{ height: 50, width: 'auto', flexShrink: 0 }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Construccion de Obra — Libro Diario de Obra</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>INTERVENTORIA — COD: {d?.codigo_formato || 'F-141-IN'} — Emision: 27/08/2009 — Mod: 00</div>
          </div>
        </div>

        {/* Proyecto / Fecha */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '15%' }}>OBRA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, width: '35%' }}>{d?.proyecto_nombre || d?.obra_nombre || '---'}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '15%' }}>CLIENTE:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, width: '35%' }}>{d?.cliente_nombre || '---'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '20%' }}>DIA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{d?.dia_semana || '---'}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '20%' }}>FECHA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{d?.fecha || '---'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0' }}>ESTADO:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{d?.status_label || d?.status || '---'}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0' }}>{' '}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{' '}</td>
            </tr>
          </tbody>
        </table>

        {/* Reporte de Lluvia */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Reporte de Lluvia</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 1, border: '1px solid #94a3b8' }}>
            {horasLluvia.map((conLluvia, h) => (
              <div key={h} style={{
                textAlign: 'center',
                padding: '2px 0',
                fontSize: 8,
                fontWeight: 600,
                background: conLluvia ? '#3b82f6' : '#f8fafc',
                color: conLluvia ? 'white' : '#94a3b8',
              }}>
                <div>{h}</div>
                <div>{conLluvia ? '///' : '---'}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 2 }}>
            Horas con lluvia: <strong>{lluvia}</strong> de 24
          </div>
        </div>

        {/* Comision Topografia + Estado Terreno */}
        <div style={{ marginBottom: 14, display: 'flex', gap: 24, fontSize: 11 }}>
          <div><span style={{ fontWeight: 700 }}>Comision Topografia:</span> {topografia ? 'Si' : 'No'}</div>
          <div><span style={{ fontWeight: 700 }}>Estado Terreno Inicio:</span> {d?.estado_terreno_inicio || '---'}</div>
          <div><span style={{ fontWeight: 700 }}>Estado Terreno Final:</span> {d?.estado_terreno_final || '---'}</div>
        </div>

        {/* Maquinaria */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', color: 'white', padding: '4px 8px', marginBottom: 0 }}>
            Maquinaria — Equipos — Herramientas de Poder y Vehiculos
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={th}>DESCRIPCION</th>
                <th style={{ ...th, width: 60, textAlign: 'center' }}>CANT.</th>
                <th style={{ ...th, width: 120 }}>EMPRESA</th>
                <th style={th}>NOTAS</th>
              </tr>
            </thead>
            <tbody>
              {maquinaria.length === 0 ? (
                <tr><td style={td} colSpan={4}>Sin maquinaria registrada</td></tr>
              ) : maquinaria.map((m, i) => (
                <tr key={m.id || i}>
                  <td style={td}>{m.descripcion || '---'}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{m.cantidad}</td>
                  <td style={td}>{m.empresa || '---'}</td>
                  <td style={{ ...td, color: '#64748b' }}>{m.notas || '---'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f0f0' }}>
                <td style={{ ...td, fontWeight: 700 }} colSpan={3}>TOTAL MAQUINARIA</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 900 }}>{totalMaq}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Personal */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', color: 'white', padding: '4px 8px', marginBottom: 0 }}>
            Personal de Obra
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={th}>CARGO / DESCRIPCION</th>
                <th style={{ ...th, width: 60, textAlign: 'center' }}>CANT.</th>
                <th style={{ ...th, width: 120 }}>EMPRESA</th>
                <th style={th}>NOTAS</th>
              </tr>
            </thead>
            <tbody>
              {personal.length === 0 ? (
                <tr><td style={td} colSpan={4}>Sin personal registrado</td></tr>
              ) : personal.map((p, i) => (
                <tr key={p.id || i}>
                  <td style={td}>{p.descripcion || '---'}</td>
                  <td style={{ ...td, textAlign: 'center', fontWeight: 700 }}>{p.cantidad}</td>
                  <td style={td}>{p.empresa || '---'}</td>
                  <td style={{ ...td, color: '#64748b' }}>{p.notas || '---'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f0f0f0' }}>
                <td style={{ ...td, fontWeight: 700 }} colSpan={3}>TOTAL PERSONAL</td>
                <td style={{ ...td, textAlign: 'center', fontWeight: 900 }}>{totalPers}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actividades */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', color: 'white', padding: '4px 8px', marginBottom: 4 }}>
            Actividades del Dia
          </div>
          {actividades.length === 0 ? (
            <div style={{ padding: '4px 8px', color: '#94a3b8' }}>Sin actividades registradas</div>
          ) : actividades.map((grupo, gi) => (
            <div key={grupo.id || gi} style={{ marginBottom: gi < actividades.length - 1 ? 8 : 0 }}>
              <div style={{ fontWeight: 800, fontSize: 10, color: '#475569', borderBottom: '1px solid #cbd5e1', padding: '3px 6px', background: '#f8fafc' }}>
                {grupo.categoria}
              </div>
              <ul style={{ margin: '4px 0 4px 16px', padding: 0, listStyle: 'none' }}>
                {grupo.actividades.map((a, ai) => (
                  <li key={ai} style={{ padding: '1px 0', fontSize: 10, lineHeight: 1.5 }}>
                    &bull; {a}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Observaciones */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', color: 'white', padding: '4px 8px', marginBottom: 4 }}>
            Observaciones Generales
          </div>
          <div style={{ padding: '6px 8px', fontSize: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
            {d?.observaciones_generales || '---'}
          </div>
        </div>

        {/* Firmas */}
        <div style={{ marginTop: 20, borderTop: '2px solid #1e293b', paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Recursos Control Obra</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <tbody>
              <tr>
                <td style={{ width: '33%', textAlign: 'center', border: '1px solid #94a3b8', padding: '6px 8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Elaborado por</div>
                  {d?.elaborado_por_detalle?.firma_url && (
                    <img src={d.elaborado_por_detalle.firma_url} alt="Firma" style={{ maxHeight: 40, marginBottom: 4 }} />
                  )}
                  <div style={{ fontWeight: 600, fontSize: 10 }}>{d?.elaborado_por_detalle?.nombre_completo || d?.elaborado_por_texto || d?.nombre_elaborado || '_______________'}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{d?.elaborado_por_detalle?.cargo_nombre || d?.cargo_elaborado || ''}</div>
                </td>
                <td style={{ width: '33%', textAlign: 'center', border: '1px solid #94a3b8', padding: '6px 8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Revisado por</div>
                  {d?.revisado_por_detalle?.firma_url && (
                    <img src={d.revisado_por_detalle.firma_url} alt="Firma" style={{ maxHeight: 40, marginBottom: 4 }} />
                  )}
                  <div style={{ fontWeight: 600, fontSize: 10 }}>{d?.revisado_por_detalle?.nombre_completo || d?.revisado_por_texto || d?.nombre_revisado || '_______________'}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{d?.revisado_por_detalle?.cargo_nombre || d?.cargo_revisado || ''}</div>
                </td>
                <td style={{ width: '34%', textAlign: 'center', border: '1px solid #94a3b8', padding: '6px 8px' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Aprobado por</div>
                  <div style={{ fontWeight: 600, fontSize: 10 }}>{'_______________'}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const th = {
  padding: '4px 8px',
  fontSize: 9,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'left',
  border: '1px solid #94a3b8',
};

const td = {
  padding: '4px 8px',
  fontSize: 10,
  border: '1px solid #e2e8f0',
};

export default ReportesInforme;

// ── Exportar PDF (cliente-side, desde formSnapshot) ──────────────────────────
const CAT_MAQ_PDF = 'MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS';
const CAT_PER_PDF = 'PERSONAL DE OBRA';

export function exportarPDFReporte(data) {
  if (!data) { toast.warning('No hay datos para exportar'); return; }

  // Normalizar igual que el componente
  const horasLluvia = Array.isArray(data.horas_lluvia)
    ? data.horas_lluvia.map(h => (typeof h === 'boolean' ? h : Boolean(h?.con_lluvia ?? h)))
    : Array.isArray(data.reportes_lluvia)
      ? (() => { const hh = Array(24).fill(false); data.reportes_lluvia.forEach(r => { if (r.hora >= 0 && r.hora < 24) hh[r.hora] = Boolean(r.con_lluvia); }); return hh; })()
      : Array(24).fill(false);

  const lluvia = horasLluvia.filter(Boolean).length;

  let recursos = [];
  if (Array.isArray(data.recursos) && data.recursos.length > 0) {
    recursos = data.recursos;
  } else {
    const detalles = (data.detalles || []).map(d => ({ descripcion: d.recurso_nombre || d.descripcion || '', categoria: d.categoria_nombre || d.categoria || '', cantidad: parseFloat(d.cantidad) || 0, empresa: d.empresa || '', notas: d.notas || '' }));
    const maqLibre = (data.maquinaria_libre || []).map(d => ({ descripcion: d.descripcion || '', categoria: CAT_MAQ_PDF, cantidad: parseFloat(d.cantidad) || 0, empresa: d.empresa || '', notas: d.notas || '' }));
    const perLibre = (data.personal_libre || []).map(d => ({ descripcion: d.descripcion || '', categoria: CAT_PER_PDF, cantidad: parseFloat(d.cantidad) || 0, empresa: d.empresa || '', notas: d.notas || '' }));
    recursos = [...detalles, ...maqLibre, ...perLibre];
  }

  const topografia = Boolean(data.comision_topografia);
  const maquinaria = recursos.filter(r => r.categoria === CAT_MAQ_PDF);
  const personal = recursos.filter(r => r.categoria === CAT_PER_PDF);
  const totalMaq = maquinaria.reduce((s, m) => s + (parseFloat(m.cantidad) || 0), 0);
  const totalPers = personal.reduce((s, p) => s + (parseFloat(p.cantidad) || 0), 0);

  const actsRaw = Array.isArray(data.actividades) ? data.actividades : [];
  const actsMap = {};
  actsRaw.forEach(a => {
    const cat = (() => {
      const n = (a.categoria_nombre || a.categoria || '').toLowerCase();
      const secs = [
        { titulo: "ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES", keywords: ["admin", "documental", "ingesed"] },
        { titulo: "ACTIVIDADES DE CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES", keywords: ["cableado", "conexionado", "pruebas funcionales", "siemens"] },
        { titulo: "ACTIVIDADES DE PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES", keywords: ["pruebas de equipo", "montaje", "reactor", "cte"] },
        { titulo: "ACTIVIDADES DE OBRA CIVIL", keywords: ["civil", "edemsa"] },
        { titulo: "GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO", keywords: ["seguridad", "salud", "sst"] },
        { titulo: "ACTIVIDADES AMBIENTALES Y SOCIALES", keywords: ["ambiental", "social"] },
      ];
      for (const sec of secs) { if (sec.keywords.some(k => n.includes(k))) return sec.titulo; }
      return a.categoria_nombre || a.categoria || 'General';
    })();
    const desc = a.descripcion || '';
    if (desc) {
      if (!actsMap[cat]) actsMap[cat] = { categoria: cat, actividades: [] };
      actsMap[cat].actividades.push(desc);
    }
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe Diario</title>
<style>
  @page { margin: 1.2cm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Courier New', Courier, monospace; color: #1e293b; font-size: 11px; line-height: 1.4; margin: 0; padding: 0; }
  .page { max-width: 900px; margin: 0 auto; }
  .report { border: 2px solid #1e293b; padding: 20px 24px; background: white; }
  .header { margin-bottom: 16px; border-bottom: 2px solid #1e293b; padding-bottom: 10px; display: flex; align-items: center; gap: 16px; }
  .header-logo img { height: 50px; width: auto; flex-shrink: 0; }
  .header-title { flex: 1; text-align: center; }
  .header-title h1 { font-size: 13px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; margin: 0; }
  .header-title p { font-size: 10px; color: #475569; margin: 2px 0 0; }
  table.info { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  table.info td { border: 1px solid #1e293b; padding: 6px 10px; font-size: 12px; }
  table.info .label { font-weight: 700; background: #f0f0f0; }
  .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .section-title-dark { background: #1e293b; color: white; padding: 4px 8px; margin-bottom: 0; }
  .section-title-dark + * { margin-top: 4px; }
  .lluvia-grid { display: grid; grid-template-columns: repeat(24, 1fr); gap: 1px; border: 1px solid #94a3b8; }
  .lluvia-cell { text-align: center; padding: 2px 0; font-size: 8px; font-weight: 600; }
  .lluvia-cell.lluvia { background: #3b82f6; color: white; }
  .lluvia-cell.nolluvia { background: #f8fafc; color: #94a3b8; }
  .lluvia-total { font-size: 9px; color: #64748b; margin-top: 2px; }
  .terreno { margin-bottom: 14px; display: flex; gap: 24px; font-size: 11px; }
  .terreno span { font-weight: 700; }
  table.data { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 14px; }
  table.data th { padding: 4px 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; text-align: left; border: 1px solid #94a3b8; background: #f0f0f0; }
  table.data td { padding: 4px 8px; font-size: 10px; border: 1px solid #e2e8f0; }
  table.data .total-row { background: #f0f0f0; font-weight: 700; }
  .actividades { margin-bottom: 14px; }
  .actividad-cat { font-weight: 800; font-size: 10px; color: #475569; border-bottom: 1px solid #cbd5e1; padding: 3px 6px; background: #f8fafc; margin-bottom: 2px; }
  .actividad-list { margin: 4px 0 8px 16px; padding: 0; list-style: none; }
  .actividad-list li { padding: 1px 0; font-size: 10px; line-height: 1.5; }
  .obs { padding: 6px 8px; font-size: 10px; line-height: 1.6; white-space: pre-wrap; border: 1px solid #e2e8f0; margin-bottom: 14px; }
  .firmas { margin-top: 20px; border-top: 2px solid #1e293b; padding-top: 12px; }
  .firmas-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
  table.firmas { width: 100%; border-collapse: collapse; font-size: 10px; }
  table.firmas td { width: 33%; text-align: center; border: 1px solid #94a3b8; padding: 6px 8px; }
  table.firmas .firma-label { font-weight: 700; margin-bottom: 4px; }
  table.firmas .firma-img { max-height: 40px; margin-bottom: 4px; }
  table.firmas .firma-nombre { font-weight: 600; font-size: 10px; }
  table.firmas .firma-cargo { font-size: 9px; color: #64748b; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .lluvia-cell.lluvia { background: #3b82f6 !important; color: white !important; }
  }
</style>
</head>
<body>
<div class="page">
<div class="report">

<div class="header">
  <div class="header-logo"><img src="/logotipo.png" alt="Logo" onerror="this.style.display='none'" /></div>
  <div class="header-title">
    <h1>Construccion de Obra — Libro Diario de Obra</h1>
    <p>INTERVENTORIA — COD: ${data.codigo_formato || 'F-141-IN'} — Emision: 27/08/2009 — Mod: 00</p>
  </div>
</div>

<table class="info">
  <tr>
    <td class="label" style="width:15%">OBRA:</td>
    <td style="font-weight:700;width:35%">${data.proyecto_nombre || data.obra_nombre || '---'}</td>
    <td class="label" style="width:15%">CLIENTE:</td>
    <td style="font-weight:700;width:35%">${data.cliente_nombre || '---'}</td>
  </tr>
  <tr>
    <td class="label" style="width:20%">DIA:</td>
    <td>${data.dia_semana || '---'}</td>
    <td class="label" style="width:20%">FECHA:</td>
    <td>${data.fecha || '---'}</td>
  </tr>
  <tr>
    <td class="label">ESTADO:</td>
    <td>${data.status_label || data.status || '---'}</td>
    <td class="label"></td>
    <td></td>
  </tr>
</table>

<div style="margin-bottom:14px">
  <div class="section-title">Reporte de Lluvia</div>
  <div class="lluvia-grid">
    ${horasLluvia.map((conLluvia, h) =>
      `<div class="lluvia-cell ${conLluvia ? 'lluvia' : 'nolluvia'}"><div>${h}</div><div>${conLluvia ? '///' : '---'}</div></div>`
    ).join('')}
  </div>
  <div class="lluvia-total">Horas con lluvia: <strong>${lluvia}</strong> de 24</div>
</div>

<div class="terreno">
  <div><span>Comision Topografia:</span> ${topografia ? 'Si' : 'No'}</div>
  <div><span>Estado Terreno Inicio:</span> ${data.estado_terreno_inicio || '---'}</div>
  <div><span>Estado Terreno Final:</span> ${data.estado_terreno_final || '---'}</div>
</div>

<div style="margin-bottom:14px">
  <div class="section-title section-title-dark">Maquinaria — Equipos — Herramientas de Poder y Vehiculos</div>
  <table class="data">
    <thead><tr><th>DESCRIPCION</th><th style="width:60px;text-align:center">CANT.</th><th style="width:120px">EMPRESA</th><th>NOTAS</th></tr></thead>
    <tbody>
      ${maquinaria.length === 0
        ? '<tr><td colspan="4">Sin maquinaria registrada</td></tr>'
        : maquinaria.map(m => `<tr><td>${m.descripcion || '---'}</td><td style="text-align:center;font-weight:700">${m.cantidad}</td><td>${m.empresa || '---'}</td><td style="color:#64748b">${m.notas || '---'}</td></tr>`).join('')
      }
    </tbody>
    <tfoot><tr class="total-row"><td colspan="3">TOTAL MAQUINARIA</td><td style="text-align:center;font-weight:900">${totalMaq}</td></tr></tfoot>
  </table>
</div>

<div style="margin-bottom:14px">
  <div class="section-title section-title-dark">Personal de Obra</div>
  <table class="data">
    <thead><tr><th>CARGO / DESCRIPCION</th><th style="width:60px;text-align:center">CANT.</th><th style="width:120px">EMPRESA</th><th>NOTAS</th></tr></thead>
    <tbody>
      ${personal.length === 0
        ? '<tr><td colspan="4">Sin personal registrado</td></tr>'
        : personal.map(p => `<tr><td>${p.descripcion || '---'}</td><td style="text-align:center;font-weight:700">${p.cantidad}</td><td>${p.empresa || '---'}</td><td style="color:#64748b">${p.notas || '---'}</td></tr>`).join('')
      }
    </tbody>
    <tfoot><tr class="total-row"><td colspan="3">TOTAL PERSONAL</td><td style="text-align:center;font-weight:900">${totalPers}</td></tr></tfoot>
  </table>
</div>

<div class="actividades">
  <div class="section-title section-title-dark">Actividades del Dia</div>
  ${Object.keys(actsMap).length === 0
    ? '<div style="padding:4px 8px;color:#94a3b8">Sin actividades registradas</div>'
    : Object.values(actsMap).map((grupo, gi) =>
        `<div style="margin-bottom:${gi < Object.keys(actsMap).length - 1 ? 8 : 0}px">
          <div class="actividad-cat">${grupo.categoria}</div>
          <ul class="actividad-list">
            ${grupo.actividades.map(a => `<li>&bull; ${a}</li>`).join('')}
          </ul>
        </div>`
      ).join('')
  }
</div>

<div style="margin-bottom:14px">
  <div class="section-title section-title-dark">Observaciones Generales</div>
  <div class="obs">${(data.observaciones_generales || '---').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
</div>

<div class="firmas">
  <div class="firmas-title">Recursos Control Obra</div>
  <table class="firmas">
    <tr>
      <td>
        <div class="firma-label">Elaborado por</div>
        ${data.elaborado_por_detalle?.firma_url ? `<img class="firma-img" src="${data.elaborado_por_detalle.firma_url}" />` : ''}
        <div class="firma-nombre">${data.elaborado_por_detalle?.nombre_completo || data.elaborado_por_texto || '_______________'}</div>
        <div class="firma-cargo">${data.elaborado_por_detalle?.cargo_nombre || data.cargo_elaborado || ''}</div>
      </td>
      <td>
        <div class="firma-label">Revisado por</div>
        ${data.revisado_por_detalle?.firma_url ? `<img class="firma-img" src="${data.revisado_por_detalle.firma_url}" />` : ''}
        <div class="firma-nombre">${data.revisado_por_detalle?.nombre_completo || data.revisado_por_texto || '_______________'}</div>
        <div class="firma-cargo">${data.revisado_por_detalle?.cargo_nombre || data.cargo_revisado || ''}</div>
      </td>
      <td>
        <div class="firma-label">Aprobado por</div>
        <div class="firma-nombre">_______________</div>
      </td>
    </tr>
  </table>
</div>

</div>
</div>
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) { toast.warning('Permite ventanas emergentes para exportar PDF'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}
