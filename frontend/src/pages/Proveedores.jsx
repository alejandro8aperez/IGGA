import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { Users, AlertCircle, Edit3, Trash2, Plus, X, FileText, Phone, Mail, Building2, Calendar, DollarSign, Palette, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';

const API_URL = API.COMPRAS.PROVEEDORES;

function Proveedores() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('proveedores');
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(null);

    const [formData, setFormData] = useState({
        razon_social: '',
        nombre_comercial: '',
        //cedula: '',
        nit: '',
        email: '',
        telefono: '',
        direccion: '',
        notas: '',
        adjunto_archivos: null,
        // additional fields
        tipo_prove: 'empresa',
        regimen_tributario: 'comun',
        responsable_iva: false,
        gran_contribuyente: false,
        agente_retenedor: false,
        clasificacion: 'B',
        sector_industria: '',
        credito_maximo: 0,
        dias_credito: 0,
        descuento_general: 0,
        condicion_pago: '',
        lista_precios: '',
        contacto_nombre: '',
        cargo_contacto: '',
        contacto_email: '',
        contacto_telefono: '',
        representante_legal: '',
        cedula_representante: '',
        banco_razon_social: '',
        numero_cuenta: '',
        tipo_cuenta: '',
        titular_cuenta: '',
        codigo_bancario: '',
        fecha_constitucion: '',
        fecha_ultimo_contacto: '',
        estado: 'activo',
        pais: 'Colombia',
        ciudad: '',
        departamento: '',
        codigo_postal: '',
        direccion_entrega: '',
        ciudad_entrega: '',
        numero_resolucion_dian: '',
        fecha_resolucion_dian: '',
        tipo_documento: 'NIT',
        codigo_barras: '',
        digito_verificacion: '',
        actividad_economica_ciiu: '',
        responsabilidades_fiscales: '',
        matricula_mercantil: '',
        correo_facturacion_electronica: ''
    });

    const [showAdditional, setShowAdditional] = useState(false);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        try {
            console.log('CRM: Cargando proveedores desde:', API_URL);
            const response = await axiosInstance.get(API_URL);
            console.log('CRM: Proveedors cargados:', response.data);
            setProveedores(response.data);
            setLoading(false);
        } catch (err) {
            console.error('CRM: Error al cargar proveedores:', err);
            console.error('CRM: Detalles del error:', {
                message: err.message,
                code: err.code,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(`Error al cargar proveedores del CRM: ${err.message || 'Error de conexión'}`);
            setLoading(false);
        }
    };

    const openModal = (prov = null) => {
        if (prov) {
            setCurrentProvider(prov);
            setFormData({
                razon_social: prov.razon_social || '',
                nombre_comercial: prov.nombre_comercial || '',
                //cedula: prov.nit || '',
                nit: prov.nit || '',
                email: prov.email || '',
                telefono: prov.telefono || '',
                direccion: prov.direccion || '',
                notas: prov.notas || '',
                adjunto_archivos: null,
                tipo_prove: prov.tipo_prove || 'empresa',
                regimen_tributario: prov.regimen_tributario || 'comun',
                responsable_iva: !!prov.responsable_iva,
                gran_contribuyente: !!prov.gran_contribuyente,
                agente_retenedor: !!prov.agente_retenedor,
                clasificacion: prov.clasificacion || 'B',
                sector_industria: prov.sector_industria || '',
                credito_maximo: prov.credito_maximo || 0,
                dias_credito: prov.dias_credito || 0,
                descuento_general: prov.descuento_general || 0,
                condicion_pago: prov.condicion_pago || '',
                lista_precios: prov.lista_precios || '',
                contacto_nombre: prov.contacto_nombre || '',
                cargo_contacto: prov.cargo_contacto || '',
                contacto_email: prov.contacto_email || '',
                contacto_telefono: prov.contacto_telefono || '',
                representante_legal: prov.representante_legal || '',
                cedula_representante: prov.nit_representante || '',
                banco_razon_social: prov.banco_nombre || '',
                numero_cuenta: prov.numero_cuenta || '',
                tipo_cuenta: prov.tipo_cuenta || '',
                titular_cuenta: prov.titular_cuenta || '',
                codigo_bancario: prov.codigo_bancario || '',
                fecha_constitucion: prov.fecha_constitucion || '',
                fecha_ultimo_contacto: prov.fecha_ultimo_contacto || '',
                estado: prov.estado || 'activo',
                pais: prov.pais || 'Colombia',
                ciudad: prov.ciudad || '',
                departamento: prov.departamento || '',
                codigo_postal: prov.codigo_postal || '',
                direccion_entrega: prov.direccion_entrega || '',
                ciudad_entrega: prov.ciudad_entrega || '',
                numero_resolucion_dian: prov.numero_resolucion_dian || '',
                fecha_resolucion_dian: prov.fecha_resolucion_dian || '',
                tipo_documento: prov.tipo_documento || 'NIT',
                codigo_barras: prov.codigo_barras || '',
                digito_verificacion: prov.digito_verificacion || '',
                actividad_economica_ciiu: prov.actividad_economica_ciiu || '',
                responsabilidades_fiscales: prov.responsabilidades_fiscales || '',
                matricula_mercantil: prov.matricula_mercantil || '',
                correo_facturacion_electronica: prov.correo_facturacion_electronica || ''
            });
            setShowAdditional(true);
        } else {
            setCurrentProvider(null);
            setFormData({
                razon_social: '',
                nombre_comercial: '',
                //cedula: '',
                nit: '',
                email: '',
                telefono: '',
                direccion: '',
                notas: '',
                adjunto_archivos: null,
                tipo_prove: 'empresa',
                regimen_tributario: 'comun',
                responsable_iva: false,
                gran_contribuyente: false,
                agente_retenedor: false,
                clasificacion: 'B',
                sector_industria: '',
                credito_maximo: 0,
                dias_credito: 0,
                descuento_general: 0,
                condicion_pago: '',
                lista_precios: '',
                contacto_nombre: '',
                cargo_contacto: '',
                contacto_email: '',
                contacto_telefono: '',
                representante_legal: '',
                cedula_representante: '',
                banco_razon_social: '',
                numero_cuenta: '',
                tipo_cuenta: '',
                titular_cuenta: '',
                codigo_bancario: '',
                fecha_constitucion: '',
                fecha_ultimo_contacto: '',
                estado: 'activo',
                pais: 'Colombia',
                ciudad: '',
                departamento: '',
                codigo_postal: '',
                direccion_entrega: '',
                ciudad_entrega: '',
                numero_resolucion_dian: '',
                fecha_resolucion_dian: '',
                tipo_documento: 'NIT',
                codigo_barras: '',
                digito_verificacion: '',
                actividad_economica_ciiu: '',
                responsabilidades_fiscales: '',
                matricula_mercantil: '',
                correo_facturacion_electronica: ''
            });
            setShowAdditional(false);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProvider(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, files, checked } = e.target;
        let newValue;
        if (type === 'file') newValue = files[0];
        else if (type === 'checkbox') newValue = checked;
        else newValue = value;
        setFormData({ 
            ...formData, 
            [name]: newValue
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            if (currentProvider) {
                // Usamos PATCH para actualizaciones parciales y más seguras
                // Aseguramos que la URL termine con barra para Django REST Framework
                const url = API_URL.endsWith('/') ? `${API_URL}${currentProvider.id}/` : `${API_URL}/${currentProvider.id}/`;
                await axiosInstance.patch(url, data, config);
            } else {
                await axiosInstance.post(API_URL, data, config);
            }
            closeModal();
            fetchProveedores();
        } catch (err) {
            console.error('[CRM] Error al guardar prove:', err.response?.data || err.message);
            alert("Error al guardar el prove. Verifique los datos e intente de nuevo.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este prove definitivamente?')) {
            try {
                await axiosInstance.delete(`${API_URL}${id}/`);
                fetchProveedores();
            } catch (err) {
                alert("Error al eliminar el prove.");
            }
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '60px', 
                        height: '60px', 
                        border: '4px solid rgba(255,255,255,0.3)', 
                        borderTop: '4px solid white', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }}></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>Cargando CRM...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ 
                            fontSize: '2.5rem', 
                            fontWeight: '700', 
                            color: '#1a202c',
                            margin: '0 0 0.5rem 0'
                        }}>
                            CRM Avanzado
                        </h1>
                        <p style={{ 
                            fontSize: '1.1rem', 
                            color: '#718096',
                            margin: 0
                        }}>
                            Gestión de Proveedors y Oportunidades
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <X size={18} />
                        Volver al Inicio
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div style={{ 
                    background: '#fed7d7',
                    border: '1px solid #feb2b2',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    color: '#c53030',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <AlertCircle size={20} />
                    <div style={{ flex: 1 }}>
                        <strong>Error:</strong> {error}
                    </div>
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('proveedores')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: activeTab === 'proveedores' ? '#667eea' : '#718096',
                            backgroundColor: activeTab === 'proveedores' ? '#f0f4ff' : 'transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        Proveedores
                    </button>
                </div>

                <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                }}>
                                    <Users size={24} />
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{proveedores.length}</div>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Proveedors</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>

                                <button 
                                    onClick={() => openModal()}
                                    style={{
                                        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(72, 187, 120, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(72, 187, 120, 0.3)';
                                    }}
                                >
                                    <Plus size={18} />
                                    Nuevo Proveedor
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Compañía / NIT</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Email</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Teléfono</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Notas</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Docs</th>
                                            <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e2e8f0', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proveedores.map((prove, index) => (
                                            <tr key={prove.id} style={{ 
                                                borderBottom: '1px solid #e2e8f0',
                                                backgroundColor: index % 2 === 0 ? 'white' : '#f8fafc'
                                            }}>
                                                <td style={{ padding: '1rem', fontWeight: '600', color: '#2d3748' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Building2 size={16} style={{ color: '#667eea' }} />
                                                        <div>
                                                            <div>{prove.cedula ? `${prove.cedula} - ` : ''}{prove.nombre}</div>
                                                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                                {prove.nit ? `${prove.nit} - ` : ''}{prove.compania || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Mail size={14} style={{ color: '#718096' }} />
                                                        {prove.email}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Phone size={14} style={{ color: '#718096' }} />
                                                        {prove.telefono || 'N/A'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem', color: '#4a5568' }}>
                                                    <div style={{ fontSize: '0.875rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {prove.notas || 'N/A'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {prove.adjunto_archivos ? (
                                                        <a href={prove.adjunto_archivos} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}><Paperclip size={16} /></a>
                                                    ) : 'N/A'}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button 
                                                            onClick={() => openModal(prove)}
                                                            style={{
                                                                background: '#667eea',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.backgroundColor = '#5a67d8';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = '#667eea';
                                                            }}
                                                            title="Editar"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(prove.id)}
                                                            style={{
                                                                background: '#e53e3e',
                                                                color: 'white',
                                                                border: 'none',
                                                                padding: '0.5rem',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                transition: 'all 0.2s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.target.style.backgroundColor = '#c53030';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.target.style.backgroundColor = '#e53e3e';
                                                            }}
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {proveedores.length === 0 && !error && (
                                    <div style={{ 
                                        padding: '4rem', 
                                        textAlign: 'center', 
                                        color: '#718096',
                                        background: '#f8fafc'
                                    }}>
                                        <Users size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
                                        <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                            No hay proveedores registrados
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            Empieza añadiendo tu primer prove para comenzar a gestionar tus relaciones.
                                        </div>
                                        <button 
                                            onClick={() => openModal()}
                                            style={{
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0.75rem 1.5rem',
                                                borderRadius: '12px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Plus size={18} />
                                            Crear Primer Proveedor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(4px)'
                }} onClick={closeModal}>
                    <div 
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '90%',
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: '700', 
                                color: '#2d3748',
                                margin: 0
                            }}>
                                {currentProvider ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                            </h2>
                            <button 
                                onClick={closeModal}
                                style={{
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
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#cbd5e0';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#e2e8f0';
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Razón Social *</label>
                                    <input
                                        type="text"
                                        name="razon_social"
                                        value={formData.razon_social}
                                        onChange={handleInputChange}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Cédula</label>
                                    <input
                                        type="text"
                                        name="cedula"
                                        value={formData.nit}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Nombre Comercial</label>
                                    <input
                                        type="text"
                                        name="nombre_comercial"
                                        value={formData.nombre_comercial}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>NIT</label>
                                    <input
                                        type="text"
                                        name="nit"
                                        value={formData.nit}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        style={{ 
                                            width: '100%', 
                                            padding: '0.75rem', 
                                            border: '2px solid #e2e8f0', 
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Dirección</label>
                                <textarea
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleInputChange}
                                    rows={3}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>NOTAS</label>
                                <textarea
                                    name="notas"
                                    value={formData.notas}
                                    onChange={handleInputChange}
                                    rows={3}
                                    style={{ 
                                        width: '100%', 
                                        padding: '0.75rem', 
                                        border: '2px solid #e2e8f0', 
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>ADJUNTO ARCHIVOS</label>
                                <input
                                    type="file"
                                    name="adjunto_archivos"
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '0.5rem 0' }}
                                />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowAdditional(!showAdditional)}
                                    style={{
                                        background: '#f1f5f9',
                                        color: '#334155',
                                        border: '1px solid #e2e8f0',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    {showAdditional ? 'Ocultar Datos Adicionales' : 'Mostrar Datos Adicionales'}
                                </button>
                            </div>

                            {showAdditional && (
                                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Tipo de Proveedor</label>
                                        <select name="tipo_prove" value={formData.tipo_prove} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="persona_natural">Persona Natural</option>
                                            <option value="empresa">Empresa</option>
                                            <option value="empresa_unipersonal">Empresa Unipersonal</option>
                                            <option value="cooperativa">Cooperativa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Estado</label>
                                        <select name="estado" value={formData.estado} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                            <option value="suspendido">Suspendido</option>
                                            <option value="bloqueado">Bloqueado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Tipo de Documento</label>
                                        <select name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="NIT">NIT</option>
                                            <option value="CC">Cédula de Ciudadanía</option>
                                            <option value="CE">Cédula de Extranjería</option>
                                            <option value="PAS">Pasaporte</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Dígito Verificación</label>
                                        <input type="text" name="digito_verificacion" value={formData.digito_verificacion} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Código de Barras</label>
                                        <input type="text" name="codigo_barras" value={formData.codigo_barras} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Actividad Económica (CIIU)</label>
                                        <input type="text" name="actividad_economica_ciiu" value={formData.actividad_economica_ciiu} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Responsabilidades Fiscales</label>
                                        <input type="text" name="responsabilidades_fiscales" value={formData.responsabilidades_fiscales} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Matrícula Mercantil</label>
                                        <input type="text" name="matricula_mercantil" value={formData.matricula_mercantil} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Correo Facturación Electrónica</label>
                                        <input type="email" name="correo_facturacion_electronica" value={formData.correo_facturacion_electronica} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Régimen Tributario</label>
                                        <select name="regimen_tributario" value={formData.regimen_tributario} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="comun">Régimen Común</option>
                                            <option value="simplificado">Régimen Simplificado</option>
                                            <option value="especial">Régimen Especial</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" name="responsable_iva" checked={formData.responsable_iva} onChange={handleInputChange} />
                                            Responsable IVA
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" name="gran_contribuyente" checked={formData.gran_contribuyente} onChange={handleInputChange} />
                                            Gran contribuyente
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input type="checkbox" name="agente_retenedor" checked={formData.agente_retenedor} onChange={handleInputChange} />
                                            Agente retenedor
                                        </label>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Clasificación</label>
                                        <select name="clasificacion" value={formData.clasificacion} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="A">A - Premium</option>
                                            <option value="B">B - Estándar</option>
                                            <option value="C">C - Básico</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Crédito Máximo (COP)</label>
                                        <input type="number" name="credito_maximo" value={formData.credito_maximo} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Días de Crédito</label>
                                        <input type="number" name="dias_credito" value={formData.dias_credito} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Descuento General (%)</label>
                                        <input type="number" name="descuento_general" value={formData.descuento_general} onChange={handleInputChange} step="0.01" style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Contacto Principal</label>
                                        <input type="text" name="contacto_nombre" value={formData.contacto_nombre} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Cargo Contacto</label>
                                        <input type="text" name="cargo_contacto" value={formData.cargo_contacto} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Representante Legal</label>
                                        <input type="text" name="representante_legal" value={formData.representante_legal} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Banco</label>
                                        <input type="text" name="banco_nombre" value={formData.banco_nombre} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Número de Cuenta</label>
                                        <input type="text" name="numero_cuenta" value={formData.numero_cuenta} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Tipo de Cuenta</label>
                                        <select name="tipo_cuenta" value={formData.tipo_cuenta} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                            <option value="">--</option>
                                            <option value="corriente">Cuenta Corriente</option>
                                            <option value="ahorros">Cuenta de Ahorros</option>
                                            <option value="nomina">Cuenta Nómina</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Fecha Constitución</label>
                                        <input type="date" name="fecha_constitucion" value={formData.fecha_constitucion || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#4a5568' }}>Último Contacto</label>
                                        <input type="date" name="fecha_ultimo_contacto" value={formData.fecha_ultimo_contacto || ''} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button 
                                    type="button" 
                                    onClick={closeModal}
                                    style={{
                                        background: '#e2e8f0',
                                        color: '#4a5568',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = '#cbd5e0';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = '#e2e8f0';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                                    }}
                                >
                                    {currentProvider ? 'Actualizar' : 'Guardar'}
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
