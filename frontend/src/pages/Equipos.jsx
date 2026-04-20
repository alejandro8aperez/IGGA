import { useState, useEffect } from 'react';
import axios from 'axios';

function Equipos() {
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({
        codigo: '', nombre: '', descripcion: '', ubicacion: '', tipo: '', fecha_instalacion: '', proveedor: '', estado: 'activo'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/equipos/');
                setEquipos(res.data);
            } catch (err) {
                setError('Error al cargar equipos.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/mantenimiento/equipos/${editingId}/`, form);
            } else {
                await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/equipos/', form);
            }
            const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/equipos/');
            setEquipos(res.data);
            setForm({ codigo: '', nombre: '', descripcion: '', ubicacion: '', tipo: '', fecha_instalacion: '', proveedor: '', estado: 'activo' });
            setEditingId(null);
        } catch {
            setError('Error al guardar equipo.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro que desea eliminar este equipo?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/mantenimiento/equipos/${id}/`);
                const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/mantenimiento/equipos/');
                setEquipos(res.data);
            } catch {
                setError('Error al eliminar equipo.');
            }
        }
    };

    const handleEdit = (equipo) => {
        setForm(equipo);
        setEditingId(equipo.id);
        window.scrollTo(0, 0);
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
                </button><p>Cargando Equipos...</p></div>;
    if (error) return <div className="container"><p>{error}</p></div>;

    const activos = equipos.filter((e) => e.estado === 'activo').length;
    const enMantenimiento = equipos.filter((e) => e.estado === 'mantenimiento').length;

    return (
        <div className="container">
            <h1>Gestión de Equipos</h1>
            <p>Base de datos de equipos para mantenimiento preventivo y correctivo.</p>

            <div className="dashboard-cards">
                <div className="card"><strong>Total Equipos</strong><span>{equipos.length}</span></div>
                <div className="card"><strong>Activos</strong><span>{activos}</span></div>
                <div className="card"><strong>En Mantenimiento</strong><span>{enMantenimiento}</span></div>
            </div>

            <section className="form-section">
                <h2>{editingId ? 'Editar Equipo' : 'Registrar Nuevo Equipo'}</h2>
                <form onSubmit={handleSubmit} className="simple-form">
                    <label>Código:<input name="codigo" value={form.codigo} onChange={handleChange} required /></label>
                    <label>Nombre:<input name="nombre" value={form.nombre} onChange={handleChange} required /></label>
                    <label>Descripción:<textarea name="descripcion" value={form.descripcion} onChange={handleChange}></textarea></label>
                    <label>Ubicación:<input name="ubicacion" value={form.ubicacion} onChange={handleChange} /></label>
                    <label>Tipo:<input name="tipo" value={form.tipo} onChange={handleChange} /></label>
                    <label>Fecha instalación:<input name="fecha_instalacion" type="date" value={form.fecha_instalacion} onChange={handleChange} /></label>
                    <label>Proveedor:<input name="proveedor" value={form.proveedor} onChange={handleChange} /></label>
                    <label>Estado:<select name="estado" value={form.estado} onChange={handleChange}><option value="activo">Activo</option><option value="inactivo">Inactivo</option><option value="mantenimiento">En Mantenimiento</option></select></label>
                    <button type="submit">{editingId ? 'Actualizar' : 'Guardar'} equipo</button>
                    {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ codigo: '', nombre: '', descripcion: '', ubicacion: '', tipo: '', fecha_instalacion: '', proveedor: '', estado: 'activo' }); }}>Limpiar formulario</button>}
                </form>
            </section>

            <section>
                <h2>Listado de Equipos</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Tipo</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th>Instalación</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipos.map((e) => (
                            <tr key={e.id}>
                                <td>{e.id}</td>
                                <td>{e.codigo}</td>
                                <td>{e.nombre}</td>
                                <td>{e.tipo}</td>
                                <td>{e.ubicacion}</td>
                                <td>{e.estado}</td>
                                <td>{e.fecha_instalacion || '-'}</td>
                                <td>
                                    <button onClick={() => handleEdit(e)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Editar</button>
                                    <button onClick={() => handleDelete(e.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default Equipos;
