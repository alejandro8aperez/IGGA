import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { 
    Factory, Wrench, Plus, CheckCircle, Play, AlertCircle, Save, Trash2, 
    BookOpen, X, Search, Filter, Package, Clock, DollarSign,
    Edit3, LayoutDashboard, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';

const API_BASE = API.PRODUCCION.RECETAS.replace('produccion/recetas/', '');

const styles = {
    container: { 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif'
    },
    header: {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#1a202c',
        margin: '0 0 0.5rem 0'
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#718096',
        margin: 0
    },
    btnPrimary: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    btnSuccess: {
        background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 15px rgba(72, 187, 120, 0.3)',
        transition: 'all 0.2s'
    },
    tabsContainer: {
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    },
    tab: (active) => ({
        background: 'none',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 600,
        color: active ? '#667eea' : '#718096',
        backgroundColor: active ? '#f0f4ff' : 'transparent',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    }),
    statsGrid: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem'
    },
    statCard: (color) => ({
        background: color,
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        minWidth: '160px'
    }),
    searchFilter: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
    },
    searchInput: {
        flex: 1,
        minWidth: '300px',
        padding: '0.75rem 1rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        background: 'white'
    },
    tableContainer: {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#64748b',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
    },
    td: {
        padding: '1rem',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '0.9rem',
        color: '#334155'
    },
    badge: (estado) => ({
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: estado === 'completado' ? '#d1fae5' : 
                   estado === 'en_progreso' ? '#fef3c7' : 
                   estado === 'planificado' ? '#dbeafe' : '#e2e8f0',
        color: estado === 'completado' ? '#065f46' : 
              estado === 'en_progreso' ? '#92400e' : 
              estado === 'planificado' ? '#1e40af' : '#64748b'
    }),
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
    },
    modal: {
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
    },
    modalHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '16px 16px 0 0'
    },
    btnIcon: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '6px',
        color: '#64748b',
        transition: 'all 0.2s'
    },
    btnIconDanger: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '6px',
        color: '#64748b',
        transition: 'all 0.2s'
    },
    formGroup: {
        marginBottom: '1.25rem'
    },
    formLabel: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#374151',
        marginBottom: '0.5rem'
    },
    formInput: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none'
    },
    formSelect: {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '0.9rem',
        outline: 'none',
        background: 'white'
    }
};

