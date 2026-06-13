/**
 * styleHelper.js - ERP-8AMPERIOS
 * Utilidad para normalizar props `style` en componentes React.
 * Previene el error: "Failed to set an indexed property [0] on CSSStyleDeclaration"
 */

/**
 * Normaliza cualquier valor de estilo a un objeto plano válido para React.
 * @param {Object|Array|string|null} style - Valor de estilo a normalizar
 * @returns {Object} - Objeto de estilo válido para React
 */
export const normalizeStyle = (style) => {
  if (!style) return {};

  // Ya es un objeto plano válido
  if (typeof style === 'object' && !Array.isArray(style)) {
    return style;
  }

  // Array de objetos - fusionarlos en uno solo
  if (Array.isArray(style)) {
    return style.reduce((acc, curr) => {
      if (curr && typeof curr === 'object') {
        return { ...acc, ...curr };
      }
      return acc;
    }, {});
  }

  // String CSS - convertir a objeto (básico)
  if (typeof style === 'string') {
    const result = {};
    style.split(';').forEach(rule => {
      const [prop, value] = rule.split(':');
      if (prop && value) {
        const camelProp = prop.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        result[camelProp] = value.trim();
      }
    });
    return result;
  }

  return {};
};

/**
 * Hook seguro para aplicar estilos dinámicos.
 * Uso: const safeStyle = useSafeStyle(dynamicStyle);
 */
export const useSafeStyle = (style) => {
  return normalizeStyle(style);
};

/**
 * Componente wrapper que normaliza estilos automáticamente.
 * Uso: <SafeDiv style={dynamicStyle}>contenido</SafeDiv>
 */
import React from 'react';

export const SafeDiv = ({ style, children, ...props }) => {
  return (
    <div style={normalizeStyle(style)} {...props}>
      {children}
    </div>
  );
};

export default normalizeStyle;
