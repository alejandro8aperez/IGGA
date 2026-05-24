import { useState, useRef, useEffect } from 'react';
export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return <div style={{ position: 'relative', display: 'inline-block' }}>{typeof children === 'function' ? children({ open, setOpen }) : children}</div>;
}
export function DropdownMenuTrigger({ children, onClick }) {
  return <div onClick={onClick} style={{ cursor: 'pointer', display: 'inline-flex' }}>{children}</div>;
}
export function DropdownMenuContent({ children, style }) {
  return <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 1000, background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '160px', padding: '0.4rem 0', ...style }}>{children}</div>;
}
export function DropdownMenuItem({ children, onClick, style }) {
  return <div onClick={onClick} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.15s', ...style }}
    onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>{children}</div>;
}
