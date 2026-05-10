import React, { useState, useEffect } from 'react';
import { 
    Plus, FileText, ShoppingCart, Users, Search, 
    Filter, Eye, Download, CheckCircle, Clock, 
    AlertCircle, TrendingUp, DollarSign, Printer, Trash2
} from 'lucide-react';
import axios from 'axios';

// Estilos globales para el módulo de Ventas
const s = {
  page: { 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: 'Inter, sans-serif'
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
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '2rem'
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
  input: { 
    width: '100%', 
    background: 'white', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    padding: '0.6rem 0.9rem', 
    color: '#1e293b', 
    fontSize: '0.95rem', 
    boxSizing: 'border-box' 
  },
  badge: (c) => ({ 
    background: c + '22', 
    color: c, 
    padding: '0.2rem 0.7rem', 
    borderRadius: '20px', 
    fontSize: '0.75rem', 
    fontWeight: 600 
  }),
  tabBtn: (active) => ({
    background: active ? '#f0f4ff' : 'white',
    color: active ? '#667eea' : '#718096',
    border: '1px solid ' + (active ? '#667eea' : '#e2e8f0'),
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  })
};

export default function Ventas() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ordenes');

  const [ordenes, setOrdenes] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [notasCredito, setNotasCredito] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState([]);
  
  // Estados para modal de orden
  const [isOrdModalOpen, setIsOrdModalOpen] = useState(false);
  const [currentOrd, setCurrentOrd] = useState(null);
  const [ordForm, setOrdForm] = useState({
    cliente: '',
    fecha_entrega_esperada: '',
    estado: 'borrador',
    total: 0,
    detalles: []
  });

  // Estados para modal de nota de crédito
  const [isNCModalOpen, setIsNCModalOpen] = useState(false);
  const [currentNC, setCurrentNC] = useState(null);
  const [ncForm, setNcForm] = useState({
    factura: '',
    numero_nota: '',
    tipo: 'devolucion',
    motivo: '',
    porcentaje_iva: 19,
    detalles: []
  });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
      setLoading(true);
      // Corregido: /pedidos/ es el endpoint correcto según urls.py
      const [ordRes, factRes, cliRes, prodRes, ncRes] = await Promise.all([
        axios.get('/ventas/pedidos/'),
        axios.get('/ventas/facturas/'),
        axios.get('/crm/clientes/'),
        axios.get('/inventarios/productos/'),
        axios.get('/ventas/notas-credito/')
      ]);
      setOrdenes(Array.isArray(ordRes.data) ? ordRes.data : []);
      setFacturas(factRes.data);
      setClientes(cliRes.data);
      setProductos((prodRes.data || []).filter(p => 
        p.tipo_producto === 'producto_terminado' || 
        p.tipo_producto === 'semielaborado' ||
        !p.tipo_producto // Por si hay datos antiguos sin tipo
      ));
      setNotasCredito(ncRes.data || []);
      setLoading(false);
        } catch (err) {
      console.error('Error fetching ventas data:', err);
      setError('Error al cargar datos de ventas. Verifique su conexión.');
      setLoading(false);
    }
    };

  const openNCModal = (nc = null) => {
    if (nc) {
      setCurrentNC(nc);
      setNcForm({
        factura: nc.factura,
        numero_nota: nc.numero_nota,
        tipo: nc.tipo,
        motivo: nc.motivo,
        total: parseFloat(nc.total || 0),
        subtotal: parseFloat(nc.total || 0),
        porcentaje_iva: 0,
        valor_iva: 0,
        detalles: []
      });
    } else {
      setCurrentNC(null);
      setNcForm({
        factura: '',
        numero_nota: `NC-${Date.now()}`,
        tipo: 'devolucion',
        motivo: '',
        total: 0,
        subtotal: 0,
        porcentaje_iva: 0,
        valor_iva: 0,
        detalles: []
      });
    }
    setIsNCModalOpen(true);
  };

  const closeNCModal = () => {
    setIsNCModalOpen(false);
    setCurrentNC(null);
  };

  const handleNCSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalValue = parseFloat(ncForm.total) || 0;
      const payload = { 
        ...ncForm,
        subtotal: totalValue,
        valor_iva: 0,
        porcentaje_iva: 0,
        total: totalValue,
        detalles: []
      };
      if (currentNC) {
        await axios.put(`/ventas/notas-credito/${currentNC.id}/`, payload);
        alert('Nota de crédito actualizada');
      } else {
        await axios.post('/ventas/notas-credito/', payload);
        alert('Nota de crédito creada');
      }
      closeNCModal();
      fetchData();
    } catch (err) {
      console.error('Error guardando nota de crédito:', err);
      alert('Error al guardar la nota de crédito.');
    }
  };

  const descargarPDFNC = async (id, numero) => {
    try {
      const response = await axios.get(`/ventas/notas-credito/${id}/export_pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NotaCredito_${numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Error al generar PDF de la nota'); }
  };

  const descargarExcelNC = async (id, numero) => {
    try {
      const response = await axios.get(`/ventas/notas-credito/${id}/export_excel/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NotaCredito_${numero}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) { alert('Error al generar Excel de la nota'); }
  };

  const openOrdModal = (ord = null) => {
    if (ord) {
      setCurrentOrd(ord);
      setOrdForm({
        cliente: ord.cliente,
        fecha_entrega_esperada: ord.fecha_entrega_esperada || '',
        estado: ord.estado,
        total: ord.total,
        detalles: (ord.detalles || []).map(d => ({
          id: d.id || Math.random(),
          producto: d.producto?.id || d.producto,
          nombre_producto: d.producto?.nombre || d.producto_nombre || '',
          unidad: d.unidad || 'UND',
          cantidad: d.cantidad || 1,
          valor_unitario: parseFloat(d.precio_unitario || d.valor_unitario || 0),
          valor_total: (d.cantidad || 1) * parseFloat(d.precio_unitario || d.valor_unitario || 0)
        }))
      });
    } else {
      setCurrentOrd(null);
      setOrdForm({
        cliente: '',
        fecha_entrega_esperada: '',
        estado: 'borrador',
        total: 0,
        detalles: []
      });
    }
    setIsOrdModalOpen(true);
  };

  const closeOrdModal = () => {
    setIsOrdModalOpen(false);
    setCurrentOrd(null);
  };

  const addProductoToOrden = () => {
    setOrdForm(prev => ({
      ...prev,
      detalles: [...prev.detalles, {
        id: Math.random(),
        producto: '',
        nombre_producto: '',
        unidad: 'UND',
        cantidad: 1,
        valor_unitario: 0,
        valor_total: 0
      }]
    }));
  };

  const removeProductoFromOrden = (index) => {
    setOrdForm(prev => {
      const newDetalles = [...prev.detalles];
      newDetalles.splice(index, 1);
      const newTotal = newDetalles.reduce((sum, d) => sum + (d.valor_total || 0), 0);
      return { ...prev, detalles: newDetalles, total: newTotal };
    });
  };

  const updateProductoInOrden = (index, field, value) => {
    setOrdForm(prev => {
      const newDetalles = [...prev.detalles];
      newDetalles[index] = { ...newDetalles[index], [field]: value };
      
      if (field === 'producto') {
        const prod = productos.find(p => p.id === parseInt(value));
        if (prod) {
          newDetalles[index].nombre_producto = prod.nombre;
          newDetalles[index].valor_unitario = parseFloat(prod.precio_venta || 0);
          newDetalles[index].unidad = prod.unidad_medida || 'UND';
        }
      }
      
      if (field === 'cantidad' || field === 'valor_unitario' || field === 'producto') {
        const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
        const valorUnitario = parseFloat(newDetalles[index].valor_unitario) || 0;
        newDetalles[index].valor_total = cantidad * valorUnitario;
      }
      
      const newTotal = newDetalles.reduce((sum, d) => sum + (d.valor_total || 0), 0);
      return { ...prev, detalles: newDetalles, total: newTotal };
    });
  };

  const handleOrdSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cliente: ordForm.cliente,
        fecha_entrega_esperada: ordForm.fecha_entrega_esperada || null,
        estado: ordForm.estado,
        total: ordForm.total,
        detalles: ordForm.detalles.map(d => ({
          producto: d.producto,
          unidad: d.unidad,
          cantidad: d.cantidad,
          valor_unitario: d.valor_unitario
        }))
      };
      
      if (currentOrd) {
        await axios.put(`/ventas/pedidos/${currentOrd.id}/`, payload);
        alert('Orden actualizada correctamente');
      } else {
        await axios.post('/ventas/pedidos/', payload);
        alert('Orden creada correctamente');
      }
      closeOrdModal();
      fetchData();
    } catch (err) {
      console.error('Error guardando orden:', err);
      alert('Error al guardar la orden');
    }
  };

  const eliminarFactura = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta factura? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/ventas/facturas/${id}/`);
      alert('Factura eliminada correctamente');
      fetchData();
    } catch (err) {
      console.error('Error eliminando factura:', err);
      alert('Error al eliminar la factura');
    }
  };

  const eliminarOrden = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este pedido? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/ventas/pedidos/${id}/`);
      alert('Pedido eliminado correctamente');
      fetchData();
    } catch (err) {
      console.error('Error eliminando pedido:', err);
      alert('Error al eliminar el pedido');
    }
  };

  const eliminarNotaCredito = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota de crédito? Esta acción no se puede deshacer.')) return;
    try {
      await axios.delete(`/ventas/notas-credito/${id}/`);
      alert('Nota de crédito eliminada correctamente');
      fetchData();
    } catch (err) {
      console.error('Error eliminando nota de crédito:', err);
      alert('Error al eliminar la nota de crédito');
    }
  };

  const generarFactura = async (orden) => {
    try {
      const payload = {
        orden_venta: orden.id,
        cliente: orden.cliente,
        numero_factura: `FV-${orden.id}-${Date.now()}`,
        total: orden.total,
        fecha_emision: new Date().toISOString().split('T')[0],
        estado_pago: 'pendiente',
        detalles: orden.detalles || []
      };

      console.log('[ERP] Intentando generar factura:', payload);

      const response = await axios.post('/ventas/facturas/', payload);
      if (response.status === 201 || response.status === 200) {
        console.log('[ERP] Factura generada con éxito:', response.data);
        alert('Factura generada y registrada en el sistema.');
        fetchData();
      }
    } catch (err) {
      const serverError = err.response?.data;
      console.error('[ERP] Error 400 detalle:', JSON.stringify(serverError, null, 2));
      
      // Evitar mostrar HTML crudo en el mensaje de error si el servidor responde con 404/500
      const errorMsg = typeof serverError === 'string' && serverError.includes('<!doctype html>') 
        ? 'Error del servidor (Ruta no encontrada o fallo interno)' 
        : JSON.stringify(serverError || err.message);
        
      setError(`Error: ${errorMsg}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const descargarPDF = async (id, numero) => {
    try {
      const response = await axios.get(`/ventas/facturas/${id}/export_pdf/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_${numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error descargando PDF:', err);
      alert('Error al generar el PDF');
    }
  };

  const descargarExcel = async (id, numero) => {
    try {
      const response = await axios.get(`/ventas/facturas/${id}/export_excel/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Factura_${numero}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error descargando Excel:', err);
      alert('Error al generar el Excel');
    }
  };

    const totalVentas = ordenes.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    const facturacionPendiente = ordenes.filter(o => o.estado === 'pendiente').length;
    const totalClientes = clientes.length;

    if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={s.page}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
    );

    return (
    <div className="p-8 font-sans" style={s.page}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="text-indigo-500" size={32} />
              Gestión de Ventas
            </h1>
            <button 
              style={s.btnPrimary} 
              onClick={() => activeTab === 'ordenes' ? openOrdModal() : openNCModal()}
            >
              <Plus size={20} />
              {activeTab === 'ordenes' ? 'Nueva Orden' : 'Nueva Nota de Crédito'}
            </button>
          </div>
          <p className="text-slate-400 mt-1" style={{ marginTop: '0.5rem' }}>Control de pedidos, facturación y devoluciones.</p>
        </div>
      </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-8 rounded-r-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-500" size={24} />
                        <div>
                            <p className="font-bold">Ha ocurrido un problema</p>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-xl font-bold px-2">×</button>
                </div>
            )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard icon={<DollarSign />} title="Ingresos Brutos" value={`$${Number(totalVentas).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} color="#10B981" />
        <StatCard icon={<Clock />} title="Pendiente Facturar" value={facturacionPendiente} color="#F59E0B" />
        <StatCard icon={<Users />} title="Clientes" value={totalClientes} color="#3B82F6" />
        <StatCard icon={<TrendingUp />} title="Crecimiento" value="+12.4%" color="#6366F1" />
      </div>

      <div className="flex gap-3 mb-6">
        <button 
          onClick={() => setActiveTab('ordenes')}
          style={s.tabBtn(activeTab === 'ordenes')}
        >
          Pedidos (Ordenes)
        </button>
        <button 
          onClick={() => setActiveTab('facturas')}
          style={s.tabBtn(activeTab === 'facturas')}
        >
          Bóveda de Facturas
        </button>
        <button 
          onClick={() => setActiveTab('notas-credito')}
          style={s.tabBtn(activeTab === 'notas-credito')}
        >
          Notas de Crédito
        </button>
      </div>

      <div style={s.card} className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Buscar por cliente o número de documento..."
            style={{ ...s.input, width: '100%', paddingLeft: '3rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={s.card}>
        <div className="overflow-x-auto">
          {activeTab === 'ordenes' ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>ID Pedido</th>
                  <th style={s.th}>Cliente</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Total</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th} className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.filter(o => o.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())).map((orden) => (
                  <tr key={orden.id}>
                    <td style={{ ...s.td, color: '#818CF8', fontWeight: 700 }}>#{orden.id}</td>
                    <td style={s.td}>{orden.cliente_nombre}</td>
                    <td style={s.td}>{formatDate(orden.fecha_emision)}</td>
                    <td style={{ ...s.td, fontWeight: 700 }}>${parseFloat(orden.total).toLocaleString()}</td>
                    <td style={s.td}><StatusBadge status={orden.estado} /></td>
                    <td style={s.td}>
                      <div className="flex justify-center gap-2">
                        <button title="Ver" onClick={() => openOrdModal(orden)} style={{ background: 'transparent', border: 'none', color: '#818CF8', cursor: 'pointer' }}><Eye size={18} /></button>
                        {orden.estado !== 'facturado' && (
                          <button title="Generar Factura" onClick={() => generarFactura(orden)} style={{ background: 'transparent', border: 'none', color: '#10B981', cursor: 'pointer' }}><FileText size={18} /></button>
                        )}
                        <button title="Borrar" onClick={() => eliminarOrden(orden.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'facturas' ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nº Factura</th>
                  <th style={s.th}>Emisión</th>
                  <th style={s.th}>Monto</th>
                  <th style={s.th}>DIAN</th>
                  <th style={s.th} className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.map((factura) => (
                  <tr key={factura.id}>
                    <td style={s.td}>{factura.numero_factura}</td>
                    <td style={s.td}>{formatDate(factura.fecha_emision)}</td>
                    <td style={{ ...s.td, color: '#10B981', fontWeight: 700 }}>${parseFloat(factura.total).toLocaleString()}</td>
                    <td style={s.td}><span style={s.badge('#10B981')}>{factura.estado_dian || 'Aceptada'}</span></td>
                    <td style={s.td}>
                      <div className="flex justify-center gap-2">
                        <button title="Ver" onClick={() => {
                          const orden = ordenes.find(o => o.id === factura.orden_venta);
                          if (orden) openOrdModal(orden);
                          else alert('Orden no encontrada');
                        }} style={{ background: 'transparent', border: 'none', color: '#818CF8', cursor: 'pointer' }}><Eye size={18} /></button>
                        <button title="Descargar PDF" onClick={() => descargarPDF(factura.id, factura.numero_factura)} style={{ background: 'transparent', border: 'none', color: '#10B981', cursor: 'pointer' }}><Printer size={18} /></button>
                        <button title="Descargar Excel" onClick={() => descargarExcel(factura.id, factura.numero_factura)} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer' }}><Download size={18} /></button>
                        <button title="Borrar" onClick={() => eliminarFactura(factura.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'notas-credito' ? (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Nº Nota</th>
                  <th style={s.th}>Factura</th>
                  <th style={s.th}>Fecha</th>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Monto</th>
                  <th style={s.th}>Estado</th>
                  <th style={s.th} className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notasCredito.map((nc) => (
                  <tr key={nc.id}>
                    <td style={s.td}>{nc.numero_nota}</td>
                    <td style={s.td}>{nc.factura_numero}</td>
                    <td style={s.td}>{formatDate(nc.fecha_emision)}</td>
                    <td style={s.td}>{nc.tipo}</td>
                    <td style={{ ...s.td, color: '#EF4444', fontWeight: 700 }}>${parseFloat(nc.total).toLocaleString()}</td>
                    <td style={s.td}><span style={s.badge(nc.estado === 'aprobada' ? '#10B981' : nc.estado === 'rechazada' ? '#EF4444' : '#F59E0B')}>{nc.estado}</span></td>
                    <td style={s.td}>
                      <div className="flex justify-center gap-2">
                        <button title="Editar" onClick={() => openNCModal(nc)} style={{ background: 'transparent', border: 'none', color: '#818CF8', cursor: 'pointer' }}><Eye size={18} /></button>
                        <button title="Imprimir PDF" onClick={() => descargarPDFNC(nc.id, nc.numero_nota)} style={{ background: 'transparent', border: 'none', color: '#10B981', cursor: 'pointer' }}><Printer size={18} /></button>
                        <button title="Exportar Excel" onClick={() => descargarExcelNC(nc.id, nc.numero_nota)} style={{ background: 'transparent', border: 'none', color: '#059669', cursor: 'pointer' }}><Download size={18} /></button>
                        <button title="Borrar" onClick={() => eliminarNotaCredito(nc.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>

      {/* Modal de Orden */}
      {isOrdModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '2rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px',
            maxHeight: '90vh', overflow: 'auto', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {currentOrd ? `Editar Orden #${currentOrd.id}` : 'Nueva Orden de Venta'}
              </h2>
              <button onClick={closeOrdModal} style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleOrdSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cliente</label>
                  <select
                    value={ordForm.cliente}
                    onChange={(e) => setOrdForm({...ordForm, cliente: e.target.value})}
                    style={s.input}
                    required
                  >
                    <option value="">Seleccione cliente</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fecha Entrega</label>
                  <input
                    type="date"
                    value={ordForm.fecha_entrega_esperada}
                    onChange={(e) => setOrdForm({...ordForm, fecha_entrega_esperada: e.target.value})}
                    style={s.input}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Estado</label>
                <select
                  value={ordForm.estado}
                  onChange={(e) => setOrdForm({...ordForm, estado: e.target.value})}
                  style={s.input}
                >
                  <option value="borrador">Borrador</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Tabla de Productos */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 600 }}>Productos</label>
                  <button type="button" onClick={addProductoToOrden} style={{
                    background: '#10B981', color: 'white', border: 'none', padding: '0.5rem 1rem',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem'
                  }}>+ Agregar Producto</button>
                </div>

                {ordForm.detalles.length > 0 ? (
                  <table style={{ ...s.table, fontSize: '0.875rem' }}>
                    <thead>
                      <tr>
                        <th style={{ ...s.th, padding: '0.5rem' }}>Producto</th>
                        <th style={{ ...s.th, padding: '0.5rem', width: '70px' }}>Unidad</th>
                        <th style={{ ...s.th, padding: '0.5rem', width: '100px' }}>Cantidad</th>
                        <th style={{ ...s.th, padding: '0.5rem', width: '120px' }}>Valor Unitario</th>
                        <th style={{ ...s.th, padding: '0.5rem', width: '120px' }}>Valor Total</th>
                        <th style={{ ...s.th, padding: '0.5rem', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordForm.detalles.map((detalle, index) => (
                        <tr key={detalle.id}>
                          <td style={{ ...s.td, padding: '0.5rem' }}>
                            <select
                              value={detalle.producto}
                              onChange={(e) => updateProductoInOrden(index, 'producto', e.target.value)}
                              style={{ ...s.input, fontSize: '0.875rem' }}
                              required
                            >
                              <option value="">Seleccione...</option>
                              {productos.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ ...s.td, padding: '0.5rem', textAlign: 'center' }}>
                            <input
                              type="text"
                              value={detalle.unidad || ''}
                              onChange={(e) => updateProductoInOrden(index, 'unidad', e.target.value)}
                              placeholder="UND"
                              style={{ ...s.input, fontSize: '0.875rem', width: '100%', textAlign: 'center' }}
                            />
                          </td>
                          <td style={{ ...s.td, padding: '0.5rem' }}>
                            <input
                              type="number"
                              min="1"
                              value={detalle.cantidad}
                              onChange={(e) => updateProductoInOrden(index, 'cantidad', e.target.value)}
                              style={{ ...s.input, fontSize: '0.875rem', width: '100%' }}
                            />
                          </td>
                          <td style={{ ...s.td, padding: '0.5rem' }}>
                            <input
                              type="number"
                              step="0.01"
                              value={detalle.valor_unitario}
                              onChange={(e) => updateProductoInOrden(index, 'valor_unitario', e.target.value)}
                              style={{ ...s.input, fontSize: '0.875rem', width: '100%' }}
                            />
                          </td>
                          <td style={{ ...s.td, padding: '0.5rem', fontWeight: 700 }}>
                            ${Number(detalle.valor_total).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td style={{ ...s.td, padding: '0.5rem', textAlign: 'center' }}>
                            <button type="button" onClick={() => removeProductoFromOrden(index)} style={{
                              color: '#EF4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem'
                            }}>×</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '8px' }}>
                    No hay productos. Haga clic en "+ Agregar Producto"
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 700 }}>
                Total: ${Number(ordForm.total).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={closeOrdModal} style={{
                  padding: '0.75rem 1.5rem', border: '1px solid #D1D5DB', borderRadius: '8px',
                  background: 'white', cursor: 'pointer'
                }}>Cancelar</button>
                <button type="submit" style={{
                  padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white',
                  cursor: 'pointer', fontWeight: 600
                }}>{currentOrd ? 'Actualizar' : 'Crear'} Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de Nota de Crédito */}
      {isNCModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1001, padding: '2rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px',
            maxHeight: '90vh', overflow: 'auto', padding: '2rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {currentNC ? `Editar Nota de Crédito #${currentNC.numero_nota}` : 'Nueva Nota de Crédito'}
              </h2>
              <button onClick={closeNCModal} style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleNCSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Factura Relacionada</label>
                  <select
                    value={ncForm.factura}
                    onChange={(e) => setNcForm({...ncForm, factura: e.target.value})}
                    style={s.input}
                    required
                  >
                    <option value="">Seleccione factura</option>
                    {facturas.map(f => (
                      <option key={f.id} value={f.id}>{f.numero_factura} ({f.cliente_nombre})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tipo de Nota</label>
                  <select
                    value={ncForm.tipo}
                    onChange={(e) => setNcForm({...ncForm, tipo: e.target.value})}
                    style={s.input}
                  >
                    <option value="devolucion">Devolución de Mercancía</option>
                    <option value="descuento">Descuento/Anulación</option>
                    <option value="correccion">Corrección de Factura</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Motivo</label>
                <textarea
                  value={ncForm.motivo}
                  onChange={(e) => setNcForm({...ncForm, motivo: e.target.value})}
                  style={{ ...s.input, height: '80px', resize: 'none' }}
                  placeholder="Explique el motivo de la nota..."
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Valor Total a Acreditar</label>
                <input
                  type="number"
                  value={ncForm.total}
                  onChange={(e) => setNcForm({...ncForm, total: e.target.value})}
                  style={{ ...s.input, fontSize: '1.25rem', fontWeight: 700, color: '#EF4444' }}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" onClick={closeNCModal} style={{
                  padding: '0.75rem 1.5rem', border: '1px solid #D1D5DB', borderRadius: '8px',
                  background: 'white', cursor: 'pointer'
                }}>Cancelar</button>
                <button type="submit" style={{
                  padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', color: 'white',
                  cursor: 'pointer', fontWeight: 600
                }}>{currentNC ? 'Actualizar' : 'Crear'} Nota de Crédito</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    );
}

// Helper para formatear fechas de forma segura
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-CO');
  } catch {
    return 'Fecha inválida';
  }
};

function StatCard({ icon, title, value, color }) {
  return (
    <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ background: color + '22', color: color, padding: '1rem', borderRadius: '10px' }}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ color: '#F8FAFC', fontSize: '1.25rem', fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    pendiente: { c: '#F59E0B', l: 'Pendiente' },
    facturado: { c: '#10B981', l: 'Facturado' },
    procesando: { c: '#3B82F6', l: 'Procesando' },
    default: { c: '#94A3B8', l: status }
  };
  const statusCfg = config[status] || config.default;

  return (
    <span style={{ 
      background: statusCfg.c + '22', 
      color: statusCfg.c, 
      padding: '0.2rem 0.6rem', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      fontWeight: 700, 
      border: `1px solid ${statusCfg.c}44` 
    }}>
      {statusCfg.l}
    </span>
  );
}
