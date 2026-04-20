import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Settings, Users, Building2, Plus, Edit3, Trash2, X, Save, AlertCircle, Briefcase } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/';

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
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '1.5rem'
    },
    cardTitle: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1a202c',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#4a5568'
    },
    input: {
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        background: 'white'
    },
    select: {
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '1rem',
        outline: 'none',
        background: 'white',
        cursor: 'pointer'
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
        maxWidth: '500px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        overflow: 'hidden'
    },
    modalHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        color: 'white'
    },
    modalBody: {
        padding: '1.5rem'
    },
    errorAlert: {
        background: '#fed7d7',
        border: '1px solid #feb2b2',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem',
        color: '#c53030',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid rgba(236,72,153,0.3)',
        borderTop: '4px solid #ec4899',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }
};

function Configuracion() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [empresa, setEmpresa] = useState({
        nombre: '',
        ruc: '',
        direccion: '',
        telefono: '',
        email: '',
        moneda_base: 'USD',
        sitio_web: ''
    });
    const [empresaId, setEmpresaId] = useState(null);
    const [departamentos, setDepartamentos] = useState([]);
    const [showDeptoModal, setShowDeptoModal] = useState(false);
    const [currentDepto, setCurrentDepto] = useState({ id: null, nombre: '', descripcion: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [resEmpresas, resDeptos] = await Promise.all([
                axios.get(`${API_BASE}configuracion/empresas/`),
                axios.get(`${API_BASE}configuracion/departamentos/`)
            ]);
            if (resEmpresas.data.length > 0) {
                setEmpresa(resEmpresas.data[0]);
                setEmpresaId(resEmpresas.data[0].id);
            }
            setDepartamentos(resDeptos.data);
        } catch (error) {
            console.error('Error fetching settings data:', error);
            setError('Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleEmpresaChange = (e) => {
        setEmpresa({ ...empresa, [e.target.name]: e.target.value });
    };

    const saveEmpresa = async () => {
        try {
            if (empresaId) {
                await axios.put(`${API_BASE}configuracion/empresas/${empresaId}/`, empresa);
            } else {
                const res = await axios.post(`${API_BASE}configuracion/empresas/`, empresa);
                setEmpresaId(res.data.id);
            }
            alert('Configuración de empresa guardada con éxito.');
        } catch (error) {
            console.error('Error saving company settings:', error);
        }
    };

    const saveDepartamento = async () => {
        try {
            if (currentDepto.id) {
                await axios.put(`${API_BASE}configuracion/departamentos/${currentDepto.id}/`, currentDepto);
            } else {
                await axios.post(`${API_BASE}configuracion/departamentos/`, currentDepto);
            }
            setShowDeptoModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving department:', error);
        }
    };

    const deleteDepartamento = async (id) => {
        if (window.confirm('¿Seguro que deseas eliminar este departamento?')) {
            try {
                await axios.delete(`${API_BASE}configuracion/departamentos/${id}/`);
                fetchData();
            } catch (error) {
                console.error('Error deleting department:', error);
            }
        }
    };

    if (loading) return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={styles.spinner}></div>
            </div>
        </div>
    );
    
    if (error) return (
        <div style={styles.container}>
            <div style={styles.errorAlert}>
                <AlertCircle size={24} />
                <div>{error}</div>
                <button onClick={() => setError(null)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cerrar</button>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            {/* Header CRM-style */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Configuración del Sistema</h1>
                    <p style={styles.subtitle}>Gestión de Empresa y Departamentos — ERP 8AMPERIOS</p>
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
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', padding: '1rem 1.5rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minWidth: '200px', flex: '1' }}>
                    <Building2 size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{empresa.nombre ? 'Activa' : 'Sin datos'}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Estado Empresa</div>
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', padding: '1rem 1.5rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minWidth: '200px', flex: '1' }}>
                    <Briefcase size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{departamentos.length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Departamentos</div>
                    </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem 1.5rem', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', minWidth: '200px', flex: '1' }}>
                    <Users size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{empresa.moneda_base}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Moneda Base</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Datos de la Empresa */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>
                        <Building2 size={20} style={{ color: '#ec4899' }} />
                        Datos de la Empresa
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre de la Empresa</label>
                                <input type="text" style={styles.input} name="nombre" value={empresa.nombre} onChange={handleEmpresaChange} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>RUC / NIT</label>
                                <input type="text" style={styles.input} name="ruc" value={empresa.ruc || ''} onChange={handleEmpresaChange} />
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Dirección Fiscal</label>
                            <input type="text" style={styles.input} name="direccion" value={empresa.direccion || ''} onChange={handleEmpresaChange} />
                        </div>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Teléfono</label>
                                <input type="text" style={styles.input} name="telefono" value={empresa.telefono || ''} onChange={handleEmpresaChange} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Moneda Base</label>
                                <select style={styles.select} name="moneda_base" value={empresa.moneda_base || 'USD'} onChange={handleEmpresaChange}>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="COP">COP ($)</option>
                                    <option value="MXN">MXN ($)</option>
                                </select>
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Correo Electrónico</label>
                            <input type="email" style={styles.input} name="email" value={empresa.email || ''} onChange={handleEmpresaChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Sitio Web</label>
                            <input type="text" style={styles.input} name="sitio_web" value={empresa.sitio_web || ''} onChange={handleEmpresaChange} />
                        </div>
                        <button onClick={saveEmpresa} style={styles.btnSuccess}>
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </div>
                </div>

                {/* Gestión de Departamentos */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={styles.cardTitle} style={{ marginBottom: 0 }}>
                            <Briefcase size={20} style={{ color: '#48bb78' }} />
                            Departamentos de la Empresa
                        </h2>
                        <button style={styles.btnPrimary} onClick={() => { setCurrentDepto({ id: null, nombre: '', descripcion: '' }); setShowDeptoModal(true); }}>
                            <Plus size={18} /> Nuevo
                        </button>
                    </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Nombre</th>
                                    <th style={styles.th}>Descripción</th>
                                    <th style={{...styles.th, textAlign: 'right'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departamentos.map(d => (
                                    <tr key={d.id}>
                                        <td style={styles.td}>{d.nombre}</td>
                                        <td style={styles.td}>{d.descripcion}</td>
                                        <td style={{...styles.td, textAlign: 'right'}}>
                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                <button style={styles.btnIcon} onClick={() => { setCurrentDepto(d); setShowDeptoModal(true); }}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button style={{...styles.btnIcon, color: '#e53e3e'}} onClick={() => deleteDepartamento(d.id)}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {departamentos.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{...styles.td, textAlign: 'center', padding: '3rem', color: '#718096'}}>
                                            No se encontraron departamentos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Departamento */}
            {showDeptoModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Briefcase size={20} />
                                {currentDepto.id ? 'Editar Departamento' : 'Nuevo Departamento'}
                            </h2>
                            <button 
                                onClick={() => setShowDeptoModal(false)}
                                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={styles.label}>Nombre</label>
                                    <input type="text" style={styles.input} value={currentDepto.nombre} onChange={(e) => setCurrentDepto({ ...currentDepto, nombre: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.label}>Descripción</label>
                                    <textarea style={{...styles.input, minHeight: '80px', resize: 'vertical'}} value={currentDepto.descripcion} onChange={(e) => setCurrentDepto({ ...currentDepto, descripcion: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button 
                                        onClick={() => setShowDeptoModal(false)} 
                                        style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={saveDepartamento}
                                        style={styles.btnSuccess}
                                    >
                                        <Save size={18} /> Guardar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Configuracion;
