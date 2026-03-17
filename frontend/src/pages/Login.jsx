import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Lock, User } from 'lucide-react';
import './index.css';

const Login = () => {
    const { loginUser } = useContext(AuthContext);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-main)',
            padding: '1rem'
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                        <Lock size={32} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>8AMPERIOS ERP</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Inicia sesión para acceder a tu panel
                    </p>
                </div>

                <form onSubmit={loginUser}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} /> Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            className="form-input"
                            placeholder="admin"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={16} /> Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                        Entrar al Sistema
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
