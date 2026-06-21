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

const _imgUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const raw = import.meta.env.VITE_API_URL || 'https://erp-backend-a37b.onrender.com/api/';
  return raw.replace(/\/api\/?$/, '').replace(/\/+$/, '') + (src.startsWith('/') ? src : '/' + src);
};

export function exportarPDFReporte(data, fotos = []) {
  if (!data) { toast.warning('No hay datos para exportar'); return; }

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

  // ── Anexo Fotográfico ──
  let fotosHTML = '';
  const fotosArr = Array.isArray(fotos) ? fotos.filter(f => f?.imagen_url || f?.imagen) : [];
  if (fotosArr.length > 0) {
    const sorted = fotosArr.sort((a, b) => (a.posicion || 0) - (b.posicion || 0));
    const chunk = (arr, sz) => { const r = []; for (let i = 0; i < arr.length; i += sz) r.push(arr.slice(i, i + sz)); return r; };
    const pages = chunk(sorted, 24);
    fotosHTML = pages.map((page, idx) => `
    <div class="foto-cover">
      ${idx === 0 ? '<h1>Anexo Fotográfico</h1><div class="sub">Registro Fotográfico de Obra</div>' : ''}
      <div class="foto-grid">
        ${page.map(f => `
          <div class="foto-card">
            <img src="${_imgUrl(f.imagen_url || f.imagen)}" alt="" />
            <div class="foto-info">
              <span class="num">${String(f.posicion || '').padStart(2, '0')}</span>
              ${f.seccion_display ? `<span class="sec">${f.seccion_display}</span>` : ''}
              ${f.descripcion ? `<span class="desc">${f.descripcion}</span>` : ''}
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe Diario - ${data.proyecto_nombre || data.obra_nombre || ''}</title>
<style>
  @page {
    margin: 1.8cm 1.5cm 2.2cm;
    size: A4;
    @bottom-center { content: counter(page) " / " counter(pages); font: 8px 'Segoe UI', system-ui, sans-serif; color: #94a3b8; }
  }
  * { box-sizing: border-box; margin: 0; }
  body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #1e293b; font-size: 9.5px; line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Page wrapper ── */
  .page { max-width: 100%; padding: 0; }

  /* ── Header ── */
  .header {
    display: flex; align-items: center; gap: 18px;
    margin-bottom: 18px; padding-bottom: 14px;
    border-bottom: 3px solid #1e3a8a;
  }
  .header-logo { flex-shrink: 0; }
  .header-logo img { height: 54px; width: auto; display: block; }
  .header-body { flex: 1; }
  .header-body h1 {
    font-size: 14px; font-weight: 800; letter-spacing: 0.08em;
    text-transform: uppercase; color: #1e3a8a; margin: 0 0 2px;
  }
  .header-body .subtitle {
    font-size: 8.5px; color: #64748b; letter-spacing: 0.03em;
  }
  .header-badge {
    flex-shrink: 0; text-align: right;
  }
  .header-badge .badge {
    display: inline-block; background: #1e3a8a; color: #fff;
    font-size: 8px; font-weight: 700; letter-spacing: 0.05em;
    padding: 4px 12px; border-radius: 3px; text-transform: uppercase;
  }

  /* ── Info table ── */
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .info-table td {
    border: 1px solid #cbd5e1; padding: 5px 9px; font-size: 9.5px;
    vertical-align: middle;
  }
  .info-table .lbl {
    font-weight: 700; background: #f1f5f9; color: #475569;
    width: 12%; text-transform: uppercase; font-size: 8px; letter-spacing: 0.04em;
  }
  .info-table .val { font-weight: 600; width: 38%; }
  .info-table .val.highlight { color: #1e3a8a; }

  /* ── Section titles ── */
  .sec-title {
    font-size: 8.5px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: #1e3a8a;
    border-bottom: 1.5px solid #1e3a8a;
    padding: 0 0 3px; margin-bottom: 6px;
  }
  .sec-title-bar {
    background: #1e3a8a; color: #fff; padding: 4px 9px;
    font-size: 8.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; margin-bottom: 0; border-radius: 2px 2px 0 0;
  }

  /* ── Rain grid ── */
  .rain-grid { border: 1px solid #cbd5e1; border-radius: 3px; overflow: hidden; }
  .rain-row { display: flex; }
  .rain-cell {
    flex: 1; text-align: center; padding: 2px 0;
    font-size: 7px; font-weight: 600;
    border-right: 1px solid #e2e8f0;
  }
  .rain-cell:last-child { border-right: none; }
  .rain-cell.rain { background: #3b82f6; color: #fff; }
  .rain-cell.dry { background: #f8fafc; color: #94a3b8; }
  .rain-label { font-size: 6.5px; color: #94a3b8; }
  .rain-summary { font-size: 8.5px; color: #64748b; margin-top: 4px; }

  /* ── Terreno ── */
  .terreno-grid { display: flex; gap: 18px; margin-bottom: 16px; }
  .terreno-item { font-size: 9px; }
  .terreno-item strong { font-weight: 700; color: #475569; }

  /* ── Data tables ── */
  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9px; }
  .data-table thead th {
    background: #1e3a8a; color: #fff; padding: 4px 8px;
    font-size: 7.5px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; text-align: left; border: 1px solid #1e3a8a;
  }
  .data-table tbody td {
    padding: 3px 8px; border: 1px solid #e2e8f0; vertical-align: top;
  }
  .data-table tbody tr:nth-child(even) { background: #f8fafc; }
  .data-table tfoot td {
    background: #f1f5f9; font-weight: 700; padding: 4px 8px;
    border: 1px solid #cbd5e1; font-size: 8.5px;
  }
  .data-table .num { text-align: center; font-weight: 700; }
  .data-table .muted { color: #94a3b8; }

  /* ── Actividades ── */
  .act-group { margin-bottom: 8px; }
  .act-cat {
    font-weight: 700; font-size: 8.5px; color: #475569;
    background: #f1f5f9; padding: 3px 8px; border-left: 3px solid #1e3a8a;
    margin-bottom: 3px;
  }
  .act-list { margin: 2px 0 4px 20px; padding: 0; list-style: none; }
  .act-list li { padding: 1px 0; font-size: 9px; line-height: 1.5; position: relative; }
  .act-list li::before { content: "\\2022"; color: #1e3a8a; font-weight: 700; position: absolute; left: -11px; }

  /* ── Observaciones ── */
  .obs-box {
    padding: 6px 9px; font-size: 9px; line-height: 1.7;
    border: 1px solid #e2e8f0; border-radius: 3px;
    background: #fafbfc; margin-bottom: 14px;
  }

  /* ── Firmas ── */
  .firmas-section { margin-top: 22px; border-top: 3px solid #1e3a8a; padding-top: 12px; }
  .firmas-table { width: 100%; border-collapse: collapse; font-size: 9px; }
  .firmas-table td {
    width: 33.33%; text-align: center;
    border: 1px solid #cbd5e1; padding: 10px 8px 8px;
    vertical-align: top;
  }
  .firmas-table .label {
    font-weight: 700; font-size: 8px; text-transform: uppercase;
    letter-spacing: 0.05em; color: #475569; margin-bottom: 6px;
  }
  .firmas-table .sig-img { max-height: 38px; margin-bottom: 4px; }
  .firmas-table .name { font-weight: 600; font-size: 9px; color: #1e293b; }
  .firmas-table .cargo { font-size: 8px; color: #94a3b8; }

  /* ── Print ── */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .rain-cell.rain { background: #3b82f6 !important; color: #fff !important; }
    .data-table thead th { background: #1e3a8a !important; color: #fff !important; }
    .sec-title-bar { background: #1e3a8a !important; color: #fff !important; }
    .header-body h1 { color: #1e3a8a !important; }
  }

  /* ── Anexo Fotográfico ── */
  .foto-cover { page-break-before: always; }
  .foto-cover h1 {
    font-size: 18px; font-weight: 900; text-align: center;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #1e3a8a; margin: 40px 0 6px;
  }
  .foto-cover .sub {
    text-align: center; font-size: 10px; color: #64748b; margin-bottom: 20px;
  }
  .foto-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .foto-card { border: 1px solid #e2e8f0; border-radius: 4px; overflow: hidden; break-inside: avoid; }
  .foto-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .foto-info { padding: 3px 5px; background: #f8fafc; font-size: 7.5px; }
  .foto-info .num { font-weight: 700; color: #1e3a8a; font-family: monospace; }
  .foto-info .sec { font-weight: 600; text-transform: uppercase; color: #7c3aed; font-size: 6.5px; }
  .foto-info .desc { color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
</head>
<body>
<div class="page">

  <!-- ═══ HEADER ═══ -->
  <div class="header">
    <div class="header-logo">
      <img src="/logotipo.png" alt="Logo" onerror="this.style.display='none'" />
    </div>
    <div class="header-body">
      <h1>Libro Diario de Obra — Interventor&iacute;a</h1>
      <div class="subtitle">
        C&oacute;digo: ${data.codigo_formato || 'F-141-IN'} &nbsp;|&nbsp;
        Emisi&oacute;n: 27/08/2009 &nbsp;|&nbsp; Mod: 00 &nbsp;|&nbsp;
        Versi&oacute;n: 1
      </div>
    </div>
    <div class="header-badge">
      <div class="badge">${data.status_label || data.status || 'BORRADOR'}</div>
    </div>
  </div>

  <!-- ═══ INFO TABLE ═══ -->
  <table class="info-table">
    <tr>
      <td class="lbl">Obra</td>
      <td class="val highlight" colspan="3">${(data.proyecto_nombre || data.obra_nombre || '---').replace(/</g, '&lt;')}</td>
    </tr>
    <tr>
      <td class="lbl">Cliente</td>
      <td class="val">${data.cliente_nombre || '---'}</td>
      <td class="lbl" style="width:10%">Fecha</td>
      <td class="val" style="width:28%">${data.fecha || '---'}</td>
    </tr>
    <tr>
      <td class="lbl">D&iacute;a</td>
      <td class="val">${data.dia_semana || '---'}</td>
      <td class="lbl">Comisi&oacute;n Topograf&iacute;a</td>
      <td class="val">${topografia ? 'S&iacute;' : 'No'}</td>
    </tr>
  </table>

  <!-- ═══ RAIN REPORT ═══ -->
  <div style="margin-bottom:14px">
    <div class="sec-title">Reporte de Lluvia</div>
    <div class="rain-grid">
      <div class="rain-row">
        ${horasLluvia.map((conLluvia, h) =>
          `<div class="rain-cell ${conLluvia ? 'rain' : 'dry'}"><div>${h}</div></div>`
        ).join('')}
      </div>
      <div class="rain-row">
        ${horasLluvia.map((conLluvia, h) =>
          `<div class="rain-cell ${conLluvia ? 'rain' : 'dry'}" style="font-size:6.5px">${conLluvia ? '///' : '---'}</div>`
        ).join('')}
      </div>
    </div>
    <div class="rain-summary">
      Horas con lluvia: <strong>${lluvia}</strong> de 24
      &nbsp;&middot;&nbsp;
      <span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:2px;vertical-align:middle;margin-right:2px"></span> Lluvia
      <span style="display:inline-block;width:10px;height:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:2px;vertical-align:middle;margin:0 2px 0 8px"></span> Sin lluvia
    </div>
  </div>

  <!-- ═══ TERRAIN STATUS ═══ -->
  <div class="terreno-grid">
    <div class="terreno-item"><strong>Estado Terreno Inicio:</strong> ${data.estado_terreno_inicio || '---'}</div>
    <div class="terreno-item"><strong>Estado Terreno Final:</strong> ${data.estado_terreno_final || '---'}</div>
  </div>

  <!-- ═══ MAQUINARIA ═══ -->
  <div style="margin-bottom:14px">
    <div class="sec-title-bar">Maquinaria — Equipos — Herramientas de Poder y Veh&iacute;culos</div>
    <table class="data-table">
      <thead><tr><th style="width:42%">Descripci&oacute;n</th><th style="width:10%;text-align:center">Cant.</th><th style="width:22%">Empresa</th><th>Notas</th></tr></thead>
      <tbody>
        ${maquinaria.length === 0
          ? '<tr><td colspan="4" class="muted" style="padding:8px;text-align:center">Sin maquinaria registrada</td></tr>'
          : maquinaria.map(m =>
              `<tr><td>${m.descripcion || '---'}</td><td class="num">${m.cantidad}</td><td>${m.empresa || '---'}</td><td class="muted">${m.notas || '---'}</td></tr>`
            ).join('')
        }
      </tbody>
      <tfoot><tr><td colspan="3">TOTAL MAQUINARIA</td><td class="num">${totalMaq}</td></tr></tfoot>
    </table>
  </div>

  <!-- ═══ PERSONAL ═══ -->
  <div style="margin-bottom:14px">
    <div class="sec-title-bar">Personal de Obra</div>
    <table class="data-table">
      <thead><tr><th style="width:42%">Cargo / Descripci&oacute;n</th><th style="width:10%;text-align:center">Cant.</th><th style="width:22%">Empresa</th><th>Notas</th></tr></thead>
      <tbody>
        ${personal.length === 0
          ? '<tr><td colspan="4" class="muted" style="padding:8px;text-align:center">Sin personal registrado</td></tr>'
          : personal.map(p =>
              `<tr><td>${p.descripcion || '---'}</td><td class="num">${p.cantidad}</td><td>${p.empresa || '---'}</td><td class="muted">${p.notas || '---'}</td></tr>`
            ).join('')
        }
      </tbody>
      <tfoot><tr><td colspan="3">TOTAL PERSONAL</td><td class="num">${totalPers}</td></tr></tfoot>
    </table>
  </div>

  <!-- ═══ ACTIVITIES ═══ -->
  <div style="margin-bottom:14px">
    <div class="sec-title-bar">Actividades del D&iacute;a</div>
    ${Object.keys(actsMap).length === 0
      ? '<div style="padding:6px 9px;color:#94a3b8;font-size:9px">Sin actividades registradas</div>'
      : Object.values(actsMap).map(grupo =>
          `<div class="act-group">
            <div class="act-cat">${grupo.categoria}</div>
            <ul class="act-list">
              ${grupo.actividades.map(a => `<li>${a.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</li>`).join('')}
            </ul>
          </div>`
        ).join('')
    }
  </div>

  <!-- ═══ OBSERVACIONES ═══ -->
  <div style="margin-bottom:14px">
    <div class="sec-title">Observaciones Generales</div>
    <div class="obs-box">${(data.observaciones_generales || 'Sin observaciones').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\n/g, '<br>')}</div>
  </div>

  <!-- ═══ FIRMAS ═══ -->
  <div class="firmas-section">
    <table class="firmas-table">
      <tr>
        <td>
          <div class="label">Elaborado por</div>
          ${data.elaborado_por_detalle?.firma_url ? `<div><img class="sig-img" src="${data.elaborado_por_detalle.firma_url}" /></div>` : '<div style="height:38px;margin-bottom:4px"></div>'}
          <div class="name">${data.elaborado_por_detalle?.nombre_completo || data.elaborado_por_texto || '____________________'}</div>
          <div class="cargo">${data.elaborado_por_detalle?.cargo_nombre || data.cargo_elaborado || ''}</div>
        </td>
        <td>
          <div class="label">Revisado por</div>
          ${data.revisado_por_detalle?.firma_url ? `<div><img class="sig-img" src="${data.revisado_por_detalle.firma_url}" /></div>` : '<div style="height:38px;margin-bottom:4px"></div>'}
          <div class="name">${data.revisado_por_detalle?.nombre_completo || data.revisado_por_texto || '____________________'}</div>
          <div class="cargo">${data.revisado_por_detalle?.cargo_nombre || data.cargo_revisado || ''}</div>
        </td>
        <td>
          <div class="label">Aprobado por</div>
          <div style="height:38px;margin-bottom:4px"></div>
          <div class="name">____________________</div>
          <div class="cargo">&nbsp;</div>
        </td>
      </tr>
    </table>
  </div>

</div>
${fotosHTML}
</body>
</html>`;

  const w = window.open('', '_blank');
  if (!w) { toast.warning('Permite ventanas emergentes para exportar PDF'); return; }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 600);
}
