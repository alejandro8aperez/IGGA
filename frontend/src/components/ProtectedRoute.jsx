import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — ERP 8AMPERIOS
 * Redirige a /login si el usuario no está autenticado.
 * Guarda la ruta original para redirigir después del login.
 */
function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        // Guardamos la ruta a la que intentaba acceder
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export default ProtectedRoute;
