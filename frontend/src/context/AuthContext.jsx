import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authTokens, setAuthTokens] = useState(() => localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });

            if (response.status === 200) {
                setAuthTokens(response.data);

                // Decode token manually for a simple setup, or fetch user info
                // For simplicity, we just set a generic user object
                setUser({ username: e.target.username.value });

                localStorage.setItem('authTokens', JSON.stringify(response.data));
                navigate('/');
            }
        } catch (error) {
            alert("Usuario o contraseña incorrectos");
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const updateToken = async () => {
        if (!authTokens) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                refresh: authTokens?.refresh
            });

            if (response.status === 200) {
                setAuthTokens(response.data);
                localStorage.setItem('authTokens', JSON.stringify(response.data));
            } else {
                logoutUser();
            }
        } catch (error) {
            logoutUser();
        }

        if (loading) {
            setLoading(false);
        }
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    useEffect(() => {
        if (loading && authTokens) {
            // updateToken(); // Normally refresh on load, skipping for simplicity in this flow unless needed
            setUser({ username: "Admin" }); // Mocking user decode
        }
        setLoading(false);
    }, [authTokens, loading]);

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
