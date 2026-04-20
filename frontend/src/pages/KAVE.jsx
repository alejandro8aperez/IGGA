import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, CheckSquare, Clock, DollarSign, Search, Plus, Edit, Trash2, Zap, 
  Calculator, ChevronLeft, AlertTriangle, CheckCircle, FileText, Activity, 
  Thermometer, Wind, ZapOff, TrendingUp, BarChart3, Info, Settings, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/kave/';

// ── Estilos globales ──────────────────────────────────────────────────────
const s = {
  page:    { background: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' },
  header:  { background: '#1E293B', borderBottom: '1px solid #334155', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title:   { fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', margin: 0 },
  nav:     { display: 'flex', gap: '0.5rem' },
  navBtn:  (active) => ({ background: active ? '#4F46E5' : 'transparent', color: active ? '#fff' : '#94A3B8', border: '1px solid ' + (active ? '#4F46E5' : '#334155'), padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }),
  body:    { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
  card:    { background: '#1E293B', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' },
  label:   { display: 'block', color: '#94A3B8', fontSize: '0.82rem', marginBottom: '0.4rem', fontWeight: 500 },
  input:   { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#F8FAFC', fontSize: '0.95rem', boxSizing: 'border-box' },
  select:  { width: '100%', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '0.6rem 0.9rem', color: '#F8FAFC', fontSize: '0.95rem', boxSizing: 'border-box' },
  btn:     (color='#4F46E5') => ({ background: color, color: '#fff', border: 'none', padding: '0.65rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }),
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  grid3:   { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  grid4:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  fGroup:  { marginBottom: '1rem' },
  stat:    (color) => ({ background: color + '22', border: '1px solid ' + color + '55', borderRadius: '10px', padding: '1.2rem', textAlign: 'center' }),
  statVal: { fontSize: '1.2rem', fontWeight: 700, color: '#F8FAFC' },
  statLbl: { fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' },
  result:  { background: '#0F172A', borderRadius: '8px', padding: '1rem 1.2rem', border: '1px solid #334155', marginBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  resLbl:  { color: '#94A3B8', fontSize: '0.88rem' },
  resVal:  { color: '#818CF8', fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace' },
  table:   { width: '100%', borderCollapse: 'collapse' },
  th:      { padding: '0.75rem 1rem', textAlign: 'left', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid #334155' },
  td:      { padding: '0.75rem 1rem', borderBottom: '1px solid #1E293B', color: '#F8FAFC', fontSize: '0.9rem' },
  badge:   (c) => ({ background: c + '22', color: c, padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }),
  sep:     { borderTop: '1px solid #334155', margin: '1.5rem 0' },
  warn:    { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
  success: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.8rem 1rem', color: '#6ee7b7', fontSize: '0.88rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
  sectionTitle: { color: '#818CF8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', fontWeight: 600 }
};

// ── COMPONENTE GRAFICO ─────────────────────────────────────────────────────
function TransformadorSVG({ form, calc }) {
  if (!calc || !form) return null;

  const esEi = form.forma_nucleo === 'ei';
  
  // Parámetros calculados
  const espPri = calc.parametros_calculo?.h_efec_pri_mm || 10;
  const espTotal = calc.parametros_calculo?.espesor_total_mm || 20;

  if (esEi) {
    // Dibujo Núcleo ventana, pierna central y bobinas
    const anVentana = parseFloat(form.ancho_ventana) || 100;
    const alVentana = parseFloat(form.altura_ventana) || 200;
    const anPierna = parseFloat(form.ancho_pierna) || 50;

    // Normalizamos para dibujar en viewBox de 400x250
    const widthTotal = (anPierna * 3) + (anVentana * 2);
    const heightTotal = alVentana + (anPierna * 2);
    
    const maxDim = Math.max(widthTotal, heightTotal);
    const scale = 220 / (maxDim || 1); // ajustado para caber en 300px

    const dPi = anPierna * scale;
    const dVeX = anVentana * scale;
    const dVeY = alVentana * scale;
    
    // Espesor bobinas repartido radialmente
    const espR = (espTotal * scale) / 2;
    // La bobina no debe pasarse del ancho de la ventana
    const wBobina = Math.min(espR, dVeX - 2); 
    
    return (
       <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
         <div style={{ ...s.sectionTitle, textAlign: 'center' }}>Vista Transversal (Núcleo y Devanado)</div>
         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
           <svg width="100%" height="250" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(200, 125)">
                 {/* Núcleo Completo (Color Silicio) */}
                 <rect x={(-dPi*1.5) - dVeX} y={(-dVeY/2) - dPi} width={(dPi*3) + (dVeX*2)} height={dVeY + (dPi*2)} fill="#334155" rx="2" />
                 
                 {/* Hueco Ventana Izquierda */}
                 <rect x={(-dPi/2) - dVeX} y={-dVeY/2} width={dVeX} height={dVeY} fill="#0F172A" />
                 
                 {/* Hueco Ventana Derecha */}
                 <rect x={(dPi/2)} y={-dVeY/2} width={dVeX} height={dVeY} fill="#0F172A" />

                 {/* Pierna Central del Núcleo */}
                 <rect x={-dPi/2} y={(-dVeY/2) - dPi} width={dPi} height={dVeY + (dPi*2)} fill="#475569" />

                 {/* Bobinas en la pierna central */}
                 <g>
                    {/* Lado Izquierdo - Bobina Completa */}
                    <rect x={(-dPi/2) - wBobina} y={(-dVeY/2) + 2} width={wBobina} height={dVeY - 4} fill="#F97316" opacity="0.8"/>
                    {/* Lado Izquierdo - Capa Exterior (AT) */}
                    <rect x={(-dPi/2) - wBobina} y={(-dVeY/2) + 2} width={wBobina*0.4} height={dVeY - 4} fill="#3B82F6" opacity="0.9"/>
                    
                    {/* Lado Derecho - Bobina Completa */}
                    <rect x={(dPi/2)} y={(-dVeY/2) + 2} width={wBobina} height={dVeY - 4} fill="#F97316" opacity="0.8"/>
                    {/* Lado Derecho - Capa Exterior (AT) */}
                    <rect x={(dPi/2) + wBobina*0.6} y={(-dVeY/2) + 2} width={wBobina*0.4} height={dVeY - 4} fill="#3B82F6" opacity="0.9"/>
                 </g>
                 
                 {/* Medida de la pierna */}
                 <text x="0" y="5" fill="#F8FAFC" fontSize="12" textAnchor="middle" fontWeight="bold">{parseFloat(form.ancho_pierna)}mm</text>
              </g>
           </svg>
         </div>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem', color: '#94A3B8' }}>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#475569', borderRadius:'2px'}}></div> Núcleo</div>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#F97316', borderRadius:'2px'}}></div> Baja Tensión</div>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#3B82F6', borderRadius:'2px'}}></div> Alta Tensión</div>
         </div>
       </div>
    );
  } else {
    // Toroidal
    const diamInt = parseFloat(form.diametro_interno) || 50;
    const diamExt = parseFloat(form.diametro_externo) || 150;
    
    return (
       <div style={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
         <div style={{ ...s.sectionTitle, textAlign: 'center' }}>Vista de Planta (Anillo Toroidal)</div>
         <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
           <svg width="100%" height="250" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
              <g transform="translate(200, 125)">
                 {/* Anillo de Acero */}
                 <circle cx="0" cy="0" r="90" fill="#475569" stroke="#334155" strokeWidth="2" />
                 {/* Hueco interno */}
                 <circle cx="0" cy="0" r="40" fill="#0F172A" />

                 {/* Devanado (Overlay visual torioidal)  */}
                 <circle cx="0" cy="0" r="80" fill="none" stroke="#F97316" strokeWidth="18" opacity="0.6"/>
                 <circle cx="0" cy="0" r="55" fill="none" stroke="#3B82F6" strokeWidth="10" opacity="0.7"/>
                 
                 {/* Rayas de hilos */}
                 <circle cx="0" cy="0" r="65" fill="none" stroke="#0F172A" strokeWidth="2" strokeDasharray="4 8" opacity="0.3"/>
                 
                 <text x="0" y="5" fill="#F8FAFC" fontSize="12" textAnchor="middle" fontWeight="bold">ØInt {diamInt}</text>
              </g>
           </svg>
         </div>
         <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem', color: '#94A3B8' }}>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#475569', borderRadius:'10px'}}></div> Núcleo</div>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#F97316', borderRadius:'10px'}}></div> Baja Tensión</div>
            <div style={{ display:'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 12, height:12, background:'#3B82F6', borderRadius:'10px'}}></div> Alta Tensión</div>
         </div>
       </div>
    );
  }
}

// ── COMPONENTE DE GRÁFICO DE EFICIENCIA ──────────────────────────────────
function GraficoEficiencia({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ height: 200, width: '100%', marginTop: '1rem', background: '#0F172A', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ ...s.sectionTitle, fontSize: '0.7rem', marginBottom: '5px' }}>Curva de Eficiencia vs Carga (%)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="carga" stroke="#94A3B8" fontSize={10} tickFormatter={(v) => v + '%'} />
          <YAxis stroke="#94A3B8" fontSize={10} domain={['dataMin - 1', 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            itemStyle={{ color: '#818CF8' }}
          />
          <Area type="monotone" dataKey="eficiencia" stroke="#818CF8" fillOpacity={1} fill="url(#colorEff)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── VISTA: Calculador ─────────────────────────────────────────────────────
function VistaCalculador({ onGuardar }) {
  const [form, setForm] = useState({
    potencia_kva: '25', vp: '13200', vs: '220',
    tipo: 'monofasico', refrigeracion: 'seco', forma_nucleo: 'ei',
    material: 'silicio', material_bobinas: 'aluminio', frecuencia: '60',
    induccion_maxima: '1.45', densidad_corriente: '2.5',
    altura_ventana: '200', ancho_ventana: '100', ancho_pierna: '50', profundidad_nucleo: '50', factor_apilamiento: '0.96',
    diametro_interno: '50', diametro_externo: '150', altura_toroide: '70',
    tipo_conductor_primario: 'awg', alto_platina_primario: '0', ancho_platina_primario: '0',
    tipo_conductor_secundario: 'awg', alto_platina_secundario: '0', ancho_platina_secundario: '0',
    canal_entre_capas: '0.1', margen_seguridad_extremos: '5.0', aislamiento_tubo: '2.0', aislamiento_entre_devanados: '1.0', levante_bobinado: '15.0'
  });

  const [calc, setCalc] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');
  const [simulando, setSimulando] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setGuardado(false); };

  const optimizar = () => {
    // Lógica de optimización heurística de ingeniería
    let b = '1.45';
    let j = '2.5';
    
    if (form.material === 'amorfoso') b = '1.25';
    if (form.material === 'ferrita') b = '0.35';
    if (form.refrigeracion === 'aceite') j = '3.5';
    
    setForm({
      ...form,
      induccion_maxima: b,
      densidad_corriente: j
    });
    window.alert(`Optimización aplicada: B=${b}T, J=${j}A/mm2. Basado en materiales y refrigeración.`);
  };

  const simular = async () => {
    setSimulando(true);
    setError('');
    try {
      console.log('🔧 Enviando datos a KAVE:', form);
      console.log('🌐 URL:', API_URL + 'quote/');
      
      // Opción 1: Usar fetch nativo
      const response = await fetch(API_URL + 'quote/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      console.log('>>> Respuesta KAVE completa:', data);
      console.log('>>> Keys disponibles:', Object.keys(data));
      console.log('>>> Status:', response.status);
      console.log('>>> data.status:', data.status);
      console.log('>>> data.resultado:', data.resultado);
      console.log('>>> data.cotizacion:', data.cotizacion);
      
      // Manejo robusto de diferentes estructuras de respuesta
      let calcData = null;
      
      if (data.status === 'success') {
        // Intentar diferentes posibles estructuras
        if (data.resultado) {
          calcData = data.resultado;
          console.log('>>> Usando data.resultado');
        } else if (data.cotizacion) {
          calcData = data.cotizacion;
          console.log('>>> Usando data.cotizacion');
        } else if (data.data) {
          calcData = data.data;
          console.log('>>> Usando data.data');
        } else {
          // Si la respuesta es directamente el objeto de cálculo
          calcData = data;
          console.log('>>> Usando data directo');
        }
        
        console.log('>>> Datos de cálculo finales:', calcData);
        setCalc(calcData);
      } else {
        setError(data.error || 'Error desconocido.');
      }
    } catch (e) {
      console.error('>>> Error completo en catch:', e);
      console.error('>>> e.message:', e.message);
      console.error('>>> e.stack:', e.stack);
      
      // Manejo específico para error de 'resultado'
      if (e.message && e.message.includes('resultado')) {
        console.error('>>> Error específico de resultado detectado');
        setError('Error en la estructura de la respuesta del servidor. Contacte al administrador.');
      } else if (e.message && e.message.includes('Unexpected token')) {
        console.error('>>> Error de JSON parsing');
        setError('Error en el formato de la respuesta. Verifique el servidor.');
      } else {
        setError(`❌ Error: ${e.message}`);
      }
    } finally {
      setSimulando(false);
    }
  };

  const guardar = async () => {
    try {
      console.log('KAVE: Intentando guardar diseño...');
      console.log('KAVE: URL:', API_URL + 'design/');
      console.log('KAVE: Datos a guardar:', form);
      
      const response = await axios.post(API_URL + 'design/', form);
      console.log('KAVE: Respuesta del servidor:', response.status, response.data);
      
      setGuardado(true);
      setError('');
      if (onGuardar) onGuardar();
      
      console.log('KAVE: Diseño guardado exitosamente');
    } catch (e) {
      console.error('KAVE: Error al guardar diseño:', e);
      console.error('KAVE: Detalles del error:', {
        message: e.message,
        code: e.code,
        response: e.response?.data,
        status: e.response?.status,
        config: e.config
      });
      
      let errorMessage = 'Error al guardar. Verifica que el backend esté corriendo.';
      
      if (e.code === 'ECONNREFUSED' || e.code === 'ERR_CONNECTION_REFUSED') {
        console.error('KAVE: No se puede conectar al backend en 127.0.0.1:8000');
        errorMessage = 'No se puede conectar al servidor. Inicie el backend Django en 127.0.0.1:8000.';
      } else if (e.response?.status === 400) {
        console.error('KAVE: Error de validación en el backend');
        errorMessage = `Error de validación: ${e.response?.data?.error || 'Datos inválidos'}`;
      } else if (e.response?.status === 500) {
        console.error('KAVE: Error interno del servidor');
        errorMessage = 'Error interno del servidor. Revise los logs del backend.';
      }
      
      setError(errorMessage);
    }
  };

  const esEi = form.forma_nucleo === 'ei';

  return (
    <div>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#F8FAFC' }}>
        Analizador y Planificador de Ingeniería (KAVE)
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '2rem' }}>

        {/* ── Panel Izquierdo: Formularios ── */}
        <div style={s.card}>
          
          {/* Parámetros Avanzados */}
          <div style={s.sectionTitle}>
            <Settings size={14} style={{ marginRight: 6 }} />
            Configuración de Ingeniería
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={s.fGroup}>
              <label style={s.label}>Inducción Máx. (B) [Tesla]</label>
              <input style={s.input} type="number" step="0.01" value={form.induccion_maxima} onChange={e => set('induccion_maxima', e.target.value)} />
            </div>
            <div style={s.fGroup}>
              <label style={s.label}>Densidad Corriente (J) [A/mm2]</label>
              <input style={s.input} type="number" step="0.1" value={form.densidad_corriente} onChange={e => set('densidad_corriente', e.target.value)} />
            </div>
          </div>

          <div style={s.sectionTitle}>
            <Zap size={14} style={{ marginRight: 6 }} />
            Especificaciones Eléctricas
          </div>
          <div style={s.grid2}>
            <div style={s.fGroup}>
              <label style={s.label}>Tipo Sistema</label>
              <select style={s.select} value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                <option value="monofasico">Monofásico</option><option value="trifasico">Trifásico</option>
              </select>
            </div>
            <div style={s.fGroup}><label style={s.label}>Potencia (kVA)</label><input style={s.input} type="number" value={form.potencia_kva} onChange={e => set('potencia_kva', e.target.value)} /></div>
            <div style={s.fGroup}><label style={s.label}>Vp Tensión Primaria (V)</label><input style={s.input} type="number" value={form.vp} onChange={e => set('vp', e.target.value)} /></div>
            <div style={s.fGroup}><label style={s.label}>Vs Tensión Secundaria (V)</label><input style={s.input} type="number" value={form.vs} onChange={e => set('vs', e.target.value)} /></div>
          </div>
          <div style={s.grid3}>
            <div style={s.fGroup}>
              <label style={s.label}>Material Núcleo</label>
              <select style={s.select} value={form.material} onChange={e => set('material', e.target.value)}>
                <option value="silicio">Acero al Silicio</option><option value="amorfoso">Acero Amorfo</option>
              </select>
            </div>
            <div style={s.fGroup}>
              <label style={s.label}>Refrigeración</label>
              <select style={s.select} value={form.refrigeracion} onChange={e => set('refrigeracion', e.target.value)}>
                <option value="seco">Seco</option><option value="aceite">En Aceite</option>
              </select>
            </div>
            <div style={s.fGroup}>
              <label style={s.label}>Frecuencia (Hz)</label>
              <select style={s.select} value={form.frecuencia} onChange={e => set('frecuencia', e.target.value)}>
                <option value="60">60</option><option value="50">50</option>
              </select>
            </div>
          </div>

          <div style={s.sep} />
          <div style={s.sectionTitle}>Geometría y Núcleo</div>
          <div style={s.grid2}>
            <div style={s.fGroup}>
              <label style={s.label}>Morfología de Núcleo</label>
              <select style={s.select} value={form.forma_nucleo} onChange={e => set('forma_nucleo', e.target.value)}>
                <option value="ei">Columnas Convencional (E-I)</option><option value="toroidal">Anillo Toroidal</option>
              </select>
            </div>
            <div style={s.fGroup}><label style={s.label}>Factor de Apilamiento (Ku)</label><input style={s.input} type="number" step="0.01" value={form.factor_apilamiento} onChange={e => set('factor_apilamiento', e.target.value)} /></div>
          </div>

          {esEi ? (
            <div style={s.grid4}>
              <div style={s.fGroup}><label style={s.label}>Al. Ventana (mm)</label><input style={s.input} type="number" value={form.altura_ventana} onChange={e => set('altura_ventana', e.target.value)} /></div>
              <div style={s.fGroup}><label style={s.label}>An. Ventana (mm)</label><input style={s.input} type="number" value={form.ancho_ventana} onChange={e => set('ancho_ventana', e.target.value)} /></div>
              <div style={s.fGroup}><label style={s.label}>An. Pierna (mm)</label><input style={s.input} type="number" value={form.ancho_pierna} onChange={e => set('ancho_pierna', e.target.value)} /></div>
              <div style={s.fGroup}><label style={s.label}>Profundidad (mm)</label><input style={s.input} type="number" value={form.profundidad_nucleo} onChange={e => set('profundidad_nucleo', e.target.value)} /></div>
            </div>
          ) : (
            <div style={s.grid3}>
              <div style={s.fGroup}><label style={s.label}>Diámetro Interno (mm)</label><input style={s.input} type="number" value={form.diametro_interno} onChange={e => set('diametro_interno', e.target.value)} /></div>
              <div style={s.fGroup}><label style={s.label}>Diámetro Externo (mm)</label><input style={s.input} type="number" value={form.diametro_externo} onChange={e => set('diametro_externo', e.target.value)} /></div>
              <div style={s.fGroup}><label style={s.label}>Altura Toroide (mm)</label><input style={s.input} type="number" value={form.altura_toroide} onChange={e => set('altura_toroide', e.target.value)} /></div>
            </div>
          )}

          <div style={s.sep} />
          <div style={s.sectionTitle}>Conductores y Devanado</div>
          <div style={{ marginBottom: '1.5rem', ...s.card, padding: '1rem' }}>
            <label style={s.label}>Material de Devanados (Global)</label>
            <select style={s.select} value={form.material_bobinas} onChange={e => set('material_bobinas', e.target.value)}>
              <option value="aluminio">Aluminio (Por Defecto)</option>
              <option value="cobre">Cobre</option>
            </select>
          </div>
          <div style={s.grid2}>
            <div style={s.card}>
              <label style={{...s.label, color:'#fff', marginBottom:'1rem'}}>Alta Tensión (Primario)</label>
              <div style={s.fGroup}>
                <label style={s.label}>Tipo de Conductor</label>
                <select style={s.select} value={form.tipo_conductor_primario} onChange={e => set('tipo_conductor_primario', e.target.value)}>
                  <option value="awg">Hilo Redondo (Automático AWG)</option><option value="platina">Platina Rectangular Man.</option>
                </select>
              </div>
              {form.tipo_conductor_primario === 'platina' && (
                <div style={s.grid2}>
                  <div style={s.fGroup}><label style={s.label}>Alto (mm)</label><input style={s.input} type="number" step="0.1" value={form.alto_platina_primario} onChange={e => set('alto_platina_primario', e.target.value)} /></div>
                  <div style={s.fGroup}><label style={s.label}>Ancho (mm)</label><input style={s.input} type="number" step="0.1" value={form.ancho_platina_primario} onChange={e => set('ancho_platina_primario', e.target.value)} /></div>
                </div>
              )}
            </div>

            <div style={s.card}>
              <label style={{...s.label, color:'#fff', marginBottom:'1rem'}}>Baja Tensión (Secundario)</label>
              <div style={s.fGroup}>
                <label style={s.label}>Tipo de Conductor</label>
                <select style={s.select} value={form.tipo_conductor_secundario} onChange={e => set('tipo_conductor_secundario', e.target.value)}>
                  <option value="awg">Hilo Redondo (Automático AWG)</option><option value="platina">Platina Rectangular Man.</option>
                </select>
              </div>
              {form.tipo_conductor_secundario === 'platina' && (
                <div style={s.grid2}>
                  <div style={s.fGroup}><label style={s.label}>Alto (mm)</label><input style={s.input} type="number" step="0.1" value={form.alto_platina_secundario} onChange={e => set('alto_platina_secundario', e.target.value)} /></div>
                  <div style={s.fGroup}><label style={s.label}>Ancho (mm)</label><input style={s.input} type="number" step="0.1" value={form.ancho_platina_secundario} onChange={e => set('ancho_platina_secundario', e.target.value)} /></div>
                </div>
              )}
            </div>
          </div>

          <div style={s.sep} />
          <div style={s.sectionTitle}>Aislamientos Físicos Intercapa</div>
          <div style={s.grid4}>
            <div style={s.fGroup}><label style={s.label}>Tubo/Formaleta (mm)</label><input style={s.input} type="number" step="0.1" value={form.aislamiento_tubo} onChange={e => set('aislamiento_tubo', e.target.value)} /></div>
            <div style={s.fGroup}><label style={s.label}>Aisl. AT-BT (mm)</label><input style={s.input} type="number" step="0.1" value={form.aislamiento_entre_devanados} onChange={e => set('aislamiento_entre_devanados', e.target.value)} /></div>
            <div style={s.fGroup}><label style={s.label}>Canal Intercapa (mm)</label><input style={s.input} type="number" step="0.1" value={form.canal_entre_capas} onChange={e => set('canal_entre_capas', e.target.value)} /></div>
            <div style={s.fGroup}><label style={s.label}>Esponjamiento (%)</label><input style={s.input} type="number" step="0.1" value={form.levante_bobinado} onChange={e => set('levante_bobinado', e.target.value)} /></div>
          </div>
          <div style={s.grid4}>
             <div style={s.fGroup}><label style={s.label}>Margen Extremos (mm)</label><input style={s.input} type="number" step="0.1" value={form.margen_seguridad_extremos} onChange={e => set('margen_seguridad_extremos', e.target.value)} /></div>
          </div>

          <div style={s.sep} />

          {error   && <div style={s.warn}><AlertTriangle size={18}/> {error}</div>}
          {guardado && <div style={s.success}><CheckCircle size={18} /> Diseño estructurado guardado exitosamente en base de PostgreSQL.</div>}

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={s.btn('#3B82F6')} onClick={simular} disabled={simulando}>
              <Calculator size={16} /> {simulando ? 'Calculando física...' : 'Simular'}
            </button>
            <button style={s.btn('#8B5CF6')} onClick={optimizar} title="Optimizar parámetros B y J">
              <TrendingUp size={16} /> Sugerir Optimización
            </button>
            <button style={s.btn('#10b981')} onClick={guardar} disabled={!calc}>
              <Plus size={16} /> Guardar Diseño
            </button>
          </div>
        </div>

        {/* ── Panel Derecho: Simulador (calcResult) ── */}
        <div>
          {calc ? (
            <>
              {/* Gráfica SVG Dinámica del Transformador */}
              <TransformadorSVG form={form} calc={calc} />

              {/* Diagnóstico Manufactura */}
              {calc.parametros_calculo?.viabilidad ? (
                <div style={s.success}>
                  <CheckCircle size={28}/> 
                  <div>
                    <strong style={{display: 'block'}}>Viable para Manufactura</strong>
                    {calc.parametros_calculo.mensaje_viabilidad}
                  </div>
                </div>
              ) : (
                <div style={s.warn}>
                  <AlertTriangle size={28} />
                  <div>
                    <strong style={{display: 'block', color: '#ef4444'}}>Rechazo Geométrico</strong>
                    {calc.parametros_calculo?.mensaje_viabilidad}
                  </div>
                </div>
              )}

              <div style={{ ...s.grid2, marginBottom: '1rem' }}>
                <div style={s.stat('#818CF8')}>
                  <div style={s.statVal}>{calc.relacion_transformacion}</div>
                  <div style={s.statLbl}>R. Transformación</div>
                </div>
                <div style={s.stat('#34D399')}>
                  <div style={s.statVal}>{calc.eficiencia} %</div>
                  <div style={s.statLbl}>Eficiencia Real</div>
                </div>
                <div style={s.stat('#F59E0B')}>
                  <div style={s.statVal}>{calc.corrientes?.primaria} A</div>
                  <div style={s.statLbl}>I Primaria</div>
                </div>
                <div style={s.stat('#F87171')}>
                  <div style={s.statVal}>{calc.corrientes?.secundaria} A</div>
                  <div style={s.statLbl}>I Secundaria</div>
                </div>
              </div>

              {/* GRÁFICO DE EFICIENCIA INTEGRADO */}
              <GraficoEficiencia data={calc.eficiencia_map} />

              {calc.parametros_calculo?.elevacion_temperatura_c > 65 && (
                <div style={s.warn}>
                  <AlertTriangle size={20} />
                  <div>
                    <strong style={{display: 'block', color: '#ef4444'}}>Alerta Térmica</strong>
                    La elevación de temperatura calculada ({calc.parametros_calculo.elevacion_temperatura_c}°C) supera los límites recomendados. Aumente el área de enfriamiento o disminuya la densidad.
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={s.sectionTitle}>Cálculos Físicos y Materiales</div>
                {[
                  ['Regulación Volltaje', calc.regulacion ? calc.regulacion + ' %' : 'N/A'],
                  ['Elevación Térmica', calc.parametros_calculo?.elevacion_temperatura_c ? calc.parametros_calculo.elevacion_temperatura_c + ' °C' : 'N/A'],
                  ['Peso Bobinas ('+ (calc.parametros_calculo?.material_bobinas || '') +')', calc.parametros_calculo?.peso_bobinas_kg ? calc.parametros_calculo.peso_bobinas_kg + ' kg' : 'N/A'],
                  ['Peso Núcleo (Magnético)', calc.parametros_calculo?.peso_nucleo_kg ? calc.parametros_calculo.peso_nucleo_kg + ' kg' : 'N/A'],
                ].map(([lbl, val], i) => (
                  <div key={i} style={s.result}>
                    <span style={s.resLbl}>{lbl}</span>
                    <span style={s.resVal}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ ...s.card, marginTop: '1rem' }}>
                <div style={s.sectionTitle}>Diagnóstico y Configuración de Calibres</div>
                {[
                  ['Calibre AT Asignado',          calc.parametros_calculo?.calibre_pri],
                  ['Calibre BT Asignado',        calc.parametros_calculo?.calibre_sec],
                  ['Espesor Total (Tubo a BT)',   calc.parametros_calculo?.espesor_total_mm + ' mm'],
                  ['Espiras AT',          calc.parametros_calculo?.vueltas_primario + ' vueltas'],
                  ['Espiras BT',        calc.parametros_calculo?.vueltas_secundario + ' vueltas'],
                  ['Área del núcleo transversal',          calc.parametros_calculo?.area_nucleo_cm2 + ' cm²'],
                  ['Pérdidas de Corto',        calc.perdidas?.cobre_w + ' W'],
                  ['Pérdidas en Vacío',       calc.perdidas?.nucleo_w + ' W'],
                  ['Estimación Acero/Silicio',       '$' + calc.costo_estimado?.toLocaleString()]
                ].map(([lbl, val]) => (
                  <div key={lbl} style={s.result}>
                    <span style={s.resLbl}>{lbl}</span>
                    <span style={s.resVal}>{val || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ ...s.card, color: '#94A3B8', textAlign: 'center', padding: '5rem 0', fontWeight: '500' }}>
              <Calculator size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
              <div style={{ marginBottom: '1rem' }}>Diligencia los datos a la izquierda y presiona "Simular" para ejecutar el entorno físico.</div>
              {error && (
                <div style={{ ...s.warn, marginTop: '1rem', textAlign: 'left' }}>
                  <AlertTriangle size={18} />
                  <div>
                    <strong style={{display: 'block', color: '#ef4444'}}>Error en el cálculo:</strong>
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VISTA: Historial de diseños ───────────────────────────────────────────
function VistaHistorial({ refresh }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detailedCalc, setDetailedCalc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { 
    console.log('KAVE: VistaHistorial montado, iniciando carga...');
    cargar(); 
  }, [refresh]);

  const cargar = async () => {
    console.log('KAVE: Iniciando función cargar...');
    setLoading(true);
    setError(null);
    
    try {
      console.log('KAVE: Enviando petición a:', API_URL + 'designs/');
      const r = await axios.get(API_URL + 'designs/');
      console.log('KAVE: Respuesta recibida:', r.status, r.data);
      
      if (r.data && Array.isArray(r.data)) {
        // Si la respuesta es directamente un array
        setDesigns(r.data);
        console.log(`KAVE: Se cargaron ${r.data.length} diseños (formato array)`);
      } else if (r.data && r.data.transformadores && Array.isArray(r.data.transformadores)) {
        // Si la respuesta tiene la estructura esperada
        setDesigns(r.data.transformadores);
        console.log(`KAVE: Se cargaron ${r.data.transformadores.length} diseños (formato transformadores)`);
      } else {
        console.log('KAVE: Formato de respuesta inesperado, usando array vacío');
        setDesigns([]);
      }
      
    } catch (error) {
      console.error('KAVE: Error al cargar diseños:', error);
      console.error('KAVE: Detalles completos del error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      let errorMessage = 'No se pudo cargar la bóveda de diseños.';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED') {
        console.error('KAVE: No se puede conectar al backend en 127.0.0.1:8000');
        errorMessage = 'No se puede conectar al servidor. Inicie el backend Django en 127.0.0.1:8000.';
      } else if (error.response?.status === 404) {
        console.error('KAVE: Endpoint no encontrado - /api/kave/designs/');
        errorMessage = 'Endpoint no encontrado. Verifique las rutas del API.';
      } else if (error.response?.status === 500) {
        console.error('KAVE: Error interno del servidor');
        errorMessage = 'Error interno del servidor. Contacte al administrador.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acceso denegado. Verifique sus credenciales.';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autenticado. Inicie sesión nuevamente.';
      }
      
      setError(errorMessage);
      setDesigns([]);
      
    } finally { 
      console.log('KAVE: Finalizando carga, setLoading(false)');
      setLoading(false); 
    }
  };

  const cargarDetalle = async (id) => {
    try {
      console.log(`KAVE: Cargando detalle del diseño ${id}`);
      const r = await axios.get(API_URL + `designs/${id}/`);
      console.log(`KAVE: Detalle del diseño ${id}:`, r.data);
      setSelected(r.data.transformador);
      setDetailedCalc(r.data.calculos?.[0] || null);
    } catch (error) {
      console.error(`KAVE: Error al cargar detalle del diseño ${id}:`, error);
      console.error('KAVE: Detalles del error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este diseño?')) return;
    try {
      console.log(`KAVE: Eliminando diseño ${id}`);
      
      // Llamar al backend para eliminar permanentemente
      await axios.delete(API_URL + `designs/${id}/`);
      
      // Actualizar el estado local después de eliminar exitosamente
      setDesigns(designs.filter(d => d.id !== id));
      console.log(`KAVE: Diseño ${id} eliminado correctamente de la base de datos`);
    } catch (error) {
      console.error(`KAVE: Error al eliminar diseño ${id}:`, error);
      console.error('KAVE: Detalles del error:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Mostrar error al usuario
      alert(`Error al eliminar el diseño: ${error.response?.data?.error || error.message}`);
    }
  };

  const enviarAMRP = async (id) => {
    if (!window.confirm("¿Aprobar y enviar los requerimientos de este diseño técnico al Plan Maestro de MRP para su producción/compra de materiales?")) return;
    try {
      console.log(`KAVE: Enviando diseño ${id} a MRP`);
      const res = await axios.post(API_URL + `designs/${id}/send_to_mrp/`);
      console.log(`KAVE: Respuesta de MRP:`, res.data);
      alert("¡Éxito! " + res.data.mensaje);
    } catch(e) {
      console.error(`KAVE: Error al enviar diseño ${id} a MRP:`, e);
      console.error('KAVE: Detalles del error:', {
        message: e.message,
        code: e.code,
        response: e.response?.data,
        status: e.response?.status
      });
      alert("Error al enviar a MRP: " + (e.response?.data?.error || e.message));
    }
  };

  // Fallback de seguridad - siempre mostrar algo visible
  if (loading) {
    console.log('KAVE: Mostrando estado de loading');
    return (
      <div style={{ color: '#94A3B8', padding: '2rem', textAlign: 'center', minHeight: '50vh' }}>
        <div style={{ marginBottom: '1rem' }}>
          <Zap size={32} style={{ opacity: 0.3, animation: 'spin 1s linear infinite' }} />
        </div>
        <div>Cargando base de datos KAVE...</div>
        <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
          Conectando con el servidor...
        </div>
      </div>
    );
  }

  if (error) {
    console.log('KAVE: Mostrando estado de error:', error);
    return (
      <div style={{ minHeight: '50vh', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#F8FAFC' }}>Biblioteca Central de Manufactura</h2>
        <div style={{ ...s.card, textAlign: 'center', padding: '3rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <AlertTriangle size={48} style={{ color: '#ef4444', opacity: 0.8 }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>
            Error de Conexión
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            {error}
          </div>
          <button 
            style={{ ...s.btn('#3B82F6'), padding: '0.75rem 1.5rem' }}
            onClick={cargar}
          >
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!designs || designs.length === 0) {
    console.log('KAVE: Mostrando bóveda vacía');
    return (
      <div style={{ minHeight: '50vh', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#F8FAFC' }}>Biblioteca Central de Manufactura</h2>
        <div style={{ ...s.card, textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Zap size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748B' }}>
            Bóveda de Diseños Vacía
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1rem' }}>
            No hay diseños guardados en la base de datos.
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>
            Accede al "Planificador Analítico" para crear y guardar nuevos diseños.
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#fca5a5' }}>
            <strong>Nota:</strong> Asegúrate de que el backend Django esté corriendo en 127.0.0.1:8000 y que la API KAVE esté configurada correctamente.
          </div>
        </div>
      </div>
    );
  }

  console.log('KAVE: Mostrando lista de diseños, cantidad:', designs.length);

  if (selected) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <button style={{ ...s.btn('#334155'), marginBottom: '0.5rem' }} onClick={() => { setSelected(null); setDetailedCalc(null); }}>
              <ChevronLeft size={16} /> Volver a biblioteca
            </button>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>
              Registro de Diseño #{selected.id} — {selected.potencia_kva} kVA
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={{...s.btn('#4F46E5'), height: 'fit-content'}} onClick={() => enviarAMRP(selected.id)}>
              <FolderKanban size={18} /> Enviar a MRP
            </button>
            <button style={{...s.btn('#10B981'), height: 'fit-content'}} onClick={() => window.open(API_URL + `designs/${selected.id}/pdf_ficha/`, '_blank')}>
              <FileText size={18} /> Imprimir Ficha SGC (PDF)
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '2rem' }}>
           <div style={s.card}>
             <div style={s.sectionTitle}>Entradas Originales de Fabricación</div>
             <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginBottom: '1rem' }}>
              Material: {selected.material} · Refrig: {selected.refrigeracion} · Núcleo: {selected.forma_nucleo}
             </p>
             {[
               ['Tensión Primaria', selected.vp + ' V'],
               ['Tensión Secundaria', selected.vs + ' V'],
               ['Eficiencia Esperada', selected.eficiencia + '%'],
               ['Diseñador Puesto', selected.disenador_nombre || 'Local']
             ].map(([l, v]) => (
               <div key={l} style={{...s.result, background: 'transparent'}}><span style={s.resLbl}>{l}</span><span style={{ color: '#F8FAFC', fontWeight: 600 }}>{v}</span></div>
             ))}
           </div>
           
           <div style={s.card}>
             <div style={s.sectionTitle}>Históricos Radiales Salvados</div>
             {detailedCalc ? (
               <>
                 {[
                   ['Vueltas Requeridas Primario', detailedCalc.vueltas_primario],
                   ['Vueltas Requeridas Secundario', detailedCalc.vueltas_secundario],
                   ['Área del Núcleo Usada', detailedCalc.area_nucleo + ' cm²'],
                   ['Estimación de Pérdida', detailedCalc.perdidas_totales + ' W']
                 ].map(([l, v]) => (
                   <div key={l} style={s.result}><span style={s.resLbl}>{l}</span><span style={s.resVal}>{v}</span></div>
                 ))}
               </>
             ) : (
                <div style={{color:'#94a3b8', fontSize:'0.85rem'}}>No existen registros matemáticos subrogados a esta entrada.</div>
             )}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '50vh', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#F8FAFC' }}>Biblioteca Central de Manufactura</h2>
      {designs && designs.length > 0 ? (
        <div style={s.card}>
          <table style={s.table}>
            <thead>
              <tr>{['Identificador','Potencia','Voltajes','Tipo','Material','Morfología','Fecha','Acs.'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {designs.map(d => (
                <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => cargarDetalle(d.id)}>
                  <td style={{ ...s.td, fontWeight: 700, color: '#818CF8' }}>KAVE-{d.id.toString().padStart(4, '0')}</td>
                  <td style={{ ...s.td, fontWeight: 700 }}>{d.potencia_kva} kVA</td>
                  <td style={s.td}>{d.vp} / {d.vs} V</td>
                  <td style={s.td}><span style={s.badge(d.tipo === 'monofasico' ? '#34D399' : '#F59E0B')}>{d.tipo}</span></td>
                  <td style={s.td}><span style={s.badge('#3B82F6')}>{d.material}</span></td>
                  <td style={{ ...s.td, fontSize: '0.78rem', color: '#94A3B8' }}>{d.forma_nucleo ? d.forma_nucleo.toUpperCase() : 'N/A'}</td>
                  <td style={{ ...s.td, fontSize: '0.78rem', color: '#64748B' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td style={s.td} onClick={e => { e.stopPropagation(); eliminar(d.id); }}><Trash2 size={15} style={{ color: '#f87171' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ ...s.card, textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Zap size={48} style={{ opacity: 0.2, margin: '0 auto 1rem', display: 'block' }} />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#64748B' }}>
            Bóveda de Diseños Vacía
          </div>
          <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginBottom: '1rem' }}>
            No hay diseños guardados en la base de datos.
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>
            Accede al "Planificador Analítico" para crear y guardar nuevos diseños.
          </div>
        </div>
      )}
    </div>
  );
}

// ── VISTA: Proyectos ──────────────────────────────────────────────────────
function VistaProyectos() {
  const proyectos = [
    { id:1, nombre:'Transformadores de Distribución PS', cliente:'Enerco SAS', estado:'en_progreso', prioridad:'alta', fecha_entrega:'2026-04-15', presupuesto:50000, tareas_count:15, tareas_completadas:8, dias_restantes:12 },
    { id:2, nombre:'Núcleos Secos Industriales', cliente:'Tech Solutions SA', estado:'pendiente', prioridad:'media', fecha_entrega:'2026-05-01', presupuesto:25000, tareas_count:20, tareas_completadas:3, dias_restantes:28 },
  ];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F8FAFC', margin: 0 }}>Rutas de Proyectos KAVE</h2>
        <button style={s.btn()}><Plus size={16} /> Crear Ruta</button>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {proyectos.map(p => (
          <div key={p.id} style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 0.3rem', color: '#F8FAFC' }}>{p.nombre}</h3>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.88rem' }}>{p.cliente}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={s.badge(p.estado === 'en_progreso' ? '#34D399' : '#F59E0B')}>{p.estado === 'en_progreso' ? 'Ejecución' : 'Bodega'}</span>
                <span style={s.badge(p.prioridad === 'alta' ? '#f87171' : '#94A3B8')}>{p.prioridad}</span>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.4rem' }}>
                <span>{p.tareas_completadas}/{p.tareas_count} hitos de bobinado</span>
                <span>{Math.round(p.tareas_completadas/p.tareas_count*100)}%</span>
              </div>
              <div style={{ height: '6px', background: '#334155', borderRadius: '3px' }}><div style={{ height: '100%', width: `${p.tareas_completadas/p.tareas_count*100}%`, background: '#4F46E5', borderRadius: '3px' }} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
              <span>Deadline: {p.fecha_entrega}</span>
              <span>{p.dias_restantes} días</span>
              <span>${p.presupuesto.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────
function KAVE() {
  const navigate = useNavigate();
  const [vista, setVista] = useState('calculador');
  const [refresh, setRefresh] = useState(0);

  const vistas = [
    { id: 'calculador', label: 'Planificador Analítico', icon: <Calculator size={15} /> },
    { id: 'historial',  label: 'Bóveda de Diseños',  icon: <Zap size={15} /> },
    { id: 'proyectos',  label: 'Hoja de Ruta',  icon: <FolderKanban size={15} /> },
  ];

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Módulo KAVE — Simulador Físico</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <nav style={s.nav}>
            {vistas.map(v => (
              <button key={v.id} style={s.navBtn(vista === v.id)} onClick={() => setVista(v.id)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>{v.icon}{v.label}</span>
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => navigate('/')}
            title="Cerrar Módulo"
            style={{
              background: '#ef4444',
              color: '#ffffff',
              border: '1px solid #b91c1c',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              lineHeight: '1',
            }}
          >
            X
          </button>
        </div>
      </div>
      <div style={s.body}>
        {vista === 'calculador' && <VistaCalculador onGuardar={() => setRefresh(r => r+1)} />}
        {vista === 'historial'  && <VistaHistorial refresh={refresh} />}
        {vista === 'proyectos'  && <VistaProyectos />}
      </div>
    </div>
  );
}

export default KAVE;