function Produccion() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ordenes');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [productos, setProductos] = useState([]);
    const [recetas, setRecetas] = useState([]);
    const [ordenes, setOrdenes] = useState([]);
    const [instructivos, setInstructivos] = useState([]);

    const [showNewRecetaForm, setShowNewRecetaForm] = useState(false);
    const [showNewOrdenForm, setShowNewOrdenForm] = useState(false);

    const [recetaForm, setRecetaForm] = useState({
        producto_terminado: '',
        tiempo_estimado_horas: 0,
        costo_adicional_fijo: 0,
        instrucciones: '',
        insumos: [],
        instructivos_sgc: []
    });

    const [ordenForm, setOrdenForm] = useState({
        receta: '',
        cantidad_a_producir: 1,
        fecha_planeada_inicio: new Date().toISOString().split('T')[0],
        fecha_planeada_fin: '',
        observaciones: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resProd, resRec, resOrd, resDocs] = await Promise.allSettled([
                axiosInstance.get(`${API_BASE}inventarios/productos/`),
                axiosInstance.get(`${API_BASE}produccion/recetas/`),
                axiosInstance.get(`${API_BASE}produccion/ordenes/`),
                axiosInstance.get(`${API_BASE}calidad/documentos-iso/`)
            ]);

            if (resProd.status === 'fulfilled') setProductos(resProd.value.data);
            if (resRec.status === 'fulfilled') setRecetas(resRec.value.data);
            if (resOrd.status === 'fulfilled') setOrdenes(resOrd.value.data);
            if (resDocs.status === 'fulfilled') {
                setInstructivos(resDocs.value.data.filter(d => d.categoria === '3_instructivo'));
            }

            // Solo mostrar error si los endpoints principales de producción fallaron
            if (resRec.status === 'rejected' && resOrd.status === 'rejected') {
                setError('No se pudo conectar con el servidor de producción. Verifica que el backend esté activo.');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error inesperado al cargar datos de producción');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrdenes = ordenes.filter(o => {
        const search = searchTerm.toLowerCase();
        return (o.producto_nombre || '').toLowerCase().includes(search) ||
               (o.id || '').toString().includes(search);
    });

    const filteredRecetas = recetas.filter(r => {
        const search = searchTerm.toLowerCase();
        return (r.producto_nombre || '').toLowerCase().includes(search);
    });

    const handleAddInsumo = () => {
        setRecetaForm({
            ...recetaForm,
            insumos: [...recetaForm.insumos, { producto_materia_prima: '', cantidad_requerida: 1 }]
        });
    };

    const handleRemoveInsumo = (index) => {
        const newInsumos = recetaForm.insumos.filter((_, i) => i !== index);
        setRecetaForm({ ...recetaForm, insumos: newInsumos });
    };

    const saveReceta = async () => {
        if (!recetaForm.producto_terminado || recetaForm.insumos.length === 0) {
            alert('Debe especificar un producto final y al menos un insumo.');
            return;
        }
        try {
            const res = await axiosInstance.post(`${API_BASE}produccion/recetas/`, {
                producto_terminado: recetaForm.producto_terminado,
                tiempo_estimado_horas: recetaForm.tiempo_estimado_horas,
                costo_adicional_fijo: recetaForm.costo_adicional_fijo,
                instrucciones: recetaForm.instrucciones,
                instructivos_sgc: recetaForm.instructivos_sgc
            });
            const recetaId = res.data.id;
            for (let insumo of recetaForm.insumos) {
                await axiosInstance.post(`${API_BASE}produccion/insumos/`, {
                    receta: recetaId,
                    producto_materia_prima: insumo.producto_materia_prima,
                    cantidad_requerida: insumo.cantidad_requerida
                });
            }
            fetchData();
            setShowNewRecetaForm(false);
            setRecetaForm({
                producto_terminado: '',
                tiempo_estimado_horas: 0,
                costo_adicional_fijo: 0,
                instrucciones: '',
                insumos: [],
                instructivos_sgc: []
            });
            alert('Receta guardada exitosamente');
        } catch (error) {
            console.error('Error saving receta:', error);
            alert('Error al guardar la receta');
        }
    };

    const saveOrden = async () => {
        if (!ordenForm.receta) {
            alert('Debe seleccionar una receta.');
            return;
        }
        try {
            await axiosInstance.post(`${API_BASE}produccion/ordenes/`, ordenForm);
            fetchData();
            setShowNewOrdenForm(false);
            setOrdenForm({
                receta: '',
                cantidad_a_producir: 1,
                fecha_planeada_inicio: new Date().toISOString().split('T')[0],
                fecha_planeada_fin: '',
            });
            alert('Orden de producción creada exitosamente');
        } catch (error) {
            console.error('Error saving orden:', error);
            alert('Error al crear la orden');
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
                    <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>Cargando Producción...</div>
                </div>
                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Producción</h1>
                    <p style={styles.subtitle}>Gestión de Recetas y Órdenes de Manufactura</p>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    style={styles.btnPrimary}
                >
                    <X size={18} />
                    Volver al Inicio
                </button>
            </div>

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
                    <button onClick={() => setError(null)} style={{ background: '#e53e3e', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                        Cerrar
                    </button>
                </div>
            )}

            <div style={styles.tabsContainer}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <button onClick={() => setActiveTab('ordenes')} style={styles.tab(activeTab === 'ordenes')}>
                        <Factory size={18} />
                        Órdenes de Producción
                    </button>
                    <button onClick={() => setActiveTab('recetas')} style={styles.tab(activeTab === 'recetas')}>
                        <BookOpen size={18} />
                        Recetas (BOM)
                    </button>
                </div>

                <div style={styles.statsGrid}>
                    <div style={styles.statCard('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')}>
                        <Package size={24} />
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{ordenes.length}</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Órdenes</div>
                        </div>
                    </div>
                    <div style={styles.statCard('linear-gradient(135deg, #48bb78 0%, #38a169 100%)')}>
                        <BookOpen size={24} />
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{recetas.length}</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Recetas</div>
                        </div>
                    </div>
                    <div style={styles.statCard('linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)')}>
                        <Wrench size={24} />
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{productos.length}</div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Productos</div>
                        </div>
                    </div>
                </div>

                <div style={styles.searchFilter}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type='text'
                            placeholder={`Buscar ${activeTab === 'ordenes' ? 'órdenes' : 'recetas'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{...styles.searchInput, paddingLeft: '2.5rem'}}
                        />
                    </div>
                    <button onClick={() => activeTab === 'ordenes' ? setShowNewOrdenForm(true) : setShowNewRecetaForm(true)} style={styles.btnSuccess}>
                        <Plus size={18} />
                        {activeTab === 'ordenes' ? 'Nueva Orden' : 'Nueva Receta'}
                    </button>
                </div>

                {activeTab === 'ordenes' ? (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Cantidad</th>
                                    <th style={styles.th}>Fecha Inicio</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrdenes.map((orden) => (
                                    <tr key={orden.id}>
                                        <td style={styles.td}><strong style={{ color: '#667eea' }}>#{orden.id}</strong></td>
                                        <td style={styles.td}>{orden.producto_nombre || 'N/A'}</td>
                                        <td style={styles.td}>{orden.cantidad_a_producir}</td>
                                        <td style={styles.td}>{orden.fecha_planeada_inicio}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(orden.estado)}>{orden.estado}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <button style={styles.btnIcon}><Play size={18} /></button>
                                            <button style={styles.btnIconDanger}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Producto</th>
                                    <th style={styles.th}>Tiempo Est.</th>
                                    <th style={styles.th}>Insumos</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRecetas.map((receta) => (
                                    <tr key={receta.id}>
                                        <td style={styles.td}><strong style={{ color: '#667eea' }}>#{receta.id}</strong></td>
                                        <td style={styles.td}>{receta.producto_nombre || 'N/A'}</td>
                                        <td style={styles.td}>{receta.tiempo_estimado_horas} hrs</td>
                                        <td style={styles.td}>{receta.insumos?.length || 0} items</td>
                                        <td style={styles.td}>
                                            <button style={styles.btnIcon}><Edit3 size={18} /></button>
                                            <button style={styles.btnIconDanger}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showNewRecetaForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BookOpen size={20} />
                                Nueva Receta (BOM)
                            </h2>
                            <button onClick={() => setShowNewRecetaForm(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Producto Final</label>
                                <select style={styles.formSelect} value={recetaForm.producto_terminado} onChange={e => setRecetaForm({...recetaForm, producto_terminado: e.target.value})}>
                                    <option value=''>Seleccione...</option>
                                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Tiempo Estimado (hrs)</label>
                                    <input type='number' step='0.5' style={styles.formInput} value={recetaForm.tiempo_estimado_horas} onChange={e => setRecetaForm({...recetaForm, tiempo_estimado_horas: e.target.value})} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Costo Extra ($)</label>
                                    <input type='number' style={styles.formInput} value={recetaForm.costo_adicional_fijo} onChange={e => setRecetaForm({...recetaForm, costo_adicional_fijo: e.target.value})} />
                                </div>
                            </div>
                            <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Materias Primas</h3>
                            {recetaForm.insumos.map((ins, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <select style={{...styles.formSelect, flex: 2}} value={ins.producto_materia_prima} onChange={e => { const newInsumos = [...recetaForm.insumos]; newInsumos[idx].producto_materia_prima = e.target.value; setRecetaForm({...recetaForm, insumos: newInsumos}); }}>
                                        <option value=''>Seleccione...</option>
                                        {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                    <input type='number' step='0.01' style={{...styles.formInput, flex: 1}} placeholder='Cantidad' value={ins.cantidad_requerida} onChange={e => { const newInsumos = [...recetaForm.insumos]; newInsumos[idx].cantidad_requerida = e.target.value; setRecetaForm({...recetaForm, insumos: newInsumos}); }} />
                                    <button onClick={() => handleRemoveInsumo(idx)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={handleAddInsumo} style={{ background: '#f0f4ff', border: '1px dashed #667eea', color: '#667eea', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', width: '100%', marginBottom: '1.5rem' }}>
                                <Plus size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
                                Agregar Insumo
                            </button>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setShowNewRecetaForm(false)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                                <button onClick={saveReceta} style={styles.btnSuccess}>
                                    <Save size={18} style={{ marginRight: '0.5rem' }} />
                                    Guardar Receta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showNewOrdenForm && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <div style={styles.modalHeader}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Factory size={20} />
                                Nueva Orden de Producción
                            </h2>
                            <button onClick={() => setShowNewOrdenForm(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Receta (Producto a Fabricar)</label>
                                <select style={styles.formSelect} value={ordenForm.receta} onChange={e => setOrdenForm({...ordenForm, receta: e.target.value})}>
                                    <option value=''>Seleccione una receta...</option>
                                    {recetas.map(r => <option key={r.id} value={r.id}>{r.producto_nombre}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Cantidad a Producir</label>
                                    <input type='number' style={styles.formInput} value={ordenForm.cantidad_a_producir} onChange={e => setOrdenForm({...ordenForm, cantidad_a_producir: e.target.value})} />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.formLabel}>Fecha de Inicio</label>
                                    <input type='date' style={styles.formInput} value={ordenForm.fecha_planeada_inicio} onChange={e => setOrdenForm({...ordenForm, fecha_planeada_inicio: e.target.value})} />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Fecha Fin Estimada</label>
                                <input type='date' style={styles.formInput} value={ordenForm.fecha_planeada_fin} onChange={e => setOrdenForm({...ordenForm, fecha_planeada_fin: e.target.value})} />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Observaciones</label>
                                <textarea style={{...styles.formInput, minHeight: '80px'}} rows='3' value={ordenForm.observaciones} onChange={e => setOrdenForm({...ordenForm, observaciones: e.target.value})} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button onClick={() => setShowNewOrdenForm(false)} style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                                <button onClick={saveOrden} style={styles.btnSuccess}>
                                    <Play size={18} style={{ marginRight: '0.5rem' }} />
                                    Lanzar Orden
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Produccion;
