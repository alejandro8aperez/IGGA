import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return ctx;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('erpUser');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Loading user from storage:', parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('erpUser');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = (userData) => {
        console.log('Setting user in context:', userData);
        setUser(userData);
        localStorage.setItem('erpUser', JSON.stringify(userData));
    };

    const logoutUser = () => {
        console.log('Logging out user');
        setUser(null);
        localStorage.removeItem('erpUser');
    };

    const value = {
        user,
        loginUser,
        logoutUser,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
