export function Table({ children, style }) {
  return <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', ...style }}>{children}</table>;
}
export function TableHeader({ children }) {
  return <thead style={{ background: '#f8fafc' }}>{children}</thead>;
}
export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}
export function TableRow({ children, style }) {
  return <tr style={{ borderBottom: '1px solid #f1f5f9', ...style }}
    onMouseOver={e => e.currentTarget.style.background = '#fafbff'}
    onMouseOut={e => e.currentTarget.style.background = ''}>{children}</tr>;
}
export function TableHead({ children, style }) {
  return <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', ...style }}>{children}</th>;
}
export function TableCell({ children, style }) {
  return <td style={{ padding: '0.75rem 1rem', color: '#334155', ...style }}>{children}</td>;
}
