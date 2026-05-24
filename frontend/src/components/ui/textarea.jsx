export function Textarea({ value, onChange, placeholder, rows = 3, className, style, disabled }) {
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled} className={className}
    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', background: 'white', outline: 'none', ...style }} />;
}
