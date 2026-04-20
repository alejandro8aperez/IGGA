import React from 'react';

const DynamicFormRenderer = ({ design, formData, onChange, onSubmit, onCancel }) => {
  if (!design || !design.components) return null;

  const renderComponent = (component) => {
    const baseStyle = {
      position: 'absolute',
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      backgroundColor: component.backgroundColor || '#ffffff',
      borderRadius: `${component.borderRadius || 0}px`,
      fontSize: `${component.fontSize || 14}px`,
      color: component.color || '#000000',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: component.type === 'DIVIDER' ? '0' : '8px',
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

    // Map component "text" or "label" to a field in formData if it looks like a key
    // For simplicity in this ERP, we'll assume the user might name a label "cliente" or "total"
    // but better yet, we can add a "fieldName" property to components in the future.
    // For now, we'll just render them.

    switch (component.type) {
      case 'INPUT':
        return (
          <div key={component.id} style={baseStyle}>
            <input
              type="text"
              placeholder={component.placeholder}
              style={commonInputStyle}
              value={formData[component.fieldName] || ''}
              onChange={(e) => onChange(component.fieldName, e.target.value)}
            />
          </div>
        );
      
      case 'BUTTON':
        return (
          <div key={component.id} style={baseStyle}>
            <button
              type={component.buttonType === 'submit' ? 'submit' : 'button'}
              onClick={component.buttonType === 'cancel' ? onCancel : undefined}
              style={{ 
                ...commonInputStyle,
                backgroundColor: component.backgroundColor, 
                cursor: 'pointer',
                fontWeight: component.fontWeight || '600'
              }}
            >
              {component.text}
            </button>
          </div>
        );
      
      case 'SELECT':
        return (
          <div key={component.id} style={baseStyle}>
            <select
              style={commonInputStyle}
              value={formData[component.fieldName] || ''}
              onChange={(e) => onChange(component.fieldName, e.target.value)}
            >
              <option value="">{component.placeholder}</option>
              {component.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      
      case 'TEXTAREA':
        return (
          <div key={component.id} style={{ ...baseStyle, alignItems: 'flex-start' }}>
            <textarea
              placeholder={component.placeholder}
              style={{ 
                ...commonInputStyle,
                resize: 'none'
              }}
              value={formData[component.fieldName] || ''}
              onChange={(e) => onChange(component.fieldName, e.target.value)}
            />
          </div>
        );
      
      case 'CHECKBOX':
        return (
          <div key={component.id} style={{ ...baseStyle, border: 'none', backgroundColor: 'transparent' }}>
            <input
              type="checkbox"
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
              checked={!!formData[component.fieldName]}
              onChange={(e) => onChange(component.fieldName, e.target.checked)}
            />
            <span style={{ fontWeight: component.fontWeight || 'normal' }}>{component.label}</span>
          </div>
        );

      case 'RADIO':
        return (
          <div key={component.id} style={{ ...baseStyle, border: 'none', backgroundColor: 'transparent' }}>
            <input
              type="radio"
              style={{ width: '16px', height: '16px', marginRight: '8px' }}
              checked={formData[component.fieldName] === component.value}
              onChange={() => onChange(component.fieldName, component.value)}
            />
            <span style={{ fontWeight: component.fontWeight || 'normal' }}>{component.label}</span>
          </div>
        );

      case 'DATE':
        return (
          <div key={component.id} style={baseStyle}>
            <input
              type="date"
              style={commonInputStyle}
              value={formData[component.fieldName] || ''}
              onChange={(e) => onChange(component.fieldName, e.target.value)}
            />
          </div>
        );
      
      case 'LABEL':
        return (
          <div key={component.id} style={{ ...baseStyle, border: 'none', backgroundColor: 'transparent' }}>
            <span style={{ fontWeight: component.fontWeight || '600' }}>{component.text}</span>
          </div>
        );

      case 'DIVIDER':
        return (
          <div key={component.id} style={{ 
            ...baseStyle, 
            height: `${component.height}px`,
            backgroundColor: component.backgroundColor,
            border: 'none',
            padding: 0
          }} />
        );

      case 'SECTION':
        return (
          <div key={component.id} style={{ 
            ...baseStyle, 
            border: `1px ${component.borderStyle || 'solid'} ${component.borderColor || '#d1d5db'}`,
            alignItems: 'flex-start',
            justifyContent: 'flex-start'
          }}>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ position: 'relative', width: '1000px', height: '1200px', margin: '0 auto', backgroundColor: '#ffffff' }}>
      {design.components.map(renderComponent)}
    </form>
  );
};

export default DynamicFormRenderer;
