import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function DemoLogin({ onLogin }) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: 'demo@8amperios.com',
        password: 'Demo2024!'
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulación de login para demo
        setTimeout(() => {
            if (formData.email === 'demo@8amperios.com' && formData.password === 'Demo2024!') {
                onLogin({
                    id: 1,
                    email: formData.email,
                    name: 'Usuario Demo',
                    role: 'demo'
                });
            } else {
                alert('Credenciales incorrectas. Usa: demo@8amperios.com / Demo2024!');
            }
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '3rem',
                width: '100%',
                maxWidth: '450px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2rem',
                        fontWeight: '700',
                        color: 'white'
                    }}>
                        ⚡
                    </div>
                    <h1 style={{ 
                        fontSize: '2rem', 
                        fontWeight: '700', 
                        color: '#1a202c',
                        margin: '0 0 0.5rem 0'
                    }}>
                        8AMPERIOS ERP
                    </h1>
                    <p style={{ 
                        color: '#718096', 
                        margin: 0,
                        fontSize: '1rem'
                    }}>
                        Demo del Sistema de Gestión
                    </p>
                </div>

                {/* Alerta de Demo */}
                <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} style={{ color: '#0ea5e9', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                        <strong>Modo Demostración:</strong> Esta es una versión de evaluación del ERP 8AMPERIOS. 
                        Usa las siguientes credenciales para explorar todas las funcionalidades.
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            fontSize: '0.875rem'
                        }}>
                            <Mail size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '0.875rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            fontSize: '0.875rem'
                        }}>
                            <Lock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem 3rem 0.875rem 1rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '10px',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '0.25rem'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            background: isLoading 
                                ? '#9ca3af' 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s',
                            boxShadow: isLoading 
                                ? 'none' 
                                : '0 4px 15px rgba(102, 126, 234, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!isLoading) {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }                                }></div>
                                <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Ingresar al Demo
                            </>
                        )}
                    </button>
                </form>

                {/* Credenciales Predefinidas */}
                <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginTop: '2rem',
                    border: '1px solid #e2e8f0'
                }}>
                    <h3 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#374151',
                        marginBottom: '1rem',
                        textAlign: 'center'
                    }}>
                        Credenciales de Acceso
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Usuario:</strong> <span style={{ fontFamily: 'monospace', background: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>demo@8amperios.com</span>
                        </div>
                        <div>
                            <strong>Contraseña:</strong> <span style={{ fontFamily: 'monospace', background: '#e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>Demo2024!</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e5e7eb',
                    fontSize: '0.8rem',
                    color: '#9ca3af'
                }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>
                        © 2024 8AMPERIOS SAS - Todos los derechos reservados
                    </p>
                    <p style={{ margin: 0 }}>
                        Sistema de Gestión Empresarial v1.0 - Modo Demostración
                    </p>
                </div>
            </div>
        </div>
    );
}
