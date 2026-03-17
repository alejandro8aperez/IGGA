import { useState, useEffect } from 'react';
import axios from 'axios';
import { Factory, Wrench, Plus, CheckCircle, Play, AlertCircle, Save, Trash2 } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/';

function Produccion() {
    const [activeTab, setActiveTab] = useState('ordenes'); // 'ordenes' | 'recetas'
    const [loading, setLoading] = useState(true);

    // Data states
    const [productos, setProductos] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);

    // Forms state
    const [showNewRecetaForm, setShowNewRecetaForm] = useState(false);
    const [showNewOrdenForm, setShowNewOrdenForm] = useState(false);

    const [recetaForm, setRecetaForm] = useState({
        producto_terminado: '',
        tiempo_estimado_horas: 0,
        costo_adicional_fijo: 0,
        instrucciones: '',
        insumos: []
    });

    const [ordenForm, setOrdenForm] = useState({
        receta: '',
        cantidad_a_producir: 1,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin_estimada: '',
        observaciones: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resProd, resRec, resOrd] = await Promise.all([
                axios.get(`${API_BASE}inventarios/productos/`),
                axios.get(`${API_BASE}produccion/recetas/`),
                axios.get(`${API_BASE}produccion/ordenes/`)
            ]);
            setProductos(resProd.data);
            setRecetas(resRec.data);
            setOrdenes(resOrd.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    // --- Lógica para Recetas ---
    const handleAddInsumo = () => {
        setRecetaForm({
            ...recetaForm,
            insumos: [...recetaForm.insumos, { producto_materia_prima: '', cantidad_requerida: 1 }]
        });
    };

    const handleInsumoChange = (index, field, value) => {
        const nuevosInsumos = [...recetaForm.insumos];
        nuevosInsumos[index][field] = value;
        setRecetaForm({ ...recetaForm, insumos: nuevosInsumos });
    };

    const handleRemoveInsumo = (index) => {
        const nuevosInsumos = [...recetaForm.insumos];
        nuevosInsumos.splice(index, 1);
        setRecetaForm({ ...recetaForm, insumos: nuevosInsumos });
    };

    const saveReceta = async () => {
        if (!recetaForm.producto_terminado || recetaForm.insumos.length === 0) {
            alert('Debe especificar un producto final y al menos un insumo.');
            return;
        }

        try {
            // Pasamos los datos al backend donde Nested Serializer si estuviera habilitado los crea de una,
            // O podemos crearlos en bucle si es mas simple. Por ahora mandamos el POST base.
            // (Para este MVP, asegurémonos que el django rest framework soporte creación anidada o hacemos post a insumos por separado)
            const res = await axios.post(`${API_BASE}produccion/recetas/`, {
                producto_terminado: recetaForm.producto_terminado,
                tiempo_estimado_horas: recetaForm.tiempo_estimado_horas,
                costo_adicional_fijo: recetaForm.costo_adicional_fijo,
                instrucciones: recetaForm.instrucciones
            });

            const recetaId = res.data.id;

            // Creamos los insumos uno a uno
            for (let insumo of recetaForm.insumos) {
                await axios.post(`${API_BASE}produccion/insumos/`, {
                    receta: recetaId,
                    producto_materia_prima: insumo.producto_materia_prima,
                    cantidad_requerida: insumo.cantidad_requerida
                });
            }

            alert('Receta creada existosamente.');
            setShowNewRecetaForm(false);
            setRecetaForm({ producto_terminado: '', tiempo_estimado_horas: 0, costo_adicional_fijo: 0, instrucciones: '', insumos: [] });
            fetchData();
        } catch (error) {
            console.error("Error al guardar receta", error);
            alert('Asegúrese que un producto no tenga ya una receta creada (es 1 a 1).');
        }
    };

    // --- Lógica para Ordenes ---
    const saveOrden = async () => {
        try {
            await axios.post(`${API_BASE}produccion/ordenes/`, ordenForm);
            setShowNewOrdenForm(false);
            setOrdenForm({ receta: '', cantidad_a_producir: 1, fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin_estimada: '', observaciones: '' });
            fetchData();
        } catch (error) {
            console.error("Error al guardar orden", error);
            alert('Error al crear orden.');
        }
    };

    const actionOrden = async (id, actionType) => { // actionType: 'iniciar' o 'finalizar'
        const endpoint = `${API_BASE}produccion/ordenes/${id}/${actionType}/`;
        const msg = actionType === 'iniciar' ? '¿Iniciar producción? Esto descontará materias primas.' : '¿Finalizar orden? Esto aumentará el stock del producto terminado.';

        if (window.confirm(msg)) {
            try {
                await axios.post(endpoint);
                fetchData();
            } catch (error) {
                console.error(`Error al ${actionType} orden`, error);
                alert(error.response?.data?.error || `Error al ${actionType} orden`);
            }
        }
    };

    if (loading) return <div className="container"><div className="spinner"></div></div>;

    const productosSinReceta = productos.filter(p => !recetas.some(r => r.producto_terminado === p.id));

    return (
        <div className="container">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="header-title">Módulo de Producción (MRP)</h1>
                    <p className="header-subtitle">Control de Recetas BOM y Órdenes de Fabricación</p>
                </div>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <button
                    className={`btn ${activeTab === 'ordenes' ? 'btn-primary' : ''}`}
                    style={activeTab !== 'ordenes' ? { background: 'transparent', color: 'var(--text-primary)' } : {}}
                    onClick={() => setActiveTab('ordenes')}
                >
                    <Wrench size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} /> Órdenes de Producción
                </button>
                <button
                    className={`btn ${activeTab === 'recetas' ? 'btn-primary' : ''}`}
                    style={activeTab !== 'recetas' ? { background: 'transparent', color: 'var(--text-primary)' } : {}}
                    onClick={() => setActiveTab('recetas')}
                >
                    <Factory size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} /> Recetas / Lista de Materiales (BOM)
                </button>
            </div>


            {/* CONENIDO TABS */}
            {activeTab === 'recetas' && (
                <div>
                    {!showNewRecetaForm ? (
                        <>
                            <button className="btn btn-primary" onClick={() => setShowNewRecetaForm(true)} style={{ marginBottom: '1.5rem' }}><Plus size={18} /> Nueva Receta (BOM)</button>
                            <div className="grid">
                                {recetas.map(rec => (
                                    <div key={rec.id} className="glass-card">
                                        <h3>{rec.producto_nombre}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiempo Estimado: {rec.tiempo_estimado_horas}h | Costo Fijo Adicional: ${Number(rec.costo_adicional_fijo).toLocaleString()}</p>
                                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
                                        <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Insumos requeridos (x1 unidad):</h4>
                                        <ul style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                                            {rec.insumos && rec.insumos.map(ins => (
                                                <li key={ins.id}><b>{ins.cantidad_requerida}x</b> {ins.producto_nombre}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {recetas.length === 0 && <p>No existen recetas configuradas.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="glass-card slide-down">
                            <h2>Diseñador de Receta (BOM)</h2>
                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                <div>
                                    <label className="form-label">Producto Final a Fabricar</label>
                                    <select className="form-control" value={recetaForm.producto_terminado} onChange={e => setRecetaForm({ ...recetaForm, producto_terminado: e.target.value })}>
                                        <option value="">Seleccione...</option>
                                        {productosSinReceta.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="form-label">Tiempo Est. (Hrs)</label>
                                        <input type="number" step="0.5" className="form-control" value={recetaForm.tiempo_estimado_horas} onChange={e => setRecetaForm({ ...recetaForm, tiempo_estimado_horas: e.target.value })} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="form-label">Costo Extra Fijo ($)</label>
                                        <input type="number" className="form-control" value={recetaForm.costo_adicional_fijo} onChange={e => setRecetaForm({ ...recetaForm, costo_adicional_fijo: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Materias Primas / Insumos</h3>
                            <table className="table" style={{ marginBottom: '1rem' }}>
                                <thead>
                                    <tr>
                                        <th>Materia Prima</th>
                                        <th>Cantidad Requerida (para 1 unidad)</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recetaForm.insumos.map((ins, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                <select className="form-control" value={ins.producto_materia_prima} onChange={e => handleInsumoChange(idx, 'producto_materia_prima', e.target.value)}>
                                                    <option value="">Seleccione insumo...</option>
                                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" step="0.1" className="form-control" value={ins.cantidad_requerida} onChange={e => handleInsumoChange(idx, 'cantidad_requerida', e.target.value)} />
                                            </td>
                                            <td>
                                                <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveInsumo(idx)}><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button className="btn" style={{ background: 'transparent', border: '1px dashed var(--border)', width: '100%', marginBottom: '2rem' }} onClick={handleAddInsumo}>+ Agregar Insumo a la Receta</button>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="btn" onClick={() => setShowNewRecetaForm(false)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                                <button className="btn btn-primary" onClick={saveReceta}><Save size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} /> Guardar Receta</button>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {activeTab === 'ordenes' && (
                <div>
                    {!showNewOrdenForm ? (
                        <>
                            <button className="btn btn-primary" onClick={() => setShowNewOrdenForm(true)} style={{ marginBottom: '1.5rem' }}><Plus size={18} /> Lanzar Orden de Producción</button>

                            <div className="table-container glass-card">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID Orden</th>
                                            <th>Producto a Evaluar</th>
                                            <th>Cantidad</th>
                                            <th>Fecha Inicio</th>
                                            <th>Estado</th>
                                            <th>Acciones Operativas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ordenes.map(ord => (
                                            <tr key={ord.id}>
                                                <td style={{ fontWeight: 'bold' }}>ORD-{ord.id}</td>
                                                <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{ord.producto_nombre}</td>
                                                <td>{ord.cantidad_a_producir} Unds.</td>
                                                <td>{ord.fecha_inicio}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                                        backgroundColor: ord.estado === 'planeada' ? 'rgba(75, 85, 99, 0.2)' :
                                                            ord.estado === 'en_proceso' ? 'rgba(59, 130, 246, 0.2)' :
                                                                'rgba(16, 185, 129, 0.2)',
                                                        color: ord.estado === 'planeada' ? '#6B7280' :
                                                            ord.estado === 'en_proceso' ? '#3B82F6' :
                                                                '#10B981'
                                                    }}>
                                                        {ord.estado.toUpperCase().replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    {ord.estado === 'planeada' && (
                                                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => actionOrden(ord.id, 'iniciar')}>
                                                            <Play size={14} /> Iniciar
                                                        </button>
                                                    )}
                                                    {ord.estado === 'en_proceso' && (
                                                        <button className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => actionOrden(ord.id, 'finalizar')}>
                                                            <CheckCircle size={14} /> Finalizar
                                                        </button>
                                                    )}
                                                    {ord.estado === 'terminada' && (
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completada</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {ordenes.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No hay órdenes en cola.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="glass-card slide-down" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h2>Lanzar Orden de Producción</h2>
                            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Receta a Utilizar</label>
                                    <select className="form-control" value={ordenForm.receta} onChange={e => setOrdenForm({ ...ordenForm, receta: e.target.value })}>
                                        <option value="">Seleccione Receta...</option>
                                        {recetas.map(r => <option key={r.id} value={r.id}>{r.producto_nombre}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Cantidad a Fabricar (Unidades)</label>
                                    <input type="number" min="1" className="form-control" value={ordenForm.cantidad_a_producir} onChange={e => setOrdenForm({ ...ordenForm, cantidad_a_producir: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="form-label">Fecha Inicio</label>
                                        <input type="date" className="form-control" value={ordenForm.fecha_inicio} onChange={e => setOrdenForm({ ...ordenForm, fecha_inicio: e.target.value })} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="form-label">Fecha Fin Esperada</label>
                                        <input type="date" className="form-control" value={ordenForm.fecha_fin_estimada} onChange={e => setOrdenForm({ ...ordenForm, fecha_fin_estimada: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Comentarios / Observaciones</label>
                                    <textarea className="form-control" value={ordenForm.observaciones} onChange={e => setOrdenForm({ ...ordenForm, observaciones: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button className="btn" onClick={() => setShowNewOrdenForm(false)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                                <button className="btn btn-primary" onClick={saveOrden}>Crear Orden Planeada</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Produccion;
