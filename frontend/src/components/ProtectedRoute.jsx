import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — ERP 8AMPERIOS
 * Redirige a /login si el usuario no está autenticado.
 * Guarda la ruta original para redirigir después del login.
 */
function ProtectedRoute({ children }) { 
    const { user, loading } = useAuth(); // Get loading state
    const location = useLocation();

    if (loading) {
        // Show a loading indicator while authentication status is being determined
        return <div>Cargando autenticación...</div>; // Or a more sophisticated spinner
    }

    if (!user) { 
        // Guardamos la ruta a la que intentaba acceder
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
