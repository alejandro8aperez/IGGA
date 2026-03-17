import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, AlertCircle, Edit3, Trash2, Plus, X, Truck, FileText } from 'lucide-react';

const API_PROV = 'http://localhost:8000/api/compras/proveedores/';
const API_ORD = 'http://localhost:8000/api/compras/ordenes/';

function Compras() {
    const [proveedores, setProveedores] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal Proveedores
    const [isProvModalOpen, setIsProvModalOpen] = useState(false);
    const [currentProv, setCurrentProv] = useState(null);
    const [provForm, setProvForm] = useState({
        razon_social: '', nit: '', contacto_nombre: '', contacto_email: '', contacto_telefono: '', direccion: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resProv, resOrd] = await Promise.all([
                axios.get(API_PROV),
                axios.get(API_ORD)
            ]);
            setProveedores(resProv.data);
            setOrdenes(resOrd.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar datos de Compras.');
            setLoading(false);
        }
    };

    const openProvModal = (prov = null) => {
        if (prov) {
            setCurrentProv(prov);
            setProvForm(prov);
        } else {
            setCurrentProv(null);
            setProvForm({ razon_social: '', nit: '', contacto_nombre: '', contacto_email: '', contacto_telefono: '', direccion: '' });
        }
        setIsProvModalOpen(true);
    };

    const handlProvSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProv) {
                await axios.put(`${API_PROV}${currentProv.id}/`, provForm);
            } else {
                await axios.post(API_PROV, provForm);
            }
            setIsProvModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Error al guardar proveedor.");
        }
    };

    const handleProvDelete = async (id) => {
        if (window.confirm('¿Eliminar proveedor? (Puede fallar si tiene órdenes asociadas)')) {
            try {
                await axios.delete(`${API_PROV}${id}/`);
                fetchData();
            } catch (err) {
                alert("Error al eliminar proveedor. Es probable que tenga órdenes de compra asociadas.");
            }
        }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="header-title">Gestión de Compras</h1>
                    <p className="header-subtitle" style={{ marginBottom: 0 }}>Proveedores y Órdenes de Compra</p>
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="spinner"></div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '2rem' }}>

                        {/* PROVEEDORES LIST */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Truck size={20} color="var(--primary)" />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Directorio de Proveedores</h2>
                                </div>
                                <button className="btn btn-primary" onClick={() => openProvModal()}>
                                    <Plus size={16} /> Nuevo Proveedor
                                </button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Razón Social</th>
                                            <th>NIT</th>
                                            <th>Contacto</th>
                                            <th style={{ textAlign: 'right' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proveedores.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{p.razon_social}</td>
                                                <td>{p.nit}</td>
                                                <td>
                                                    <div>{p.contacto_nombre}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.contacto_email}</div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => openProvModal(p)}>
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleProvDelete(p.id)}
                                                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ORDENES DE COMPRA LIST */}
                        <div className="glass-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ShoppingCart size={20} color="var(--warning)" />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Órdenes de Compra</h2>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>Ver todas</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {ordenes.slice(0, 5).map(ord => (
                                    <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.5rem', borderRadius: '50%' }}>
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>OC-{ord.id} • {ord.proveedor_nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {new Date(ord.fecha_emision).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <span style={{ fontWeight: 700 }}>${parseFloat(ord.total).toLocaleString()}</span>
                                            <span className={`badge ${ord.estado === 'completada' ? 'badge-success' : 'badge-warning'}`}>{ord.estado.toUpperCase()}</span>
                                        </div>
                                    </div>
                                ))}
                                {ordenes.length === 0 && (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hay órdenes de compra recientes.</div>
                                )}
                            </div>
                        </div>

                    </div>
                </>
            )}

            {/* Proveedor Modal */}
            {isProvModalOpen && (
                <div className="modal-overlay" onClick={() => setIsProvModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentProv ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => setIsProvModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handlProvSubmit}>
                            <div className="form-group">
                                <label className="form-label">Razón Social</label>
                                <input type="text" value={provForm.razon_social} onChange={e => setProvForm({ ...provForm, razon_social: e.target.value })} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">NIT / ID Fiscal</label>
                                <input type="text" value={provForm.nit} onChange={e => setProvForm({ ...provForm, nit: e.target.value })} className="form-input" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Contacto (Nombre)</label>
                                    <input type="text" value={provForm.contacto_nombre} onChange={e => setProvForm({ ...provForm, contacto_nombre: e.target.value })} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input type="text" value={provForm.contacto_telefono} onChange={e => setProvForm({ ...provForm, contacto_telefono: e.target.value })} className="form-input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" value={provForm.contacto_email} onChange={e => setProvForm({ ...provForm, contacto_email: e.target.value })} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dirección</label>
                                <input type="text" value={provForm.direccion} onChange={e => setProvForm({ ...provForm, direccion: e.target.value })} className="form-input" />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setIsProvModalOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{currentProv ? 'Guardar Cambios' : 'Crear Proveedor'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Compras;
