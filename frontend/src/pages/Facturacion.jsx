import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { 
    FileText, Plus, Save, Send, Trash2, Edit3, CheckCircle, AlertCircle, 
    ArrowLeft, Search, Filter, Download, X, TrendingUp, DollarSign,
    Calendar, User, Package, CreditCard, Receipt, ShieldCheck, Globe,
    RefreshCw, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../config/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_FE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/facturacion-electronica';

function Facturacion() {
    const navigate = useNavigate();
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [resolucion, setResolucion] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentFacturaId, setCurrentFacturaId] = useState(null);
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
        setLoading(true);
        setError(null);
        try {
            const [resFacturas, resClientes, resProd, resRes] = await Promise.all([
                axiosInstance.get(API.FACTURACION.FACTURAS),
                axiosInstance.get(API.CRM.CLIENTES),
                axiosInstance.get(API.INVENTARIOS.PRODUCTOS),
                axiosInstance.get(API.FACTURACION.RESOLUCIONES)
            ]);
            setFacturas(resFacturas.data);
            setClientes(resClientes.data);
            setProductos(resProd.data);
            if (resRes.data.length > 0) {
                setResolucion(resRes.data.find(r => r.activa) || resRes.data[0]);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error al cargar datos de facturación.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDetalle = () => {
        setFormData({
            ...formData,
            detalles: [...formData.detalles, { producto: '', unidad: 'UND', cantidad: 1, precio_unitario: 0, porcentaje_iva: 19 }]
        });
    };

    const handleDetalleChange = (index, field, value) => {
        const newDetalles = [...formData.detalles];
        newDetalles[index][field] = value;

        if (field === 'producto') {
            const prod = productos.find(p => p.id === parseInt(value));
            if (prod) {
                newDetalles[index].precio_unitario = prod.precio_venta;
                // Auto-cargar la unidad de medida del inventario
                newDetalles[index].unidad = prod.unidad_medida || 'UND';
            }
        }

        setFormData({ ...formData, detalles: newDetalles });
    };

    const handleRemoveDetalle = (index) => {
        const newDetalles = [...formData.detalles];
        newDetalles.splice(index, 1);
        setFormData({ ...formData, detalles: newDetalles });
    };

    const handleEdit = (factura) => {
        setFormData({
            cliente: factura.cliente || '',
            fecha_vencimiento: factura.fecha_vencimiento || new Date().toISOString().split('T')[0],
            observaciones: factura.observaciones || '',
            retefuente_pct: factura.retefuente_pct || 0,
            reteica_pct: factura.reteica_pct || 0,
            detalles: factura.detalles.map(d => ({
                producto: d.producto,
                unidad: d.unidad || 'UND',
                cantidad: d.cantidad,
                precio_unitario: d.precio_unitario,
                porcentaje_iva: d.porcentaje_iva || 19
            }))
        });
        setCurrentFacturaId(factura.id);
        setShowNewForm(true);
    };

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
            if (currentFacturaId) {
                await axiosInstance.put(`${API.FACTURACION.FACTURAS}${currentFacturaId}/`, formData);
            } else {
                await axiosInstance.post(API.FACTURACION.FACTURAS, formData);
            }
            setShowNewForm(false);
            setCurrentFacturaId(null);
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
        if (window.confirm('¿Desea emitir esta factura? Esta acción descontará inventario y generará el número de factura.')) {
            try {
                await axiosInstance.post(`${API.FACTURACION.FACTURAS}${id}/emitir/`);
                alert('Factura emitida exitosamente.');
                fetchData();
            } catch (error) {
                console.error('Error emiting invoice:', error);
                alert(error.response?.data?.error || 'Error al emitir factura');
            }
        }
    };

    const enviarADIAN = async (factura) => {
        if (window.confirm(`¿Enviar factura ${factura.numero_factura} a la DIAN via Facturatech?`)) {
            try {
                const xmlData = {
                    encabezado: {
                        tipo_operacion: '10',
                        tipo_documento: '01',
                        prefijo: factura.numero_factura?.split('-')[0] || '',
                        numero: factura.numero_factura?.split('-')[1] || '',
                        fecha_emision: factura.fecha_emision,
                        hora_emision: new Date().toISOString().split('T')[1].split('.')[0],
                        moneda: 'COP',
                        fecha_vencimiento: factura.fecha_vencimiento,
                        forma_pago: '1',
                        tipo_facturacion: '1',
                        ambiente: '2'
                    },
                    emisor: {
                        nit: factura.emisor_nit || '',
                        razon_social: factura.emisor_razon_social || '',
                    },
                    adquiriente: {
                        nit: factura.cliente_ruc || '',
                        razon_social: factura.cliente_nombre || '',
                    },
                    items: factura.detalles?.map(d => ({
                        cantidad: d.cantidad,
                        precio_unitario: d.precio_unitario,
                        descuento: 0,
                        cargo: 0,
                        impuestos: d.valor_iva || 0,
                        descripcion: d.producto_nombre
                    })) || [],
                    totales: {
                        subtotal: factura.subtotal,
                        iva: factura.iva,
                        total: factura.total
                    }
                };

                const xmlRes = await axiosInstance.post(`${API_FE}/generar-xml/`, xmlData);
                const xmlContent = xmlRes.data.xml;

                const envioRes = await axiosInstance.post(`${API_FE}/enviar/`, {
                    factura_id: factura.id,
                    factura_numero: factura.numero_factura,
                    xml_content: xmlContent,
                    tipo: 'ventas'
                });

                if (envioRes.data.exito) {
                    alert(`✅ Factura enviada exitosamente a la DIAN!\n\nCUFE: ${envioRes.data.cufe || 'Pendiente'}\nTrack ID: ${envioRes.data.track_id || 'Pendiente'}`);
                } else {
                    alert(`⚠️ Factura enviada pero con advertencias:\n${envioRes.data.mensaje || envioRes.data.error || 'Verifique el estado en el módulo de Facturación Electrónica'}`);
                }
                
                fetchData();
            } catch (error) {
                console.error('Error enviando a DIAN:', error);
                alert(`❌ Error enviando a DIAN:\n${error.response?.data?.error || error.message || 'Error desconocido'}`);
            }
        }
    };

    const deleteFactura = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta factura?')) {
            try {
                await axiosInstance.delete(`${API.FACTURACION.FACTURAS}${id}/`);
                fetchData();
            } catch (err) {
                console.error('Error al eliminar factura:', err);
                alert('No se pudo eliminar la factura.');
            }
        }
    };

    const exportToExcel = (factura = null) => {
        let dataToExport = [];
        
        if (factura) {
            // Header for Excel
            dataToExport.push({ 'Factura No': 'PANADERIA LA BOQUILLA', 'Cliente': '', 'Fecha': '', 'Producto': '', 'Cantidad': '', 'Precio Unit.': '', 'IVA %': '', 'Subtotal Item': '', 'Total Factura': '' });
            dataToExport.push({ 'Factura No': 'NIT: 79867452-4', 'Cliente': '', 'Fecha': '', 'Producto': '', 'Cantidad': '', 'Precio Unit.': '', 'IVA %': '', 'Subtotal Item': '', 'Total Factura': '' });
            dataToExport.push({}); // Empty row

            // Exportar UNA factura con sus detalles
            const items = factura.detalles.map(d => ({
                'Factura No': factura.numero_factura || `Borrador #${factura.id}`,
                'Cliente': factura.cliente_nombre,
                'Fecha': new Date(factura.fecha_emision).toLocaleDateString(),
                'Producto': d.producto_nombre || `ID: ${d.producto}`,
                'Cantidad': d.cantidad,
                'Precio Unit.': d.precio_unitario,
                'IVA %': d.porcentaje_iva,
                'Subtotal Item': d.subtotal || (d.cantidad * d.precio_unitario),
                'Total Factura': factura.total
            }));
            dataToExport = [...dataToExport, ...items];
        } else {
            // Exportar resumen de TODAS las facturas
            dataToExport = facturas.map(f => ({
                'Factura No': f.numero_factura || `Borrador #${f.id}`,
                'Cliente': f.cliente_nombre,
                'Emisión': new Date(f.fecha_emision).toLocaleDateString(),
                'Subtotal': f.subtotal,
                'IVA': f.iva_total,
                'Total': f.total,
                'Estado': f.estado_dian.toUpperCase()
            }));
        }

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Facturacion");
        XLSX.writeFile(wb, factura ? `Factura_${factura.numero_factura || factura.id}.xlsx` : `Reporte_Facturacion_${new Date().getTime()}.xlsx`);
    };

    const exportToPDF = (factura) => {
        if (!factura) return;
        try {
            const doc = new jsPDF();
            
            // Función para añadir el logo
            const addLogoAndHeader = () => {
                // Logo placeholder (circulo si no carga la imagen)
                doc.setFillColor(248, 250, 252);
                doc.circle(30, 25, 15, 'F');
                
                // Intentar cargar imagen real si existe
                const img = new Image();
                img.src = '/logo_boquilla.png';
                try {
                    doc.addImage(img, 'PNG', 15, 10, 30, 30);
                } catch(e) {
                    console.log("Logo no cargado, usando texto");
                }

                doc.setTextColor(30, 41, 59);
                doc.setFontSize(22);
                doc.setFont(undefined, 'bold');
                doc.text("PANADERÍA LA BOQUILLA", 50, 22);
                
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text("NIT: 79867452-4 | Régimen Simplificado", 50, 28);
                doc.text("Calle Principal No. 123 | Tel: 300 123 4567", 50, 33);
                
                doc.setDrawColor(102, 126, 234);
                doc.setLineWidth(1);
                doc.line(15, 42, 195, 42);
            };

            addLogoAndHeader();
            
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text("FACTURA DE VENTA", 105, 55, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            // Info Bloque Izquierdo
            doc.text(`No. Factura:`, 15, 65);
            doc.setFont(undefined, 'bold');
            doc.text(`${factura.numero_factura || 'BORRADOR'}`, 45, 65);
            
            doc.setFont(undefined, 'normal');
            doc.text(`Fecha Emisión:`, 15, 70);
            doc.text(`${new Date(factura.fecha_emision).toLocaleDateString()}`, 45, 70);
            
            doc.text(`Fecha Venc.:`, 15, 75);
            doc.text(`${factura.fecha_vencimiento}`, 45, 75);

            // Info Bloque Derecho (Cliente)
            doc.setFontSize(11);
            doc.text("FACTURADO A:", 120, 65);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(factura.cliente_nombre || 'Cliente General', 120, 71);
            doc.setFont(undefined, 'normal');
            doc.text(`ID/NIT: ${factura.cliente_ruc || 'N/A'}`, 120, 76);
            
            // Details Table
            const tableColumn = ["Producto", "Cant.", "Precio Unit.", "IVA", "Total"];
            const tableRows = factura.detalles.map(d => [
                d.producto_nombre || `Producto ${d.producto}`,
                d.cantidad,
                `$${Number(d.precio_unitario).toLocaleString()}`,
                `${d.porcentaje_iva}%`,
                `$${Number(d.subtotal || (d.cantidad * d.precio_unitario)).toLocaleString()}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 85,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [102, 126, 234], textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 250] }
            });
            
            const finalY = doc.lastAutoTable.finalY || 150;
            
            // Totales
            const startX = 130;
            doc.setFont(undefined, 'normal');
            doc.text(`Subtotal:`, startX, finalY + 15);
            doc.text(`$${Number(factura.subtotal).toLocaleString()}`, 195, finalY + 15, { align: 'right' });
            
            doc.text(`IVA Total:`, startX, finalY + 22);
            doc.text(`$${Number(factura.iva_total).toLocaleString()}`, 195, finalY + 22, { align: 'right' });
            
            doc.setDrawColor(102, 126, 234);
            doc.setLineWidth(0.5);
            doc.line(startX, finalY + 26, 195, finalY + 26);
            
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL A PAGAR:`, startX, finalY + 35);
            doc.text(`$${Number(factura.total).toLocaleString()}`, 195, finalY + 35, { align: 'right' });
            
            // Footer
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text("Gracias por elegir Panadería La Boquilla. ¡Hecho con amor, para ti!", 105, 285, { align: 'center' });
            
            doc.save(`Factura_${factura.numero_factura || factura.id}.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("No se pudo generar el PDF. Error: " + err.message);
        }
    };

    const createResolution = async () => {
        try {
            await axiosInstance.post(API.FACTURACION.RESOLUCIONES, {
                prefijo: 'FE', numero_inicial: 1, numero_final: 10000, numero_actual: 1,
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', color: 'white' }}>
                <div style={{ width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontSize: '1.2rem', fontWeight: 500 }}>Cargando Facturación...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Receipt size={30} />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#1e293b' }}>Facturación Electrónica</h1>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>Emisión y control de facturas DIAN</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        <ArrowLeft size={18} /> Volver
                    </button>
                    {!showNewForm && (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => exportToExcel()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                <Download size={18} /> Excel General
                            </button>
                            <button onClick={() => setShowNewForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)' }}>
                                <Plus size={20} /> Nueva Factura
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showNewForm ? (
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{currentFacturaId ? 'Editar Factura' : 'Nueva Factura de Venta'}</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>CLIENTE</label>
                            <select value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}>
                                <option value="">Seleccione un cliente...</option>
                                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>VENCIMIENTO</label>
                            <input type="date" value={formData.fecha_vencimiento} onChange={e => setFormData({ ...formData, fecha_vencimiento: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#64748b' }}>PRODUCTO</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b' }}>UNIDAD</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b' }}>CANT.</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b' }}>PRECIO</th>
                                    <th style={{ textAlign: 'right', padding: '0.75rem', color: '#64748b' }}>TOTAL</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.detalles.map((det, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <select value={det.producto} onChange={e => handleDetalleChange(index, 'producto', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                                <option value="">Seleccione...</option>
                                                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input type="text" value={det.unidad || ''} onChange={e => handleDetalleChange(index, 'unidad', e.target.value)} placeholder="UND" style={{ width: '70px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center', background: 'white' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input type="number" value={det.cantidad} onChange={e => handleDetalleChange(index, 'cantidad', parseFloat(e.target.value))} style={{ width: '70px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            <input type="number" value={det.precio_unitario} onChange={e => handleDetalleChange(index, 'precio_unitario', parseFloat(e.target.value))} style={{ width: '100px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'right' }} />
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>
                                            ${((det.cantidad || 0) * (det.precio_unitario || 0)).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button onClick={() => handleRemoveDetalle(index)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={handleAddDetalle} style={{ marginTop: '1rem', background: 'none', border: '1px dashed #667eea', padding: '0.5rem 1rem', borderRadius: '8px', color: '#667eea', cursor: 'pointer' }}>+ Agregar Item</button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                        <div style={{ width: '300px', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Subtotal:</span><span>${subtotalCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}><span>IVA (19%):</span><span>${ivaCalc.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}><span>TOTAL:</span><span>${totalCalc.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        {currentFacturaId && (
                            <>
                                <button 
                                    onClick={() => {
                                        const fact = facturas.find(f => f.id === currentFacturaId);
                                        if (fact) exportToExcel(fact);
                                    }} 
                                    style={{ padding: '0.75rem 1.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <Download size={18} /> ENVIAR A EXCEL
                                </button>
                                <button 
                                    onClick={() => {
                                        const fact = facturas.find(f => f.id === currentFacturaId);
                                        if (fact) exportToPDF(fact);
                                    }} 
                                    style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <FileText size={18} /> ENVIAR A PDF
                                </button>
                            </>
                        )}
                        <button onClick={() => { setShowNewForm(false); setCurrentFacturaId(null); }} style={{ padding: '0.75rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={saveBorrador} style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>{currentFacturaId ? 'Actualizar' : 'Guardar Borrador'}</button>
                    </div>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>FACTURA NO.</th>
                                <th style={{ textAlign: 'left', padding: '1rem' }}>CLIENTE</th>
                                <th style={{ textAlign: 'center', padding: '1rem' }}>EMISIÓN</th>
                                <th style={{ textAlign: 'right', padding: '1rem' }}>TOTAL</th>
                                <th style={{ textAlign: 'center', padding: '1rem' }}>ESTADO</th>
                                <th style={{ textAlign: 'center', padding: '1rem' }}>ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {facturas.map(f => (
                                <tr key={f.id} style={{ background: '#f8fafc' }}>
                                    <td style={{ padding: '1rem', fontWeight: 700 }}>{f.numero_factura || `Borrador #${f.id}`}</td>
                                    <td style={{ padding: '1rem' }}>{f.cliente_nombre}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{new Date(f.fecha_emision).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700 }}>${Number(f.total).toLocaleString()}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', background: f.estado_dian === 'validada' ? '#d1fae5' : '#fef3c7', color: f.estado_dian === 'validada' ? '#065f46' : '#92400e' }}>
                                            {f.estado_dian.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                            {f.estado_dian === 'borrador' && <button onClick={() => emitirFactura(f.id)} style={{ padding: '0.4rem 0.8rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Emitir</button>}
                                            <button onClick={() => handleEdit(f)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '6px', padding: '0.4rem', cursor: 'pointer' }}><Edit3 size={16} /></button>
                                            <button onClick={() => deleteFactura(f.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Facturacion;
