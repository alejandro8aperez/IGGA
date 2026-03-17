import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, Save, Send, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/';

function Facturacion() {
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [resolucion, setResolucion] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [showNewForm, setShowNewForm] = useState(false);
    const [formData, setFormData] = useState({
        cliente: '',
        fecha_vencimiento: new Date().toISOString().split('T')[0],
        observaciones: '',
        retefuente_pct: 0,
        reteica_pct: 0,
        detalles: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resFacturas, resClientes, resProd, resRes] = await Promise.all([
                axios.get(`${API_BASE}facturacion/facturas/`),
                axios.get(`${API_BASE}crm/clientes/`),
                axios.get(`${API_BASE}inventarios/productos/`),
                axios.get(`${API_BASE}facturacion/resoluciones/`)
            ]);
            setFacturas(resFacturas.data);
            setClientes(resClientes.data);
            setProductos(resProd.data);
            if (resRes.data.length > 0) {
                setResolucion(resRes.data.find(r => r.activa) || resRes.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const handleAddDetalle = () => {
        setFormData({
            ...formData,
            detalles: [...formData.detalles, { producto: '', cantidad: 1, precio_unitario: 0, porcentaje_iva: 19 }]
        });
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index][field] = value;

        if (field === 'producto') {
            const prod = productos.find(p => p.id === parseInt(value));
            if (prod) {
                newDetalles[index].precio_unitario = prod.precio_venta;
            }
        }

        setFormData({ ...formData, detalles: newDetalles });
    };

    const handleRemoveDetalle = (index) => {
        const newDetalles = [...formData.detalles];
        newDetalles.splice(index, 1);
        setFormData({ ...formData, detalles: newDetalles });
    };

    // Cálculos en vivo
    const subtotalCalc = formData.detalles.reduce((acc, d) => acc + (d.cantidad * d.precio_unitario), 0);
    const ivaCalc = formData.detalles.reduce((acc, d) => acc + ((d.cantidad * d.precio_unitario) * (d.porcentaje_iva / 100)), 0);
    const retefuenteCalc = subtotalCalc * (formData.retefuente_pct / 100);
    const reteicaCalc = subtotalCalc * (formData.reteica_pct / 100);
    const totalCalc = subtotalCalc + ivaCalc - retefuenteCalc - reteicaCalc;

    const saveBorrador = async () => {
        if (!formData.cliente || formData.detalles.length === 0) {
            alert('Debe seleccionar cliente y al menos un producto.');
            return;
        }

        try {
            await axios.post(`${API_BASE}facturacion/facturas/`, formData);
            setShowNewForm(false);
            setFormData({
                cliente: '', fecha_vencimiento: new Date().toISOString().split('T')[0],
                observaciones: '', retefuente_pct: 0, reteica_pct: 0, detalles: []
            });
            fetchData();
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error al guardar el borrador.');
        }
    };

    const emitirFactura = async (id) => {
        if (window.confirm('¿Desea emitir esta factura a la DIAN? Esta acción descontará inventario y generará el CUFE.')) {
            try {
                await axios.post(`${API_BASE}facturacion/facturas/${id}/emitir/`);
                alert('Factura emitida exitosamente.');
                fetchData();
            } catch (error) {
                console.error('Error emiting invoice:', error);
                alert(error.response?.data?.error || 'Error al emitir factura');
            }
        }
    };

    const createResolution = async () => {
        try {
            await axios.post(`${API_BASE}facturacion/resoluciones/`, {
                prefijo: 'FE', numero_inicial: 1, numero_final: 10000, numero_actual: 1,
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="container"><div className="spinner"></div></div>;

    return (
        <div className="container">
            <div className="header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="header-title">Facturación Electrónica</h1>
                    <p className="header-subtitle">Emisión y control de facturas integradas a la DIAN (Colombia)</p>
                </div>
                {!showNewForm && (
                    <button className="btn btn-primary" onClick={() => setShowNewForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Nueva Factura
                    </button>
                )}
            </div>

            {!resolucion && (
                <div className="glass-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--warning)' }}>
                    <h3>Atención</h3>
                    <p>No existe una resolución de facturación activa. Necesitas crear una para poder emitir.</p>
                    <button className="btn btn-primary" onClick={createResolution} style={{ marginTop: '1rem' }}>Crear Resolución de Prueba</button>
                </div>
            )}

            {showNewForm ? (
                <div className="glass-card slide-down">
                    <h2 className="section-title">Nueva Factura de Venta</h2>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="form-label">Cliente</label>
                            <select className="form-control" value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })}>
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.identificacion})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Fecha Vencimiento</label>
                            <input type="date" className="form-control" value={formData.fecha_vencimiento} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} />
                        </div>
                    </div>

                    <h3 className="section-title" style={{ fontSize: '1.2rem', marginTop: '2rem' }}>Detalle de Productos</h3>
                    <div className="table-container" style={{ marginBottom: '1rem' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>IVA %</th>
                                    <th>Subtotal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.detalles.map((det, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select className="form-control" value={det.producto} onChange={e => handleDetalleChange(index, 'producto', e.target.value)}>
                                                <option value="">Seleccione...</option>
                                                {productos.filter(p => p.stock_actual > 0).map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock_actual})</option>)}
                                            </select>
                                        </td>
                                        <td><input type="number" min="1" className="form-control" value={det.cantidad} onChange={e => handleDetalleChange(index, 'cantidad', parseFloat(e.target.value))} /></td>
                                        <td><input type="number" className="form-control" value={det.precio_unitario} onChange={e => handleDetalleChange(index, 'precio_unitario', parseFloat(e.target.value))} /></td>
                                        <td>
                                            <select className="form-control" value={det.porcentaje_iva} onChange={e => handleDetalleChange(index, 'porcentaje_iva', parseFloat(e.target.value))}>
                                                <option value="19">19%</option>
                                                <option value="5">5%</option>
                                                <option value="0">0%</option>
                                            </select>
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>${((det.cantidad || 0) * (det.precio_unitario || 0)).toLocaleString()}</td>
                                        <td>
                                            <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveDetalle(index)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn" onClick={handleAddDetalle} style={{ marginTop: '1rem', background: 'transparent', border: '1px dashed var(--border)' }}>+ Agregar Producto</button>
                    </div>

                    {/* Impuestos COL */}
                    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 300px)', gap: '2rem', marginTop: '2rem' }}>
                        <div>
                            <label className="form-label">Retenciones Aplicables (%)</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div><small>Retefuente(%)</small><input type="number" step="0.1" className="form-control" value={formData.retefuente_pct} onChange={e => setFormData({ ...formData, retefuente_pct: parseFloat(e.target.value) || 0 })} /></div>
                                <div><small>ReteICA(%)</small><input type="number" step="0.001" className="form-control" value={formData.reteica_pct} onChange={e => setFormData({ ...formData, reteica_pct: parseFloat(e.target.value) || 0 })} /></div>
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <label className="form-label">Observaciones (Opcional)</label>
                                <textarea className="form-control" value={formData.observaciones} onChange={e => setFormData({ ...formData, observaciones: e.target.value })}></textarea>
                            </div>
                        </div>

                        {/* Totales */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Resumen Totales</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Subtotal:</span> <span>${subtotalCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>IVA:</span> <span>${ivaCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--danger)' }}><span>Retefuente:</span> <span>-${retefuenteCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--danger)' }}><span>ReteICA:</span> <span>-${reteicaCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.25rem', borderTop: '2px dashed var(--border)', paddingTop: '0.5rem' }}>
                                <span>Total a Pagar:</span> <span>${totalCalc.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button className="btn" onClick={() => setShowNewForm(false)} style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                        <button className="btn btn-primary" onClick={saveBorrador} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} /> Guardar Borrador</button>
                    </div>
                </div>
            ) : (
                <div className="glass-card">
                    <h2 className="section-title">Historial de Facturación</h2>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Factura No.</th>
                                    <th>Cliente</th>
                                    <th>RUC/NIT</th>
                                    <th>Emisión</th>
                                    <th>Total</th>
                                    <th>Estado DIAN</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturas.map(f => (
                                    <tr key={f.id}>
                                        <td style={{ fontWeight: '600' }}>{f.numero_factura || `Borrador #${f.id}`}</td>
                                        <td>{f.cliente_nombre}</td>
                                        <td>{f.cliente_ruc}</td>
                                        <td>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: '600' }}>${Number(f.total).toLocaleString()}</td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '500',
                                                backgroundColor: f.estado_dian === 'validada' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                                color: f.estado_dian === 'validada' ? 'var(--success)' : 'var(--warning)'
                                            }}>
                                                {f.estado_dian.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            {f.estado_dian === 'borrador' ? (
                                                <button className="btn btn-primary" onClick={() => emitirFactura(f.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Send size={14} /> Emitir DIAN
                                                </button>
                                            ) : (
                                                <span title={`CUFE: ${f.cufe}`} style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}><CheckCircle size={14} /> Firmada</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {facturas.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center' }}>No existen facturas en el sistema.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Facturacion;
