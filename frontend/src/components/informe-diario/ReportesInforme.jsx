// ============================================================
//  ReportesInforme.jsx  –  ERP-8AMPERIOS
//  Visualización de solo lectura del informe seleccionado.
//  El botón Exportar se movió al top bar de Informediarioproy.
// ============================================================
import { useQuery }   from '@tanstack/react-query';
import {
  Wrench, HardHat, FileText, Wind, Sun,
  ChevronRight, ClipboardList, CloudRain, Compass,
} from 'lucide-react';
import { informeDiarioService } from '@/services/informeDiarioApi';

const CAT_MAQ = 'MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS';
const CAT_PER = 'PERSONAL DE OBRA';

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
      id:          d.recurso || d.id,
      descripcion: d.recurso_nombre || d.descripcion || '',
      categoria:   d.recurso_categoria || d.categoria || '',
      cantidad:    parseFloat(d.cantidad) || 0,
      empresa:     d.empresa || '',
      notas:       d.notas   || '',
    }));
    const maqLibre = (data.maquinaria_libre || []).map((d, i) => ({
      id:          `ml-${i}`,
      descripcion: d.descripcion || '',
      categoria:   CAT_MAQ,
      cantidad:    parseFloat(d.cantidad) || 0,
      empresa:     d.empresa || '',
      notas:       d.notas   || '',
    }));
    const perLibre = (data.personal_libre || []).map((d, i) => ({
      id:          `pl-${i}`,
      descripcion: d.descripcion || '',
      categoria:   CAT_PER,
      cantidad:    parseFloat(d.cantidad) || 0,
      empresa:     d.empresa || '',
      notas:       d.notas   || '',
    }));
    recursos = [...detalles, ...maqLibre, ...perLibre];
  }

  const actsRaw = Array.isArray(data.actividades) ? data.actividades : [];
  const actsMap  = {};
  actsRaw.forEach(a => {
    const cat = a.categoria_nombre || a.categoria || 'General';
    if (!actsMap[cat]) actsMap[cat] = { id: cat, categoria: cat, actividades: [] };
    const desc = a.descripcion || '';
    if (desc) actsMap[cat].actividades.push(desc);
  });

  return {
    ...data,
    horasLluvia,
    maquinaria:            recursos.filter(r => r.categoria === CAT_MAQ),
    personal:              recursos.filter(r => r.categoria === CAT_PER),
    actividadesAgrupadas:  Object.values(actsMap),
  };
}

