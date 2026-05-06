import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Plus, Edit3, Trash2, X, Users, Settings, Globe, Shield, Edit, Eye } from 'lucide-react';

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
                    onClick={() => navigate('/')} 
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
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2.5rem',
                backgroundColor: '#ffffff',
                padding: '1.5rem 2rem',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                        <Building2 size={28} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gestión Multi-Empresa</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.95rem' }}>Administra múltiples empresas y sucursales en un solo lugar</p>
                    </div>
                </div>
                <button 
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                        color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', 
                        border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.4)'
                    }} 
                    onClick={openModal}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={20} />
                    Nueva Empresa
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '2rem' 
            }}>
                {empresas.map((empresa) => (
                    <div key={empresa.id} style={{
                        background: '#ffffff',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                        border: '1px solid #edf2f7',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ background: '#ebf4ff', padding: '0.75rem', borderRadius: '10px', color: '#4299e1' }}>
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: '#2d3748', fontWeight: '700' }}>{empresa.razon_social}</h3>
                                    <p style={{ margin: 0, color: '#a0aec0', fontSize: '0.85rem' }}>NIT: {empresa.nit}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button style={{ background: '#edf2f7', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#4a5568' }} onClick={() => handleEdit(empresa)}>
                                    <Edit size={16} />
                                </button>
                                <button style={{ background: '#fff5f5', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', color: '#e53e3e' }} onClick={() => handleDelete(empresa.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: '#718096', fontWeight: '500' }}>Tipo:</span>
                                <span style={{ background: empresa.tipo_empresa === 'matriz' ? '#ebf8ff' : '#f7fafc', color: empresa.tipo_empresa === 'matriz' ? '#3182ce' : '#718096', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600' }}>
                                    {empresa.tipo_empresa.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: '#718096', fontWeight: '500' }}>Régimen:</span>
                                <span style={{ color: '#2d3748', fontWeight: '600' }}>{empresa.regimen_fiscal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: '#718096', fontWeight: '500' }}>Ubicación:</span>
                                <span style={{ color: '#2d3748' }}>{empresa.ciudad || 'No especificada'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: '#718096', fontWeight: '500' }}>Moneda:</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600', background: '#f0fff4', color: '#38a169', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                                    {empresa.moneda_base}
                                </span>
                            </div>
                            {empresa.sucursales_count > 0 && (
                                <div style={{ display: 'flex', justifyItems: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    <span style={{ color: '#718096', fontWeight: '500' }}>Sucursales Integradas:</span>
                                    <span style={{ background: '#faf5ff', color: '#805ad5', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700' }}>{empresa.sucursales_count} Sucursales</span>
                                </div>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #edf2f7', paddingTop: '1rem' }}>
                            <button style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#f7fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', cursor: 'pointer' }}>
                                <Eye size={14} /> Detalles
                            </button>
                            <button style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#f7fafc', border: '1px solid #e2e8f0', padding: '0.5rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', cursor: 'pointer' }}>
                                <Users size={14} /> Accesos
                            </button>
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
