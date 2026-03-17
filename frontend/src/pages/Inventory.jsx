import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageOpen, AlertCircle, Edit3, Trash2, Plus, X } from 'lucide-react';
import './index.css';

const API_URL = 'http://localhost:8000/api/inventarios/productos/';

function App() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_sku: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: ''
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await axios.get(API_URL);
      setProductos(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar el inventario. Asegúrate que Django esté corriendo.');
      setLoading(false);
    }
  };

  const calculateStatus = (stock, minStock) => {
    if (stock === 0) return { label: 'Agotado', type: 'badge-danger' };
    if (stock <= minStock) return { label: 'Bajo', type: 'badge-warning' };
    return { label: 'Óptimo', type: 'badge-success' };
  };

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        nombre: product.nombre,
        codigo_sku: product.codigo_sku,
        precio_compra: product.precio_compra,
        precio_venta: product.precio_venta,
        stock_actual: product.stock_actual,
        stock_minimo: product.stock_minimo
      });
    } else {
      setCurrentProduct(null);
      setFormData({
        nombre: '',
        codigo_sku: '',
        precio_compra: '',
        precio_venta: '',
        stock_actual: '',
        stock_minimo: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProduct) {
        // Edit
        await axios.put(`${API_URL}${currentProduct.id}/`, formData);
      } else {
        // Create
        await axios.post(API_URL, formData);
      }
      closeModal();
      fetchProductos(); // Refresh list
    } catch (err) {
      alert("Error al guardar el producto. Verifica los campos.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`${API_URL}${id}/`);
        fetchProductos();
      } catch (err) {
        alert("Error al eliminar el producto.");
      }
    }
  };

  return (
    <div className="container">
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 className="header-title">8AMPERIOS ERP</h1>
            <p className="header-subtitle" style={{ marginBottom: 0 }}>Gestión de Inventario y Existencias Generales</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              background: 'rgba(79, 70, 229, 0.2)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <PackageOpen size={20} />
              <span style={{ fontWeight: 600 }}>{productos.length} Productos</span>
            </div>
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Plus size={18} />
              Nuevo Producto
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
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Costo</th>
                  <th>Precio Venta</th>
                  <th>Stock Actual</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod) => {
                  const status = calculateStatus(prod.stock_actual, prod.stock_minimo);
                  return (
                    <tr key={prod.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{prod.codigo_sku}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{prod.nombre}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{prod.categoria_nombre || 'Sin categoría'}</span>
                      </td>
                      <td>${parseFloat(prod.precio_compra).toLocaleString()}</td>
                      <td>${parseFloat(prod.precio_venta).toLocaleString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prod.stock_actual}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min: {prod.stock_minimo}</div>
                      </td>
                      <td>
                        <span className={`badge ${status.type}`}>{status.label}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.25rem' }}
                            onClick={() => openModal(prod)}>
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ padding: '0.25rem' }}
                            onClick={() => handleDelete(prod.id)}
                            onMouseOver={(e) => e.currentTarget.style.color = 'var(--danger)'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {productos.length === 0 && !error && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay productos en el inventario. Haz clic en "Nuevo Producto" para añadir uno.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Modal for Create / Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button className="btn btn-ghost" style={{ padding: '0.25rem' }} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre del Producto</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Código SKU</label>
                <input
                  type="text"
                  name="codigo_sku"
                  value={formData.codigo_sku}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Precio Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_compra"
                    value={formData.precio_compra}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_venta"
                    value={formData.precio_venta}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Stock Actual</label>
                  <input
                    type="number"
                    name="stock_actual"
                    value={formData.stock_actual}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Mínimo</label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
