import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Factory, Settings, ShoppingCart, TrendingUp, Users, PackageOpen, DollarSign, Briefcase, UserCheck, Truck, ShieldCheck, Megaphone, BarChart3, Building2, FileText } from 'lucide-react';

function Home() {
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        console.log('Navigating to:', path);
        navigate(path);
    };

    // Módulos principales - solo los que funcionan
    const modules = [
        { 
            path: '/mrp', 
            name: 'MRP', 
            icon: Factory, 
            color: '#DC2626',
            description: 'Material Requirements Planning'
        },
        { 
            path: '/mantenimiento', 
            name: 'Mantenimiento', 
            icon: Settings, 
            color: '#EA580C',
            description: 'Gestión de Mantenimiento'
        },
        { 
            path: '/compras', 
            name: 'Compras', 
            icon: ShoppingCart, 
            color: '#10B981',
            description: 'Gestión de Compras'
        },
        { 
            path: '/ventas', 
            name: 'Ventas', 
            icon: TrendingUp, 
            color: '#F59E0B',
            description: 'Gestión de Ventas'
        },
        { 
            path: '/inventario', 
            name: 'Inventario', 
            icon: PackageOpen, 
            color: '#64748B',
            description: 'Control de Inventario'
        },
        { 
            path: '/rrhh', 
            name: 'RRHH', 
            icon: Users, 
            color: '#EF4444',
            description: 'Recursos Humanos'
        },
        { 
            path: '/finanzas', 
            name: 'Finanzas', 
            icon: DollarSign, 
            color: '#3B82F6',
            description: 'Gestión Financiera'
        },
        { 
            path: '/config', 
            name: 'Configuración', 
            icon: Settings, 
            color: '#6B7280',
            description: 'Configuración del Sistema'
        }
    ];

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #0F172A 0%, #1a2a4a 100%)', 
            minHeight: '100vh', 
            padding: '2rem' 
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ 
                    fontSize: '3.5rem', 
                    color: '#ffffff',
                    marginBottom: '1rem',
                    fontWeight: 800,
                    textShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>🏭 8AMPERIOS</h1>
                <p style={{ 
                    fontSize: '1.25rem', 
                    color: '#94A3B8', 
                    marginBottom: '2rem', 
                    textAlign: 'center' 
                }}>
                    Sistema ERP Integrado - Módulos Disponibles
                </p>
            </div>

            {/* Grid de Módulos */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '2rem',
                maxWidth: '1400px',
                margin: '0 auto'
            }}>
                {modules.map((module) => (
                    <button
                        key={module.path}
                        onClick={() => handleNavigation(module.path)}
                        style={{
                            background: '#1E293B',
                            border: '2px solid #334155',
                            borderRadius: '16px',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            color: '#F8FAFC',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '1rem',
                            outline: 'none',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-8px)';
                            e.target.style.borderColor = module.color;
                            e.target.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.3), 0 0 20px ${module.color}33`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.borderColor = '#334155';
                            e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                        }}
                    >
                        {/* Icono */}
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: `linear-gradient(135deg, ${module.color}, ${module.color}CC)`,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            margin: '0 auto 1rem'
                        }}>
                            <module.icon size={32} color="white" />
                        </div>
                        
                        {/* Nombre */}
                        <h3 style={{ 
                            fontSize: '1.25rem', 
                            fontWeight: 600, 
                            marginBottom: '0.5rem', 
                            color: '#F8FAFC' 
                        }}>
                            {module.name}
                        </h3>
                        
                        {/* Descripción */}
                        <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#94A3B8', 
                            margin: 0,
                            lineHeight: 1.4
                        }}>
                            {module.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div style={{ 
                textAlign: 'center', 
                marginTop: '4rem',
                padding: '2rem',
                borderTop: '1px solid #334155',
                color: '#64748B',
                fontSize: '0.875rem'
            }}>
                <p>© 2026 8AMPERIOS ERP System</p>
                <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    Todos los derechos reservados
                </p>
            </div>
        </div>
    );
}

export default Home;
