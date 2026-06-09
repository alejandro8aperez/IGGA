import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import {
  Type,
  Square,
  ChevronDown,
  Save,
  FolderOpen,
  Trash2,
  Copy,
  Calendar,
  Circle,
  Minus,
  Eye,
  Edit3,
  Palette,
  Layout,
  CloudUpload,
  RefreshCw,
  X,
  Plus,
  Settings,
  Download,
  Upload,
  Grid,
  Layers,
  MousePointer,
  Move,
  RotateCw
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/customization/form-formats/';

const COMPONENT_TYPES = {
  INPUT: { label: 'Campo de Texto', icon: Type, defaultProps: { placeholder: 'Ingrese texto...', width: 200, height: 40, fontSize: 14, color: '#000000', backgroundColor: '#ffffff', borderRadius: 4 } },
  BUTTON: { label: 'Botón', icon: Square, defaultProps: { text: 'Botón', width: 120, height: 45, fontSize: 14, color: '#ffffff', backgroundColor: '#3b82f6', borderRadius: 6, fontWeight: '600' } },
  SELECT: { label: 'Lista Desplegable', icon: ChevronDown, defaultProps: { placeholder: 'Seleccione...', width: 200, height: 40, fontSize: 14, color: '#000000', backgroundColor: '#ffffff', borderRadius: 4 } },
  TEXTAREA: { label: 'Área de Texto', icon: Type, defaultProps: { placeholder: 'Ingrese texto largo...', width: 300, height: 100, fontSize: 14, color: '#000000', backgroundColor: '#ffffff', borderRadius: 4 } },
  CHECKBOX: { label: 'Casilla', icon: Square, defaultProps: { label: 'Opción', width: 120, height: 30, fontSize: 14, color: '#000000' } },
  RADIO: { label: 'Botón de Radio', icon: Circle, defaultProps: { label: 'Opción Radio', width: 150, height: 30, fontSize: 14, color: '#000000' } },
  DATE: { label: 'Fecha', icon: Calendar, defaultProps: { width: 200, height: 40, fontSize: 14, color: '#000000', backgroundColor: '#ffffff', borderRadius: 4 } },
  LABEL: { label: 'Etiqueta', icon: Type, defaultProps: { text: 'Etiqueta', width: 150, height: 30, fontSize: 16, color: '#1f2937', fontWeight: '600' } },
  DIVIDER: { label: 'Separador', icon: Minus, defaultProps: { width: 400, height: 2, backgroundColor: '#d1d5db' } },
  SECTION: { label: 'Sección/Contenedor', icon: Layout, defaultProps: { width: 400, height: 150, backgroundColor: '#f9fafb', borderRadius: 8, borderStyle: 'dashed', borderColor: '#9ca3af' } }
};

function FormDesigner() {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [gridSize] = useState(10);
  const [cloudFormats, setCloudFormats] = useState([]);
  const [currentFormatName, setCurrentFormatName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [activeTab, setActiveTab] = useState('components');
  const canvasRef = useRef(null);
  const loadFileInputRef = useRef(null);

  useEffect(() => {
    fetchFormats();
    
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get('template');
    if (templateName) {
      loadTemplateByName(templateName);
    }
  }, []);

  const loadTemplateByName = async (name) => {
    try {
      const response = await axiosInstance.get(API_BASE);
      const template = response.data.find(f => f.nombre === name);
      if (template) {
        loadFromCloud(template);
      }
    } catch (error) {
      console.error('Error loading template by name:', error);
    }
  };

  const fetchFormats = async () => {
    try {
      const response = await axiosInstance.get(API_BASE);
      setCloudFormats(response.data);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const saveToCloud = async () => {
    const name = window.prompt('Ingrese un nombre para el formato:', currentFormatName || 'Nuevo Formato');
    if (!name) return;

    setLoading(true);
    try {
      const formatData = {
        nombre: name,
        componentes: components,
        fecha_creacion: new Date().toISOString()
      };
      
      await axiosInstance.post(API_BASE, formatData);
      setCurrentFormatName(name);
      fetchFormats();
      alert('Formato guardado exitosamente');
    } catch (error) {
      console.error('Error saving format:', error);
      alert('Error al guardar el formato');
    } finally {
      setLoading(false);
    }
  };

  const loadFromCloud = async (format) => {
    try {
      setComponents(format.componentes || []);
      setCurrentFormatName(format.nombre);
      setSelectedComponent(null);
    } catch (error) {
      console.error('Error loading format:', error);
      alert('Error al cargar el formato');
    }
  };

  const deleteFromCloud = async (formatId) => {
    if (!window.confirm('¿Está seguro de eliminar este formato?')) return;

    try {
      await axiosInstance.delete(`${API_BASE}${formatId}/`);
      fetchFormats();
      alert('Formato eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting format:', error);
      alert('Error al eliminar el formato');
    }
  };

  const addComponent = (type) => {
    const newComponent = {
      id: Date.now(),
      type,
      x: 50,
      y: 50,
      ...COMPONENT_TYPES[type].defaultProps
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
  };

  const updateComponent = (id, updates) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
    if (selectedComponent?.id === id) {
      setSelectedComponent({ ...selectedComponent, ...updates });
    }
  };

  const deleteComponent = (id) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  };

  const duplicateComponent = (id) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const newComponent = {
        ...component,
        id: Date.now(),
        x: component.x + 20,
        y: component.y + 20
      };
      setComponents([...components, newComponent]);
      setSelectedComponent(newComponent);
    }
  };

  const handleCanvasClick = (e) => {
    if (isPreviewMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedComponent = components.find(comp => 
      x >= comp.x && x <= comp.x + comp.width &&
      y >= comp.y && y <= comp.y + comp.height
    );
    
    setSelectedComponent(clickedComponent || null);
  };

  const handleComponentDrag = (e, component) => {
    if (isPreviewMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    updateComponent(component.id, { x, y });
  };

  const exportToJson = () => {
    const data = {
      nombre: currentFormatName || 'Sin nombre',
      componentes: components,
      fecha_exportacion: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentFormatName || 'formulario'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setComponents(data.componentes || []);
        setCurrentFormatName(data.nombre || '');
        setSelectedComponent(null);
      } catch (error) {
        alert('Error al leer el archivo JSON');
      }
    };
    reader.readAsText(file);
  };

  const renderComponent = (component, isPreview = false) => {
    const baseStyle = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      border: !isPreview && selectedComponent?.id === component.id ? '2px solid #667eea' : 'none',
      cursor: isPreview ? 'default' : 'move',
      userSelect: isPreview ? 'auto' : 'none'
    };

    switch (component.type) {
      case 'INPUT':
        return (
          <input
            type="text"
            placeholder={component.placeholder}
            style={{
              ...baseStyle,
              fontSize: component.fontSize,
              color: component.color,
              backgroundColor: component.backgroundColor,
              borderRadius: component.borderRadius,
              border: '1px solid #d1d5db',
              padding: '8px 12px'
            }}
            readOnly={isPreview}
          />
        );
      case 'BUTTON':
        return (
          <button
            style={{
              ...baseStyle,
              fontSize: component.fontSize,
              color: component.color,
              backgroundColor: component.backgroundColor,
              borderRadius: component.borderRadius,
              fontWeight: component.fontWeight,
              border: 'none',
              cursor: isPreview ? 'pointer' : 'move'
            }}
          >
            {component.text}
          </button>
        );
      case 'SELECT':
        return (
          <select
            style={{
              ...baseStyle,
              fontSize: component.fontSize,
              color: component.color,
              backgroundColor: component.backgroundColor,
              borderRadius: component.borderRadius,
              border: '1px solid #d1d5db',
              padding: '8px 12px'
            }}
            disabled={isPreview}
          >
            <option value="">{component.placeholder}</option>
            <option value="opcion1">Opción 1</option>
            <option value="opcion2">Opción 2</option>
          </select>
        );
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={component.placeholder}
            style={{
              ...baseStyle,
              fontSize: component.fontSize,
              color: component.color,
              backgroundColor: component.backgroundColor,
              borderRadius: component.borderRadius,
              border: '1px solid #d1d5db',
              padding: '8px 12px',
              resize: 'none'
            }}
            readOnly={isPreview}
          />
        );
      case 'CHECKBOX':
        return (
          <label style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isPreview ? 'pointer' : 'move'
          }}>
            <input type="checkbox" disabled={isPreview} />
            <span style={{ fontSize: component.fontSize, color: component.color }}>
              {component.label}
            </span>
          </label>
        );
      case 'RADIO':
        return (
          <label style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isPreview ? 'pointer' : 'move'
          }}>
            <input type="radio" name="radio-group" disabled={isPreview} />
            <span style={{ fontSize: component.fontSize, color: component.color }}>
              {component.label}
            </span>
          </label>
        );
      case 'DATE':
        return (
          <input
            type="date"
            style={{
              ...baseStyle,
              fontSize: component.fontSize,
              color: component.color,
              backgroundColor: component.backgroundColor,
              borderRadius: component.borderRadius,
              border: '1px solid #d1d5db',
              padding: '8px 12px'
            }}
            disabled={isPreview}
          />
        );
      case 'LABEL':
        return (
          <div style={{
            ...baseStyle,
            fontSize: component.fontSize,
            color: component.color,
            fontWeight: component.fontWeight,
            display: 'flex',
            alignItems: 'center'
          }}>
            {component.text}
          </div>
        );
      case 'DIVIDER':
        return (
          <div style={{
            ...baseStyle,
            backgroundColor: component.backgroundColor,
            height: component.height
          }} />
        );
      case 'SECTION':
        return (
          <div style={{
            ...baseStyle,
            backgroundColor: component.backgroundColor,
            borderRadius: component.borderRadius,
            border: component.borderStyle || 'dashed',
            borderColor: component.borderColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            Contenedor
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Edit3 size={24} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700', 
                color: '#1a202c',
                margin: '0 0 0.5rem 0'
              }}>
                Diseñador de Formularios
              </h2>
              <p style={{ color: '#718096', margin: 0, fontSize: '1rem' }}>
                Crea formularios personalizados con arrastrar y soltar
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              style={{
                background: isPreviewMode 
                  ? '#10b981' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Eye size={20} />
              {isPreviewMode ? 'Editar' : 'Vista Previa'}
            </button>
            <button
              onClick={saveToCloud}
              disabled={loading}
              style={{
                background: loading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: loading 
                  ? 'none' 
                  : '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Save size={20} />
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr 300px', gap: '2rem' }}>
        {/* Panel de Componentes */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '700', 
            color: '#1a202c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Layers size={20} style={{ color: '#667eea' }} />
            Componentes
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Object.entries(COMPONENT_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() => addComponent(type)}
                disabled={isPreviewMode}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: isPreviewMode ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                  opacity: isPreviewMode ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isPreviewMode) {
                    e.target.style.background = '#f1f5f9';
                    e.target.style.borderColor = '#667eea';
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isPreviewMode) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                <config.icon size={18} style={{ color: '#667eea' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                  {config.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas de Diseño */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              fontWeight: '700', 
              color: '#1a202c',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Grid size={20} style={{ color: '#667eea' }} />
              {isPreviewMode ? 'Vista Previa' : 'Lienzo de Diseño'}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setComponents([])}
                disabled={isPreviewMode}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: isPreviewMode ? 'not-allowed' : 'pointer',
                  opacity: isPreviewMode ? 0.5 : 1
                }}
              >
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>
          </div>
          
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              position: 'relative',
              width: '100%',
              height: '600px',
              background: isPreviewMode ? '#ffffff' : `repeating-linear-gradient(
                0deg,
                #f9fafb,
                #f9fafb ${gridSize}px,
                #f3f4f6 ${gridSize}px,
                #f3f4f6 ${gridSize * 2}px
              )`,
              border: isPreviewMode ? '1px solid #e2e8f0' : '2px dashed #d1d5db',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: isPreviewMode ? 'default' : 'crosshair'
            }}
          >
            {components.map(component => (
              <div
                key={component.id}
                onMouseDown={(e) => {
                  if (!isPreviewMode) {
                    setSelectedComponent(component);
                    const handleMouseMove = (e) => handleComponentDrag(e, component);
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }
                }}
              >
                {renderComponent(component, isPreviewMode)}
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Propiedades */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: '700', 
            color: '#1a202c',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Settings size={20} style={{ color: '#667eea' }} />
            Propiedades
          </h3>
          
          {selectedComponent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600', 
                  color: '#4b5563',
                  fontSize: '0.9rem'
                }}>
                  Tipo
                </label>
                <div style={{
                  padding: '0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#374151'
                }}>
                  {COMPONENT_TYPES[selectedComponent.type].label}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    X
                  </label>
                  <input
                    type="number"
                    value={selectedComponent.x}
                    onChange={(e) => updateComponent(selectedComponent.id, { x: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Y
                  </label>
                  <input
                    type="number"
                    value={selectedComponent.y}
                    onChange={(e) => updateComponent(selectedComponent.id, { y: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Ancho
                  </label>
                  <input
                    type="number"
                    value={selectedComponent.width}
                    onChange={(e) => updateComponent(selectedComponent.id, { width: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Alto
                  </label>
                  <input
                    type="number"
                    value={selectedComponent.height}
                    onChange={(e) => updateComponent(selectedComponent.id, { height: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Propiedades específicas del componente */}
              {selectedComponent.type === 'INPUT' || selectedComponent.type === 'TEXTAREA' ? (
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.placeholder || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, { placeholder: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ) : null}

              {selectedComponent.type === 'BUTTON' || selectedComponent.type === 'LABEL' ? (
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Texto
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.text || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, { text: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ) : null}

              {selectedComponent.type === 'CHECKBOX' || selectedComponent.type === 'RADIO' ? (
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Etiqueta
                  </label>
                  <input
                    type="text"
                    value={selectedComponent.label || ''}
                    onChange={(e) => updateComponent(selectedComponent.id, { label: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>
              ) : null}

              {/* Colores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Color de Texto
                  </label>
                  <input
                    type="color"
                    value={selectedComponent.color || '#000000'}
                    onChange={(e) => updateComponent(selectedComponent.id, { color: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    fontWeight: '600', 
                    color: '#4b5563',
                    fontSize: '0.9rem'
                  }}>
                    Color de Fondo
                  </label>
                  <input
                    type="color"
                    value={selectedComponent.backgroundColor || '#ffffff'}
                    onChange={(e) => updateComponent(selectedComponent.id, { backgroundColor: e.target.value })}
                    style={{
                      width: '100%',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  onClick={() => duplicateComponent(selectedComponent.id)}
                  style={{
                    flex: 1,
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Copy size={16} />
                  Duplicar
                </button>
                <button
                  onClick={() => deleteComponent(selectedComponent.id)}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#9ca3af'
            }}>
              <Settings size={48} style={{ marginBottom: '1rem' }} />
              <p>Selecciona un componente para editar sus propiedades</p>
            </div>
          )}
        </div>
      </div>

      {/* Barra de Herramientas Inferior */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1rem 1.5rem',
        marginTop: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={exportToJson}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            <Download size={20} />
            Exportar JSON
          </button>
          <button
            onClick={() => loadFileInputRef.current?.click()}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
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
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
            }}
          >
            <Upload size={20} />
            Importar JSON
          </button>
          <input
            ref={loadFileInputRef}
            type="file"
            accept=".json"
            onChange={importFromJson}
            style={{ display: 'none' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            Componentes: {components.length}
          </span>
          {currentFormatName && (
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              | Formato: {currentFormatName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default FormDesigner;
