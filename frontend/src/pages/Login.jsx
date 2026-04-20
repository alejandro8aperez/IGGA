import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import './index.css';

const Login = () => {
    const { loginUser } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState('');
    const navigate = useNavigate();

    const empresas = [
        { id: '1', nombre: '8AMPERIOS INDUSTRIAL', codigo: '8AMP' },
        { id: '2', nombre: '8AMPERIOS COMERCIAL', codigo: '8COM' },
        { id: '3', nombre: '8AMPERIOS SERVICIOS', codigo: '8SER' }
    ];

    const usuariosPorCargo = {
        admin: { password: 'admin123', cargo: 'Administrador', nombre: 'Administrador Sistema' },
        gerente: { password: 'gerente123', cargo: 'Gerente', nombre: 'Gerente General' },
        contador: { password: 'contador123', cargo: 'Contador', nombre: 'Jefe Contabilidad' },
        produccion: { password: 'produccion123', cargo: 'Jefe Producción', nombre: 'Jefe de Producción' },
        ventas: { password: 'ventas123', cargo: 'Vendedor', nombre: 'Ejecutivo de Ventas' },
        compras: { password: 'compras123', cargo: 'Comprador', nombre: 'Jefe de Compras' },
        almacen: { password: 'almacen123', cargo: 'Almacenista', nombre: 'Encargado Almacén' },
        mantenimiento: { password: 'mantenimiento123', cargo: 'Técnico', nombre: 'Jefe Mantenimiento' },
        rrhh: { password: 'rrhh123', cargo: 'RH', nombre: 'Jefe RRHH' },
        mrp: { password: 'mrp123', cargo: 'Planificador', nombre: 'Planificador MRP' }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');
        
        // Validar usuario
        const usuarioInfo = usuariosPorCargo[username];
        if (!usuarioInfo || usuarioInfo.password !== password) {
            alert('Usuario o contraseña incorrectos');
            return;
        }

        if (!selectedEmpresa) {
            alert('Seleccione una empresa');
            return;
        }

        // Crear objeto de usuario
        const userData = {
            username: username,
            ...usuarioInfo,
            empresa: empresas.find(emp => emp.id === selectedEmpresa)
        };

        console.log('Login data:', userData);
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('erpUser', JSON.stringify(userData));
        
        // Usar el contexto existente
        loginUser(userData);
        
        // Redirigir al home
        setTimeout(() => {
            navigate('/');
        }, 500);
    };

    const handleGuestAccess = () => {
        const guestData = {
            username: 'guest',
            cargo: 'Invitado',
            nombre: 'Usuario Invitado',
            empresa: empresas[0]
        };
        
        console.log('Guest access:', guestData);
        localStorage.setItem('erpUser', JSON.stringify(guestData));
        loginUser(guestData);
        setTimeout(() => {
            navigate('/');
        }, 500);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F172A 0%, #1a2a4a 100%)',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{ 
                maxWidth: '450px', 
                width: '100%', 
                padding: '2.5rem',
                border: '1px solid #334155',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem'
                    }}>
                        <Building2 size={40} color="white" />
                    </div>
                    <h1 style={{ 
                        fontSize: '1.875rem', 
                        fontWeight: 700, 
                        margin: 0,
                        color: '#F8FAFC'
                    }}>
                        8AMPERIOS ERP
                    </h1>
                    <p style={{ 
                        color: '#94A3B8', 
                        fontSize: '0.875rem', 
                        marginTop: '0.5rem',
                        marginBottom: 0
                    }}>
                        Sistema Empresarial Integrado
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    {/* Empresa */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: '#E2E8F0',
                            marginBottom: '0.5rem'
                        }}>
                            <Building2 size={16} /> Empresa
                        </label>
                        <select
                            value={selectedEmpresa}
                            onChange={(e) => setSelectedEmpresa(e.target.value)}
                            className="form-input"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: '#0F172A',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#F8FAFC',
                                fontSize: '0.875rem'
                            }}
                        >
                            <option value="">Seleccione una empresa</option>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.nombre} ({emp.codigo})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Usuario */}
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: '#E2E8F0',
                            marginBottom: '0.5rem'
                        }}>
                            <User size={16} /> Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="Ingrese su usuario"
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: '#0F172A',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#F8FAFC',
                                fontSize: '0.875rem'
                            }}
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: '#E2E8F0',
                            marginBottom: '0.5rem'
                        }}>
                            <Lock size={16} /> Contraseña
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="form-input"
                                placeholder="Ingrese su contraseña"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.75rem',
                                    background: '#0F172A',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#F8FAFC',
                                    fontSize: '0.875rem'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748B',
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
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.875rem',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            marginBottom: '1rem'
                        }}
                    >
                        Iniciar Sesión
                    </button>
                </form>

                {/* Divider */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    margin: '1.5rem 0',
                    gap: '0.75rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
                    <span style={{ color: '#64748B', fontSize: '0.875rem' }}>o</span>
                    <div style={{ flex: 1, height: '1px', background: '#334155' }}></div>
                </div>

                {/* Guest Access */}
                <button
                    onClick={handleGuestAccess}
                    style={{
                        width: '100%',
                        background: 'transparent',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        color: '#94A3B8',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginBottom: '1rem'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.borderColor = '#4F46E5';
                        e.target.style.color = '#E2E8F0';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.borderColor = '#334155';
                        e.target.style.color = '#94A3B8';
                    }}
                >
                    Acceso como Invitado
                </button>

                {/* Usuarios de prueba */}
                <div style={{
                    background: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                }}>
                    <p style={{ 
                        color: '#94A3B8', 
                        fontSize: '0.75rem', 
                        margin: '0 0 0.5rem 0',
                        fontWeight: 500
                    }}>
                        Usuarios de prueba:
                    </p>
                    <div style={{ 
                        color: '#64748B', 
                        fontSize: '0.7rem', 
                        lineHeight: '1.4',
                        fontFamily: 'monospace'
                    }}>
                        admin/admin123 (Administrador)<br/>
                        gerente/gerente123 (Gerente)<br/>
                        mrp/mrp123 (Planificador MRP)<br/>
                        produccion/produccion123 (Producción)<br/>
                        mantenimiento/mantenimiento123 (Mantenimiento)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
