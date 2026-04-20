import { AlertCircle, Eye, Lock } from 'lucide-react';

export default function DemoBanner() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '0.75rem 1rem',
            textAlign: 'center',
            zIndex: 10000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: '600'
        }}>
            <Eye size={18} />
            <span>MODO DEMO - Versión de Evaluación</span>
            <Lock size={18} />
            <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.8rem'
            }}>
                Usuario: demo@8amperios.com
            </span>
        </div>
    );
}
