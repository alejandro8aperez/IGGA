import { createContext, useContext, useState } from 'react';

const TabsCtx = createContext({});

export function Tabs({ value, onValueChange, defaultValue, children, className, style }) {
  const [internal, setInternal] = useState(defaultValue || '');
  const active = value !== undefined ? value : internal;
  const setActive = (v) => { setInternal(v); onValueChange?.(v); };
  return <TabsCtx.Provider value={{ active, setActive }}><div className={className} style={style}>{children}</div></TabsCtx.Provider>;
}
export function TabsList({ children, className, style }) {
  return <div className={className} style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '0.5rem', ...style }}>{children}</div>;
}
export function TabsTrigger({ value, children, className, style }) {
  const { active, setActive } = useContext(TabsCtx);
  const isActive = active === value;
  return (
    <button type="button" onClick={() => setActive(value)} className={className}
      style={{ padding: '0.6rem 1rem', fontSize: '0.88rem', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', borderBottom: `3px solid ${isActive ? '#667eea' : 'transparent'}`, color: isActive ? '#667eea' : '#64748b', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', ...style }}>
      {children}
    </button>
  );
}
export function TabsContent({ value, children, className, style }) {
  const { active } = useContext(TabsCtx);
  if (active !== value) return null;
  return <div className={className} style={style}>{children}</div>;
}
