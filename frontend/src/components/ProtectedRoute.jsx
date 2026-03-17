import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    let { user, authTokens } = useContext(AuthContext);

    if (!user && !authTokens) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
