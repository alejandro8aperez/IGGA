import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle, Edit3, Trash2, Plus, X, ChevronLeft, Search, FileText, Award, Briefcase, Heart, Shield, Stethoscope, TrendingUp, Package, Palette, LayoutDashboard, ChevronRight, DollarSign, Calendar, Building2 } from 'lucide-react';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/rrhh';

// ── Estilos CRM-style ─────────────────────────────────
const styles = {
    container: { 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
    },
    header: {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        margin: '0 0 0.5rem 0'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#718096',
        margin: 0
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    btnSuccess: {
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
        transition: 'all 0.2s'
    },
    statsGrid: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap'
    },
    statCard: (color) => ({
        background: color,
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        minWidth: '160px',
        flex: '1'
    }),
    searchFilter: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    searchInput: {
        flex: 1,
        minWidth: '300px',
        padding: '0.75rem 1rem 0.75rem 2.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        background: 'white'
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    tableContainer: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '0.9rem',
        color: '#334155'
    },
    btnIcon: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '6px',
        color: '#64748b',
        transition: 'all 0.2s'
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
    },
    modal: {
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
    },
    modalHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        color: 'white',
        borderRadius: '16px 16px 0 0'
    }
};

const EMPTY_FORM = {
    // Identificación
    tipo_documento: 'CC', numero_documento: '', fecha_expedicion_doc: '', lugar_expedicion_doc: '',
    // Personal
    primer_nombre: '', segundo_nombre: '', primer_apellido: '', segundo_apellido: '',
    fecha_nacimiento: '', lugar_nacimiento: '', genero: 'M', estado_civil: '',
    nacionalidad: 'Colombiana', grupo_sanguineo: '', estrato: '', tipo_vivienda: '',
    // Licencia
    tiene_licencia: false, categoria_licencia: '', vencimiento_licencia: '',
    // Tallas
    talla_camisa: '', talla_pantalon: '', talla_zapatos: '', talla_casco: '',
    // Contacto
    correo_personal: '', correo_corporativo: '', telefono_trabajo: '',
    telefono_personal: '', telefono_movil: '',
    // Dirección
    direccion: '', barrio: '', ciudad: '', departamento_residencia: '', codigo_postal: '', pais: 'Colombia',
    // Laboral
    cargo: '', departamento: '', sede: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    fecha_fin_periodo_prueba: '', fecha_retiro: '', motivo_retiro: '',
    tipo_contrato: 'IND', fecha_vencimiento_contrato: '',
    tipo_salario: 'FIJ', salario_basico: '', auxilio_transporte: true,
    periodicidad_pago: 'MEN', horas_extras_autorizadas: false,
    estado: 'ACT', notas: '',
    // Seguridad social
    eps: '', afp: '', arl: '', nivel_riesgo_arl: '', caja_compensacion: '', fondo_cesantias: '',
    // Bancario
    banco: '', tipo_cuenta: '', numero_cuenta: '',
};

// ── Estilos base ──────────────────────────────────────

const S = {
    input: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '8px', padding: '8px 12px',
        color: 'var(--text)', fontSize: '0.9rem',
        outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    label: {
        fontSize: '0.75rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '4px', display: 'block',
    },
    section: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem',
    },
    sectionTitle: {
        fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: '#ec4899', marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: '6px',
    },
};

// ── Componentes atómicos ──────────────────────────────

function FInput({ label, name, type = 'text', value, onChange, required, span, ...p }) {
    return (
        <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
            <label style={S.label}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
            <input type={type} name={name} value={value ?? ''} onChange={onChange} required={required} style={S.input} {...p} />
        </div>
    );
}

function FSelect({ label, name, value, onChange, options, required, span }) {
    return (
        <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
            <label style={S.label}>{label}{required && <span style={{ color: '#ef4444' }}> *</span>}</label>
            <select name={name} value={value ?? ''} onChange={onChange} required={required}
                style={{ ...S.input, background: 'var(--surface)' }}>
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
        </div>
    );
}

function FCheck({ label, name, checked, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
            <input type="checkbox" id={name} name={name} checked={!!checked} onChange={onChange} />
            <label htmlFor={name} style={{ fontSize: '0.9rem', cursor: 'pointer' }}>{label}</label>
        </div>
    );
}

function Grid({ cols = 2, children }) {
    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.9rem' }}>{children}</div>;
}

