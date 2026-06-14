import { useQuery } from '@tanstack/react-query';
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
      id: d.recurso || d.id,
      descripcion: d.recurso_nombre || d.descripcion || '',
      categoria: d.recurso_categoria || d.categoria || '',
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
    const cat = a.categoria_nombre || a.categoria || 'General';
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

function ReportesInforme({ informeId, informe }) {
  const { data: rawDetalle, isLoading } = useQuery({
    queryKey: ['informe-detalle', informeId],
    queryFn: () => informeDiarioService.get(informeId),
    enabled: !!informeId,
    staleTime: 30_000,
  });

  const d = normalizar(rawDetalle || informe);

  if (!informeId && !informe) {
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
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>INTERVENTORIA — COD: F-141-IN — Emision: 27/08/2009 — Mod: 00</div>
          </div>
        </div>

        {/* Proyecto / Fecha */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '15%' }}>OBRA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, width: '35%' }}>{d?.obra_nombre || '---'}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '15%' }}>CLIENTE:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, width: '35%' }}>{d?.cliente_nombre || '---'}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '20%' }}>DIA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{d?.dia_semana || '---'}</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontWeight: 700, fontSize: 12, background: '#f0f0f0', width: '20%' }}>FECHA:</td>
              <td style={{ border: '1px solid #1e293b', padding: '6px 10px', fontSize: 12 }}>{d?.fecha || '---'}</td>
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
        {d?.observaciones_generales && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: '#1e293b', color: 'white', padding: '4px 8px', marginBottom: 4 }}>
              Observaciones Generales
            </div>
            <div style={{ padding: '6px 8px', fontSize: 10, lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
              {d.observaciones_generales}
            </div>
          </div>
        )}

        {/* Firmas */}
        <div style={{ marginTop: 20, borderTop: '2px solid #1e293b', paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Recursos Control Obra</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
            <tbody>
              <tr>
                <td style={{ ...td, width: '33%', textAlign: 'center', border: '1px solid #94a3b8' }}>
                  <div style={{ fontWeight: 700, marginBottom: 20 }}>Elaborado por</div>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: 4, marginTop: 20 }}>
                    {d?.elaborado_por || '_______________'}
                  </div>
                </td>
                <td style={{ ...td, width: '33%', textAlign: 'center', border: '1px solid #94a3b8' }}>
                  <div style={{ fontWeight: 700, marginBottom: 20 }}>Revisado por</div>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: 4, marginTop: 20 }}>
                    {d?.revisado_por || '_______________'}
                  </div>
                </td>
                <td style={{ ...td, width: '34%', textAlign: 'center', border: '1px solid #94a3b8' }}>
                  <div style={{ fontWeight: 700, marginBottom: 20 }}>Aprobado por</div>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: 4, marginTop: 20 }}>
                    {d?.aprobado_por || '_______________'}
                  </div>
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
