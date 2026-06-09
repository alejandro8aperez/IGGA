import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { 
  FileText, ShieldCheck, Download, Upload, Plus, Edit, Trash2, 
  Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, 
  FolderOpen, Users, Settings, BarChart3, Eye, Archive, Save,
  ShoppingCart, TrendingUp, Briefcase, UserCheck, Truck, Megaphone,
  Building2, PackageOpen, DollarSign, LayoutDashboard, Factory,
  X
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/calidad/formatos-iso9001/';

const s = {
  page: { background: '#0F172A', minHeight: '100vh', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' },
  header: { background: '#1E293B', borderBottom: '1px solid #334155', padding: '1rem 2rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' },
  nav: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  navBtn: (active) => ({ 
    background: active ? '#4F46E5' : 'transparent', 
    color: active ? '#fff' : '#94A3B8', 
    border: '1px solid ' + (active ? '#4F46E5' : '#334155'), 
    padding: '0.5rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
    display: 'flex', alignItems: 'center', gap: '8px',
    transition: 'all 0.2s'
  }),
  body: { padding: '2rem', maxWidth: '1400px', margin: '0 auto' },
  card: { background: '#1E293B', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  h2: { margin: 0, fontSize: '1.1rem', color: '#F8FAFC' },
  h3: { margin: '0 0 0.5rem', color: '#F8FAFC', fontSize: '1rem' },
  btn: (color='#4F46E5') => ({ background: color, color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }),
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', color: '#94A3B8', fontSize: '0.78rem', textTransform: 'uppercase', borderBottom: '1px solid #334155' },
  td: { padding: '0.75rem 1rem', borderBottom: '1px solid #1E293B', color: '#F8FAFC', fontSize: '0.9rem' },
  badge: (c, bg) => ({ background: bg, color: c, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }),
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  stat: (color) => ({ background: color + '15', border: '1px solid ' + color + '40', borderRadius: '10px', padding: '1.2rem' }),
  statVal: { fontSize: '1.5rem', fontWeight: 700, color: '#F8FAFC', margin: '0.5rem 0' },
  statLbl: { fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1E293B', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto', position: 'relative' },
  modalClose: { position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#94A3B8', transition: 'all 0.2s' },
  input: { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', width: '100%', fontSize: '0.9rem' },
  select: { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', width: '100%', fontSize: '0.9rem' },
  textarea: { background: '#0F172A', border: '1px solid #334155', color: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', width: '100%', fontSize: '0.9rem', minHeight: '100px', resize: 'vertical' },
  formGroup: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem', fontWeight: 500 }
};

// Módulos ERP disponibles
const MODULOS_ERP = [
  { id: 'calidad', nombre: 'Calidad', icono: ShieldCheck, color: '#10B981' },
  { id: 'produccion', nombre: 'Producción', icono: Factory, color: '#F59E0B' },
  { id: 'compras', nombre: 'Compras', icono: ShoppingCart, color: '#3B82F6' },
  { id: 'ventas', nombre: 'Ventas', icono: TrendingUp, color: '#8B5CF6' },
  { id: 'mrp', nombre: 'MRP/SAP', icono: PackageOpen, color: '#EF4444' },
  { id: 'kave', nombre: 'KAVE', icono: FileText, color: '#06B6D4' },
  { id: 'inventarios', nombre: 'Inventarios', icono: Archive, color: '#84CC16' },
  { id: 'mantenimiento', nombre: 'Mantenimiento', icono: Settings, color: '#F97316' },
  { id: 'rrhh', nombre: 'Recursos Humanos', icono: Users, color: '#EC4899' },
  { id: 'finanzas', nombre: 'Finanzas', icono: BarChart3, color: '#14B8A6' },
  { id: 'contabilidad', nombre: 'Contabilidad', icono: FileText, color: '#6366F1' },
  { id: 'multi_empresa', nombre: 'Multi-Empresa', icono: Building2, color: '#8B5CF6' },
];

// Estados y tipos de formatos
const ESTADOS_FORMATO = [
  { value: 'borrador', label: 'Borrador', color: '#6B7280' },
  { value: 'revision', label: 'En Revisión', color: '#F59E0B' },
  { value: 'aprobacion', label: 'En Aprobación', color: '#3B82F6' },
  { value: 'vigente', label: 'Vigente', color: '#10B981' },
  { value: 'obsoleto', label: 'Obsoleto', color: '#EF4444' },
];

const TIPOS_FORMATO = [
  { value: 'manual_calidad', label: 'Manual de Calidad' },
  { value: 'procedimiento', label: 'Procedimiento Operativo' },
  { value: 'instructivo', label: 'Instructivo de Trabajo' },
  { value: 'formato_registro', label: 'Formato/Registro' },
  { value: 'checklist', label: 'Checklist de Verificación' },
  { value: 'informe_auditoria', label: 'Informe de Auditoría' },
  { value: 'accion_correctiva', label: 'Acción Correctiva' },
  { value: 'evaluacion_proveedor', label: 'Evaluación Proveedor' },
  { value: 'control_proceso', label: 'Control de Proceso' },
  { value: 'especificacion_tecnica', label: 'Especificación Técnica' },
];

function DashboardISO() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_BASE}dashboard/`);
      setStats(response.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ position: 'relative', color: '#94A3B8', textAlign: 'center', padding: '2rem' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
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
                </button>Cargando dashboard ISO 9001...</div>;
  if (!stats) return <div style={{ position: 'relative', color: '#EF4444', textAlign: 'center', padding: '2rem' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
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
                </button>Error cargando dashboard</div>;

  return (
    <div>
      <div style={s.cardHeader}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>📊 Dashboard ISO 9001</h2>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', margin: '5px 0 0' }}>Estado general del Sistema de Gestión de Calidad</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div style={s.grid4}>
        <div style={s.stat('#10B981')}>
          <div style={s.statLbl}>
            <CheckCircle size={16} style={{ marginRight: '5px' }} />
            Formatos Vigentes
          </div>
          <div style={s.statVal}>{stats.estadisticas.vigentes}</div>
        </div>
        <div style={s.stat('#F59E0B')}>
          <div style={s.statLbl}>
            <Clock size={16} style={{ marginRight: '5px' }} />
            Requieren Actualización
          </div>
          <div style={s.statVal}>{stats.estadisticas.requieren_actualizacion}</div>
        </div>
        <div style={s.stat('#EF4444')}>
          <div style={s.statLbl}>
            <AlertTriangle size={16} style={{ marginRight: '5px' }} />
            En Borrador
          </div>
          <div style={s.statVal}>{stats.estadisticas.borradores}</div>
        </div>
        <div style={s.stat('#3B82F6')}>
          <div style={s.statLbl}>
            <FileText size={16} style={{ marginRight: '5px' }} />
            Total Formatos
          </div>
          <div style={s.statVal}>{stats.estadisticas.total_formatos}</div>
        </div>
      </div>

      {/* Formatos por módulo */}
      <div style={{ ...s.card, marginTop: '2rem' }}>
        <h3 style={s.h3}>📁 Formatos por Módulo ERP</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {stats.estadisticas.por_modulo.map(modulo => {
            const moduloCatalogo = MODULOS_ERP.find(m => m.id === modulo.modulo_relacionado);
            const IconModulo = moduloCatalogo?.icono;
            return (
            <div key={modulo.modulo_relacionado} style={{ 
              background: '#0F172A', 
              border: '1px solid #334155', 
              borderRadius: '8px', 
              padding: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {IconModulo && (
                  <IconModulo
                    size={16}
                    color={moduloCatalogo?.color}
                    style={{ marginRight: '5px' }}
                  />
                )}
                <span style={{ color: '#F8FAFC', fontWeight: 600 }}>
                  {moduloCatalogo?.nombre || modulo.modulo_relacionado}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4F46E5' }}>{modulo.count}</div>
            </div>
          )})}
        </div>
      </div>

      {/* Formatos recientes */}
      <div style={{ ...s.card, marginTop: '2rem' }}>
        <h3 style={s.h3}>📝 Formatos Recientes</h3>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Código</th>
              <th style={s.th}>Título</th>
              <th style={s.th}>Módulo</th>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Versión</th>
              <th style={s.th}>Creación</th>
            </tr>
          </thead>
          <tbody>
            {stats.formatos_recientes.map(formato => (
              <tr key={formato.id}>
                <td style={{ ...s.td, fontWeight: 600, color: '#4F46E5' }}>{formato.codigo}</td>
                <td style={s.td}>{formato.titulo}</td>
                <td style={s.td}>{formato.modulo_display}</td>
                <td style={s.td}>
                  <span style={s.badge(
                    ESTADOS_FORMATO.find(e => e.value === formato.estado)?.color || '#6B7280',
                    'rgba(255,255,255,0.1)'
                  )}>
                    {ESTADOS_FORMATO.find(e => e.value === formato.estado)?.label || formato.estado}
                  </span>
                </td>
                <td style={s.td}>v{formato.version}</td>
                <td style={{ ...s.td, color: '#94A3B8', fontSize: '0.8rem' }}>
                  {new Date(formato.fecha_creacion).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ListaFormatos() {
  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroModulo, setFiltroModulo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formatoSeleccionado, setFormatoSeleccionado] = useState(null);

  useEffect(() => {
    cargarFormatos();
  }, [filtroModulo, filtroEstado]);

  const cargarFormatos = async () => {
    try {
      setLoading(true);
      let url = API_BASE;
      const params = new URLSearchParams();
      
      if (filtroModulo !== 'todos') params.append('modulo', filtroModulo);
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      
      if (params.toString()) url += '?' + params.toString();
      
      const response = await axiosInstance.get(url);
      setFormatos(response.data);
    } catch (error) {
      console.error('Error cargando formatos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatosFiltrados = formatos.filter(formato => 
    formato.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
    formato.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    formato.proceso_afectado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado) => {
    const estadoInfo = ESTADOS_FORMATO.find(e => e.value === estado);
    return estadoInfo || { value: estado, label: estado, color: '#6B7280' };
  };

  if (loading) return <div style={{ position: 'relative', color: '#94A3B8', textAlign: 'center', padding: '2rem' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
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
                </button>Cargando formatos ISO 9001...</div>;

  return (
    <div>
      {/* Filtros y búsqueda */}
      <div style={{ ...s.card, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: '#6B7280' }} />
            <input
              type="text"
              placeholder="Buscar formatos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ ...s.input, paddingLeft: '2.5rem' }}
            />
          </div>
          
          <select value={filtroModulo} onChange={(e) => setFiltroModulo(e.target.value)} style={s.select}>
            <option value="todos">Todos los módulos</option>
            {MODULOS_ERP.map(modulo => (
              <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>
            ))}
          </select>
          
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={s.select}>
            <option value="todos">Todos los estados</option>
            {ESTADOS_FORMATO.map(estado => (
              <option key={estado.value} value={estado.value}>{estado.label}</option>
            ))}
          </select>
          
          <button onClick={() => setMostrarModal(true)} style={s.btn('#10B981')}>
            <Plus size={16} /> Nuevo Formato
          </button>
        </div>
      </div>

      {/* Lista de formatos */}
      <div style={{ background: '#1E293B', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Código</th>
              <th style={s.th}>Título</th>
              <th style={s.th}>Tipo</th>
              <th style={s.th}>Módulo</th>
              <th style={s.th}>Estado</th>
              <th style={s.th}>Versión</th>
              <th style={s.th}>Próxima Revisión</th>
              <th style={s.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formatosFiltrados.map(formato => {
              const estadoInfo = getEstadoBadge(formato.estado);
              const moduloInfo = MODULOS_ERP.find(m => m.id === formato.modulo_relacionado);
              const IconModulo = moduloInfo?.icono;
              
              return (
                <tr key={formato.id} style={{ 
                  backgroundColor: formato.requiere_actualizacion ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
                }}>
                  <td style={{ ...s.td, fontWeight: 600, color: '#4F46E5' }}>{formato.codigo}</td>
                  <td style={s.td}>{formato.titulo}</td>
                  <td style={s.td}>{formato.tipo_display}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {IconModulo && (
                        <IconModulo
                          size={16}
                          color={moduloInfo.color}
                          style={{ marginRight: '5px' }}
                        />
                      )}
                      <span>{formato.modulo_display}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <span style={s.badge(estadoInfo.color, 'rgba(255,255,255,0.1)')}>
                      {estadoInfo.label}
                    </span>
                  </td>
                  <td style={s.td}>v{formato.version}</td>
                  <td style={{ ...s.td, color: formato.requiere_actualizacion ? '#F59E0B' : '#94A3B8' }}>
                    {formato.fecha_revision ? new Date(formato.fecha_revision).toLocaleDateString() : 'No definida'}
                    {formato.requiere_actualizacion && ' ⚠️'}
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3B82F6' }}>
                        <Eye size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981' }}>
                        <Download size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B' }}>
                        <Edit size={16} />
                      </button>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {formatosFiltrados.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
            No se encontraron formatos con los filtros seleccionados
          </div>
        )}
      </div>

      {/* Modal para crear/editar formato */}
      {mostrarModal && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            {/* Botón de cierre en esquina superior derecha */}
            <button 
                onClick={() => window.location.href = '/'} 
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
            
            <h2 style={{ color: '#fff', marginBottom: '1.5rem', paddingRight: '2rem' }}>
              {formatoSeleccionado ? 'Editar Formato' : 'Nuevo Formato ISO 9001'}
            </h2>
            
            <div style={s.formGroup}>
              <label style={s.label}>Código del Formato *</label>
              <input type="text" style={s.input} placeholder="Ej: F-CAL-001" />
            </div>
            
            <div style={s.formGroup}>
              <label style={s.label}>Título del Formato *</label>
              <input type="text" style={s.input} placeholder="Título descriptivo" />
            </div>
            
            <div style={{ ...s.formGroup, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={s.label}>Tipo de Formato *</label>
                <select style={s.select}>
                  <option value="">Seleccionar tipo...</option>
                  {TIPOS_FORMATO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={s.label}>Módulo ERP *</label>
                <select style={s.select}>
                  <option value="">Seleccionar módulo...</option>
                  {MODULOS_ERP.map(modulo => (
                    <option key={modulo.id} value={modulo.id}>{modulo.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div style={s.formGroup}>
              <label style={s.label}>Proceso Afectado *</label>
              <input type="text" style={s.input} placeholder="Proceso donde se aplica el formato" />
            </div>
            
            <div style={s.formGroup}>
              <label style={s.label}>Descripción del Formato *</label>
              <textarea style={s.textarea} placeholder="Descripción detallada del formato y su uso"></textarea>
            </div>
            
            <div style={{ ...s.formGroup, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={s.label}>Frecuencia de Actualización (meses)</label>
                <input type="number" style={s.input} defaultValue="12" min="1" max="60" />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Formato Obligatorio</span>
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Requiere Aprobación</span>
                </label>
              </div>
            </div>
            
            <div style={{ ...s.formGroup, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={s.label}>Archivo PDF</label>
                <input type="file" accept=".pdf" style={{ ...s.input, padding: '0.5rem' }} />
              </div>
              
              <div>
                <label style={s.label}>Archivo Editable</label>
                <input type="file" accept=".doc,.docx" style={{ ...s.input, padding: '0.5rem' }} />
              </div>
              
              <div>
                <label style={s.label}>Plantilla</label>
                <input type="file" accept=".doc,.docx,.pdf" style={{ ...s.input, padding: '0.5rem' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button onClick={() => setMostrarModal(false)} style={{ ...s.btn('#6B7280'), background: 'transparent', border: '1px solid #6B7280' }}>
                Cancelar
              </button>
              <button onClick={() => setMostrarModal(false)} style={s.btn('#10B981')}>
                <Save size={16} /> Guardar Formato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormatosISO9001() {
  const [tabActiva, setTabActiva] = useState('dashboard');

  return (
    <div style={{ ...s.page, position: 'relative' }}>
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
          Formatos ISO 9001 - ERP 8AMPERIOS
        </h1>
        
        <nav style={s.nav}>
          <button 
            style={s.navBtn(tabActiva === 'dashboard')} 
            onClick={() => setTabActiva('dashboard')}
          >
            <BarChart3 size={16} /> Dashboard
          </button>
          <button 
            style={s.navBtn(tabActiva === 'formatos')} 
            onClick={() => setTabActiva('formatos')}
          >
            <FileText size={16} /> Formatos
          </button>
          <button 
            style={s.navBtn(tabActiva === 'procesos')} 
            onClick={() => setTabActiva('procesos')}
          >
            <Settings size={16} /> Procesos
          </button>
          <button 
            style={s.navBtn(tabActiva === 'trazabilidad')} 
            onClick={() => setTabActiva('trazabilidad')}
          >
            <Eye size={16} /> Trazabilidad
          </button>
        </nav>
      </div>
      
      <div style={s.body}>
        {tabActiva === 'dashboard' && <DashboardISO />}
        {tabActiva === 'formatos' && <ListaFormatos />}
        {tabActiva === 'procesos' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            <Settings size={48} style={{ margin: '0 auto 1rem' }} />
            <h3>Procesos ISO 9001</h3>
            <p>Gestión de procesos certificados - Próximamente</p>
          </div>
        )}
        {tabActiva === 'trazabilidad' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
            <Eye size={48} style={{ margin: '0 auto 1rem' }} />
            <h3>Trazabilidad ISO 9001</h3>
            <p>Registro completo de uso de documentos - Próximamente</p>
          </div>
        )}
      </div>
    </div>
  );
}
