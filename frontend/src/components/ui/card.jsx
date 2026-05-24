export function Card({ children, className, style }) {
  return <div className={className} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', ...style }}>{children}</div>;
}
export function CardHeader({ children, style }) {
  return <div style={{ padding: '1.25rem 1.5rem 0', ...style }}>{children}</div>;
}
export function CardTitle({ children, style }) {
  return <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0, ...style }}>{children}</h3>;
}
export function CardContent({ children, style }) {
  return <div style={{ padding: '1rem 1.5rem 1.5rem', ...style }}>{children}</div>;
}
