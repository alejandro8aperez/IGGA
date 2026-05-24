export function Separator({ style, orientation = 'horizontal' }) {
  return <div style={{ background: '#e2e8f0', ...(orientation === 'horizontal' ? { height: '1px', width: '100%', margin: '0.5rem 0' } : { width: '1px', alignSelf: 'stretch' }), ...style }} />;
}
