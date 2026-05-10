import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, LayoutDashboard, Users, PackageOpen, Settings, DollarSign, 
    ShoppingCart, Briefcase, UserCheck, Truck, ShieldCheck, 
    Megaphone, TrendingUp, FileText, BarChart3, Building2, 
    Factory, Search, Bell, User, LogOut, Menu, Grid,
    Activity, Calendar, Clock, Star, ArrowRight, MonitorSmartphone
} from 'lucide-react';

// Importaciones de módulos modernos
import MultiEmpresa from './MultiEmpresa';
import MRP from './MRP';
import Dashboard_Moderno from './Dashboard_Moderno';
import Ventas from './Ventas';
import CRM from './CRM';
import Inventario from './Inventario';
import Compras from './Compras';
import Logistica from './Logistica';
import RRHH from './RRHH';
import Nomina from './Nomina';
import POS from './POS';

// Definición de módulos con diseño moderno
const modules = [
    { 
        id: 'multi-empresa',      
        name: 'Multi-Empresa',       
        description: 'Gestión multi-compañía',             
        icon: Building2,       
        color: '#6366F1', 
        component: MultiEmpresa,
        category: 'administración'
    },
    { 
        id: 'mrp',                
        name: 'MRP (SAP)',            
        description: 'Material Requirements Planning',     
        icon: Factory,         
        color: '#DC2626', 
        component: MRP,
        category: 'producción'
    },
    { 
        id: 'dashboard',          
        name: 'Dashboard',            
        description: 'Panel de control principal',         
        icon: LayoutDashboard, 
        color: '#4F46E5', 
        component: Dashboard_Moderno,
        category: 'control'
    },
    { 
        id: 'pos',
        name: 'POS',
        description: 'Punto de Venta Panadería',
        icon: MonitorSmartphone,
        color: '#ec4899',
        component: POS,
        category: 'comercial'
    },
    { 
        id: 'ventas',             
        name: 'Ventas',               
        description: 'Gestión de órdenes y ventas',        
        icon: TrendingUp,      
        color: '#10B981', 
        component: Ventas,
        category: 'comercial'
    },
    { 
        id: 'crm',                
        name: 'CRM y Clientes',       
        description: 'Gestión de clientes y relaciones',   
        icon: Users,           
        color: '#3B82F6', 
        component: CRM,
        category: 'comercial'
    },
    { 
        id: 'inventario',         
        name: 'Inventarios',          
        description: 'Control de productos y stock',       
        icon: PackageOpen,     
        color: '#F59E0B', 
        component: Inventario,
        category: 'operaciones'
    },
    { 
        id: 'compras',            
        name: 'Compras',              
        description: 'Órdenes de compra a proveedores',    
        icon: ShoppingCart,    
        color: '#8B5CF6', 
        component: Compras,
        category: 'operaciones'
    },
    { 
        id: 'logistica',          
        name: 'Logística',            
        description: 'Gestión de envíos y entregas',       
        icon: Truck,           
        color: '#EC4899', 
        component: Logistica,
        category: 'operaciones'
    },
    { 
        id: 'rrhh',                
        name: 'RRHH',                 
        description: 'Gestión de empleados y perfiles',   
        icon: Users,           
        color: '#F472B6', 
        component: RRHH,
        category: 'administración'
    },
    { 
        id: 'nomina',              
        name: 'Nómina',               
        description: 'Liquidación y Nómina Electrónica',   
        icon: DollarSign,      
        color: '#10B981', 
        component: Nomina,
        category: 'administración'
    }
];

const categories = [
    { id: 'todos', name: 'Todos los Módulos', icon: Grid },
    { id: 'control', name: 'Control y Dashboard', icon: BarChart3 },
    { id: 'comercial', name: 'Comercial y Ventas', icon: TrendingUp },
    { id: 'operaciones', name: 'Operaciones', icon: Settings },
    { id: 'producción', name: 'Producción', icon: Factory },
    { id: 'administración', name: 'Administración', icon: Building2 }
];

