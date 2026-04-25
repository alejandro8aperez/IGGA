import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Plus, X, Edit3, Trash2, Calendar, Users, Truck, ClipboardList, AlertCircle } from 'lucide-react';
import { API } from '../config/api';

const API_URL = API.OPERACIONES.INFORMES_DIARIOS || '/api/operaciones/informes-diarios/';

const Informediarioproy = () => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInforme, setCurrentInforme] = useState(null);

  const [form, setForm] = useState({
    obra: 'Ampliación SE LA LOMA 500 kV',
    fecha: new Date().toISOString().split('T')[0],
    codigo_formato: 'F-141-IN',
    version: '1',
    mod: '00',
    lluvia: 'NO',
    he_lluvia: 0,
    maquinaria: {
      camioneta_siemens: 0,
      buseta_vans: 0,
      generador: 0,
      camion_grua: 0,
      manlift_edemsa: 0,
    },
    personal: {
      residente_tecnico: 0,
      coordinadora_sst: 0,
      director_proyecto: 0,
      inspector_qa_qc: 0,
      ayudante_tecnico: 0,
      conductor: 0,
    },
    act_administrativas: '',
    act_tecnicas_cableado: '',
    act_montaje_pruebas: '',
    act_obra_civil: '',
    act_sst_ambiental: '',
    elaborado_por: '',
    revisado_por: '',
    aprobado_por: ''
  });

  useEffect(() => {
    fetchInformes();
  }, []);

  const fetchInformes = async () => {
    try {
      const response = await axios.get(API_URL);
      setInformes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar informes');
      setLoading(false);
    }
  };

  const openModal = (informe = null) => {
    if (informe) {
      setCurrentInforme(informe);
      setForm(informe);
    } else {
      setCurrentInforme(null);
      setForm({
        obra: 'Ampliación SE LA LOMA 500 kV',
        fecha: new Date().toISOString().split('T')[0],
        codigo_formato: 'F-141-IN',
        version: '1',
        mod: '00',
        lluvia: 'NO',
        he_lluvia: 0,
        maquinaria: {
          camioneta_siemens: 0,
          buseta_vans: 0,
          generador: 0,
          camion_grua: 0,
          manlift_edemsa: 0,
        },
        personal: {
          residente_tecnico: 0,
          coordinadora_sst: 0,
          director_proyecto: 0,
          inspector_qa_qc: 0,
          ayudante_tecnico: 0,
          conductor: 0,
        },
        act_administrativas: '',
        act_tecnicas_cableado: '',
        act_montaje_pruebas: '',
        act_obra_civil: '',
        act_sst_ambiental: '',
        elaborado_por: '',
        revisado_por: '',
        aprobado_por: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInforme(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setForm(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentInforme) {
        await axios.put(`${API_URL}${currentInforme.id}/`, form);
      } else {
        await axios.post(API_URL, form);
      }
      closeModal();
      fetchInformes();
    } catch (error) {
      alert('Error al guardar el informe.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este informe definitivamente?')) {
      try {
        await axios.delete(`${API_URL}${id}/`);
        fetchInformes();
      } catch (error) {
        alert('Error al eliminar el informe.');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>Cargando Informes...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a202c', margin: '0 0 0.5rem 0' }}>
              Informe Diario de Obra
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#718096', margin: 0 }}>
              Formato F-141-IN - Interventoría
            </p>
          </div>
          <button 
            onClick={() => openModal()}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <Plus size={18} />
            Nuevo Informe
          </button>
        </div>
      </div>

      {/* Tabla de Informes */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        {informes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e0' }} />
            <p style={{ fontSize: '1.1rem' }}>No hay informes registrados</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Crea tu primer informe diario de obra</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Fecha</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Obra</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>Lluvia</th>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#4a5568', fontWeight: '600' }}>He</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#4a5568', fontWeight: '600' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {informes.map((informe) => (
                <tr key={informe.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f7fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} color="#667eea" />
                      <span style={{ fontWeight: '500' }}>{informe.fecha}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{informe.obra}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', background: informe.lluvia === 'SI' ? '#fef5e7' : '#f0fdf4', color: informe.lluvia === 'SI' ? '#d97706' : '#16a34a' }}>
                      {informe.lluvia}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{informe.he_lluvia}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => openModal(informe)} style={{ padding: '0.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(informe.id)} style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '900px', width: '90%', maxHeight: '90vh', overflow: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1a202c', margin: 0 }}>
                {currentInforme ? 'Editar Informe' : 'Nuevo Informe Diario'}
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                <X size={24} color="#718096" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Encabezado */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#f7fafc', padding: '1.5rem', borderRadius: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Obra/Proyecto</label>
                  <input name="obra" value={form.obra} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Fecha</label>
                  <input type="date" name="fecha" value={form.fecha} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Lluvia</label>
                  <select name="lluvia" value={form.lluvia} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Horas</label>
                  <input type="number" name="he_lluvia" value={form.he_lluvia} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
              </div>

              {/* Maquinaria y Personal */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                    <Truck size={18} color="#667eea" />
                    Maquinaria y Equipos
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(form.maquinaria || {}).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f7fafc', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>{key.replace(/_/g, ' ')}</span>
                        <input type="number" name={`maquinaria.${key}`} value={value} onChange={handleChange} style={{ width: '60px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                    <Users size={18} color="#667eea" />
                    Personal de Obra
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {Object.entries(form.personal || {}).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f7fafc', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>{key.replace(/_/g, ' ')}</span>
                        <input type="number" name={`personal.${key}`} value={value} onChange={handleChange} style={{ width: '60px', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px', textAlign: 'center' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actividades */}
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: '700', color: '#1a202c', marginBottom: '1rem' }}>
                  <ClipboardList size={18} color="#667eea" />
                  Actividades
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { key: 'act_administrativas', label: '1. Administrativas y Documentales' },
                    { key: 'act_tecnicas_cableado', label: '2. Técnicas (Cableado/Conexionado/Pruebas)' },
                    { key: 'act_montaje_pruebas', label: '3. Montaje y Pruebas' },
                    { key: 'act_obra_civil', label: '4. Obra Civil' },
                    { key: 'act_sst_ambiental', label: '5. Gestión SST y Ambiental' }
                  ].map((act) => (
                    <div key={act.key}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>{act.label}</label>
                      <textarea name={act.key} value={form[act.key] || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Firmas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Elaborado por</label>
                  <input name="elaborado_por" value={form.elaborado_por || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Revisado por</label>
                  <input name="revisado_por" value={form.revisado_por || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem' }}>Aprobado por</label>
                  <input name="aprobado_por" value={form.aprobado_por || ''} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                </div>
              </div>

              <button type="submit" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}}>
                {currentInforme ? 'Actualizar Informe' : 'Guardar Informe'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Informediarioproy;
