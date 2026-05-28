```jsx
import React, { useState, useEffect } from 'react';
import {
  Plus, FileText, ShoppingCart, Users, Search,
  Eye, Download, Clock,
  AlertCircle, TrendingUp, DollarSign, Printer, Trash2
} from 'lucide-react';
import axios from 'axios';
import { API } from '../config/api';

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

  const [isOrdModalOpen, setIsOrdModalOpen] = useState(false);
  const [currentOrd, setCurrentOrd] = useState(null);

  const [ordForm, setOrdForm] = useState({
    cliente: '',
    fecha_entrega_esperada: '',
    estado: 'borrador',
    total: 0,
    detalles: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        ordRes,
        cliRes,
        prodRes
      ] = await Promise.all([
        axios.get(API.PEDIDOS.LIST).catch(() => ({ data: [] })),
        axios.get(API.CRM.CLIENTES).catch(() => ({ data: [] })),
        axios.get(API.INVENTARIO.PRODUCTOS).catch(() => ({ data: [] }))
      ]);

      setOrdenes(Array.isArray(ordRes.data) ? ordRes.data : []);
      setClientes(Array.isArray(cliRes.data) ? cliRes.data : []);
      setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);

      setFacturas([]);
      setNotasCredito([]);

    } catch (err) {
      console.error('Error fetching ventas data:', err);
      setError('Error al cargar datos de ventas.');
    } finally {
      setLoading(false);
    }
  };

  const openOrdModal = (ord = null) => {
    if (ord) {
      setCurrentOrd(ord);

      setOrdForm({
        cliente: ord.cliente?.id || ord.cliente || '',
        fecha_entrega_esperada: ord.fecha_entrega_esperada || '',
        estado: ord.estado || 'borrador',
        total: ord.total || 0,
        detalles: (ord.detalles || []).map(d => ({
          id: d.id || Math.random(),
          producto: d.producto?.id || d.producto || '',
          nombre_producto: d.producto?.nombre || '',
          unidad: d.unidad || 'UND',
          cantidad: d.cantidad || 1,
          valor_unitario: parseFloat(d.valor_unitario || 0),
          valor_total: (d.cantidad || 1) * parseFloat(d.valor_unitario || 0)
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
      detalles: [
        ...prev.detalles,
        {
          id: Math.random(),
          producto: '',
          nombre_producto: '',
          unidad: 'UND',
          cantidad: 1,
          valor_unitario: 0,
          valor_total: 0
        }
      ]
    }));
  };

  const removeProductoFromOrden = (index) => {
    setOrdForm(prev => {
      const newDetalles = [...prev.detalles];

      newDetalles.splice(index, 1);

      const newTotal = newDetalles.reduce(
        (sum, d) => sum + (d.valor_total || 0),
        0
      );

      return {
        ...prev,
        detalles: newDetalles,
        total: newTotal
      };
    });
  };

  const updateProductoInOrden = (index, field, value) => {
    setOrdForm(prev => {

      const newDetalles = [...prev.detalles];

      newDetalles[index] = {
        ...newDetalles[index],
        [field]: value
      };

      if (field === 'producto') {

        const prod = productos.find(
          p => String(p.id) === String(value)
        );

        if (prod) {
          newDetalles[index].nombre_producto = prod.nombre;
          newDetalles[index].valor_unitario = parseFloat(prod.precio_venta || 0);
          newDetalles[index].unidad = prod.unidad_medida || 'UND';
        }
      }

      const cantidad = parseFloat(newDetalles[index].cantidad) || 0;
      const valorUnitario = parseFloat(newDetalles[index].valor_unitario) || 0;

      newDetalles[index].valor_total = cantidad * valorUnitario;

      const newTotal = newDetalles.reduce(
        (sum, d) => sum + (d.valor_total || 0),
        0
      );

      return {
        ...prev,
        detalles: newDetalles,
        total: newTotal
      };
    });
  };

  const handleOrdSubmit = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        cliente: parseInt(ordForm.cliente),
        fecha_entrega_esperada: ordForm.fecha_entrega_esperada || null,
        estado: ordForm.estado,
        total: ordForm.total,
        detalles: ordForm.detalles.map(d => ({
          producto: parseInt(d.producto),
          unidad: d.unidad,
          cantidad: d.cantidad,
          valor_unitario: d.valor_unitario
        }))
      };

      if (currentOrd) {

        await axios.put(
          API.PEDIDOS.DETAIL(currentOrd.id),
          payload
        );

        alert('Pedido actualizado correctamente');

      } else {

        await axios.post(
          API.PEDIDOS.CREATE,
          payload
        );

        alert('Pedido creado correctamente');
      }

      closeOrdModal();
      fetchData();

    } catch (err) {
      console.error('Error guardando pedido:', err);
      alert('Error al guardar el pedido');
    }
  };

  const eliminarOrden = async (id) => {

    if (!window.confirm('¿Eliminar pedido?')) return;

    try {

      await axios.delete(
        API.PEDIDOS.DETAIL(id)
      );

      alert('Pedido eliminado');

      fetchData();

    } catch (err) {
      console.error('Error eliminando pedido:', err);
      alert('Error eliminando pedido');
    }
  };

  const totalVentas = ordenes.reduce(
    (sum, o) => sum + parseFloat(o.total || 0),
    0
  );

  const totalClientes = clientes.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={s.page}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 font-sans" style={s.page}>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

        <div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>

            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <ShoppingCart className="text-indigo-500" size={32} />
              Gestión de Ventas
            </h1>

            <button
              style={s.btnPrimary}
              onClick={() => openOrdModal()}
            >
              <Plus size={20} />
              Nueva Orden
            </button>

          </div>

          <p
            className="text-slate-400 mt-1"
            style={{ marginTop: '0.5rem' }}
          >
            Control de pedidos y ventas.
          </p>

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

          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 text-xl font-bold px-2"
          >
            ×
          </button>

        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>

        <StatCard
          icon={<DollarSign />}
          title="Ingresos"
          value={`$${Number(totalVentas).toLocaleString('es-CO')}`}
          color="#10B981"
        />

        <StatCard
          icon={<Users />}
          title="Clientes"
          value={totalClientes}
          color="#3B82F6"
        />

        <StatCard
          icon={<TrendingUp />}
          title="Pedidos"
          value={ordenes.length}
          color="#6366F1"
        />

        <StatCard
          icon={<Clock />}
          title="Estado"
          value="Activo"
          color="#F59E0B"
        />

      </div>

      <div style={s.card} className="mb-6">

        <div className="relative">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Buscar cliente..."
            style={{
              ...s.input,
              width: '100%',
              paddingLeft: '3rem'
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

        </div>

      </div>

      <div style={s.card}>

        <div className="overflow-x-auto">

          <table style={s.table}>

            <thead>

              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Cliente</th>
                <th style={s.th}>Fecha</th>
                <th style={s.th}>Estado</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Acciones</th>
              </tr>

            </thead>

            <tbody>

              {ordenes
                .filter(o =>
                  (o.cliente_nombre || '')
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )
                .map((orden) => (

                  <tr key={orden.id}>

                    <td style={s.td}>#{orden.id}</td>

                    <td style={s.td}>
                      {orden.cliente_nombre}
                    </td>

                    <td style={s.td}>
                      {formatDate(orden.fecha_emision)}
                    </td>

                    <td style={s.td}>
                      <StatusBadge status={orden.estado} />
                    </td>

                    <td style={s.td}>
                      ${Number(orden.total || 0).toLocaleString('es-CO')}
                    </td>

                    <td style={s.td}>

                      <div className="flex gap-2">

                        <button
                          title="Editar"
                          onClick={() => openOrdModal(orden)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#818CF8',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          title="Eliminar"
                          onClick={() => eliminarOrden(orden.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}

      {isOrdModalOpen && (

        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '2rem'
          }}>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>

              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 700
              }}>
                {currentOrd
                  ? `Editar Pedido #${currentOrd.id}`
                  : 'Nuevo Pedido'}
              </h2>

              <button
                onClick={closeOrdModal}
                style={{
                  fontSize: '1.5rem',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleOrdSubmit}>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>

                <div>

                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600
                  }}>
                    Cliente
                  </label>

                  <select
                    value={ordForm.cliente}
                    onChange={(e) =>
                      setOrdForm({
                        ...ordForm,
                        cliente: e.target.value
                      })
                    }
                    style={s.input}
                    required
                  >

                    <option value="">
                      Seleccione cliente
                    </option>

                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}

                  </select>

                </div>

                <div>

                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 600
                  }}>
                    Fecha Entrega
                  </label>

                  <input
                    type="date"
                    value={ordForm.fecha_entrega_esperada}
                    onChange={(e) =>
                      setOrdForm({
                        ...ordForm,
                        fecha_entrega_esperada: e.target.value
                      })
                    }
                    style={s.input}
                  />

                </div>

              </div>

              <div style={{ marginBottom: '1rem' }}>

                <button
                  type="button"
                  onClick={addProductoToOrden}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  + Agregar Producto
                </button>

              </div>

              {ordForm.detalles.map((detalle, index) => (

                <div
                  key={detalle.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}
                >

                  <select
                    value={detalle.producto}
                    onChange={(e) =>
                      updateProductoInOrden(
                        index,
                        'producto',
                        e.target.value
                      )
                    }
                    style={s.input}
                  >

                    <option value="">Producto</option>

                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}

                  </select>

                  <input
                    type="number"
                    value={detalle.cantidad}
                    onChange={(e) =>
                      updateProductoInOrden(
                        index,
                        'cantidad',
                        e.target.value
                      )
                    }
                    style={s.input}
                  />

                  <input
                    type="number"
                    value={detalle.valor_unitario}
                    onChange={(e) =>
                      updateProductoInOrden(
                        index,
                        'valor_unitario',
                        e.target.value
                      )
                    }
                    style={s.input}
                  />

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 700
                  }}>
                    ${Number(detalle.valor_total).toLocaleString('es-CO')}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeProductoFromOrden(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#EF4444',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={18} />
                  </button>

                </div>

              ))}

              <div style={{
                textAlign: 'right',
                fontSize: '1.25rem',
                fontWeight: 700,
                marginTop: '1rem'
              }}>
                Total:
                {' '}
                ${Number(ordForm.total).toLocaleString('es-CO')}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                marginTop: '2rem'
              }}>

                <button
                  type="button"
                  onClick={closeOrdModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Guardar Pedido
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

// Helper fecha
const formatDate = (dateString) => {

  if (!dateString) return 'Sin fecha';

  try {

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-CO');

  } catch {
    return 'Fecha inválida';
  }
};

function StatCard({ icon, title, value, color }) {

  return (
    <div style={{
      background: '#1E293B',
      padding: '1.5rem',
      borderRadius: '12px',
      border: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>

      <div style={{
        background: color + '22',
        color,
        padding: '1rem',
        borderRadius: '10px'
      }}>
        {React.cloneElement(icon, { size: 24 })}
      </div>

      <div>
        <div style={{
          color: '#94A3B8',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          {title}
        </div>

        <div style={{
          color: '#F8FAFC',
          fontSize: '1.25rem',
          fontWeight: 800
        }}>
          {value}
        </div>
      </div>

    </div>
  );
}

function StatusBadge({ status }) {

  const config = {
    pendiente: { c: '#F59E0B', l: 'Pendiente' },
    completado: { c: '#10B981', l: 'Completado' },
    borrador: { c: '#3B82F6', l: 'Borrador' },
    cancelado: { c: '#EF4444', l: 'Cancelado' },
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
```
