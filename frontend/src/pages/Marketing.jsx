import { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, AlertCircle, Edit3, Trash2, Plus, X, Users, Target } from 'lucide-react';

const API_CAMPANAS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/marketing/campanas/';
const API_LEADS = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/marketing/leads/';

function Marketing() {
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

    if (loading) return <div className="container" style={{ position: 'relative' }}>
                <button 
                    onClick={() => window.location.href = '/'} 
                    className="btn btn-ghost modal-close-btn" 
                    title="Cerrar Módulo"
                    style={{ 
                        position: 'absolute', 
                        top: '1rem', 
                        right: '1rem',
                        backgroundColor: '#ff0000',
                        color: '#ffffff',
                        fontSize: '2rem',
                        padding: '0.75rem',
                        border: '2px solid #ff0000',
                        borderRadius: '8px',
                        zIndex: 99999,
                        minWidth: '60px',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(255, 0, 0, 0.8)'
                    }}
                >
                    X
                </button><div className="loading">Cargando Marketing...</div></div>;
    if (error) return <div className="container"><div className="error"><AlertCircle size={20} />{error}</div></div>;

    return (
        <div className="container" style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            <div className="header" style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#1a202c', margin: '0 0 0.5rem 0' }}>
                    <Megaphone size={32} style={{ marginRight: '1rem', verticalAlign: 'middle' }} /> 
                    Marketing y Ventas
                </h1>
                <button className="btn-primary" onClick={() => openCampModal()}>
                    <Plus size={20} /> Nueva Campaña
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div className="stat-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', flex: 1 }}>
                    <h3 style={{ color: '#718096', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Campañas Totales</h3>
                    <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#667eea', margin: 0 }}>{campanas.length}</p>
                </div>
                <div className="stat-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', flex: 1 }}>
                    <h3 style={{ color: '#718096', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Campañas Activas</h3>
                    <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#48bb78', margin: 0 }}>{campanas.filter(c => c.estado === 'activa').length}</p>
                </div>
                <div className="stat-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', flex: 1 }}>
                    <h3 style={{ color: '#718096', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>Leads Generados</h3>
                    <p className="stat-number" style={{ fontSize: '2rem', fontWeight: 700, color: '#ed8936', margin: 0 }}>{leads.length}</p>
                </div>
            </div>

            <div className="section" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '2rem' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>Campañas de Marketing</h2>
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Segmento</th>
                                <th>Fecha Inicio</th>
                                <th>Estado</th>
                                <th>Presupuesto</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campanas.map(camp => (
                                <tr key={camp.id}>
                                    <td>{camp.nombre}</td>
                                    <td>{camp.segmento}</td>
                                    <td>{camp.fecha_inicio}</td>
                                    <td><span className={`status ${camp.estado}`}>{camp.estado}</span></td>
                                    <td>${camp.presupuesto}</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => openCampModal(camp)}><Edit3 size={16} /></button>
                                        <button className="btn-icon danger" onClick={() => deleteCamp(camp.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="section" style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2 style={{ color: '#1a202c', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1.5rem 0' }}>Leads Recientes</h2>
                <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Empresa</th>
                                <th>Fuente</th>
                                <th>Estado</th>
                                <th>Puntuación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.slice(0, 10).map(lead => (
                                <tr key={lead.id}>
                                    <td>{lead.nombre}</td>
                                    <td>{lead.email}</td>
                                    <td>{lead.empresa}</td>
                                    <td>{lead.fuente}</td>
                                    <td><span className={`status ${lead.estado}`}>{lead.estado}</span></td>
                                    <td>{lead.puntuacion}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Campaña */}
            {isCampModalOpen && (
                <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal" style={{ position: 'relative', backgroundColor: 'white', color: '#1a202c' }}>
                        <div className="modal-header">
                            <button 
                                className="btn btn-ghost modal-close-btn" 
                                onClick={() => setIsCampModalOpen(false)}
                                style={{ 
                                    position: 'absolute', 
                                    top: '0.5rem', 
                                    right: '0.5rem',
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
                            <h3>{currentCamp ? 'Editar' : 'Nueva'} Campaña</h3>
                            <button 
                                className="btn btn-ghost" 
                                onClick={() => setIsCampModalOpen(false)}
                                style={{ 
                                    position: 'absolute', 
                                    top: '0.5rem', 
                                    right: '0.5rem', 
                                    padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                    borderRadius: '8px',
                                    zIndex: 1000,
                                    color: '#fca5a5',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.3)';
                                    e.target.style.transform = 'scale(1.1)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCampSubmit}>
                            <div className="form-group">
                                <label>Nombre:</label>
                                <input type="text" value={campForm.nombre} onChange={(e) => setCampForm({...campForm, nombre: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea value={campForm.descripcion} onChange={(e) => setCampForm({...campForm, descripcion: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Segmento ID:</label>
                                <input type="number" value={campForm.segmento} onChange={(e) => setCampForm({...campForm, segmento: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Inicio:</label>
                                    <input type="date" value={campForm.fecha_inicio} onChange={(e) => setCampForm({...campForm, fecha_inicio: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin:</label>
                                    <input type="date" value={campForm.fecha_fin} onChange={(e) => setCampForm({...campForm, fecha_fin: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Presupuesto:</label>
                                <input type="number" step="0.01" value={campForm.presupuesto} onChange={(e) => setCampForm({...campForm, presupuesto: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Estado:</label>
                                <select value={campForm.estado} onChange={(e) => setCampForm({...campForm, estado: e.target.value})}>
                                    <option value="planificada">Planificada</option>
                                    <option value="activa">Activa</option>
                                    <option value="pausada">Pausada</option>
                                    <option value="finalizada">Finalizada</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Canales (separados por coma):</label>
                                <input type="text" value={campForm.canales.join(', ')} onChange={(e) => setCampForm({...campForm, canales: e.target.value.split(', ')})} placeholder="email, redes_sociales, publicidad" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsCampModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Marketing;