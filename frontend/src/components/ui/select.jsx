import { useState } from 'react';
export function Select({ value, onValueChange, children }) {
  return <div style={{ position: 'relative' }} data-value={value}>{typeof children === 'function' ? children({ value, onValueChange }) : children}</div>;
}
export function SelectTrigger({ children, style }) {
  return <div style={{ padding: '0.5rem 0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', fontSize: '0.875rem', ...style }}>{children}</div>;
}
export function SelectValue({ placeholder }) {
  return <span style={{ color: '#94a3b8' }}>{placeholder}</span>;
}
export function SelectContent({ children, style }) {
  return <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', marginTop: '2px', ...style }}>{children}</div>;
}
export function SelectItem({ value, children, onSelect }) {
  return <div data-value={value} onClick={() => onSelect?.(value)}
    style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', cursor: 'pointer', color: '#334155' }}
    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>{children}</div>;
}
