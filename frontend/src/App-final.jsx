import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';

// Importaciones de módulos principales
import MRP from './pages/MRP';
import Mantenimiento from './pages/Mantenimiento';
import Compras from './pages/Compras';
import Ventas from './pages/Ventas';
import Configuracion from './pages/Configuracion';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/mrp" element={<MRP />} />
                    <Route path="/mantenimiento" element={<Mantenimiento />} />
                    <Route path="/compras" element={<Compras />} />
                    <Route path="/ventas" element={<Ventas />} />
                    <Route path="/config" element={<Configuracion />} />
                    <Route path="*" element={<div style={{padding: '2rem', textAlign: 'center'}}><h2>Módulo en construcción</h2></div>} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
