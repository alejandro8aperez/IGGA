import { useState } from 'react';
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => onOpenChange?.(false)}>
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}
export function DialogContent({ children, style }) {
  return <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', minWidth: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', ...style }}>{children}</div>;
}
export function DialogHeader({ children }) {
  return <div style={{ marginBottom: '1rem' }}>{children}</div>;
}
export function DialogTitle({ children }) {
  return <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{children}</h2>;
}
