import { useState, useEffect } from 'react';
import { 
    X, LayoutDashboard, Users, PackageOpen, Settings, DollarSign, 
    ShoppingCart, Briefcase, UserCheck, Truck, ShieldCheck, 
    Megaphone, TrendingUp, FileText, BarChart3, Building2, 
    Factory, Search, Bell, User, LogOut, Menu, Grid,
    Activity, Calendar, Clock, Star, ArrowRight
} from 'lucide-react';

console.log('Home_TEST component loaded - MODERNO ACTIVADO');

export default function Home() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        console.log('Home_TEST useEffect - Componente montado');
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            {/* Header Moderno */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.5rem',
                            fontWeight: 'bold'
                        }}>
                            8A
                        </div>
                        <div>
                            <h1 style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: '800',
                                color: '#1a202c',
                                margin: '0 0 0.5rem 0',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                8AMPERIOS ERP
                            </h1>
                            <p style={{ 
                                color: '#718096', 
                                margin: 0,
                                fontSize: '1.1rem'
                            }}>
                                Sistema Empresarial Moderno - {currentTime.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s'
                        }}>
                            <LayoutDashboard size={20} style={{ marginRight: '0.5rem' }} />
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Tarjetas de Estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {[
                    { title: 'Ventas', value: '$125,430', change: '+12.5%', color: '#10b981', icon: TrendingUp },
                    { title: 'Clientes', value: '1,234', change: '+8.2%', color: '#3b82f6', icon: Users },
                    { title: 'Pedidos', value: '456', change: '+15.3%', color: '#f59e0b', icon: ShoppingCart },
                    { title: 'Ingresos', value: '$89,750', change: '+9.7%', color: '#8b5cf6', icon: DollarSign }
                ].map((stat, index) => (
                    <div key={index} style={{
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '1rem'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: `${stat.color}15`,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                            <span style={{
                                background: `${stat.color}15`,
                                color: stat.color,
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.875rem',
                                fontWeight: '600'
                            }}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 style={{ 
                            fontSize: '2rem', 
                            fontWeight: '700', 
                            color: '#1a202c',
                            margin: '0 0 0.5rem 0'
                        }}>
                            {stat.value}
                        </h3>
                        <p style={{ 
                            color: '#718096', 
                            margin: 0,
                            fontSize: '1rem'
                        }}>
                            {stat.title}
                        </p>
                    </div>
                ))}
            </div>

            {/* Grid de Módulos */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
            }}>
                <h2 style={{ 
                    fontSize: '1.8rem', 
                    fontWeight: '700', 
                    color: '#1a202c',
                    marginBottom: '1.5rem'
                }}>
                    Módulos Principales
                </h2>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    {[
                        { name: 'Dashboard', icon: LayoutDashboard, color: '#667eea' },
                        { name: 'Ventas', icon: TrendingUp, color: '#10b981' },
                        { name: 'CRM', icon: Users, color: '#3b82f6' },
                        { name: 'Inventario', icon: PackageOpen, color: '#f59e0b' },
                        { name: 'Compras', icon: ShoppingCart, color: '#8b5cf6' },
                        { name: 'Logística', icon: Truck, color: '#ec4899' }
                    ].map((module, index) => (
                        <button key={index} style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: `${module.color}15`,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: module.color
                            }}>
                                <module.icon size={24} />
                            </div>
                            <span style={{ 
                                fontSize: '1rem', 
                                fontWeight: '600', 
                                color: '#1a202c' 
                            }}>
                                {module.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem'
            }}>
                <p>© 2026 8AMPERIOS ERP - Sistema Modernizado</p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Interfaz Moderna con Gradientes y Animaciones
                </p>
            </div>
        </div>
    );
}
