import { useState, useEffect } from 'react';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';
import { ShieldCheck, BookOpen, AlertOctagon, ClipboardCheck, Users, Search, Plus, Filter, FileText, CheckCircle, Clock, AlertTriangle, Palette } from 'lucide-react';

const API_BASE = BASE_URL + '/calidad/';

const s = {
  page: { background: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' },
  header: { background: '#1E293B', borderBottom: '1px solid #334155', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
  nav: { display: 'flex', gap: '0.5rem' },
  navBtn: (active) => ({ 
    background: active ? '#4F46E5' : 'transparent', 
    color: active ? '#fff' : '#94A3B8', 
    border: '1px solid ' + (active ? '#4F46E5' : '#334155'), 
    padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', gap: '8px'
  }),
  body: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
  card: { background: '#1E293B', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  h2: { margin: 0, fontSize: '1.1rem', color: '#F8FAFC' },
  btn: (color='#4F46E5') => ({ background: color, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid #334155' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #1E293B', color: '#F8FAFC', fontSize: '0.9rem' },
  badge: (c, bg) => ({ background: bg, color: c, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }),
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  stat: (color) => ({ background: color + '15', border: '1px solid ' + color + '40', borderRadius: '10px', padding: '1.2rem' }),
  statVal: { fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: '0.5rem 0' },
  statLbl: { fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' },
};

function VistaDocumentacion() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(API_BASE + 'documentos-iso/').then(r => { setDocs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94A3B8' }}>Cargando Repositorio ISO...</div>;

  const categorias = [
    { id: '1_base', title: '1. Base del Sistema (Manuales y Políticas)', desc: 'El núcleo de la ISO 9001 (Qué y Por qué)', color: '#818CF8' },
    { id: '2_procedimiento', title: '2. Procedimientos Obligatorios SGC', desc: 'Control docs, auditorías, NC y acciones correctoras', color: '#F472B6' },
    { id: '3_instructivo', title: '3. Instructivos de Fabricación KAVE', desc: 'Bobinados, ensambles, test eléctricos', color: '#34D399' },
    { id: '4_registro', title: '4. Formatos y Registros', desc: 'Evidencias objetivas: Fichas, certificados, actas', color: '#FBBF24' }
  ];

  return (
    <div>
      <div style={s.cardHeader}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Estructura Documental</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '5px 0 0' }}>Pirámide del Sistema de Gestión de Calidad</p>
        </div>
        <button style={s.btn()}><Plus size={16}/> Subir Documento</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {categorias.map(cat => {
          const catDocs = docs.filter(d => d.categoria === cat.id);
          return (
            <div key={cat.id} style={{ ...s.card, marginBottom: 0, borderLeft: `4px solid ${cat.color}` }}>
              <h3 style={{ margin: '0 0 0.5rem', color: '#F8FAFC', fontSize: '1.1rem' }}>{cat.title}</h3>
              <p style={{ margin: '0 0 1rem', color: '#94A3B8', fontSize: '0.85rem' }}>{cat.desc}</p>
              
              {catDocs.length === 0 ? (
                <div style={{ padding: '1rem', background: '#0F172A', borderRadius: '8px', color: '#64748B', fontSize: '0.85rem', textAlign: 'center' }}>No hay documentos aprobados en esta categoría.</div>
              ) : (
                <table style={s.table}>
                  <thead>
                    <tr><th style={s.th}>Código</th><th style={s.th}>Título del Documento</th><th style={s.th}>Versión</th><th style={s.th}>Estado</th><th style={s.th}>Aprobación</th></tr>
                  </thead>
                  <tbody>
                    {catDocs.map(d => (
                      <tr key={d.id}>
                        <td style={{ ...s.td, fontWeight: 600, color: cat.color }}>{d.codigo}</td>
                        <td style={s.td}>{d.titulo}</td>
                        <td style={s.td}>v{d.version}</td>
                        <td style={s.td}>
                          <span style={s.badge(d.estado==='vigente'?'#10b981':'#f59e0b', d.estado==='vigente'?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)')}>
                            {d.estado.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ ...s.td, color: '#94A3B8', fontSize: '0.8rem' }}>{d.fecha_aprobacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VistaCAPA() {
  const [ncs, setNcs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(API_BASE + 'noconformidades/').then(r => { setNcs(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94A3B8' }}>Cargando Hallazgos...</div>;

  return (
    <div>
      <div style={s.grid4}>
         <div style={s.stat('#F87171')}><div style={s.statLbl}><AlertOctagon size={16}/> NC Abiertas</div><div style={s.statVal}>{ncs.filter(n=>n.estado!=='cerrada').length}</div></div>
         <div style={s.stat('#FBBF24')}><div style={s.statLbl}><Clock size={16}/> En Análisis Causa Raíz</div><div style={s.statVal}>{ncs.filter(n=>n.estado==='investigacion').length}</div></div>
         <div style={s.stat('#10B981')}><div style={s.statLbl}><CheckCircle size={16}/> CAPAs Verificadas</div><div style={s.statVal}>{ncs.filter(n=>n.estado==='cerrada').length}</div></div>
      </div>

      <div style={{ ...s.card, marginTop: '2rem' }}>
        <div style={s.cardHeader}>
          <h2 style={s.h2}>Registro de No Conformidades y Acciones Correctoras (CAPA)</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              style={s.btn('#64748B')} 
              onClick={() => {
                window.location.href = '/form-designer?template=No%20Conformidad%20Calidad';
              }}
              title="Personalizar el formulario de No Conformidades"
            >
              <Palette size={16}/> Personalizar Formulario
            </button>
            <button style={s.btn('#EF4444')}><Plus size={16}/> Levantar NC</button>
          </div>
        </div>
        
        {ncs.length === 0 ? (
           <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>El sistema de calidad está limpio. No hay hallazgos registrados.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>Cod</th><th style={s.th}>Origen</th><th style={s.th}>Descripción</th><th style={s.th}>Fecha</th><th style={s.th}>Estado NC</th><th style={s.th}>CAPA Asignada</th></tr>
            </thead>
            <tbody>
              {ncs.map(nc => (
                <tr key={nc.id}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#F87171' }}>NC-{nc.id.toString().padStart(4,'0')}</td>
                  <td style={s.td}><span style={s.badge('#94A3B8', '#1E293B')}>{nc.origen_display}</span></td>
                  <td style={{ ...s.td, maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nc.descripcion}</td>
                  <td style={{ ...s.td, color: '#94A3B8', fontSize: '0.8rem' }}>{nc.fecha_reporte}</td>
                  <td style={s.td}>
                    {nc.estado === 'abierta' && <span style={s.badge('#ef4444', 'rgba(239,68,68,0.1)')}>ABIERTA</span>}
                    {nc.estado === 'investigacion' && <span style={s.badge('#f59e0b', 'rgba(245,158,11,0.1)')}>INVESTIGANDO</span>}
                    {nc.estado === 'cerrada' && <span style={s.badge('#10b981', 'rgba(16,185,129,0.1)')}>CERRADA</span>}
                  </td>
                  <td style={s.td}>
                    {nc.capa ? (
                      <span style={{ color: '#818CF8', fontSize: '0.85rem', fontWeight: 500 }}>Corrigiendo ({nc.capa.estado})</span>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '0.85rem' }}>No asignada</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function VistaAuditorias() {
  const [auditorias, setAuditorias] = useState([]);
  useEffect(() => { axiosInstance.get(API_BASE + 'auditorias/').then(r => setAuditorias(r.data)); }, []);

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h2 style={s.h2}>Programa Anual de Auditorías</h2>
        <button style={s.btn()}><Plus size={16}/> Programar Auditoría</button>
      </div>
      <table style={s.table}>
        <thead>
          <tr><th style={s.th}>Fecha Prog.</th><th style={s.th}>Tipo / Ente</th><th style={s.th}>Procesos (Alcance)</th><th style={s.th}>Auditor Líder</th><th style={s.th}>Estado</th><th style={s.th}>Hallazgos</th></tr>
        </thead>
        <tbody>
          {auditorias.map(a => (
            <tr key={a.id}>
              <td style={{ ...s.td, fontWeight: 600 }}>{a.fecha_programada}</td>
              <td style={s.td}><span style={s.badge(a.tipo==='interna'?'#818CF8':'#34D399', 'rgba(255,255,255,0.05)')}>{a.tipo_display.toUpperCase()}</span></td>
              <td style={s.td}>{a.alcance}</td>
              <td style={s.td}>{a.auditor_lider}</td>
              <td style={s.td}>{a.estado}</td>
              <td style={{ ...s.td, fontWeight: 700, color: a.hallazgos_totales > 0 ? '#ef4444' : '#10b981' }}>{a.hallazgos_totales}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VistaProveedores() {
  const [evs, setEvs] = useState([]);
  useEffect(() => { axiosInstance.get(API_BASE + 'evaluaciones-proveedor/').then(r => setEvs(r.data)); }, []);

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <h2 style={s.h2}>Monitor de Desempeño de Proveedores (SGC)</h2>
        <button style={s.btn()}><Plus size={16}/> Nueva Evaluación</button>
      </div>
      <table style={s.table}>
         <thead>
          <tr><th style={s.th}>Proveedor</th><th style={s.th}>Evaluación Calidad</th><th style={s.th}>Evaluación Tiempos</th><th style={s.th}>Status SGC</th><th style={s.th}>Última Eval.</th></tr>
         </thead>
         <tbody>
           {evs.map(e => (
             <tr key={e.id}>
               <td style={{ ...s.td, fontWeight: 600 }}>{e.proveedor_nombre}</td>
               <td style={s.td}><div style={{width:'80%', background:'#334155', height:'8px', borderRadius:'4px'}}><div style={{width:`${e.calificacion_calidad}%`, background: e.calificacion_calidad > 80 ? '#10b981' : '#f59e0b', height:'100%', borderRadius:'4px'}}/></div></td>
               <td style={s.td}><div style={{width:'80%', background:'#334155', height:'8px', borderRadius:'4px'}}><div style={{width:`${e.calificacion_tiempos}%`, background: e.calificacion_tiempos > 80 ? '#10b981' : '#f59e0b', height:'100%', borderRadius:'4px'}}/></div></td>
               <td style={s.td}>{e.aprobado ? <span style={s.badge('#10b981','rgba(16,185,129,0.1)')}>APTO</span> : <span style={s.badge('#ef4444','rgba(239,68,68,0.1)')}>EN RIESGO</span>}</td>
               <td style={{...s.td, color:'#94A3B8'}}>{e.fecha_evaluacion}</td>
             </tr>
           ))}
         </tbody>
      </table>
    </div>
  );
}

export default function CalidadISO() {
  const [tab, setTab] = useState('docs');

  return (
    <div className="container" style={{ position: 'relative' }}>
      <button 
        onClick={() => navigate('/')} 
        className="btn btn-ghost modal-close-btn" 
        title="Cerrar Módulo"
        style={{ 
          position: 'absolute', 
          top: '1rem', 
          right: '1rem',
          background: '#ff0000',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          fontSize: '2rem',
          padding: '0.75rem',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          zIndex: 999999999,
          width: '60px',
          height: '60px',
          minWidth: '60px',
          minHeight: '60px',
          maxWidth: '60px',
          maxHeight: '60px',
          visibility: 'visible',
          opacity: 1,
          display: 'block',
          pointerEvents: 'auto',
          transform: 'none',
          transition: 'none',
          animation: 'none',
          textAlign: 'center',
          lineHeight: '60px'
        }}
      >
        X
      </button>
      <div style={s.header}>
        <h1 style={s.title}>
          <ShieldCheck color="#10B981" size={28} /> 
          SGC - Centro de Control ISO 9001
        </h1>
        <nav style={s.nav}>
          <button style={s.navBtn(tab==='docs')} onClick={()=>setTab('docs')}><BookOpen size={16}/> Estructura Documental</button>
          <button style={s.navBtn(tab==='capa')} onClick={()=>setTab('capa')}><AlertOctagon size={16}/> Trato de NC y CAPA</button>
          <button style={s.navBtn(tab==='auditoria')} onClick={()=>setTab('auditoria')}><ClipboardCheck size={16}/> Auditorías</button>
          <button style={s.navBtn(tab==='proveedores')} onClick={()=>setTab('proveedores')}><Users size={16}/> Homologación Prov.</button>
        </nav>
      </div>
      <div style={s.body}>
        {tab === 'docs' && <VistaDocumentacion />}
        {tab === 'capa' && <VistaCAPA />}
        {tab === 'auditoria' && <VistaAuditorias />}
        {tab === 'proveedores' && <VistaProveedores />}
      </div>
    </div>
  );
}