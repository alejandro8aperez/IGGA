import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, X, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function DemoPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: 'demo@8amperios.com',
        password: 'Demo2024!'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        // Simulación de login para demo
        setTimeout(() => {
            if (formData.email === 'demo@8amperios.com' && formData.password === 'Demo2024!') {
                // Redirigir al dashboard del demo
                window.location.href = '/dashboard';
            } else {
                setError('Credenciales incorrectas. Usa las credenciales predefinidas.');
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative'
        }}>
            {/* Watermark de DEMO */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '8rem',
                fontWeight: '900',
                color: 'rgba(255, 255, 255, 0.05)',
                pointerEvents: 'none',
                zIndex: 1,
                whiteSpace: 'nowrap'
            }}>
                DEMO
            </div>

            <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '3rem',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
                    }}>
                        ⚡
                    </div>
                    <h1 style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: '700', 
                        color: '#1a202c',
                        margin: '0 0 0.5rem 0'
                    }}>
                        8AMPERIOS ERP
                    </h1>
                    <p style={{ 
                        color: '#718096', 
                        margin: 0,
                        fontSize: '1.1rem'
                    }}>
                        Sistema de Gestión Empresarial
                    </p>
                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        marginTop: '1rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#0c4a6e',
                        fontWeight: '600'
                    }}>
                        <Eye size={16} />
                        Versión de Demostración
                    </div>
                </div>

                {/* Alerta de Demo */}
                <div style={{
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                }}>
                    <AlertCircle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                    <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                        <strong>Bienvenido al Demo:</strong> Explora todas las funcionalidades del ERP 8AMPERIOS. 
                        Usa las credenciales predefinidas para acceder.
                    </div>
                </div>

                {/* Mensaje de Error */}
                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #ef4444',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <X size={20} style={{ color: '#dc2626' }} />
                        <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                            {error}
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            fontSize: '0.9rem'
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
                                padding: '1rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.5rem', 
                            fontWeight: '600', 
                            color: '#374151',
                            fontSize: '0.9rem'
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
                                    padding: '1rem 3.5rem 1rem 1rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
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
                                    padding: '0.5rem',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
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
                            padding: '1.25rem',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            transition: 'all 0.2s',
                            boxShadow: isLoading 
                                ? 'none' 
                                : '0 4px 15px rgba(102, 126, 234, 0.3)',
                            minHeight: '56px'
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
                                    width: '24px',
                                    height: '24px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} />
                                Acceder al Sistema Demo
                            </>
                        )}
                    </button>
                </form>

                {/* Credenciales Predefinidas */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    marginTop: '2rem',
                    border: '1px solid #cbd5e1'
                }}>
                    <h3 style={{ 
                        fontSize: '1rem', 
                        fontWeight: '700', 
                        color: '#1e293b',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}>
                        <Lock size={18} style={{ color: '#667eea' }} />
                        Credenciales de Acceso
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#475569' }}>
                        <div style={{ 
                            marginBottom: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Mail size={14} style={{ color: '#667eea' }} />
                            <span><strong>Usuario:</strong> 
                                <span style={{ 
                                    fontFamily: 'monospace', 
                                    background: '#e2e8f0', 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '6px',
                                    marginLeft: '0.5rem'
                                }}>
                                    demo@8amperios.com
                                </span>
                            </span>
                        </div>
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Lock size={14} style={{ color: '#667eea' }} />
                            <span><strong>Contraseña:</strong> 
                                <span style={{ 
                                    fontFamily: 'monospace', 
                                    background: '#e2e8f0', 
                                    padding: '0.25rem 0.5rem', 
                                    borderRadius: '6px',
                                    marginLeft: '0.5rem'
                                }}>
                                    Demo2024!
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Características del Demo */}
                <div style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '12px',
                    padding: '1rem',
                    marginTop: '1.5rem'
                }}>
                    <h4 style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#166534',
                        marginBottom: '0.75rem'
                    }}>
                        ✨ ¿Qué puedes explorar en el demo?
                    </h4>
                    <ul style={{ 
                        margin: 0, 
                        paddingLeft: '1.5rem',
                        fontSize: '0.8rem',
                        color: '#15803d',
                        lineHeight: '1.5'
                    }}>
                        <li>CRM completo con gestión de clientes y cotizaciones</li>
                        <li>Cotizador profesional sin dependencia de Excel</li>
                        <li>Diseñador de transformadores KAVE</li>
                        <li>Editor visual de formularios</li>
                        <li>Dashboard con métricas en tiempo real</li>
                    </ul>
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
                        Versión Demo v1.0 - Para fines de evaluación
                    </p>
                </div>
            </div>
        </div>
    );
}
