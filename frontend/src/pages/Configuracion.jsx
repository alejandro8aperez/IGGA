import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Plus, Trash2, Edit } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/';

function Configuracion() {
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

    return (
        <div className="container">
            <div className="header-actions">
                <h1 className="header-title">Configuración del Sistema</h1>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Datos de la Empresa */}
                <div className="glass-card">
                    <h2 className="section-title">Datos de la Empresa</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label className="form-label">Nombre de la Empresa</label>
                            <input type="text" className="form-control" name="nombre" value={empresa.nombre} onChange={handleEmpresaChange} />
                        </div>
                        <div>
                            <label className="form-label">RUC / NIT</label>
                            <input type="text" className="form-control" name="ruc" value={empresa.ruc || ''} onChange={handleEmpresaChange} />
                        </div>
                        <div>
                            <label className="form-label">Dirección Fiscal</label>
                            <input type="text" className="form-control" name="direccion" value={empresa.direccion || ''} onChange={handleEmpresaChange} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Teléfono</label>
                                <input type="text" className="form-control" name="telefono" value={empresa.telefono || ''} onChange={handleEmpresaChange} />
                            </div>
                            <div>
                                <label className="form-label">Moneda Base</label>
                                <select className="form-control" name="moneda_base" value={empresa.moneda_base || 'USD'} onChange={handleEmpresaChange}>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="COP">COP ($)</option>
                                    <option value="MXN">MXN ($)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Correo Electrónico</label>
                            <input type="email" className="form-control" name="email" value={empresa.email || ''} onChange={handleEmpresaChange} />
                        </div>
                        <button className="btn btn-primary" onClick={saveEmpresa} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} /> Guardar Cambios
                        </button>
                    </div>
                </div>

                {/* Gestión de Departamentos */}
                <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 className="section-title">Departamentos de la Empresa</h2>
                        <button className="btn btn-primary" onClick={() => { setCurrentDepto({ id: null, nombre: '', descripcion: '' }); setShowDeptoModal(true); }}>
                            <Plus size={18} /> Nuevo
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departamentos.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.nombre}</td>
                                        <td>{d.descripcion}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button className="btn-icon" onClick={() => { setCurrentDepto(d); setShowDeptoModal(true); }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => deleteDepartamento(d.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {departamentos.length === 0 && (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center' }}>No se encontraron departamentos.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de Departamento */}
            {showDeptoModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card">
                        <h2 className="section-title">{currentDepto.id ? 'Editar Departamento' : 'Nuevo Departamento'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Nombre</label>
                                <input type="text" className="form-control" value={currentDepto.nombre} onChange={(e) => setCurrentDepto({ ...currentDepto, nombre: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Descripción</label>
                                <textarea className="form-control" value={currentDepto.descripcion} onChange={(e) => setCurrentDepto({ ...currentDepto, descripcion: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn" onClick={() => setShowDeptoModal(false)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                                <button className="btn btn-primary" onClick={saveDepartamento}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Configuracion;
