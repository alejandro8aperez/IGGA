import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Megaphone, AlertCircle, Edit3, Trash2, Plus, X, Users, Target, Calendar, DollarSign, BarChart3, ChevronLeft } from 'lucide-react';

const API_CAMPANAS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/marketing/campanas/';
const API_LEADS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/marketing/leads/';

// ── Estilos CRM-style ─────────────────────────────────
const s = {
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
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
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
    badge: (estado) => {
        let bgColor, textColor;
        switch (estado) {
            case 'planificada': bgColor = '#dbeafe'; textColor = '#1e40af'; break;
            case 'activa': bgColor = '#d1fae5'; textColor = '#065f46'; break;
            case 'pausada': bgColor = '#fef3c7'; textColor = '#92400e'; break;
            case 'finalizada': bgColor = '#e2e8f0'; textColor = '#4a5568'; break;
            default: bgColor = '#f3f4f6'; textColor = '#374151'; break;
        }
        return {
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            background: bgColor,
            color: textColor
        };
    },
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
    },
    modal: {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '1rem'
    },
    modalTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1a202c',
        margin: 0
    },
    modalCloseButton: {
        background: '#e2e8f0',
        color: '#4a5568',
        border: 'none',
        padding: '0.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        transition: 'all 0.2s'
    },
    formGroup: {
        marginBottom: '1rem'
    },
    formLabel: {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#4a5568'
    },
    formInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    formSelect: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        background: 'white'
    },
    formTextarea: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        resize: 'vertical',
        minHeight: '80px'
    },
    modalActions: {
        display: 'flex',
        gap: '1rem',
        justifyContent: 'flex-end',
        marginTop: '1.5rem'
    },
    btnSecondary: {
        padding: '0.75rem 1.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: 'white',
        color: '#718096',
        cursor: 'pointer',
        fontWeight: '600'
    }
};

