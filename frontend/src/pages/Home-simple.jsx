import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Factory, Settings, ShoppingCart, TrendingUp } from 'lucide-react';

function Home() {
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        console.log('Navigating to:', path);
        alert(`Navegando a: ${path}`);
        navigate(path);
    };

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #0F172A 0%, #1a2a4a 100%)', 
            minHeight: '100vh', 
            padding: '2rem' 
        }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ 
                    fontSize: '3rem', 
                    color: '#ffffff',
                    marginBottom: '1rem',
                    fontWeight: 700
                }}>8AMPERIOS</h1>
                <p style={{ fontSize: '1.25rem', color: '#94A3B8', marginBottom: '2rem' }}>
                    Sistema ERP Integrado
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <button
                    onClick={() => handleNavigation('/mrp')}
                    style={{
                        background: '#1E293B',
                        border: '2px solid #4F46E5',
                        borderRadius: '12px',
                        padding: '2rem',
                        cursor: 'pointer',
                        color: '#F8FAFC',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                    >
                        <Factory size={40} style={{ marginBottom: '1rem' }} />
                        <div>MRP</div>
                        <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                            Material Requirements Planning
                        </div>
                    </button>

                <button
                    onClick={() => handleNavigation('/mantenimiento')}
                    style={{
                        background: '#1E293B',
                        border: '2px solid #DC2626',
                        borderRadius: '12px',
                        padding: '2rem',
                        cursor: 'pointer',
                        color: '#F8FAFC',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Settings size={40} style={{ marginBottom: '1rem' }} />
                    <div>Mantenimiento</div>
                    <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                        Gestión de Mantenimiento
                    </div>
                </button>

                <button
                    onClick={() => handleNavigation('/compras')}
                    style={{
                        background: '#1E293B',
                        border: '2px solid #10B981',
                        borderRadius: '12px',
                        padding: '2rem',
                        cursor: 'pointer',
                        color: '#F8FAFC',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    <ShoppingCart size={40} style={{ marginBottom: '1rem' }} />
                    <div>Compras</div>
                    <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                        Gestión de Compras
                    </div>
                </button>

                <button
                    onClick={() => handleNavigation('/ventas')}
                    style={{
                        background: '#1E293B',
                        border: '2px solid #F59E0B',
                        borderRadius: '12px',
                        padding: '2rem',
                        cursor: 'pointer',
                        color: '#F8FAFC',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    <TrendingUp size={40} style={{ marginBottom: '1rem' }} />
                    <div>Ventas</div>
                    <div style={{ fontSize: '0.9rem', color: '#94A3B8', marginTop: '0.5rem' }}>
                        Gestión de Ventas
                    </div>
                </button>

                <button
                    onClick={() => handleNavigation('/')}
                    style={{
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        border: '2px solid #4F46E5',
                        borderRadius: '12px',
                        padding: '2rem',
                        cursor: 'pointer',
                        color: '#F8FAFC',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    <LayoutDashboard size={40} style={{ marginBottom: '1rem' }} />
                    <div>Inicio</div>
                    <div style={{ fontSize: '0.9rem', color: '#E2E8F0', marginTop: '0.5rem' }}>
                        Panel Principal
                    </div>
                </button>
            </div>
        </div>
    );
}

export default Home;
