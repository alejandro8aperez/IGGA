import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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
  FileJson
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

const propInputStyle = {
  width: '100%',
  padding: '8px',
  backgroundColor: '#f8fafc',
  color: '#1e293b',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box'
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
  const canvasRef = useRef(null);
  const loadFileInputRef = useRef(null);

  useEffect(() => {
    fetchFormats();
    
    // Check if we should load a template from URL
    const params = new URLSearchParams(window.location.search);
    const templateName = params.get('template');
    if (templateName) {
      loadTemplateByName(templateName);
    }
  }, []);

  const loadTemplateByName = async (name) => {
    try {
      const response = await axios.get(API_BASE);
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
      const response = await axios.get(API_BASE);
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
      const design = {
        components,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      await axios.post(API_BASE, {
        nombre: name,
        json_design: design,
        creado_por: 1 // TODO: Get current user ID
      });

      setCurrentFormatName(name);
      fetchFormats();
      window.alert('Formato guardado en la nube correctamente.');
    } catch (error) {
      console.error('Error saving format:', error);
      window.alert('Error al guardar en la nube.');
    } finally {
      setLoading(false);
    }
  };

  const loadFromCloud = (format) => {
    try {
      setComponents(format.json_design.components || []);
      setCurrentFormatName(format.nombre);
      setSelectedComponent(null);
      setIsPreviewMode(false);
    } catch (error) {
      window.alert('Error al cargar el formato: ' + error.message);
    }
  };

  const toggleJsonEditor = () => {
    if (!showJsonEditor) {
      setJsonText(JSON.stringify({ components, version: '1.0' }, null, 2));
    }
    setShowJsonEditor(!showJsonEditor);
  };

  const applyJsonChanges = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.components && Array.isArray(parsed.components)) {
        setComponents(parsed.components);
        setShowJsonEditor(false);
        window.alert('Diseño actualizado desde el código JSON.');
      } else {
        throw new Error('El JSON debe contener un array de "components".');
      }
    } catch (error) {
      window.alert('Error en el JSON: ' + error.message);
    }
  };

  const snapToGrid = (value) => Math.round(value / gridSize) * gridSize;

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedComponent(null);
    }
  };

  const handleComponentMouseDown = (e, componentId) => {
    if (e.button !== 0 || isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    const component = components.find((c) => c.id === componentId);
    if (!component || !canvasRef.current) return;
    setSelectedComponent(component);
    setIsDragging(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const canvasW = 1000;
    const canvasH = 1200;
    const startMouseX = e.clientX - rect.left;
    const startMouseY = e.clientY - rect.top;
    const originX = component.x;
    const originY = component.y;
    const w = component.width;
    const h = component.height;

    const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const mx = moveEvent.clientX - rect.left;
      const my = moveEvent.clientY - rect.top;
      const nx = clamp(originX + (mx - startMouseX), 0, Math.max(0, canvasW - w));
      const ny = clamp(originY + (my - startMouseY), 0, Math.max(0, canvasH - h));
      setComponents((prev) =>
        prev.map((comp) => (comp.id === componentId ? { ...comp, x: nx, y: ny } : comp))
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsDragging(false);
      let snapped = null;
      setComponents((prev) =>
        prev.map((comp) => {
          if (comp.id !== componentId) return comp;
          snapped = {
            ...comp,
            x: snapToGrid(comp.x),
            y: snapToGrid(comp.y),
          };
          return snapped;
        })
      );
      if (snapped) setSelectedComponent(snapped);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e, componentId, handle) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    const component = components.find(c => c.id === componentId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width;
    const startHeight = component.height;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (handle.includes('right')) newWidth = Math.max(50, snapToGrid(startWidth + deltaX));
      if (handle.includes('left')) newWidth = Math.max(50, snapToGrid(startWidth - deltaX));
      if (handle.includes('bottom')) newHeight = Math.max(30, snapToGrid(startHeight + deltaY));
      if (handle.includes('top')) newHeight = Math.max(30, snapToGrid(startHeight - deltaY));
      
      setComponents(prev => prev.map(comp => 
        comp.id === componentId 
          ? { ...comp, width: newWidth, height: newHeight }
          : comp
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const addComponent = (type) => {
    const newComponent = {
      id: Date.now().toString(),
      type,
      x: snapToGrid(50),
      y: snapToGrid(50),
      ...COMPONENT_TYPES[type].defaultProps
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  };

  const deleteComponent = (componentId) => {
    setComponents(prev => prev.filter(c => c.id !== componentId));
    setSelectedComponent(null);
  };

  const duplicateComponent = (componentId) => {
    const component = components.find(c => c.id === componentId);
    const newComponent = {
      ...component,
      id: Date.now().toString(),
      x: component.x + 20,
      y: component.y + 20
    };
    setComponents(prev => [...prev, newComponent]);
    setSelectedComponent(newComponent);
  };

  const updateComponentProperty = (property, value) => {
    if (!selectedComponent) return;
    
    setComponents(prev => prev.map(comp => 
      comp.id === selectedComponent.id 
        ? { ...comp, [property]: value }
        : comp
    ));
    
    setSelectedComponent(prev => ({ ...prev, [property]: value }));
  };

  const saveDesign = () => {
    const design = {
      components,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formulario-design-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadDesign = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        window.alert('Error: Por favor seleccione un archivo .json válido generado por este diseñador.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const design = JSON.parse(event.target.result);
          
          if (!design.components || !Array.isArray(design.components)) {
            throw new Error('El archivo no tiene el formato de diseño esperado.');
          }

          setComponents(design.components || []);
          setSelectedComponent(null);
          setIsPreviewMode(false);
        } catch (error) {
          window.alert('Error al cargar el diseño: El archivo seleccionado no es un JSON de diseño válido. Asegúrese de no estar intentando cargar un archivo de código (.jsx o .js).\n\nDetalle: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const renderComponent = (component) => {
    const isSelected = selectedComponent?.id === component.id;
    
    const baseStyle = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      border: isPreviewMode 
        ? (component.type === 'SECTION' ? `1px ${component.borderStyle || 'solid'} ${component.borderColor || '#d1d5db'}` : 'none')
        : (isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db'),
      backgroundColor: component.backgroundColor || '#ffffff',
      cursor: isPreviewMode ? 'default' : (isDragging ? 'grabbing' : 'grab'),
      userSelect: 'none',
      padding: component.type === 'DIVIDER' ? '0' : '8px',
      borderRadius: `${component.borderRadius || 0}px`,
      fontSize: `${component.fontSize || 14}px`,
      color: component.color || '#000000',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box'
    };

    const commonInputStyle = {
      width: '100%',
      height: '100%',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: 'inherit',
      color: 'inherit',
      fontWeight: component.fontWeight || 'normal'
    };

    switch (component.type) {
      case 'INPUT':
        return (
          <div style={baseStyle}>
            <input
              type="text"
              placeholder={component.placeholder}
              style={commonInputStyle}
              readOnly
            />
          </div>
        );
      
      case 'BUTTON':
        return (
          <div style={baseStyle}>
            <button
              style={{ 
                ...commonInputStyle,
                backgroundColor: isPreviewMode ? component.backgroundColor : 'transparent', 
                cursor: isPreviewMode ? 'pointer' : 'grab',
                fontWeight: component.fontWeight || '600'
              }}
            >
              {component.text}
            </button>
          </div>
        );
      
      case 'SELECT':
        return (
          <div style={baseStyle}>
            <select
              style={commonInputStyle}
              disabled={!isPreviewMode}
            >
              <option>{component.placeholder}</option>
            </select>
          </div>
        );
      
      case 'TEXTAREA':
        return (
          <div style={{ ...baseStyle, alignItems: 'flex-start' }}>
            <textarea
              placeholder={component.placeholder}
              style={{ 
                ...commonInputStyle,
                resize: 'none'
              }}
              readOnly
            />
          </div>
        );
      
      case 'CHECKBOX':
        return (
          <div style={{ ...baseStyle, border: isPreviewMode ? 'none' : baseStyle.border, backgroundColor: 'transparent' }}>
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
              disabled={!isPreviewMode}
            />
            <span style={{ fontWeight: component.fontWeight || 'normal' }}>{component.label}</span>
          </div>
        );

      case 'RADIO':
        return (
          <div style={{ ...baseStyle, border: isPreviewMode ? 'none' : baseStyle.border, backgroundColor: 'transparent' }}>
            <input
              type="radio"
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
              disabled={!isPreviewMode}
            />
            <span style={{ fontWeight: component.fontWeight || 'normal' }}>{component.label}</span>
          </div>
        );

      case 'DATE':
        return (
          <div style={baseStyle}>
            <input
              type="date"
              style={commonInputStyle}
              readOnly={!isPreviewMode}
            />
          </div>
        );
      
      case 'LABEL':
        return (
          <div style={{ ...baseStyle, border: isPreviewMode ? 'none' : baseStyle.border, backgroundColor: 'transparent' }}>
            <span style={{ fontWeight: component.fontWeight || '600' }}>{component.text}</span>
          </div>
        );

      case 'DIVIDER':
        return (
          <div style={{ 
            ...baseStyle, 
            height: `${component.height}px`,
            backgroundColor: component.backgroundColor,
            border: 'none',
            padding: 0
          }} />
        );

      case 'SECTION':
        return (
          <div style={{ 
            ...baseStyle, 
            border: `${isPreviewMode ? '1px' : '2px'} ${component.borderStyle || 'dashed'} ${component.borderColor || '#9ca3af'}`,
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }}>
            {!isPreviewMode && (
              <span style={{ 
                position: 'absolute', 
                top: 2, 
                left: 5, 
                fontSize: '10px', 
                color: '#9ca3af',
                textTransform: 'uppercase'
              }}>
                Sección
              </span>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', backgroundColor: '#f3f4f6', flexDirection: 'column' }}>
      {/* Barra de herramientas superior */}
      <div style={{ 
        height: '60px', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <Layout size={20} />
            <span style={{ fontWeight: 'bold' }}>Diseñador de Formatos</span>
          </div>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setIsPreviewMode(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: !isPreviewMode ? '#ffffff' : 'transparent',
                boxShadow: !isPreviewMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: !isPreviewMode ? '600' : '400',
                color: !isPreviewMode ? '#3b82f6' : '#64748b'
              }}
            >
              <Edit3 size={14} />
              Edición
            </button>
            <button
              onClick={() => {
                setIsPreviewMode(true);
                setSelectedComponent(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isPreviewMode ? '#ffffff' : 'transparent',
                boxShadow: isPreviewMode ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isPreviewMode ? '600' : '400',
                color: isPreviewMode ? '#3b82f6' : '#64748b'
              }}
            >
              <Eye size={14} />
              Vista Previa
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              if (window.confirm('¿Está seguro de que desea limpiar el lienzo y comenzar un nuevo diseño?')) {
                setComponents([]);
                setSelectedComponent(null);
                setCurrentFormatName('');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#ef4444',
              border: '1px solid #fee2e2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={16} />
            Nuevo
          </button>

          {/* Selector de formatos en la nube */}
          <div style={{ position: 'relative' }}>
            <select
              onChange={(e) => {
                const format = cloudFormats.find(f => f.id === parseInt(e.target.value));
                if (format) loadFromCloud(format);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                maxWidth: '200px'
              }}
            >
              <option value="">📁 Biblioteca en la Nube</option>
              {cloudFormats.map(f => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>

          <button
            onClick={saveToCloud}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <CloudUpload size={16} />
            {loading ? 'Guardando...' : 'Subir a la Nube'}
          </button>

          <button
            onClick={() => loadFileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <FolderOpen size={16} />
            Cargar Local
          </button>
          <button
            onClick={toggleJsonEditor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <FileJson size={16} />
            Ver JSON
          </button>

          <button
            onClick={saveDesign}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Save size={16} />
            Guardar Local
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!isPreviewMode && (
          <div style={{ 
            width: '260px', 
            backgroundColor: '#ffffff', 
            borderRight: '1px solid #e5e7eb',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '15px', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Componentes
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {Object.entries(COMPONENT_TYPES).map(([type, config]) => {
                const Icon = config.icon;
                return (
                  <div
                    key={type}
                    onClick={() => addComponent(type)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  >
                    <div style={{ color: '#3b82f6' }}><Icon size={20} /></div>
                    <span style={{ fontSize: '11px', fontWeight: '500', color: '#1e293b' }}>{config.label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
              <p style={{ fontSize: '11px', color: '#9a3412', lineHeight: '1.5', margin: 0 }}>
                <strong>Tip:</strong> Puede arrastrar los componentes en el lienzo para reposicionarlos y usar los manejadores azules para redimensionar.
              </p>
            </div>
          </div>
        )}

        <div style={{ 
          flex: 1, 
          position: 'relative', 
          overflow: 'auto', 
          backgroundColor: '#f1f5f9',
          display: 'flex',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: '1000px',
              height: '1200px',
              minHeight: '1200px',
              backgroundColor: 'white',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              backgroundImage: isPreviewMode ? 'none' : `
                linear-gradient(to right, #f1f5f9 1px, transparent 1px),
                linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              position: 'relative',
              cursor: isPreviewMode ? 'default' : 'crosshair'
            }}
          >
            {components.map(component => (
              <div key={component.id}>
                {renderComponent(component)}
                
                {!isPreviewMode && selectedComponent?.id === component.id && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        left: component.x - 4,
                        top: component.y - 4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'nw-resize',
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, component.id, 'top-left')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: component.x + component.width - 4,
                        top: component.y - 4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'ne-resize',
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, component.id, 'top-right')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: component.x - 4,
                        top: component.y + component.height - 4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'sw-resize',
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, component.id, 'bottom-left')}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: component.x + component.width - 4,
                        top: component.y + component.height - 4,
                        width: 8,
                        height: 8,
                        backgroundColor: '#3b82f6',
                        border: '1px solid white',
                        borderRadius: '50%',
                        cursor: 'se-resize',
                        zIndex: 20
                      }}
                      onMouseDown={(e) => handleResizeMouseDown(e, component.id, 'bottom-right')}
                    />
                    <div style={{
                      position: 'absolute',
                      top: component.y - 35,
                      left: component.x,
                      display: 'flex',
                      gap: '4px',
                      zIndex: 30
                    }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicateComponent(component.id); }}
                        style={{ padding: '4px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        title="Duplicar"
                      >
                        <Copy size={12} color="#64748b" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteComponent(component.id); }}
                        style={{ padding: '4px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        title="Eliminar"
                      >
                        <Trash2 size={12} color="#ef4444" />
                      </button>
                    </div>
                  </>
                )}
                
                {!isPreviewMode && (
                  <div
                    style={{
                      position: 'absolute',
                      left: component.x,
                      top: component.y,
                      width: component.width,
                      height: component.height,
                      cursor: 'move',
                      zIndex: 10
                    }}
                    onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {!isPreviewMode && selectedComponent && (
          <div style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e5e7eb',
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#1e293b' }}>
              <Palette size={18} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Propiedades</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section>
                <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Básico</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Posición X</label>
                    <input
                      type="number"
                      value={selectedComponent.x}
                      onChange={(e) => updateComponentProperty('x', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Posición Y</label>
                    <input
                      type="number"
                      value={selectedComponent.y}
                      onChange={(e) => updateComponentProperty('y', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Ancho (px)</label>
                    <input
                      type="number"
                      value={selectedComponent.width}
                      onChange={(e) => updateComponentProperty('width', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Alto (px)</label>
                    <input
                      type="number"
                      value={selectedComponent.height}
                      onChange={(e) => updateComponentProperty('height', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Contenido y Datos</h4>
                
                {(selectedComponent.type === 'INPUT' || selectedComponent.type === 'TEXTAREA' || selectedComponent.type === 'SELECT' || selectedComponent.type === 'CHECKBOX' || selectedComponent.type === 'RADIO' || selectedComponent.type === 'DATE') && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Nombre del Campo (Data Key)</label>
                    <input
                      type="text"
                      placeholder="e.g. cliente, total, fecha"
                      value={selectedComponent.fieldName || ''}
                      onChange={(e) => updateComponentProperty('fieldName', e.target.value)}
                      style={propInputStyle}
                    />
                  </div>
                )}

                {(selectedComponent.type === 'INPUT' || selectedComponent.type === 'TEXTAREA' || selectedComponent.type === 'SELECT') && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Placeholder / Ayuda</label>
                    <input
                      type="text"
                      value={selectedComponent.placeholder || ''}
                      onChange={(e) => updateComponentProperty('placeholder', e.target.value)}
                      style={propInputStyle}
                    />
                  </div>
                )}
                
                {(selectedComponent.type === 'BUTTON' || selectedComponent.type === 'LABEL' || selectedComponent.type === 'CHECKBOX' || selectedComponent.type === 'RADIO') && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Texto / Etiqueta</label>
                    <input
                      type="text"
                      value={selectedComponent.text || selectedComponent.label || ''}
                      onChange={(e) => updateComponentProperty(selectedComponent.type === 'CHECKBOX' || selectedComponent.type === 'RADIO' ? 'label' : 'text', e.target.value)}
                      style={propInputStyle}
                    />
                  </div>
                )}

                {selectedComponent.type === 'BUTTON' && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Acción del Botón</label>
                    <select
                      value={selectedComponent.buttonType || 'none'}
                      onChange={(e) => updateComponentProperty('buttonType', e.target.value)}
                      style={propInputStyle}
                    >
                      <option value="none">Ninguna</option>
                      <option value="submit">Guardar (Submit)</option>
                      <option value="cancel">Cancelar</option>
                    </select>
                  </div>
                )}
              </section>

              <section>
                <h4 style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>Estilo Visual</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Tam. Fuente</label>
                    <input
                      type="number"
                      value={selectedComponent.fontSize || 14}
                      onChange={(e) => updateComponentProperty('fontSize', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Borde (px)</label>
                    <input
                      type="number"
                      value={selectedComponent.borderRadius || 0}
                      onChange={(e) => updateComponentProperty('borderRadius', parseInt(e.target.value))}
                      style={propInputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Color Texto</label>
                    <input
                      type="color"
                      value={selectedComponent.color || '#000000'}
                      onChange={(e) => updateComponentProperty('color', e.target.value)}
                      style={{ ...propInputStyle, height: '35px', padding: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Color Fondo</label>
                    <input
                      type="color"
                      value={selectedComponent.backgroundColor || '#ffffff'}
                      onChange={(e) => updateComponentProperty('backgroundColor', e.target.value)}
                      style={{ ...propInputStyle, height: '35px', padding: '2px' }}
                    />
                  </div>
                </div>

                {selectedComponent.type === 'SECTION' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Estilo Borde</label>
                      <select
                        value={selectedComponent.borderStyle || 'dashed'}
                        onChange={(e) => updateComponentProperty('borderStyle', e.target.value)}
                        style={propInputStyle}
                      >
                        <option value="solid">Sólido</option>
                        <option value="dashed">Guiones</option>
                        <option value="dotted">Puntos</option>
                        <option value="none">Ninguno</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: '#64748b' }}>Color Borde</label>
                      <input
                        type="color"
                        value={selectedComponent.borderColor || '#9ca3af'}
                        onChange={(e) => updateComponentProperty('borderColor', e.target.value)}
                        style={{ ...propInputStyle, height: '35px', padding: '2px' }}
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>
            
            <div style={{ marginTop: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <button
                onClick={() => deleteComponent(selectedComponent.id)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#fee2e2',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 size={16} />
                Eliminar Componente
              </button>
            </div>
          </div>
        )}
      </div>
      <input
        ref={loadFileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={loadDesign}
        style={{ display: 'none' }}
      />

      {/* Modal Editor JSON */}
      {showJsonEditor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '40px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileJson size={20} color="#3b82f6" />
                Editor de Código JSON
              </h3>
              <button onClick={() => setShowJsonEditor(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ flex: 1, padding: '20px', overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
                Aquí puede ver y editar directamente la estructura técnica del formulario.
              </p>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                style={{
                  width: '100%',
                  height: '400px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '15px',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  borderRadius: '8px',
                  border: 'none',
                  resize: 'none'
                }}
              />
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowJsonEditor(false)}
                style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={applyJsonChanges}
                style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDesigner;
