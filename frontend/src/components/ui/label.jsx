export function Label({ children, htmlFor, style }) {
  return <label htmlFor={htmlFor} style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '0.3rem', ...style }}>{children}</label>;
}
