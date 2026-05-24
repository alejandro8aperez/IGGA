export function Button({ children, onClick, disabled, className, style, type = 'button', variant }) {
  const base = { padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e0', background: variant === 'destructive' ? '#ef4444' : variant === 'outline' ? 'white' : '#667eea', color: variant === 'outline' ? '#475569' : 'white', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1, fontSize: '0.875rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
  return <button type={type} onClick={onClick} disabled={disabled} className={className} style={{ ...base, ...style }}>{children}</button>;
}
