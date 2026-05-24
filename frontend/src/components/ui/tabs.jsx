// Stub de tabs para reemplazar shadcn/ui
import { useState } from 'react';

export function Tabs({ defaultValue, value, onValueChange, children, className, style }) {
  const [active, setActive] = useState(value || defaultValue || '');
  const handleChange = (v) => { setActive(v); onValueChange?.(v); };
  return <div style={style} className={className} data-active={active}>
    {typeof children === 'function' ? children({ active, setActive: handleChange }) : children}
  </div>;
}
export function TabsList({ children, style }) {
  return <div style={{ display:'flex', gap:'0.25rem', borderBottom:'1px solid #e2e8f0', ...style }}>{children}</div>;
}
export function TabsTrigger({ value, children, style }) {
  return <button type="button" data-value={value} style={style}>{children}</button>;
}
export function TabsContent({ value, children, style }) {
  return <div data-value={value} style={style}>{children}</div>;
}

