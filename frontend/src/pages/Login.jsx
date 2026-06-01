import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Lock, User, Building2, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';

const Login = () => {
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from?.pathname || '/dashboard';

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedEmpresa, setEmpresa] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const empresas = [
        { id: '1', nombre: 'IGGA', codigo: 'IGG' },
        { id: '2', nombre: 'numero 1', codigo: 'NUM1' },
        { id: '3', nombre: 'numero 2', codigo: 'NUM2' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedEmpresa) {
            setError('Seleccione una empresa para continuar.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('token/', { username, password }, { timeout: 8000 });
            const { access, refresh, user: userData } = res.data;

            loginUser({
                ...userData,
                access: access,
                refresh: refresh,
                refreshToken: refresh,
                empresa: empresas.find(e => e.id === selectedEmpresa),
            });
            navigate(redirectTo, { replace: true });

        } catch (err) {
            if (err.code === 'ECONNABORTED' || !err.response) {
                const demoResult = autenticarDemo(username, password, selectedEmpresa);
                if (demoResult) {
                    loginUser(demoResult);
                    navigate(redirectTo, { replace: true });
                } else {
                    setError('Usuario o contraseña incorrectos.');
                }
            } else if (err.response?.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else {
                setError('Error al conectar con el servidor. Intente de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a1628 0%, #0f172a 50%, #1a1035 100%)',
            padding: '1rem'
        }}>
            {/* Fondo decorativo */}
            <div style={{
                position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0
            }}>
                {[...Array(3)].map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        width: ['500px', '300px', '400px'][i],
                        height: ['500px', '300px', '400px'][i],
                        borderRadius: '50%',
                        background: ['rgba(102,126,234,0.06)', 'rgba(118,75,162,0.05)', 'rgba(102,126,234,0.04)'][i],
                        top: ['10%', '60%', '40%'][i], left: ['60%', '-5%', '80%'][i],
                        filter: 'blur(60px)'
                    }} />
                ))}
            </div>

            <div style={{
                maxWidth: '440px', width: '100%', position: 'relative', zIndex: 1,
                background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
                border: '1px solid #1e3a5f', borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '2.5rem'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '192px !important', height: '192px !important',
                        margin: '0 auto 1.5rem',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: 'white',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <img 
                            src="/logo.png" 
                            alt="Logo ERP 8AMPERIOS" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', maxWidth: '100%', maxHeight: '100%' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span style="color:#d97706; font-weight:bold;">LOGO</span>';
                            }}
                        />
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.4rem' }}>
                        INGENIERIA Y GESTION ADMINISTRATIVA
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                        ERP 8AMPERIOS
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                        borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#fca5a5'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Empresa */}
                    <Field label="Empresa" icon={<Building2 size={15} />}>
                        <select value={selectedEmpresa} onChange={e => setEmpresa(e.target.value)}
                            required style={inputStyle}>
                            <option value="">Seleccione una empresa</option>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nombre} ({emp.codigo})</option>
                            ))}
                        </select>
                    </Field>

                    {/* Usuario */}
                    <Field label="Usuario" icon={<User size={15} />}>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                            placeholder="Ingrese su usuario" required style={inputStyle} />
                    </Field>

                    {/* Contraseña */}
                    <Field label="Contraseña" icon={<Lock size={15} />}>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? 'text' : 'password'}
                                value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Ingrese su contraseña" required
                                style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px'
                                }}>
                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </Field>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '0.875rem',
                        background: loading ? '#334155' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        border: 'none', borderRadius: '10px', color: 'white',
                        fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', marginTop: '0.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        boxShadow: loading ? 'none' : '0 4px 15px rgba(102,126,234,0.35)'
                    }}>
                        {loading && <Loader size={18} style={{ animation: 'erp-spin 0.8s linear infinite' }} />}
                        {loading ? 'Verificando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Usuarios de prueba */}
                <div style={{
                    marginTop: '1.5rem', background: 'rgba(30,58,95,0.4)',
                    border: '1px solid #1e3a5f', borderRadius: '10px', padding: '0.875rem'
                }}>
                    <p style={{
                        color: '#64748b', fontSize: '0.72rem', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.5rem'
                    }}>
                        Usuarios de demo
                    </p>
                    <div style={{ color: '#475569', fontSize: '0.72rem', lineHeight: 1.7, fontFamily: 'monospace' }}>
                        admin / admin123 · Administrador<br />
                        gerente / gerente123 · Gerente<br />
                        contador / contador123 · Contador<br />
                        produccion / produccion123 · Producción<br />
                        rrhh / rrhh123 · Recursos Humanos
                    </div>
                </div>

                <p style={{ textAlign: 'center', color: '#1e3a5f', fontSize: '0.72rem', marginTop: '1.25rem' }}>
                    8AMPERIOS © {new Date().getFullYear()} · Medellín, Colombia
                </p>
            </div>
            <style>{`@keyframes erp-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputStyle = {
    width: '100%', padding: '0.7rem 0.9rem',
    background: 'rgba(15,23,42,0.8)', border: '1px solid #1e3a5f',
    borderRadius: '8px', color: '#f8fafc', fontSize: '0.875rem',
    outline: 'none', boxSizing: 'border-box'
};

function Field({ label, icon, children }) {
    return (
        <div style={{ marginBottom: '1.1rem' }}>
            <label style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.4rem'
            }}>
                {icon}{label}
            </label>
            {children}
        </div>
    );
}

// Autenticación demo (solo cuando el backend no está disponible)
function autenticarDemo(username, password, empresaId) {
    const usuarios = {
        admin: { password: 'admin123', cargo: 'Administrador', nombre: 'Administrador Sistema' },
        gerente: { password: 'gerente123', cargo: 'Gerente', nombre: 'Gerente General' },
        contador: { password: 'contador123', cargo: 'Contador', nombre: 'Jefe Contabilidad' },
        produccion: { password: 'produccion123', cargo: 'Jefe Producción', nombre: 'Jefe de Producción' },
        ventas: { password: 'ventas123', cargo: 'Vendedor', nombre: 'Ejecutivo de Ventas' },
        compras: { password: 'compras123', cargo: 'Comprador', nombre: 'Jefe de Compras' },
        almacen: { password: 'almacen123', cargo: 'Almacenista', nombre: 'Encargado Almacén' },
        mantenimiento: { password: 'mantenimiento123', cargo: 'Técnico', nombre: 'Jefe Mantenimiento' },
        rrhh: { password: 'rrhh123', cargo: 'RH', nombre: 'Jefe RRHH' },
        mrp: { password: 'mrp123', cargo: 'Planificador', nombre: 'Planificador MRP' },
    };
    const empresas = [
        { id: '1', nombre: 'IGGA', codigo: 'IGG' },
        { id: '2', nombre: 'numero 1', codigo: 'NUM1' },
        { id: '3', nombre: 'numero 2', codigo: 'NUM2' },
    ];
    const info = usuarios[username];
    if (!info || info.password !== password) return null;
    return {
        username,
        ...info,
        empresa: empresas.find(e => e.id === empresaId),
        modoDemo: true,
        access: 'demo-mode-access-token',
    };
}

export default Login;
