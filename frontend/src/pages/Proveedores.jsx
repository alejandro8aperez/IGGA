import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import {
  Users, AlertCircle, Edit3, Trash2, Plus, X, FileText,
  Phone, Mail, Building2, Paperclip, MapPin, CreditCard,
  Shield, Star, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';

const API_URL = API.COMPRAS.PROVEEDORES;

// ── Estilos ──────────────────────────────────────────────────────────────────
const S = {
  page:         { minHeight: '100vh', background: 'linear-gradient(135deg,#f0f4ff 0%,#e8edf5 100%)', padding: '2rem', fontFamily: "'Inter','Segoe UI',sans-serif" },
  card:         { background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 4px 24px rgba(102,126,234,.10)', border: '1px solid #e8ecf4' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  h1:           { fontSize: '2rem', fontWeight: 800, color: '#1a202c', margin: '0 0 .25rem' },
  sub:          { fontSize: '1rem', color: '#718096', margin: 0 },
  backBtn:      { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', padding: '.65rem 1.3rem', borderRadius: '10px', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem' },
  addBtn:       { background: 'linear-gradient(135deg,#48bb78,#38a169)', color: 'white', border: 'none', padding: '.65rem 1.3rem', borderRadius: '10px', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.4rem', boxShadow: '0 4px 14px rgba(72,187,120,.35)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '.85rem 1rem', textAlign: 'left', borderBottom: '2px solid #edf2f7', color: '#4a5568', fontWeight: 700, fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.03em', background: '#f8fafc' },
  td:           { padding: '.9rem 1rem', borderBottom: '1px solid #edf2f7', verticalAlign: 'middle' },
  // Modal
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)' },
  modal:        { background: 'white', borderRadius: '18px', padding: '2rem', width: '95%', maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(0,0,0,.30)' },
  // Section inside modal
  section:      { marginTop: '1.5rem', marginBottom: '.5rem' },
  sectionTitle: { fontSize: '.75rem', fontWeight: 800, color: '#667eea', textTransform: 'uppercase', letterSpacing: '.08em', paddingBottom: '.5rem', borderBottom: '2px solid #e8ecf4', marginBottom: '1rem' },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
  label:        { display: 'block', marginBottom: '.3rem', fontWeight: 600, color: '#4a5568', fontSize: '.82rem' },
  input:        { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '.9rem', transition: 'border-color .2s', outline: 'none', boxSizing: 'border-box' },
  select:       { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '.9rem', background: 'white', boxSizing: 'border-box' },
  textarea:     { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '.9rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  checkRow:     { display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' },
  checkLabel:   { display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.88rem', color: '#4a5568', cursor: 'pointer' },
  toggleBtn:    { background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', padding: '.45rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem', display: 'flex', alignItems: 'center', gap: '.35rem' },
  saveBtn:      { background: 'linear-gradient(135deg,#667eea,#764ba2)', color: 'white', border: 'none', padding: '.7rem 1.5rem', borderRadius: '10px', fontSize: '.95rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(102,126,234,.35)' },
  cancelBtn:    { background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '.7rem 1.5rem', borderRadius: '10px', fontSize: '.95rem', fontWeight: 600, cursor: 'pointer' },
};

const ESTADO_COLOR = { activo: '#48bb78', inactivo: '#a0aec0', bloqueado: '#e53e3e', en_evaluacion: '#ed8936' };

const emptyForm = () => ({
  razon_social: '', nombre_comercial: '', nit: '', tipo_proveedor: 'empresa',
  tipo_documento: 'NIT', digito_verificacion: '', codigo_barras: '',
  responsable_iva: false, gran_contribuyente: false, agente_retenedor: false,
  regimen_tributario: 'comun', numero_resolucion_dian: '', fecha_resolucion_dian: '',
  actividad_economica_ciiu: '', responsabilidades_fiscales: '', matricula_mercantil: '',
  correo_facturacion_electronica: '',
  clasificacion: 'B', sector_industria: '', categoria: 'servicios',
  credito_maximo: 0, dias_credito: 0, descuento_general: 0,
  condicion_pago: 'Contado', lista_precios: '', moneda: 'COP',
  tiempo_entrega_promedio_dias: 7,
  email: '', telefono: '', telefono_alterno: '', fax: '',
  contacto_nombre: '', contacto_email: '', contacto_telefono: '',
  contacto_telefono_alt: '', cargo_contacto: '',
  representante_legal: '', cedula_representante: '',
  direccion: '', ciudad: '', departamento: '', pais: 'Colombia',
  codigo_postal: '', sitio_web: '',
  direccion_entrega: '', ciudad_entrega: '',
  banco_nombre: '', numero_cuenta: '', tipo_cuenta: '', titular_cuenta: '', codigo_bancario: '',
  estado: 'activo', calificacion: '',
  fecha_constitucion: '', fecha_ultimo_contacto: '',
  notas: '', adjunto_archivos: null, logotipo: null,
});

function fieldVal(prov, key, def = '') {
  return prov[key] !== undefined && prov[key] !== null ? prov[key] : def;
}

function FormField({ label, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
    </div>
  );
}

function InputF({ name, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <input
      type={type} name={name} value={value ?? ''} onChange={onChange}
      placeholder={placeholder} required={required} style={S.input}
      onFocus={e => e.target.style.borderColor = '#667eea'}
      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
    />
  );
}

function SelectF({ name, value, onChange, options }) {
  return (
    <select name={name} value={value ?? ''} onChange={onChange} style={S.select}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function Proveedores() {
  const navigate = useNavigate();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProv, setCurrentProv] = useState(null);
  const [formData, setFormData] = useState(emptyForm());
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => { fetchProveedores(); }, []);

  const fetchProveedores = async () => {
    try {
      const r = await axiosInstance.get(API_URL);
      const data = Array.isArray(r.data) ? r.data : (r.data?.results || []);
      setProveedores(data);
    } catch (err) {
      setError(`Error al cargar proveedores: ${err.message || 'Error de conexión'}`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (prov = null) => {
    if (prov) {
      setCurrentProv(prov);
      setFormData({
        razon_social: fieldVal(prov, 'razon_social'),
        nombre_comercial: fieldVal(prov, 'nombre_comercial'),
        nit: fieldVal(prov, 'nit'),
        tipo_proveedor: fieldVal(prov, 'tipo_proveedor', 'empresa'),
        tipo_documento: fieldVal(prov, 'tipo_documento', 'NIT'),
        digito_verificacion: fieldVal(prov, 'digito_verificacion'),
        codigo_barras: fieldVal(prov, 'codigo_barras'),
        responsable_iva: !!prov.responsable_iva,
        gran_contribuyente: !!prov.gran_contribuyente,
        agente_retenedor: !!prov.agente_retenedor,
        regimen_tributario: fieldVal(prov, 'regimen_tributario', 'comun'),
        numero_resolucion_dian: fieldVal(prov, 'numero_resolucion_dian'),
        fecha_resolucion_dian: fieldVal(prov, 'fecha_resolucion_dian'),
        actividad_economica_ciiu: fieldVal(prov, 'actividad_economica_ciiu'),
        responsabilidades_fiscales: fieldVal(prov, 'responsabilidades_fiscales'),
        matricula_mercantil: fieldVal(prov, 'matricula_mercantil'),
        correo_facturacion_electronica: fieldVal(prov, 'correo_facturacion_electronica'),
        clasificacion: fieldVal(prov, 'clasificacion', 'B'),
        sector_industria: fieldVal(prov, 'sector_industria'),
        categoria: fieldVal(prov, 'categoria', 'servicios'),
        credito_maximo: fieldVal(prov, 'credito_maximo', 0),
        dias_credito: fieldVal(prov, 'dias_credito', 0),
        descuento_general: fieldVal(prov, 'descuento_general', 0),
        condicion_pago: fieldVal(prov, 'condicion_pago', 'Contado'),
        lista_precios: fieldVal(prov, 'lista_precios'),
        moneda: fieldVal(prov, 'moneda', 'COP'),
        tiempo_entrega_promedio_dias: fieldVal(prov, 'tiempo_entrega_promedio_dias', 7),
        email: fieldVal(prov, 'email'),
        telefono: fieldVal(prov, 'telefono'),
        telefono_alterno: fieldVal(prov, 'telefono_alterno'),
        fax: fieldVal(prov, 'fax'),
        contacto_nombre: fieldVal(prov, 'contacto_nombre'),
        contacto_email: fieldVal(prov, 'contacto_email'),
        contacto_telefono: fieldVal(prov, 'contacto_telefono'),
        contacto_telefono_alt: fieldVal(prov, 'contacto_telefono_alt'),
        cargo_contacto: fieldVal(prov, 'cargo_contacto'),
        representante_legal: fieldVal(prov, 'representante_legal'),
        cedula_representante: fieldVal(prov, 'cedula_representante'),
        direccion: fieldVal(prov, 'direccion'),
        ciudad: fieldVal(prov, 'ciudad'),
        departamento: fieldVal(prov, 'departamento'),
        pais: fieldVal(prov, 'pais', 'Colombia'),
        codigo_postal: fieldVal(prov, 'codigo_postal'),
        sitio_web: fieldVal(prov, 'sitio_web'),
        direccion_entrega: fieldVal(prov, 'direccion_entrega'),
        ciudad_entrega: fieldVal(prov, 'ciudad_entrega'),
        banco_nombre: fieldVal(prov, 'banco_nombre'),
        numero_cuenta: fieldVal(prov, 'numero_cuenta'),
        tipo_cuenta: fieldVal(prov, 'tipo_cuenta'),
        titular_cuenta: fieldVal(prov, 'titular_cuenta'),
        codigo_bancario: fieldVal(prov, 'codigo_bancario'),
        estado: fieldVal(prov, 'estado', 'activo'),
        calificacion: fieldVal(prov, 'calificacion'),
        fecha_constitucion: fieldVal(prov, 'fecha_constitucion'),
        fecha_ultimo_contacto: fieldVal(prov, 'fecha_ultimo_contacto'),
        notas: fieldVal(prov, 'notas'),
        adjunto_archivos: null,
        logotipo: null,
      });
      setShowExtra(true);
    } else {
      setCurrentProv(null);
      setFormData(emptyForm());
      setShowExtra(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setCurrentProv(null); };

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    const val = type === 'file' ? files[0] : type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') data.append(k, v);
    });
    try {
      if (currentProv) {
        const url = `${API_URL}${currentProv.id}/`;
        await axiosInstance.patch(url, data);
      } else {
        await axiosInstance.post(API_URL, data);
      }
      closeModal();
      fetchProveedores();
    } catch (err) {
      const errMsg = JSON.stringify(err.response?.data || err.message);
      alert(`Error al guardar el proveedor:\n${errMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor definitivamente?')) return;
    try {
      await axiosInstance.delete(`${API_URL}${id}/`);
      fetchProveedores();
    } catch { alert('Error al eliminar.'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ width: 56, height: 56, border: '4px solid rgba(255,255,255,.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>Cargando Proveedores...</div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={S.page}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} input:focus,select:focus,textarea:focus{border-color:#667eea!important;box-shadow:0 0 0 3px rgba(102,126,234,.15)}`}</style>

      {/* ── Header ── */}
      <div style={{ ...S.card, ...S.header }}>
        <div>
          <h1 style={S.h1}>🏭 Proveedores</h1>
          <p style={S.sub}>Gestión completa de proveedores y condiciones comerciales</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => openModal()} style={S.addBtn}><Plus size={16} />Nuevo Proveedor</button>
          <button onClick={() => navigate('/')} style={S.backBtn}><ArrowLeft size={16} />Inicio</button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: '#fed7d7', border: '1px solid #feb2b2', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', color: '#c53030', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}><strong>Error:</strong> {error}</div>
          <button onClick={() => setError(null)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '.4rem .9rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: proveedores.length, color: '#667eea' },
          { label: 'Activos', value: proveedores.filter(p => p.estado === 'activo').length, color: '#48bb78' },
          { label: 'Inactivos', value: proveedores.filter(p => p.estado === 'inactivo').length, color: '#a0aec0' },
          { label: 'Bloqueados', value: proveedores.filter(p => p.estado === 'bloqueado').length, color: '#e53e3e' },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'white', borderRadius: '12px', padding: '1.2rem', boxShadow: '0 4px 16px rgba(102,126,234,.1)', display: 'flex', alignItems: 'center', gap: '1rem', border: `2px solid ${stat.color}18` }}>
            <div style={{ background: `${stat.color}18`, borderRadius: '10px', padding: '.6rem .9rem', fontWeight: 800, fontSize: '1.4rem', color: stat.color }}>{stat.value}</div>
            <div style={{ fontWeight: 600, color: '#4a5568', fontSize: '.9rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={S.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Código</th>
                <th style={S.th}>Razón Social / NIT</th>
                <th style={S.th}>Contacto</th>
                <th style={S.th}>Ciudad</th>
                <th style={S.th}>Categoría</th>
                <th style={S.th}>Estado</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((prov, idx) => (
                <tr key={prov.id} style={{ background: idx % 2 === 0 ? 'white' : '#f8fafc' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f0f4ff'}
                  onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#f8fafc'}
                >
                  <td style={S.td}>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, background: '#667eea18', color: '#667eea', borderRadius: 6, padding: '2px 8px' }}>
                      {prov.codigo_proveedor || '—'}
                    </span>
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      <Building2 size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#2d3748' }}>{prov.razon_social}</div>
                        <div style={{ fontSize: '.75rem', color: '#718096' }}>{prov.nit}</div>
                        {prov.nombre_comercial && <div style={{ fontSize: '.72rem', color: '#a0aec0' }}>{prov.nombre_comercial}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>
                    {(prov.email || prov.contacto_email) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.2rem' }}>
                        <Mail size={13} style={{ color: '#718096' }} />
                        <span style={{ fontSize: '.82rem' }}>{prov.email || prov.contacto_email}</span>
                      </div>
                    )}
                    {(prov.telefono || prov.contacto_telefono) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <Phone size={13} style={{ color: '#718096' }} />
                        <span style={{ fontSize: '.82rem' }}>{prov.telefono || prov.contacto_telefono}</span>
                      </div>
                    )}
                  </td>
                  <td style={S.td}>
                    {prov.ciudad && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: '#4a5568' }}>
                        <MapPin size={13} style={{ color: '#718096' }} />
                        {prov.ciudad}{prov.departamento ? `, ${prov.departamento}` : ''}
                      </div>
                    )}
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, background: '#f0f4ff', color: '#667eea', borderRadius: 6, padding: '2px 9px' }}>
                      {prov.categoria_display || prov.categoria || '—'}
                    </span>
                  </td>
                  <td style={S.td}>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, background: `${ESTADO_COLOR[prov.estado] || '#a0aec0'}18`, color: ESTADO_COLOR[prov.estado] || '#a0aec0', borderRadius: 20, padding: '3px 10px' }}>
                      {prov.estado_display || prov.estado}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '.4rem', justifyContent: 'center' }}>
                      <button onClick={() => openModal(prov)} title="Editar"
                        style={{ background: '#667eea', color: 'white', border: 'none', padding: '.4rem .6rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => e.currentTarget.style.background = '#5a67d8'}
                        onMouseOut={e => e.currentTarget.style.background = '#667eea'}
                      ><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(prov.id)} title="Eliminar"
                        style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '.4rem .6rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onMouseOver={e => e.currentTarget.style.background = '#c53030'}
                        onMouseOut={e => e.currentTarget.style.background = '#e53e3e'}
                      ><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {proveedores.length === 0 && !error && (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#718096' }}>
              <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '.5rem' }}>Sin proveedores registrados</div>
              <button onClick={() => openModal()} style={{ ...S.addBtn, margin: '0 auto' }}><Plus size={16} />Crear Primer Proveedor</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div style={S.overlay} onClick={closeModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f1f5f9' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#2d3748' }}>
                  {currentProv ? `✏️ Editar: ${currentProv.razon_social}` : '➕ Nuevo Proveedor'}
                </h2>
                {currentProv?.codigo_proveedor && (
                  <span style={{ fontSize: '.78rem', fontWeight: 700, background: '#667eea18', color: '#667eea', borderRadius: 6, padding: '2px 9px' }}>
                    {currentProv.codigo_proveedor}
                  </span>
                )}
              </div>
              <button onClick={closeModal} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '.45rem .6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* ── CAMPOS PRINCIPALES (siempre visibles) ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormField label="Razón Social">
                  <InputF name="razon_social" value={formData.razon_social} onChange={handleChange} placeholder="Nombre o razón social" />
                </FormField>
                <FormField label="Nombre Comercial">
                  <InputF name="nombre_comercial" value={formData.nombre_comercial} onChange={handleChange} placeholder="Nombre comercial" />
                </FormField>
                <FormField label="NIT / Documento">
                  <InputF name="nit" value={formData.nit} onChange={handleChange} placeholder="900.123.456" />
                </FormField>
                <FormField label="Email Principal">
                  <InputF name="email" value={formData.email} onChange={handleChange} type="email" placeholder="empresa@dominio.com" />
                </FormField>
                <FormField label="Teléfono Principal">
                  <InputF name="telefono" value={formData.telefono} onChange={handleChange} type="tel" placeholder="+57 600 1234567" />
                </FormField>
                <FormField label="Dirección de Facturación">
                  <textarea name="direccion" value={formData.direccion} onChange={handleChange} rows={2} style={S.textarea} placeholder="Calle, carrera, #..." />
                </FormField>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <FormField label="Notas Internas">
                  <textarea name="notas" value={formData.notas} onChange={handleChange} rows={3} style={S.textarea} placeholder="Observaciones, condiciones especiales..." />
                </FormField>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <FormField label="Adjunto (contrato, RUT, etc.)">
                  <input type="file" name="adjunto_archivos" onChange={handleChange} style={{ width: '100%', padding: '.4rem 0' }} />
                </FormField>
              </div>

              {/* ── Toggle datos adicionales ── */}
              <div style={{ marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowExtra(v => !v)} style={S.toggleBtn}>
                  {showExtra ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  {showExtra ? 'Ocultar Datos Adicionales' : 'Mostrar Datos Adicionales'}
                </button>
              </div>

              {showExtra && (<>
                {/* ── INFORMACIÓN BÁSICA EXTENDIDA ── */}
                <div style={S.section}><div style={S.sectionTitle}>🏢 Información Básica</div></div>
                <div style={S.grid3}>
                  <FormField label="Tipo de Proveedor">
                    <SelectF name="tipo_proveedor" value={formData.tipo_proveedor} onChange={handleChange}
                      options={[{ value: 'empresa', label: 'Empresa' }, { value: 'persona_natural', label: 'Persona Natural' }, { value: 'empresa_unipersonal', label: 'Empresa Unipersonal' }, { value: 'cooperativa', label: 'Cooperativa' }]} />
                  </FormField>
                  <FormField label="Tipo de Documento">
                    <SelectF name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}
                      options={[{ value: 'NIT', label: 'NIT' }, { value: 'CC', label: 'Cédula de Ciudadanía' }, { value: 'CE', label: 'Cédula de Extranjería' }, { value: 'PAS', label: 'Pasaporte' }]} />
                  </FormField>
                  <FormField label="Dígito Verificación">
                    <InputF name="digito_verificacion" value={formData.digito_verificacion} onChange={handleChange} placeholder="0" />
                  </FormField>
                  <FormField label="Estado">
                    <SelectF name="estado" value={formData.estado} onChange={handleChange}
                      options={[{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Inactivo' }, { value: 'bloqueado', label: 'Bloqueado' }, { value: 'en_evaluacion', label: 'En Evaluación' }]} />
                  </FormField>
                  <FormField label="Clasificación">
                    <SelectF name="clasificacion" value={formData.clasificacion} onChange={handleChange}
                      options={[{ value: 'A', label: 'A — Premium' }, { value: 'B', label: 'B — Estándar' }, { value: 'C', label: 'C — Básico' }]} />
                  </FormField>
                  <FormField label="Categoría">
                    <SelectF name="categoria" value={formData.categoria} onChange={handleChange}
                      options={[
                        { value: 'materias_primas', label: 'Materias Primas' }, { value: 'insumos', label: 'Insumos/Consumibles' },
                        { value: 'maquinaria', label: 'Maquinaria y Equipos' }, { value: 'servicios', label: 'Servicios' },
                        { value: 'empaques', label: 'Empaques' }, { value: 'transporte', label: 'Transporte/Logística' },
                        { value: 'tecnologia', label: 'Tecnología' }, { value: 'otro', label: 'Otro' },
                      ]} />
                  </FormField>
                </div>

                {/* ── TRIBUTACIÓN DIAN ── */}
                <div style={S.section}><div style={S.sectionTitle}><Shield size={12} style={{ display: 'inline', marginRight: 4 }} />Tributación DIAN</div></div>
                <div style={S.grid3}>
                  <FormField label="Régimen Tributario">
                    <SelectF name="regimen_tributario" value={formData.regimen_tributario} onChange={handleChange}
                      options={[{ value: 'comun', label: 'Régimen Común' }, { value: 'simplificado', label: 'Régimen Simplificado' }, { value: 'especial', label: 'Régimen Especial' }]} />
                  </FormField>
                  <FormField label="Código de Barras">
                    <InputF name="codigo_barras" value={formData.codigo_barras} onChange={handleChange} placeholder="Código de barras" />
                  </FormField>
                  <FormField label="Actividad Económica (CIIU)">
                    <InputF name="actividad_economica_ciiu" value={formData.actividad_economica_ciiu} onChange={handleChange} placeholder="4321" />
                  </FormField>
                  <FormField label="Resolución DIAN">
                    <InputF name="numero_resolucion_dian" value={formData.numero_resolucion_dian} onChange={handleChange} />
                  </FormField>
                  <FormField label="Fecha Resolución DIAN">
                    <InputF name="fecha_resolucion_dian" value={formData.fecha_resolucion_dian} onChange={handleChange} type="date" />
                  </FormField>
                  <FormField label="Responsabilidades Fiscales">
                    <InputF name="responsabilidades_fiscales" value={formData.responsabilidades_fiscales} onChange={handleChange} placeholder="O-13, O-15..." />
                  </FormField>
                  <FormField label="Matrícula Mercantil">
                    <InputF name="matricula_mercantil" value={formData.matricula_mercantil} onChange={handleChange} />
                  </FormField>
                  <FormField label="Correo Facturación Electrónica">
                    <InputF name="correo_facturacion_electronica" value={formData.correo_facturacion_electronica} onChange={handleChange} type="email" />
                  </FormField>
                </div>
                <div style={S.checkRow}>
                  {[['responsable_iva', 'Responsable de IVA'], ['gran_contribuyente', 'Gran Contribuyente'], ['agente_retenedor', 'Agente Retenedor']].map(([f, lbl]) => (
                    <label key={f} style={S.checkLabel}>
                      <input type="checkbox" name={f} checked={!!formData[f]} onChange={handleChange} style={{ width: '1rem', height: '1rem' }} />
                      {lbl}
                    </label>
                  ))}
                </div>

                {/* ── CONTACTO PRINCIPAL ── */}
                <div style={S.section}><div style={S.sectionTitle}><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Contacto Principal</div></div>
                <div style={S.grid3}>
                  <FormField label="Teléfono Alterno">
                    <InputF name="telefono_alterno" value={formData.telefono_alterno} onChange={handleChange} type="tel" />
                  </FormField>
                  <FormField label="Fax">
                    <InputF name="fax" value={formData.fax} onChange={handleChange} type="tel" />
                  </FormField>
                  <FormField label="Nombre del Contacto">
                    <InputF name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} placeholder="Nombre completo" />
                  </FormField>
                  <FormField label="Cargo del Contacto">
                    <InputF name="cargo_contacto" value={formData.cargo_contacto} onChange={handleChange} placeholder="Gerente, Director..." />
                  </FormField>
                  <FormField label="Email del Contacto">
                    <InputF name="contacto_email" value={formData.contacto_email} onChange={handleChange} type="email" />
                  </FormField>
                  <FormField label="Teléfono Contacto">
                    <InputF name="contacto_telefono" value={formData.contacto_telefono} onChange={handleChange} type="tel" />
                  </FormField>
                  <FormField label="Tel. Alternativo Contacto">
                    <InputF name="contacto_telefono_alt" value={formData.contacto_telefono_alt} onChange={handleChange} type="tel" />
                  </FormField>
                  <FormField label="Representante Legal">
                    <InputF name="representante_legal" value={formData.representante_legal} onChange={handleChange} />
                  </FormField>
                  <FormField label="Cédula Representante">
                    <InputF name="cedula_representante" value={formData.cedula_representante} onChange={handleChange} />
                  </FormField>
                </div>

                {/* ── DIRECCIÓN ── */}
                <div style={S.section}><div style={S.sectionTitle}><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Dirección</div></div>
                <div style={{ ...S.grid2, marginBottom: '1rem' }}>
                  <FormField label="Dirección de Entrega">
                    <textarea name="direccion_entrega" value={formData.direccion_entrega} onChange={handleChange} rows={2} style={S.textarea} placeholder="Si difiere de facturación..." />
                  </FormField>
                </div>
                <div style={S.grid3}>
                  <FormField label="Ciudad">
                    <InputF name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Bogotá, Medellín..." />
                  </FormField>
                  <FormField label="Departamento">
                    <InputF name="departamento" value={formData.departamento} onChange={handleChange} />
                  </FormField>
                  <FormField label="País">
                    <InputF name="pais" value={formData.pais} onChange={handleChange} />
                  </FormField>
                  <FormField label="Código Postal">
                    <InputF name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} />
                  </FormField>
                  <FormField label="Ciudad de Entrega">
                    <InputF name="ciudad_entrega" value={formData.ciudad_entrega} onChange={handleChange} />
                  </FormField>
                  <FormField label="Sitio Web">
                    <InputF name="sitio_web" value={formData.sitio_web} onChange={handleChange} placeholder="https://www.empresa.com" />
                  </FormField>
                </div>

                {/* ── CONDICIONES COMERCIALES ── */}
                <div style={S.section}><div style={S.sectionTitle}><Star size={12} style={{ display: 'inline', marginRight: 4 }} />Condiciones Comerciales</div></div>
                <div style={S.grid3}>
                  <FormField label="Condición de Pago">
                    <InputF name="condicion_pago" value={formData.condicion_pago} onChange={handleChange} placeholder="Contado, 30 días..." />
                  </FormField>
                  <FormField label="Crédito Máximo (COP)">
                    <InputF name="credito_maximo" value={formData.credito_maximo} onChange={handleChange} type="number" />
                  </FormField>
                  <FormField label="Días de Crédito">
                    <InputF name="dias_credito" value={formData.dias_credito} onChange={handleChange} type="number" />
                  </FormField>
                  <FormField label="Descuento General (%)">
                    <InputF name="descuento_general" value={formData.descuento_general} onChange={handleChange} type="number" />
                  </FormField>
                  <FormField label="Lista de Precios">
                    <InputF name="lista_precios" value={formData.lista_precios} onChange={handleChange} placeholder="Lista A, Lista B..." />
                  </FormField>
                  <FormField label="Moneda">
                    <SelectF name="moneda" value={formData.moneda} onChange={handleChange}
                      options={[{ value: 'COP', label: 'COP — Peso Colombiano' }, { value: 'USD', label: 'USD — Dólar' }, { value: 'EUR', label: 'EUR — Euro' }]} />
                  </FormField>
                  <FormField label="Tiempo Entrega Prom. (días)">
                    <InputF name="tiempo_entrega_promedio_dias" value={formData.tiempo_entrega_promedio_dias} onChange={handleChange} type="number" />
                  </FormField>
                  <FormField label="Sector / Industria">
                    <InputF name="sector_industria" value={formData.sector_industria} onChange={handleChange} placeholder="Construcción, Eléctrico..." />
                  </FormField>
                  <FormField label="Calificación (1–5)">
                    <InputF name="calificacion" value={formData.calificacion} onChange={handleChange} type="number" placeholder="4.5" />
                  </FormField>
                </div>

                {/* ── INFORMACIÓN BANCARIA ── */}
                <div style={S.section}><div style={S.sectionTitle}><CreditCard size={12} style={{ display: 'inline', marginRight: 4 }} />Información Bancaria</div></div>
                <div style={S.grid3}>
                  <FormField label="Banco">
                    <InputF name="banco_nombre" value={formData.banco_nombre} onChange={handleChange} placeholder="Bancolombia, Davivienda..." />
                  </FormField>
                  <FormField label="Número de Cuenta">
                    <InputF name="numero_cuenta" value={formData.numero_cuenta} onChange={handleChange} />
                  </FormField>
                  <FormField label="Tipo de Cuenta">
                    <SelectF name="tipo_cuenta" value={formData.tipo_cuenta} onChange={handleChange}
                      options={[{ value: '', label: '— Seleccionar —' }, { value: 'corriente', label: 'Cuenta Corriente' }, { value: 'ahorros', label: 'Cuenta de Ahorros' }, { value: 'nomina', label: 'Cuenta Nómina' }]} />
                  </FormField>
                  <FormField label="Titular de la Cuenta">
                    <InputF name="titular_cuenta" value={formData.titular_cuenta} onChange={handleChange} />
                  </FormField>
                  <FormField label="Código Bancario">
                    <InputF name="codigo_bancario" value={formData.codigo_bancario} onChange={handleChange} />
                  </FormField>
                </div>

                {/* ── ADICIONAL ── */}
                <div style={S.section}><div style={S.sectionTitle}><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Información Adicional</div></div>
                <div style={S.grid2}>
                  <FormField label="Fecha de Constitución">
                    <InputF name="fecha_constitucion" value={formData.fecha_constitucion} onChange={handleChange} type="date" />
                  </FormField>
                  <FormField label="Fecha Último Contacto">
                    <InputF name="fecha_ultimo_contacto" value={formData.fecha_ultimo_contacto} onChange={handleChange} type="date" />
                  </FormField>
                </div>
                <div style={{ ...S.grid2, marginTop: '1rem' }}>
                  <FormField label="Logotipo">
                    <input type="file" name="logotipo" accept="image/*" onChange={handleChange} style={{ width: '100%', padding: '.4rem 0' }} />
                  </FormField>
                </div>
              </>)}

              {/* ── Footer ── */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '2rem', paddingTop: '1.25rem', borderTop: '2px solid #f1f5f9' }}>
                <button type="button" onClick={closeModal} style={S.cancelBtn}>Cancelar</button>
                <button type="submit" style={S.saveBtn}>
                  {currentProv ? '💾 Actualizar Proveedor' : '✅ Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Proveedores;
