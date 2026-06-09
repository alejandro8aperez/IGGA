// ============================================================
//  AuthContext.jsx  –  ERP-8AMPERIOS
// ============================================================
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance, { BASE_URL } from '../config/axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const logoutUser = logout;

  // ── Verificar token al arrancar ──────────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      const access  = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (!access || !refresh) { setLoading(false); return; }
      try {
        const res = await axiosInstance.get('usuarios/me/');
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  // ── Login ────────────────────────────────────────────────────
  const login = async (username, password) => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    const response = await axiosInstance.post('token/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    const perfil = await axiosInstance.get('usuarios/me/');
    setUser(perfil.data);
    return perfil.data;
  };

  // ── loginUser: compatible con Login.jsx ──────────────────────
  const loginUser = (userData) => {
    if (userData.access) {
      localStorage.setItem('access_token', userData.access);
    }
    if (userData.refresh || userData.refreshToken) {
      localStorage.setItem('refresh_token', userData.refresh || userData.refreshToken);
    }
    if (userData.access) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.access}`;
    }
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginUser,
      logout,
      logoutUser,
      loading,
      isAuthenticated: !!user
    }}>
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
