import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Edit3, Trash2, Plus, X } from 'lucide-react';

const API_URL = 'http://localhost:8000/api/crm/clientes/';

function CRM() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        direccion: ''
    });

    useEffect(() => {
        fetchClientes();
    }, []);

    const fetchClientes = async () => {
        try {
            const response = await axios.get(API_URL);
            setClientes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar clientes del CRM.');
            setLoading(false);
        }
    };

    const openModal = (client = null) => {
        if (client) {
            setCurrentClient(client);
            setFormData({
                nombre: client.nombre,
                email: client.email,
                telefono: client.telefono,
                direccion: client.direccion
            });
        } else {
            setCurrentClient(null);
            setFormData({
                nombre: '',
                email: '',
                telefono: '',
                direccion: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentClient(null);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentClient) {
                await axios.put(`${API_URL}${currentClient.id}/`, formData);
            } else {
                await axios.post(API_URL, formData);
            }
            closeModal();
            fetchClientes();
        } catch (err) {
            alert("Error al guardar el cliente.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este cliente definitivamente?')) {
            try {
                await axios.delete(`${API_URL}${id}/`);
                fetchClientes();
            } catch (err) {
                alert("Error al eliminar el cliente.");
            }
        }
    };

    return (
        <div className="container">
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="header-title">CRM Avanzado</h1>
                        <p className="header-subtitle" style={{ marginBottom: 0 }}>Gestión de Clientes y Oportunidades</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            background: 'rgba(79, 70, 229, 0.2)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Users size={20} />
                            <span style={{ fontWeight: 600 }}>{clientes.length} Clientes</span>
                        </div>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <Plus size={18} />
                            Nuevo Cliente
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="spinner"></div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre/Razón Social</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Dirección</th>
                                    <th>Fecha de Registro</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((client) => (
                                    <tr key={client.id}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{client.nombre}</div>
                                        </td>
                                        <td>{client.email}</td>
                                        <td>{client.telefono || '-'}</td>
                                        <td>{client.direccion || '-'}</td>
                                        <td>{new Date(client.fecha_registro).toLocaleDateString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => openModal(client)}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleDelete(client.id)}
                                                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {clientes.length === 0 && !error && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                El CRM está vacío. Empieza añadiendo tu primer cliente.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nombre o Razón Social</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Correo Electrónico</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono</label>
                                <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Dirección / Sede</label>
                                <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} className="form-input" />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">
                                    {currentClient ? 'Guardar Cambios' : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CRM;
