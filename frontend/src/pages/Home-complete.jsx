import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Factory, Settings, ShoppingCart, TrendingUp, Users, PackageOpen, DollarSign, Briefcase, UserCheck, Truck, ShieldCheck, Megaphone, BarChart3, Building2, FileText, FolderKanban, Award } from 'lucide-react';

/** Lista de módulos para la portada y el menú lateral (una sola fuente de verdad). */
export const ERP_MODULES_NAV = [
        { path: '/multi-empresa', name: 'Multi-Empresa', icon: Building2, color: '#6366F1', description: 'Gestión multi-compañía' },
        { path: '/mrp', name: 'MRP (SAP)', icon: Factory, color: '#DC2626', description: 'Material Requirements Planning' },
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, color: '#4F46E5', description: 'Panel de control principal' },
        { path: '/ventas', name: 'Ventas', icon: TrendingUp, color: '#10B981', description: 'Gestión de órdenes y ventas' },
        { path: '/crm', name: 'CRM y Clientes', icon: Users, color: '#3B82F6', description: 'Gestión de clientes y relaciones' },
        { path: '/inventario', name: 'Inventarios', icon: PackageOpen, color: '#64748B', description: 'Control de inventario' },
        { path: '/activos', name: 'Activos Fijos', icon: PackageOpen, color: '#64748B', description: 'Gestión de activos fijos' },
        { path: '/compras', name: 'Compras', icon: ShoppingCart, color: '#F59E0B', description: 'Gestión de compras' },
        { path: '/logistica', name: 'Logística', icon: Truck, color: '#059669', description: 'Gestión logística' },
        { path: '/operaciones', name: 'Operaciones', icon: Briefcase, color: '#8B5CF6', description: 'Gestión de operaciones' },
        { path: '/mantenimiento', name: 'Mantenimiento', icon: Settings, color: '#EA580C', description: 'Gestión de mantenimiento' },
        { path: '/equipos', name: 'Equipos', icon: PackageOpen, color: '#64748B', description: 'Base de datos de equipos' },
        { path: '/produccion', name: 'Producción', icon: Factory, color: '#F97316', description: 'Órdenes de producción' },
        { path: '/proyectos', name: 'Proyectos', icon: BarChart3, color: '#06B6D4', description: 'Gestión de proyectos' },
        { path: '/proyectos-ps', name: 'Proyectos PS', icon: FileText, color: '#1E40AF', description: 'Control SAP PS avanzado' },
        { path: '/calidad', name: 'Control Calidad', icon: ShieldCheck, color: '#84CC16', description: 'Inspecciones y control de calidad' },
        { path: '/formatos-iso9001', name: 'ISO 9001', icon: Award, color: '#10B981', description: 'Formatos y gestión ISO 9001' },
        { path: '/rrhh', name: 'Recursos Humanos', icon: UserCheck, color: '#EF4444', description: 'Gestión de empleados y nómina' },
        { path: '/marketing', name: 'Marketing', icon: Megaphone, color: '#D946EF', description: 'Campañas y promociones' },
        { path: '/facturacion', name: 'Facturación FE', icon: FileText, color: '#10B981', description: 'Facturación electrónica' },
        { path: '/reportes', name: 'Reportes', icon: BarChart3, color: '#8B5CF6', description: 'Reportes básicos' },
        { path: '/reportes-avanzados', name: 'Reportes Avanzados', icon: BarChart3, color: '#8B5CF6', description: 'Analytics y reportes visuales' },
        { path: '/tesoreria', name: 'Tesorería', icon: DollarSign, color: '#059669', description: 'Gestión de tesorería' },
        { path: '/contratos', name: 'Contratos', icon: FileText, color: '#6B7280', description: 'Gestión de contratos' },
        { path: '/planeacion', name: 'Planeación', icon: BarChart3, color: '#0891B2', description: 'Planeación estratégica' },
        { path: '/kave', name: 'KAVE', icon: FolderKanban, color: '#8B5CF6', description: 'Gestión de Proyectos KAVE' },
        { path: '/config', name: 'Configuración', icon: Settings, color: '#6B7280', description: 'Parámetros del sistema' },
];

function Home() {
    const navigate = useNavigate();
    
    const handleNavigation = (path) => {
        console.log('Navigating to:', path);
        navigate(path);
    };

    const modules = ERP_MODULES_NAV;

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #0F172A 0%, #1a2a4a 100%)', 
            minHeight: '100vh', 
            padding: '2rem' 
        }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
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
                    Sistema ERP Integrado - Todos los Módulos
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem',
                maxWidth: '1600px',
                margin: '0 auto'
            }}>
                {modules.map((module) => (
                    <button
                        key={module.path}
                        onClick={() => handleNavigation(module.path)}
                        style={{
                            background: '#1E293B',
                            border: '2px solid #334155',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'center',
                            color: '#F8FAFC',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            minHeight: '180px'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-6px)';
                            e.target.style.borderColor = module.color;
                            e.target.style.boxShadow = `0 12px 24px rgba(0, 0, 0, 0.3), 0 0 20px ${module.color}33`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.borderColor = '#334155';
                            e.target.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                        }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: `linear-gradient(135deg, ${module.color}, ${module.color}CC)`,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1rem',
                            margin: '0 auto'
                        }}>
                            <module.icon size={24} color="white" />
                        </div>
                        
                        <h3 style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 600, 
                            marginBottom: '0.5rem', 
                            color: '#F8FAFC' 
                        }}>
                            {module.name}
                        </h3>
                        
                        <p style={{ 
                            fontSize: '0.8rem', 
                            color: '#94A3B8', 
                            margin: 0,
                            lineHeight: 1.3
                        }}>
                            {module.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Home;