export default function Home() {
    const navigate = useNavigate();
    const [activeModule, setActiveModule] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const filteredModules = modules.filter(module => {
        const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            module.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'todos' || module.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const openModule = (module) => {
        setActiveModule(module);
    };

    const closeModule = () => {
        setActiveModule(null);
    };

    function ModuleModal({ module, onClose }) {
        const Component = module.component;

        useEffect(() => {
            const handler = (e) => { if (e.key === 'Escape') onClose(); };
            window.addEventListener('keydown', handler);
            document.body.style.overflow = 'hidden';
            return () => {
                window.removeEventListener('keydown', handler);
                document.body.style.overflow = '';
            };
        }, [onClose]);

        return (
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', 
                    inset: 0, 
                    zIndex: 9999,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex', 
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '16px',
                    overflowY: 'auto'
                }}
            >
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#1e293b',
                        border: `2px solid ${module.color}`,
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '1400px',
                        minHeight: 'calc(100vh - 32px)',
                        maxHeight: 'calc(100vh - 32px)',
                        boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 50px ${module.color}33`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`,
                        padding: '1.5rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'rgba(255,255,255,0.2)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <module.icon size={24} />
                            </div>
                            <div>
                                <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
                                    {module.name}
                                </h2>
                                <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                                    {module.description}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.2s'
                            }}
                        >
                            <X size={20} />
                            Cerrar
                        </button>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
                        <Component />
                    </div>
                </div>
            </div>
        );
    }

    if (activeModule) {
        return <ModuleModal module={activeModule} onClose={closeModule} />;
    }

    return (
        <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.1
            }} />

            <header style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                            8A
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1a202c' }}>8AMPERIOS ERP</h1>
                            <p style={{ margin: '0.25rem 0 0 0', color: '#718096', fontSize: '0.875rem' }}>Gestión Empresarial Inteligente</p>
                        </div>
                    </div>
                    <div style={{ color: '#718096', fontWeight: '600' }}>{currentTime.toLocaleTimeString()}</div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 5 }}>
                <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1a202c', margin: '0 0 1rem 0' }}>Panel de Control</h2>
                    <p style={{ fontSize: '1.2rem', color: '#718096', margin: '0 0 2rem 0' }}>Accede a tus herramientas de gestión diaria</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{modules.length}</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Módulos Listos</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>On</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Sistema Activo</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>SaaS</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Infraestructura</div>
                        </div>
                        <div style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>SSL</div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Seguridad Cifrada</div>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#718096' }} />
                            <input type="text" placeholder="Buscar módulos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none' }} />
                        </div>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: '1rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', background: 'white', cursor: 'pointer' }}>
                            {categories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option> ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredModules.map((module) => (
                        <button key={module.id} onClick={() => openModule(module)} style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ width: '60px', height: '60px', background: `linear-gradient(135deg, ${module.color} 0%, ${module.color}dd 100%)`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <module.icon size={30} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1a202c', margin: '0 0 0.5rem 0' }}>{module.name}</h3>
                                <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0, lineHeight: '1.4' }}>{module.description}</p>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}> <ArrowRight size={20} style={{ color: module.color }} /> </div>
                        </button>
                    ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '2rem', marginTop: '2rem', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a202c', margin: '0 0 1.5rem 0' }}>Acciones Rápidas</h3>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => openModule(modules.find(m => m.id === 'dashboard'))} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} /> Dashboard
                        </button>
                        <button onClick={() => openModule(modules.find(m => m.id === 'crm'))} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> CRM
                        </button>
                        <button onClick={() => openModule(modules.find(m => m.id === 'ventas'))} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} /> Ventas
                        </button>
                        <button onClick={() => navigate('/pos')} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', color: 'white', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MonitorSmartphone size={20} /> POS
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