function SectionTitle({ icon: Icon, children }) {
    return <div style={S.sectionTitle}>{Icon && <Icon size={14} />}{children}</div>;
}

function getStatusBadge(estado) {
    const map = {
        ACT: ['Activo', '#22c55e'], INA: ['Inactivo', '#ef4444'],
        VAC: ['Vacaciones', '#3b82f6'], INC: ['Incapacitado', '#f59e0b'],
        LIC: ['Licencia', '#8b5cf6'], RET: ['Retirado', '#6b7280'],
    };
    const [label, color] = map[estado] || [estado, '#6b7280'];
    return (
        <span style={{
            background: color + '22', color, padding: '2px 10px', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${color}44`,
        }}>{label}</span>
    );
}

// ── Vista detalle de empleado ─────────────────────────

function EmpleadoDetalle({ empleado, onBack, onEdit }) {
    const tabs = [
        { id: 'info', label: 'Info General', icon: Users },
        { id: 'laboral', label: 'Laboral', icon: Briefcase },
        { id: 'familia', label: 'Familia', icon: Heart },
        { id: 'academia', label: 'Formación', icon: Award },
        { id: 'experiencia', label: 'Experiencia', icon: TrendingUp },
        { id: 'salud', label: 'Salud', icon: Stethoscope },
        { id: 'dotacion', label: 'Dotación / EPP', icon: Package },
        { id: 'docs', label: 'Documentos', icon: FileText },
        { id: 'disciplina', label: 'Disciplinario', icon: Shield },
    ];
    const [tab, setTab] = useState('info');

    const Row = ({ label, value }) => value ? (
        <div style={{ display: 'flex', gap: '1rem', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ minWidth: '180px', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: '0.9rem' }}>{value}</span>
        </div>
    ) : null;

    return (
        <div>
            {/* Header empleado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn btn-ghost" onClick={onBack} style={{ padding: '6px 10px' }}>
                    <ChevronLeft size={18} /> Volver
                </button>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
                        {empleado.primer_nombre} {empleado.segundo_nombre} {empleado.primer_apellido} {empleado.segundo_apellido}
                    </h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {empleado.tipo_documento}: {empleado.numero_documento} · {empleado.cargo} · {empleado.departamento}
                    </div>
                </div>
                {getStatusBadge(empleado.estado)}
                <button className="btn btn-primary" onClick={onEdit} style={{ padding: '6px 14px' }}>
                    <Edit3 size={14} /> Editar
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                {tabs.map(t => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                            padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px',
                            color: tab === t.id ? '#ec4899' : 'var(--text-muted)',
                            borderBottom: tab === t.id ? '2px solid #ec4899' : '2px solid transparent',
                            marginBottom: '-1px',
                        }}>
                        <t.icon size={13} />{t.label}
                    </button>
                ))}
            </div>

            {tab === 'info' && (
                <Grid cols={2}>
                    <div style={S.section}>
                        <SectionTitle icon={Users}>Datos personales</SectionTitle>
                        <Row label="Nombre completo" value={`${empleado.primer_nombre} ${empleado.segundo_nombre || ''} ${empleado.primer_apellido} ${empleado.segundo_apellido || ''}`.trim()} />
                        <Row label="Fecha nacimiento" value={empleado.fecha_nacimiento} />
                        <Row label="Lugar nacimiento" value={empleado.lugar_nacimiento} />
                        <Row label="Género" value={empleado.genero} />
                        <Row label="Estado civil" value={empleado.estado_civil} />
                        <Row label="Grupo sanguíneo" value={empleado.grupo_sanguineo} />
                        <Row label="Nacionalidad" value={empleado.nacionalidad} />
                        <Row label="Estrato" value={empleado.estrato} />
                        <Row label="Tipo vivienda" value={empleado.tipo_vivienda} />
                    </div>
                    <div style={S.section}>
                        <SectionTitle>Contacto y dirección</SectionTitle>
                        <Row label="Correo corporativo" value={empleado.correo_corporativo} />
                        <Row label="Correo personal" value={empleado.correo_personal} />
                        <Row label="Móvil" value={empleado.telefono_movil} />
                        <Row label="Teléfono trabajo" value={empleado.telefono_trabajo} />
                        <Row label="Dirección" value={empleado.direccion} />
                        <Row label="Barrio" value={empleado.barrio} />
                        <Row label="Ciudad" value={empleado.ciudad} />
                        <Row label="Depto. residencia" value={empleado.departamento_residencia} />
                    </div>
                    <div style={S.section}>
                        <SectionTitle icon={Shield}>Seguridad social</SectionTitle>
                        <Row label="EPS" value={empleado.eps} />
                        <Row label="AFP / Pensión" value={empleado.afp} />
                        <Row label="ARL" value={empleado.arl} />
                        <Row label="Nivel riesgo ARL" value={empleado.nivel_riesgo_arl} />
                        <Row label="Caja compensación" value={empleado.caja_compensacion} />
                        <Row label="Fondo cesantías" value={empleado.fondo_cesantias} />
                    </div>
                    <div style={S.section}>
                        <SectionTitle>Datos bancarios</SectionTitle>
                        <Row label="Banco" value={empleado.banco} />
                        <Row label="Tipo cuenta" value={empleado.tipo_cuenta} />
                        <Row label="Número cuenta" value={empleado.numero_cuenta} />
                    </div>
                </Grid>
            )}

            {tab === 'laboral' && (
                <div style={S.section}>
                    <SectionTitle icon={Briefcase}>Información laboral</SectionTitle>
                    <Grid cols={2}>
                        <Row label="Cargo" value={empleado.cargo} />
                        <Row label="Departamento" value={empleado.departamento} />
                        <Row label="Sede" value={empleado.sede} />
                        <Row label="Fecha ingreso" value={empleado.fecha_ingreso} />
                        <Row label="Tipo contrato" value={empleado.tipo_contrato} />
                        <Row label="Venc. contrato" value={empleado.fecha_vencimiento_contrato} />
                        <Row label="Tipo salario" value={empleado.tipo_salario} />
                        <Row label="Salario básico" value={empleado.salario_basico ? `$${parseFloat(empleado.salario_basico).toLocaleString('es-CO')}` : ''} />
                        <Row label="Auxilio transporte" value={empleado.auxilio_transporte ? 'Sí' : 'No'} />
                        <Row label="Periodicidad pago" value={empleado.periodicidad_pago} />
                        <Row label="Horas extra auth." value={empleado.horas_extras_autorizadas ? 'Sí' : 'No'} />
                        <Row label="Fin período prueba" value={empleado.fecha_fin_periodo_prueba} />
                    </Grid>
                    {empleado.notas && <div style={{ marginTop: '1rem', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.9rem' }}>{empleado.notas}</div>}
                </div>
            )}

            {['familia', 'academia', 'experiencia', 'salud', 'dotacion', 'docs', 'disciplina'].includes(tab) && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚧</div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Próximamente</div>
                    <div style={{ fontSize: '0.85rem' }}>Esta sección se habilitará en la siguiente versión del módulo RRHH.</div>
                </div>
            )}
        </div>
    );
}

// ── Modal formulario empleado ─────────────────────────

function EmpleadoModal({ empleado, onClose, onSaved }) {
    const [formData, setFormData] = useState(empleado ? { ...EMPTY_FORM, ...empleado } : { ...EMPTY_FORM });
    const [tab, setTab] = useState('personal');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const f = (name) => ({ name, value: formData[name], onChange: handleChange });
    const fc = (name) => ({ name, checked: formData[name], onChange: handleChange });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones manuales por si los campos requeridos están ocultos en otras pestañas
        if (!formData.numero_documento) return alert("Error: El número de documento es obligatorio (Pestaña Personal).");
        if (!formData.primer_nombre) return alert("Error: El primer nombre es obligatorio (Pestaña Personal).");
        if (!formData.primer_apellido) return alert("Error: El primer apellido es obligatorio (Pestaña Personal).");
        if (!formData.fecha_nacimiento) return alert("Error: La fecha de nacimiento es obligatoria (Pestaña Personal).");
        if (!formData.fecha_ingreso) return alert("Error: La fecha de ingreso es obligatoria (Pestaña Laboral).");
        if (formData.salario_basico === '' || formData.salario_basico === null) return alert("Error: El salario básico es obligatorio (Pestaña Laboral).");

        try {
            const payload = {
                ...formData,
                salario_basico: parseFloat(formData.salario_basico) || 0,
                eps: formData.eps || null, afp: formData.afp || null,
                arl: formData.arl || null, caja_compensacion: formData.caja_compensacion || null,
                fecha_retiro: formData.fecha_retiro || null,
                fecha_fin_periodo_prueba: formData.fecha_fin_periodo_prueba || null,
                fecha_vencimiento_contrato: formData.fecha_vencimiento_contrato || null,
                fecha_expedicion_doc: formData.fecha_expedicion_doc || null,
                vencimiento_licencia: formData.vencimiento_licencia || null,
                estrato: formData.estrato || null,
            };
            if (empleado) {
                await axios.put(`${API}/empleados/${empleado.id}/`, payload);
            } else {
                await axios.post(`${API}/empleados/`, payload);
            }
            onSaved();
        } catch (err) {
            console.error(err.response?.data);
            alert('Error:\n' + JSON.stringify(err.response?.data, null, 2));
        }
    };

    const tabs = [
        { id: 'personal', label: '👤 Personal' },
        { id: 'contacto', label: '📞 Contacto' },
        { id: 'laboral', label: '💼 Laboral' },
        { id: 'seguridad', label: '🏥 Seg. Social' },
        { id: 'bancario', label: '🏦 Bancario' },
        { id: 'extra', label: '📋 Adicional' },
    ];

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} />
                        {empleado ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h2>
                    <button 
                        onClick={onClose}
                        style={{ 
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ padding: '1.5rem 1.5rem 0', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '2px', overflowX: 'auto' }}>
                        {tabs.map(t => (
                            <button key={t.id} type="button" onClick={() => setTab(t.id)}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                    padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600,
                                    color: tab === t.id ? '#ec4899' : '#64748b',
                                    borderBottom: tab === t.id ? '2px solid #ec4899' : '2px solid transparent',
                                    marginBottom: '-1px',
                                }}>{t.label}</button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>

                    {/* ── Personal ── */}
                    {tab === 'personal' && (<>
                        <div style={S.section}>
                            <SectionTitle>Identificación</SectionTitle>
                            <Grid>
                                <FSelect label="Tipo documento" {...f('tipo_documento')} required options={[['CC','Cédula Ciudadanía'],['CE','Cédula Extranjería'],['PA','Pasaporte'],['TI','Tarjeta Identidad'],['NIT','NIT']]} />
                                <FInput label="Número documento" {...f('numero_documento')} required />
                                <FInput label="Fecha expedición" {...f('fecha_expedicion_doc')} type="date" />
                                <FInput label="Lugar expedición" {...f('lugar_expedicion_doc')} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Nombre</SectionTitle>
                            <Grid>
                                <FInput label="Primer nombre" {...f('primer_nombre')} required />
                                <FInput label="Segundo nombre" {...f('segundo_nombre')} />
                                <FInput label="Primer apellido" {...f('primer_apellido')} required />
                                <FInput label="Segundo apellido" {...f('segundo_apellido')} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Datos personales</SectionTitle>
                            <Grid>
                                <FInput label="Fecha nacimiento" {...f('fecha_nacimiento')} type="date" required />
                                <FInput label="Lugar nacimiento" {...f('lugar_nacimiento')} />
                                <FSelect label="Género" {...f('genero')} required options={[['M','Masculino'],['F','Femenino'],['O','Otro'],['NI','No informa']]} />
                                <FSelect label="Estado civil" {...f('estado_civil')} options={[['','--'],['S','Soltero/a'],['C','Casado/a'],['U','Unión libre'],['D','Divorciado/a'],['V','Viudo/a']]} />
                                <FInput label="Nacionalidad" {...f('nacionalidad')} />
                                <FSelect label="Grupo sanguíneo" {...f('grupo_sanguineo')} options={[['','--'],['A+','A+'],['A-','A-'],['B+','B+'],['B-','B-'],['AB+','AB+'],['AB-','AB-'],['O+','O+'],['O-','O-']]} />
                                <FSelect label="Estrato" {...f('estrato')} options={[['','--'],['1','1'],['2','2'],['3','3'],['4','4'],['5','5'],['6','6']]} />
                                <FSelect label="Tipo vivienda" {...f('tipo_vivienda')} options={[['','--'],['PRO','Propia'],['ARR','Arrendada'],['FAM','Familiar'],['OTR','Otra']]} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Tallas (dotación)</SectionTitle>
                            <Grid cols={4}>
                                <FInput label="Camisa" {...f('talla_camisa')} />
                                <FInput label="Pantalón" {...f('talla_pantalon')} />
                                <FInput label="Zapatos" {...f('talla_zapatos')} />
                                <FInput label="Casco" {...f('talla_casco')} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Licencia de conducción</SectionTitle>
                            <Grid cols={3}>
                                <FCheck label="Tiene licencia" {...fc('tiene_licencia')} />
                                <FInput label="Categoría" {...f('categoria_licencia')} />
                                <FInput label="Vencimiento" {...f('vencimiento_licencia')} type="date" />
                            </Grid>
                        </div>
                    </>)}

                    {/* ── Contacto ── */}
                    {tab === 'contacto' && (<>
                        <div style={S.section}>
                            <SectionTitle>Correos y teléfonos</SectionTitle>
                            <Grid>
                                <FInput label="Correo corporativo" {...f('correo_corporativo')} type="email" />
                                <FInput label="Correo personal" {...f('correo_personal')} type="email" />
                                <FInput label="Teléfono móvil" {...f('telefono_movil')} />
                                <FInput label="Teléfono trabajo" {...f('telefono_trabajo')} />
                                <FInput label="Teléfono personal" {...f('telefono_personal')} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Dirección de residencia</SectionTitle>
                            <Grid>
                                <FInput label="Dirección" {...f('direccion')} span={2} />
                                <FInput label="Barrio" {...f('barrio')} />
                                <FInput label="Ciudad" {...f('ciudad')} />
                                <FInput label="Depto. residencia" {...f('departamento_residencia')} />
                                <FInput label="Código postal" {...f('codigo_postal')} />
                                <FInput label="País" {...f('pais')} />
                            </Grid>
                        </div>
                    </>)}

                    {/* ── Laboral ── */}
                    {tab === 'laboral' && (<>
                        <div style={S.section}>
                            <SectionTitle icon={Briefcase}>Cargo y ubicación</SectionTitle>
                            <Grid>
                                <FInput label="Cargo" {...f('cargo')} />
                                <FInput label="Departamento" {...f('departamento')} />
                                <FInput label="Sede" {...f('sede')} />
                                <FSelect label="Estado" {...f('estado')} required options={[['ACT','Activo'],['INA','Inactivo'],['VAC','Vacaciones'],['INC','Incapacitado'],['LIC','Licencia'],['RET','Retirado']]} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Contrato</SectionTitle>
                            <Grid>
                                <FInput label="Fecha ingreso" {...f('fecha_ingreso')} type="date" required />
                                <FInput label="Fin período prueba" {...f('fecha_fin_periodo_prueba')} type="date" />
                                <FSelect label="Tipo contrato" {...f('tipo_contrato')} required options={[['IND','Término Indefinido'],['FIJ','Término Fijo'],['OBR','Obra o Labor'],['APR','Aprendizaje'],['SER','Prestación Servicios']]} />
                                <FInput label="Venc. contrato" {...f('fecha_vencimiento_contrato')} type="date" />
                                <FInput label="Fecha retiro" {...f('fecha_retiro')} type="date" />
                                <FSelect label="Motivo retiro" {...f('motivo_retiro')} options={[['','--'],['REN','Renuncia'],['DES','Despido sin justa causa'],['DJC','Despido con justa causa'],['MUT','Mutuo acuerdo'],['FCC','Fin de contrato'],['FAL','Fallecimiento'],['OTR','Otro']]} />
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Salario y pago</SectionTitle>
                            <Grid>
                                <FSelect label="Tipo salario" {...f('tipo_salario')} required options={[['FIJ','Salario Fijo'],['VAR','Salario Variable'],['INT','Salario Integral']]} />
                                <FInput label="Salario básico ($)" {...f('salario_basico')} type="number" required />
                                <FSelect label="Periodicidad pago" {...f('periodicidad_pago')} options={[['SEM','Semanal'],['QUI','Quincenal'],['MEN','Mensual']]} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <FCheck label="Auxilio de transporte" {...fc('auxilio_transporte')} />
                                    <FCheck label="Horas extras autorizadas" {...fc('horas_extras_autorizadas')} />
                                </div>
                            </Grid>
                        </div>
                        <div style={S.section}>
                            <SectionTitle>Notas</SectionTitle>
                            <textarea name="notas" value={formData.notas} onChange={handleChange} rows={3}
                                style={{ ...S.input, resize: 'vertical' }} placeholder="Observaciones del empleado..." />
                        </div>
                    </>)}

                    {/* ── Seguridad Social ── */}
                    {tab === 'seguridad' && (
                        <div style={S.section}>
                            <SectionTitle icon={Shield}>Seguridad social</SectionTitle>
                            <Grid>
                                <FInput label="EPS (ID)" {...f('eps')} type="number" />
                                <FInput label="AFP — Pensión (ID)" {...f('afp')} type="number" />
                                <FInput label="ARL (ID)" {...f('arl')} type="number" />
                                <FSelect label="Nivel riesgo ARL" {...f('nivel_riesgo_arl')} options={[['','--'],['I','Nivel I - Mínimo'],['II','Nivel II - Bajo'],['III','Nivel III - Medio'],['IV','Nivel IV - Alto'],['V','Nivel V - Máximo']]} />
                                <FInput label="Caja compensación (ID)" {...f('caja_compensacion')} type="number" />
                                <FInput label="Fondo cesantías" {...f('fondo_cesantias')} />
                            </Grid>
                        </div>
                    )}

                    {/* ── Bancario ── */}
                    {tab === 'bancario' && (
                        <div style={S.section}>
                            <SectionTitle>Datos bancarios</SectionTitle>
                            <Grid>
                                <FSelect label="Banco" {...f('banco')} options={[['','--'],['BANCOLOMBIA','Bancolombia'],['DAVIVIENDA','Davivienda'],['BOGOTA','Banco de Bogotá'],['OCCIDENTE','Banco de Occidente'],['BBVA','BBVA'],['NEQUI','Nequi'],['DAVIPLATA','Daviplata'],['POPULAR','Banco Popular'],['ITAU','Itaú'],['SCOTIABANK','Scotiabank Colpatria'],['OTRO','Otro']]} />
                                <FSelect label="Tipo cuenta" {...f('tipo_cuenta')} options={[['','--'],['AHO','Cuenta de Ahorros'],['CTE','Cuenta Corriente']]} />
                                <FInput label="Número cuenta" {...f('numero_cuenta')} span={2} />
                            </Grid>
                        </div>
                    )}

                    {/* ── Adicional ── */}
                    {tab === 'extra' && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Módulos adicionales</div>
                            <div style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                                Familiares, formación académica, experiencia laboral, vacaciones, incapacidades,
                                dotación, exámenes médicos y documentos se gestionan desde la vista de detalle del empleado.
                            </div>
                        </div>
                    )}

                    <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            {empleado ? 'Guardar Cambios' : 'Registrar Empleado'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────

function RRHH() {
    const navigate = useNavigate();
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editEmpleado, setEditEmpleado] = useState(null);
    const [detalleEmpleado, setDetalleEmpleado] = useState(null);

    useEffect(() => { fetchEmpleados(); }, []);

    const fetchEmpleados = async () => {
        try {
            const r = await axios.get(`${API}/empleados/`);
            setEmpleados(r.data);
            setLoading(false);
        } catch {
            setError('Error al cargar empleados.');
            setLoading(false);
        }
    };

    const openNew = () => { setEditEmpleado(null); setModalOpen(true); };
    const openEdit = (emp) => { setEditEmpleado(emp); setDetalleEmpleado(null); setModalOpen(true); };
    const onSaved = () => { setModalOpen(false); fetchEmpleados(); };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar empleado?')) {
            try { await axios.delete(`${API}/empleados/${id}/`); fetchEmpleados(); }
            catch { alert('Error al eliminar.'); }
        }
    };

    const filtered = empleados.filter(e =>
        `${e.primer_nombre} ${e.primer_apellido} ${e.numero_documento} ${e.cargo}`
            .toLowerCase().includes(search.toLowerCase())
    );

    // Vista detalle con estilo CRM
    if (detalleEmpleado) {
        return (
            <div style={styles.container}>
                {/* Header CRM-style */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Recursos Humanos</h1>
                        <p style={styles.subtitle}>Detalle del Empleado</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => setDetalleEmpleado(null)}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                color: '#64748b',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ChevronLeft size={18} />
                            Volver
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            style={styles.btnPrimary}
                        >
                            <X size={18} />
                            Inicio
                        </button>
                    </div>
                </div>

                <div style={styles.card}>
                    <EmpleadoDetalle
                        empleado={detalleEmpleado}
                        onBack={() => setDetalleEmpleado(null)}
                        onEdit={() => openEdit(detalleEmpleado)}
                    />
                </div>
                {modalOpen && (
                    <EmpleadoModal
                        empleado={editEmpleado}
                        onClose={() => setModalOpen(false)}
                        onSaved={() => { onSaved(); setDetalleEmpleado(null); fetchEmpleados(); }}
                    />
                )}
            </div>
        );
    }

    const empleadosActivos = empleados.filter(e => e.estado === 'ACT').length;
    const empleadosInactivos = empleados.filter(e => e.estado === 'RET').length;
    const totalSalarios = empleados.reduce((sum, e) => sum + parseFloat(e.salario_basico || 0), 0);

    return (
        <div style={styles.container}>
            {/* Header CRM-style */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Recursos Humanos</h1>
                    <p style={styles.subtitle}>Gestión de Empleados — ERP 8AMPERIOS</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={styles.btnPrimary}
                    >
                        <X size={18} />
                        Volver al Inicio
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard('linear-gradient(135deg, #ec4899 0%, #db2777 100%)')}>
                    <Users size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{empleados.length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Empleados</div>
                    </div>
                </div>
                <div style={styles.statCard('linear-gradient(135deg, #48bb78 0%, #38a169 100%)')}>
                    <Briefcase size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{empleadosActivos}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Activos</div>
                    </div>
                </div>
                <div style={styles.statCard('linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)')}>
                    <TrendingUp size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{empleadosInactivos}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Retirados</div>
                    </div>
                </div>
                <div style={styles.statCard('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                    <DollarSign size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${(totalSalarios / 1000000).toFixed(1)}M</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Nómina Mensual</div>
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div style={styles.card}>
                {/* Search and Actions */}
                <div style={styles.searchFilter}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            placeholder="Buscar por nombre, documento o cargo..."
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                    <button 
                        onClick={() => window.location.href = '/form-designer?template=Empleado%20RRHH'}
                        style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Palette size={18} />
                        Personalizar
                    </button>
                    <button onClick={openNew} style={styles.btnSuccess}>
                        <Plus size={18} />
                        Nuevo Empleado
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{ 
                        background: '#fed7d7',
                        border: '1px solid #feb2b2',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        color: '#c53030',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <AlertCircle size={20} />
                        <div style={{ flex: 1 }}>{error}</div>
                        <button 
                            onClick={() => setError(null)}
                            style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div style={{ width: '40px', height: '40px', border: '4px solid rgba(236,72,153,0.3)', borderTop: '4px solid #ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Empleado</th>
                                    <th style={styles.th}>Documento</th>
                                    <th style={styles.th}>Cargo / Depto</th>
                                    <th style={styles.th}>Ingreso</th>
                                    <th style={styles.th}>Salario</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={{...styles.th, textAlign: 'right'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(emp => (
                                    <tr key={emp.id} style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setDetalleEmpleado(emp)}>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600, color: '#1a202c' }}>{emp.primer_nombre} {emp.primer_apellido}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>{emp.correo_corporativo}</div>
                                        </td>
                                        <td style={{...styles.td, fontFamily: 'monospace', fontSize: '0.85rem'}}>{emp.tipo_documento}: {emp.numero_documento}</td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 500 }}>{emp.cargo || '—'}</div>
                                            <div style={{ fontSize: '0.82rem', color: '#718096' }}>{emp.departamento}</div>
                                        </td>
                                        <td style={styles.td}>{emp.fecha_ingreso}</td>
                                        <td style={styles.td}>${parseFloat(emp.salario_basico || 0).toLocaleString('es-CO')}</td>
                                        <td style={styles.td}>{getStatusBadge(emp.estado)}</td>
                                        <td style={{...styles.td, textAlign: 'right'}} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <button style={styles.btnIcon} onClick={() => openEdit(emp)}><Edit3 size={18} /></button>
                                                <button style={{...styles.btnIcon, color: '#e53e3e'}} onClick={() => handleDelete(emp.id)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
                                {search ? 'No se encontraron resultados.' : 'No hay empleados registrados.'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {modalOpen && (
                <EmpleadoModal
                    empleado={editEmpleado}
                    onClose={() => setModalOpen(false)}
                    onSaved={onSaved}
                />
            )}
        </div>
    );
}

export default RRHH;