function Marketing() {
    const navigate = useNavigate();
    const [campanas, setCampanas] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal Campaña
    const [isCampModalOpen, setIsCampModalOpen] = useState(false);
    const [currentCamp, setCurrentCamp] = useState(null);
    const [campForm, setCampForm] = useState({
        nombre: '', descripcion: '', segmento: '', fecha_inicio: '', fecha_fin: '', presupuesto: 0, estado: 'planificada', canales: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resCamp, resLeads] = await Promise.all([
                axios.get(API_CAMPANAS),
                axios.get(API_LEADS)
            ]);
            setCampanas(resCamp.data);
            setLeads(resLeads.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar datos de Marketing.');
            setLoading(false);
        }
    };

    const openCampModal = (camp = null) => {
        if (camp) {
            setCurrentCamp(camp);
            setCampForm(camp);
        } else {
            setCurrentCamp(null);
            setCampForm({ nombre: '', descripcion: '', segmento: '', fecha_inicio: '', fecha_fin: '', presupuesto: 0, estado: 'planificada', canales: [] });
        }
        setIsCampModalOpen(true);
    };

    const handleCampSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentCamp) {
                await axios.put(`${API_CAMPANAS}${currentCamp.id}/`, campForm);
            } else {
                await axios.post(API_CAMPANAS, campForm);
            }
            fetchData();
            setIsCampModalOpen(false);
        } catch (err) {
            console.error('Error al guardar campaña:', err);
        }
    };

    const deleteCamp = async (id) => {
        if (window.confirm('¿Eliminar esta campaña?')) {
            try {
                await axios.delete(`${API_CAMPANAS}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar campaña:', err);
            }
        }
    };

    if (loading) return (
        <div style={{ ...s.container, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: '#667eea' }}>
                <RefreshCw size={48} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: '600' }}>Cargando Marketing...</p>
            </div>
        </div>
    );

    return (
        <div style={s.container}>
            <div style={s.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer', color: '#64748b' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 style={s.title}>Marketing y Ventas</h1>
                        <p style={s.subtitle}>Gestión de campañas y seguimiento de leads</p>
                    </div>
                </div>
                <button style={s.btnPrimary} onClick={() => openCampModal()}>
                    <Plus size={20} /> Nueva Campaña
                </button>
            </div>

            {error && (
                <div style={{ background: '#fed7d7', color: '#c53030', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <div style={s.statsGrid}>
                <div style={s.statCard('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                    <Megaphone size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{campanas.length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Campañas Totales</div>
                    </div>
                </div>
                <div style={s.statCard('linear-gradient(135deg, #48bb78 0%, #38a169 100%)')}>
                    <Target size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{campanas.filter(c => c.estado === 'activa').length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Campañas Activas</div>
                    </div>
                </div>
                <div style={s.statCard('linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)')}>
                    <Users size={24} />
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{leads.length}</div>
                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Leads Generados</div>
                    </div>
                </div>
            </div>

            <div style={s.card}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2d3748', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChart3 size={20} style={{ color: '#667eea' }} /> Campañas de Marketing
                </h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Nombre</th>
                                <th style={s.th}>Segmento</th>
                                <th style={s.th}>Fecha Inicio</th>
                                <th style={s.th}>Estado</th>
                                <th style={s.th}>Presupuesto</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campanas.map(camp => (
                                <tr key={camp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ ...s.td, fontWeight: '600' }}>{camp.nombre}</td>
                                    <td style={s.td}>{camp.segmento}</td>
                                    <td style={s.td}>{camp.fecha_inicio}</td>
                                    <td style={s.td}><span style={s.badge(camp.estado)}>{camp.estado}</span></td>
                                    <td style={{ ...s.td, fontWeight: '700', color: '#667eea' }}>${Number(camp.presupuesto).toLocaleString()}</td>
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            <button style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', color: '#64748b' }} onClick={() => openCampModal(camp)}><Edit3 size={16} /></button>
                                            <button style={{ background: '#fee2e2', border: 'none', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }} onClick={() => deleteCamp(camp.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCampModalOpen && (
                <div style={s.modalOverlay}>
                    <div style={s.modal}>
                        <div style={s.modalHeader}>
                            <h2 style={{ ...s.modalTitle, color: 'white' }}>{currentCamp ? 'Editar' : 'Nueva'} Campaña</h2>
                            <button 
                                onClick={() => setIsCampModalOpen(false)}
                                style={s.modalCloseButton}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCampSubmit} style={{ padding: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={s.formLabel}>Nombre de la Campaña *</label>
                                    <input type="text" style={s.formInput} value={campForm.nombre} onChange={(e) => setCampForm({...campForm, nombre: e.target.value})} required />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={s.formLabel}>Descripción</label>
                                    <textarea style={s.formTextarea} value={campForm.descripcion} onChange={(e) => setCampForm({...campForm, descripcion: e.target.value})} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Segmento ID</label>
                                    <input type="number" style={s.formInput} value={campForm.segmento} onChange={(e) => setCampForm({...campForm, segmento: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Presupuesto ($)</label>
                                    <input type="number" step="0.01" style={s.formInput} value={campForm.presupuesto} onChange={(e) => setCampForm({...campForm, presupuesto: e.target.value})} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Fecha Inicio</label>
                                    <input type="date" style={s.formInput} value={campForm.fecha_inicio} onChange={(e) => setCampForm({...campForm, fecha_inicio: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Fecha Fin</label>
                                    <input type="date" style={s.formInput} value={campForm.fecha_fin} onChange={(e) => setCampForm({...campForm, fecha_fin: e.target.value})} />
                                </div>
                                <div>
                                    <label style={s.formLabel}>Estado</label>
                                    <select style={s.formSelect} value={campForm.estado} onChange={(e) => setCampForm({...campForm, estado: e.target.value})}>
                                        <option value="planificada">Planificada</option>
                                        <option value="activa">Activa</option>
                                        <option value="pausada">Pausada</option>
                                        <option value="finalizada">Finalizada</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={s.formLabel}>Canales</label>
                                    <input type="text" style={s.formInput} value={Array.isArray(campForm.canales) ? campForm.canales.join(', ') : campForm.canales} onChange={(e) => setCampForm({...campForm, canales: e.target.value.split(', ')})} placeholder="email, redes, sms" />
                                </div>
                            </div>
                            <div style={s.modalActions}>
                                <button type="button" style={s.btnSecondary} onClick={() => setIsCampModalOpen(false)}>Cancelar</button>
                                <button type="submit" style={s.btnPrimary}>Guardar Campaña</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marketing;