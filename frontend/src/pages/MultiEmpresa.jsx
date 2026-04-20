import { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Plus, Edit3, Trash2, X, Users, Settings, Globe, Shield } from 'lucide-react';

function MultiEmpresa() {
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmpresa, setEditingEmpresa] = useState(null);
    const [formData, setFormData] = useState({
        nit: '',
        razon_social: '',
        nombre_comercial: '',
        tipo_empresa: 'independiente',
        regimen_fiscal: 'comun',
        tipo_contribuyente: 'persona_juridica',
        direccion: '',
        telefono: '',
        email: '',
        sitio_web: '',
        moneda_base: 'COP',
        pais: 'Colombia',
        ciudad: '',
        activa: true
    });

    useEffect(() => {
        fetchEmpresas();
    }, []);

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/multi-empresa/empresas/');
            setEmpresas(response.data);
        } catch (error) {
            console.error('Error fetching empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEmpresa) {
                await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/multi-empresa/empresas/${editingEmpresa.id}/`, formData);
            } else {
                await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/multi-empresa/empresas/', formData);
            }
            setShowModal(false);
            setEditingEmpresa(null);
            resetForm();
            fetchEmpresas();
        } catch (error) {
            console.error('Error saving empresa:', error);
        }
    };

    const handleEdit = (empresa) => {
        setEditingEmpresa(empresa);
        setFormData(empresa);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta empresa?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/multi-empresa/empresas/${id}/`);
                fetchEmpresas();
            } catch (error) {
                console.error('Error deleting empresa:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            nit: '',
            razon_social: '',
            nombre_comercial: '',
            tipo_empresa: 'independiente',
            regimen_fiscal: 'comun',
            tipo_contribuyente: 'persona_juridica',
            direccion: '',
            telefono: '',
            email: '',
            sitio_web: '',
            moneda_base: 'COP',
            pais: 'Colombia',
            ciudad: '',
            activa: true
        });
    };

    const openModal = () => {
        resetForm();
        setEditingEmpresa(null);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="container" style={{ position: 'relative' }}>
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
                </button>
                <div className="loading-spinner">Cargando empresas...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <Building2 size={32} />
                    <div>
                        <h1>Gestión Multi-Empresa</h1>
                        <p>Administra múltiples empresas y sucursales</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={openModal}>
                    <Plus size={20} />
                    Nueva Empresa
                </button>
            </div>

            <div className="grid">
                {empresas.map((empresa) => (
                    <div key={empresa.id} className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <Building2 size={24} />
                                <div>
                                    <h3>{empresa.razon_social}</h3>
                                    <p className="text-muted">NIT: {empresa.nit}</p>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(empresa)}>
                                    <Edit size={16} />
                                </button>
                                <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(empresa.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="empresa-info">
                                <div className="info-item">
                                    <span className="label">Tipo:</span>
                                    <span className={`badge ${empresa.tipo_empresa === 'matriz' ? 'badge-primary' : 'badge-secondary'}`}>
                                        {empresa.tipo_empresa}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Régimen:</span>
                                    <span>{empresa.regimen_fiscal}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Ciudad:</span>
                                    <span>{empresa.ciudad || 'No especificada'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Moneda:</span>
                                    <span>{empresa.moneda_base}</span>
                                </div>
                                {empresa.sucursales_count > 0 && (
                                    <div className="info-item">
                                        <span className="label">Sucursales:</span>
                                        <span className="badge badge-info">{empresa.sucursales_count}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="footer-actions">
                                <button className="btn btn-sm btn-outline">
                                    <Eye size={16} />
                                    Ver Detalles
                                </button>
                                <button className="btn btn-sm btn-outline">
                                    <Users size={16} />
                                    Usuarios
                                </button>
                                <button className="btn btn-sm btn-outline">
                                    <Settings size={16} />
                                    Configurar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ position: 'relative' }}>
                        <div className="modal-header">
                            <h2>{editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
                            <button 
                                className="btn btn-ghost modal-close-btn" 
                                onClick={() => setShowModal(false)}
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
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>NIT *</label>
                                        <input
                                            type="text"
                                            value={formData.nit}
                                            onChange={(e) => setFormData({...formData, nit: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Razón Social *</label>
                                        <input
                                            type="text"
                                            value={formData.razon_social}
                                            onChange={(e) => setFormData({...formData, razon_social: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre Comercial</label>
                                        <input
                                            type="text"
                                            value={formData.nombre_comercial}
                                            onChange={(e) => setFormData({...formData, nombre_comercial: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo Empresa</label>
                                        <select
                                            value={formData.tipo_empresa}
                                            onChange={(e) => setFormData({...formData, tipo_empresa: e.target.value})}
                                        >
                                            <option value="independiente">Independiente</option>
                                            <option value="matriz">Matriz</option>
                                            <option value="sucursal">Sucursal</option>
                                            <option value="filial">Filial</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Régimen Fiscal</label>
                                        <select
                                            value={formData.regimen_fiscal}
                                            onChange={(e) => setFormData({...formData, regimen_fiscal: e.target.value})}
                                        >
                                            <option value="comun">Régimen Común</option>
                                            <option value="simplificado">Régimen Simplificado</option>
                                            <option value="especial">Régimen Especial</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tipo Contribuyente</label>
                                        <select
                                            value={formData.tipo_contribuyente}
                                            onChange={(e) => setFormData({...formData, tipo_contribuyente: e.target.value})}
                                        >
                                            <option value="persona_juridica">Persona Jurídica</option>
                                            <option value="persona_natural">Persona Natural</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Teléfono</label>
                                        <input
                                            type="text"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Ciudad</label>
                                        <input
                                            type="text"
                                            value={formData.ciudad}
                                            onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Moneda Base</label>
                                        <select
                                            value={formData.moneda_base}
                                            onChange={(e) => setFormData({...formData, moneda_base: e.target.value})}
                                        >
                                            <option value="COP">COP - Peso Colombiano</option>
                                            <option value="USD">USD - Dólar</option>
                                            <option value="EUR">EUR - Euro</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <textarea
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                        rows={3}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sitio Web</label>
                                    <input
                                        type="url"
                                        value={formData.sitio_web}
                                        onChange={(e) => setFormData({...formData, sitio_web: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingEmpresa ? 'Actualizar' : 'Crear'} Empresa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MultiEmpresa;
