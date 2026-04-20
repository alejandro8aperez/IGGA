import React from 'react';
import FormDesigner from '../components/FormDesigner';

function FormDesignerPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        background: 'var(--bg-main)',
      }}
    >
      <header
        style={{
          flexShrink: 0,
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Diseño de formularios
        </h1>
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '52rem' }}>
          Añada controles desde la izquierda, colóquelos en el lienzo y edite propiedades a la derecha. Use{' '}
          <strong>Guardar diseño</strong> para descargar un JSON y <strong>Cargar diseño</strong> para abrir uno guardado.
        </p>
      </header>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <FormDesigner />
      </div>
    </div>
  );
}

export default FormDesignerPage;