export default function ReportesInforme({ informeId, informe }) {
  const { data: rawDetalle, isLoading } = useQuery({
    queryKey:  ['informe-detalle', informeId],
    queryFn:   () => informeDiarioService.get(informeId),
    enabled:   !!informeId,
    staleTime: 30_000,
  });

  const d = normalizar(rawDetalle || informe);

  if (!informeId && !informe) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 380, color: '#94a3b8', gap: 14 }}>
        <ClipboardList size={52} style={{ opacity: 0.25 }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Sin informe seleccionado</p>
        <p style={{ margin: 0, fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
          Abre un informe desde el <strong>Panel</strong>, completa los datos en <strong>FORM</strong> y vuelve aquí para ver el resumen.
        </p>
      </div>
    );
  }

  if (isLoading && !d) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, color: '#94a3b8', gap: 10 }}>
        <style>{`@keyframes rspin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ width: 22, height: 22, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'rspin 0.7s linear infinite' }} />
        <span style={{ fontSize: 14 }}>Cargando…</span>
      </div>
    );
  }

  const horasConLluvia = d?.horasLluvia?.filter(Boolean).length ?? 0;
  const lluvia         = horasConLluvia > 0;
  const topografia     = Boolean(d?.comision_topografia);
  const maquinaria     = d?.maquinaria || [];
  const personal       = d?.personal   || [];
  const actividades    = d?.actividadesAgrupadas || [];
  const totalPers      = personal.reduce((s, p) => s + (parseFloat(p.cantidad) || 0), 0);
  const totalMaq       = maquinaria.reduce((s, m) => s + (parseFloat(m.cantidad) || 0), 0);

  return (
    <div style={{ color: '#1e293b', fontSize: 13 }}>

      {/* ── Cabecera ──────────────────────────────────────────────────────── */}
      {d && (
        <div style={s.header}>
          <Meta label="PROYECTO"   value={d.obra_nombre       || '—'} />
          <Meta label="FECHA"      value={d.fecha              || '—'} />
          <Meta label="DÍA"        value={d.dia_semana         || '—'} />
          <Meta label="CÓDIGO"     value={d.codigo_formato     || '—'} />
          <Meta label="ESTADO"     value={d.status             || '—'} />
          <Meta label="ELABORADO"  value={d.elaborado_por      || '—'} />
        </div>
      )}

      {/* ── Condiciones ────────────────────────────────────────────────────── */}
      <div style={s.climaRow}>
        <ClimaCard icon={<CloudRain size={18} color={lluvia ? '#3b82f6' : '#cbd5e1'} />} label="LLUVIA"
          value={lluvia ? `${horasConLluvia} hora${horasConLluvia !== 1 ? 's' : ''}` : 'Sin lluvia'}
          active={lluvia} activeColor="#3b82f6" />
        <ClimaCard icon={<Compass size={18} color={topografia ? '#6366f1' : '#cbd5e1'} />} label="COMISIÓN TOPOGRAFÍA"
          value={topografia ? 'Sí' : 'No'} active={topografia} activeColor="#6366f1" />
        <ClimaCard icon={<Sun size={18} color="#f59e0b" />} label="ESTADO TERRENO — INICIO"
          value={d?.estado_terreno_inicio || '—'} active={!!d?.estado_terreno_inicio} activeColor="#f59e0b" />
        <ClimaCard icon={<Wind size={18} color="#10b981" />} label="ESTADO TERRENO — FINAL"
          value={d?.estado_terreno_final || '—'} active={!!d?.estado_terreno_final} activeColor="#10b981" />
      </div>

      {/* ── Maquinaria ─────────────────────────────────────────────────────── */}
      <Section icon={<Wrench size={13} />} title="MAQUINARIA — EQUIPOS — HERRAMIENTAS Y VEHÍCULOS"
        badge={totalMaq ? `${totalMaq} total` : null} color="#0d9488">
        {maquinaria.length === 0 ? <Empty msg="Sin maquinaria registrada" /> : (
          <table style={s.table}>
            <thead><tr>
              <Th w="38%">DESCRIPCIÓN</Th>
              <Th w="10%" center>CANT.</Th>
              <Th w="22%">EMPRESA</Th>
              <Th>NOTAS</Th>
            </tr></thead>
            <tbody>
              {maquinaria.map((m, i) => (
                <tr key={m.id || i} style={i % 2 ? s.trAlt : s.tr}>
                  <Td>{m.descripcion || '—'}</Td>
                  <Td center><span style={m.cantidad > 0 ? s.numOn : s.numOff}>{m.cantidad}</span></Td>
                  <Td><span style={s.empresa}>{m.empresa || '—'}</span></Td>
                  <Td><span style={s.notas}>{m.notas || '—'}</span></Td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr>
              <td colSpan={3} style={s.tfoot}>Total</td>
              <td style={{ ...s.tfoot, textAlign: 'center', color: '#0d9488', fontWeight: 900 }}>{totalMaq}</td>
            </tr></tfoot>
          </table>
        )}
      </Section>

      {/* ── Personal ───────────────────────────────────────────────────────── */}
      <Section icon={<HardHat size={13} />} title="PERSONAL DE OBRA"
        badge={totalPers ? `${totalPers} personas` : null} color="#6366f1">
        {personal.length === 0 ? <Empty msg="Sin personal registrado" /> : (
          <table style={s.table}>
            <thead><tr>
              <Th w="70%">CARGO / DESCRIPCIÓN</Th>
              <Th center>CANTIDAD</Th>
            </tr></thead>
            <tbody>
              {personal.map((p, i) => (
                <tr key={p.id || i} style={i % 2 ? s.trAlt : s.tr}>
                  <Td>{p.descripcion || '—'}</Td>
                  <Td center><span style={p.cantidad > 0 ? s.numOn : s.numOff}>{p.cantidad}</span></Td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr>
              <td style={s.tfoot}>Total</td>
              <td style={{ ...s.tfoot, textAlign: 'center', color: '#6366f1', fontWeight: 900 }}>{totalPers}</td>
            </tr></tfoot>
          </table>
        )}
      </Section>

      {/* ── Actividades ────────────────────────────────────────────────────── */}
      <Section icon={<FileText size={13} />} title="ACTIVIDADES DEL DÍA" color="#f59e0b">
        {actividades.length === 0 ? <Empty msg="Sin actividades registradas" /> :
          actividades.map((grupo, gi) => (
            <div key={grupo.id || gi} style={{ ...s.actGrupo, borderLeftColor: grupo.color || '#6366f1', marginBottom: gi < actividades.length - 1 ? 14 : 0 }}>
              <span style={{ ...s.actCat, color: grupo.color || '#6366f1' }}>{grupo.categoria}</span>
              <ul style={s.actList}>
                {grupo.actividades.map((a, ai) => (
                  <li key={ai} style={s.actItem}>
                    <ChevronRight size={10} style={{ marginRight: 5, color: grupo.color || '#6366f1', flexShrink: 0, marginTop: 2 }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          ))
        }
      </Section>

      {/* ── Observaciones ──────────────────────────────────────────────────── */}
      {d?.observaciones_generales && (
        <Section icon={<ClipboardList size={13} />} title="OBSERVACIONES GENERALES" color="#64748b">
          <p style={{ margin: 0, fontSize: 13, color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {d.observaciones_generales}
          </p>
        </Section>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{value}</span>
    </div>
  );
}

function ClimaCard({ icon, label, value, active, activeColor }) {
  return (
    <div style={{ flex: '1 1 180px', background: active ? `${activeColor}10` : '#f8fafc', border: `1px solid ${active ? activeColor + '40' : '#e2e8f0'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <span style={{ fontSize: 15, fontWeight: 800, color: active ? activeColor : '#94a3b8' }}>{value}</span>
    </div>
  );
}

