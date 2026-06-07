// ============================================================
//  AuthContext.jsx  –  ERP-8AMPERIOS
//  Manejo de sesión JWT compatible con el interceptor anti-cascada
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';  // ← corregido

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // ── Verificar token al arrancar la app ──────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const access  = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (!access || !refresh) {
        setLoading(false);
        return;
      }
      try {
        const res = await axiosInstance.get('usuarios/perfil/');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  // ── Login ───────────────────────────────────────────────────
  const login = async (username, password) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    const response = await axios.post(`${BASE_URL}token/`, { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    const perfil = await axiosInstance.get('usuarios/perfil/');
    setUser(perfil.data);
    return perfil.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};

export default AuthContext;
