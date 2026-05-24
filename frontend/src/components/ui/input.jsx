export function Input({ value, onChange, placeholder, type = 'text', className, style, disabled }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} className={className}
    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '0.875rem', background: 'white', outline: 'none', ...style }} />;
}