function Section({ icon, title, badge, color, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHead}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: color || '#0d9488' }}>
          {icon}
          <span style={{ ...s.sectionTitle, color: color || '#0d9488' }}>{title}</span>
        </div>
        {badge && <span style={{ fontSize: 10, fontWeight: 700, color: color || '#0d9488', background: (color || '#0d9488') + '18', borderRadius: 20, padding: '2px 10px' }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function Empty({ msg }) {
  return <p style={{ margin: 0, padding: '0.5rem 0', color: '#94a3b8', fontSize: 12, fontStyle: 'italic' }}>{msg}</p>;
}

function Th({ children, w, center }) {
  return <th style={{ ...s.th, width: w, textAlign: center ? 'center' : 'left' }}>{children}</th>;
}
function Td({ children, center }) {
  return <td style={{ ...s.td, textAlign: center ? 'center' : 'left' }}>{children}</td>;
}

const s = {
  header:      { background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: '10px 28px', alignItems: 'flex-end' },
  climaRow:    { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  section:     { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th:          { background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '7px 10px', borderBottom: '1px solid #e2e8f0' },
  tr:          { background: 'white' },
  trAlt:       { background: '#f8fafc' },
  td:          { padding: '7px 10px', color: '#334155', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
  tfoot:       { padding: '8px 10px', fontWeight: 700, fontSize: 11, color: '#64748b', textTransform: 'uppercase', borderTop: '1px solid #e2e8f0' },
  numOn:       { fontWeight: 800, color: '#0d9488' },
  numOff:      { color: '#cbd5e1', fontWeight: 600 },
  empresa:     { color: '#3b82f6', fontSize: 11 },
  notas:       { color: '#94a3b8', fontStyle: 'italic', fontSize: 11 },
  actGrupo:    { borderLeft: '3px solid', paddingLeft: 12 },
  actCat:      { fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 },
  actList:     { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  actItem:     { display: 'flex', alignItems: 'flex-start', color: '#334155', fontSize: 12, lineHeight: 1.5 },
};
