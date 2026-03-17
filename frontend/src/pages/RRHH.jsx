import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle, Edit3, Trash2, Plus, X, UserCheck } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8000/api/rrhh/empleados/';

function RRHH() {
    const [empleados, setEmpleados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmpleado, setCurrentEmpleado] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        documento_identidad: '',
        email: '',
        telefono: '',
        fecha_contratacion: '',
        cargo: '',
        salario_base: '',
        departamento: '',
        estado: 'activo'
    });

    useEffect(() => {
        fetchEmpleados();
    }, []);

    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(API_URL);
            setEmpleados(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar empleados. Asegúrate que Django esté corriendo.');
            setLoading(false);
        }
    };

    const getStatusBadge = (estado) => {
        switch (estado) {
            case 'activo': return <span className="badge badge-success">Activo</span>;
            case 'vacaciones': return <span className="badge badge-primary">En Vacaciones</span>;
            case 'incapacidad': return <span className="badge badge-warning">Incapacidad</span>;
            case 'inactivo': return <span className="badge badge-danger">Inactivo</span>;
            default: return <span className="badge">{estado}</span>;
        }
    };

    const openModal = (empleado = null) => {
        if (empleado) {
            setCurrentEmpleado(empleado);
            setFormData({
                nombre: empleado.nombre,
                apellidos: empleado.apellidos,
                documento_identidad: empleado.documento_identidad,
                email: empleado.email,
                telefono: empleado.telefono,
                fecha_contratacion: empleado.fecha_contratacion,
                cargo: empleado.cargo,
                salario_base: empleado.salario_base,
                departamento: empleado.departamento,
                estado: empleado.estado
            });
        } else {
            setCurrentEmpleado(null);
            setFormData({
                nombre: '',
                apellidos: '',
                documento_identidad: '',
                email: '',
                telefono: '',
                fecha_contratacion: new Date().toISOString().split('T')[0],
                cargo: '',
                salario_base: '',
                departamento: '',
                estado: 'activo'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentEmpleado(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, salario_base: parseFloat(formData.salario_base) };
            if (currentEmpleado) {
                await axios.put(`${API_URL}${currentEmpleado.id}/`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            closeModal();
            fetchEmpleados();
        } catch (err) {
            alert("Error al guardar el empleado. Verifica los campos y que el documento/email sean únicos.");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar a este empleado?')) {
            try {
                await axios.delete(`${API_URL}${id}/`);
                fetchEmpleados();
            } catch (err) {
                alert("Error al eliminar el empleado.");
            }
        }
    };

    return (
        <div className="container">
            <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 className="header-title">Recursos Humanos</h1>
                        <p className="header-subtitle" style={{ marginBottom: 0 }}>Gestión de Empleados y Nómina Base</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div className="stats-pill" style={{
                            background: 'rgba(236, 72, 153, 0.2)',
                            padding: '0.75rem 1rem',
                            borderRadius: '12px',
                            color: '#ec4899',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <Users size={20} />
                            <span style={{ fontWeight: 600 }}>{empleados.length} Empleados</span>
                        </div>
                        <button className="btn btn-primary" onClick={() => openModal()}>
                            <Plus size={18} />
                            Nuevo Empleado
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
                                    <th>Nombre Completo</th>
                                    <th>Documento / Contacto</th>
                                    <th>Cargo / Depto</th>
                                    <th>Fecha Ingreso</th>
                                    <th>Salario Base</th>
                                    <th>Estado</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empleados.map((emp) => (
                                    <tr key={emp.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{emp.nombre} {emp.apellidos}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID interno: {emp.id}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontFamily: 'monospace', color: 'var(--text)' }}>DNI: {emp.documento_identidad}</div>
                                            <div style={{ fontSize: '0.85rem' }}>{emp.email}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{emp.cargo}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{emp.departamento}</div>
                                        </td>
                                        <td>{emp.fecha_contratacion}</td>
                                        <td>${parseFloat(emp.salario_base).toLocaleString()}</td>
                                        <td>{getStatusBadge(emp.estado)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => openModal(emp)}>
                                                    <Edit3 size={18} />
                                                </button>
                                                <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={() => handleDelete(emp.id)}
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

                        {empleados.length === 0 && !error && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                No hay empleados registrados en el sistema.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
                            <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={closeModal}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Nombres</label>
                                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellidos</label>
                                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Doc. Identidad (DNI/NIE/...)</label>
                                    <input type="text" name="documento_identidad" value={formData.documento_identidad} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Corporativo</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Teléfono</label>
                                    <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Fecha de Contratación</label>
                                    <input type="date" name="fecha_contratacion" value={formData.fecha_contratacion} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Cargo / Puesto</label>
                                    <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Departamento</label>
                                    <input type="text" name="departamento" value={formData.departamento} onChange={handleInputChange} className="form-input" required />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Salario Base Mensual ($)</label>
                                    <input type="number" step="0.01" name="salario_base" value={formData.salario_base} onChange={handleInputChange} className="form-input" required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estado</label>
                                    <select name="estado" value={formData.estado} onChange={handleInputChange} className="form-input" style={{ background: 'var(--surface)' }}>
                                        <option value="activo">Activo</option>
                                        <option value="vacaciones">En Vacaciones</option>
                                        <option value="incapacidad">Incapacidad Médica</option>
                                        <option value="inactivo">Inactivo / Baja</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{currentEmpleado ? 'Guardar Cambios' : 'Registrar Empleado'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RRHH;
