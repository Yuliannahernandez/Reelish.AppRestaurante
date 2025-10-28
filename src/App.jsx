import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SplashScreen from './pages/SplashScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import ForgotPasswordScreen from './pages/ForgotPasswordScreen';
import ProfileScreen from './pages/ProfileScreen';
import DireccionesScreen from './pages/DireccionesScreen';
import NuevaDireccionScreen from './pages/NuevaDireccionScreen';
import MetodosPagosScreen from './pages/MetodosPagosScreen';
import NuevaTarjetaScreen from './pages/NuevaTarjetaScreen';
import IdiomaScreen from './pages/IdiomaScreen';
import CondicionesSaludScreen from './pages/CondicionesSaludScreen';
import { AuthProvider } from './context/AuthContext';
import HomeScreen from './pages/HomeScreen';
import ProductoDetalleScreen from './pages/ProductoDetalleScreen';
import ProtectedRoute from './components/ProtectedRoute';
import CarritoScreen from './pages/CarritoScreen';
import SeleccionarSucursalScreen from './pages/SeleccionarSucursalScreen';
import SeleccionarMetodoPagoScreen from './pages/SeleccionarMetodoPagoScreen';
import CheckoutScreen from './pages/CheckoutScreen';
import SeguimientoPedidoScreen from './pages/SeguimientoPedidoScreen';
import MisPedidosScreen from './pages/MisPedidosScreen';
import CategoriasScreen from './pages/CategoriasScreen';
import ProductosCategoriaScreen from './pages/ProductosCategoriaScreen';
import PuntosLealtadScreen from './pages/PuntosLealtadScreen';
import TriviaScreen from './pages/TriviaScreen';
import PanelGerenteScreen from './pages/PanelGerenteScreen';
import EditarProductoScreen from './pages/EditarProductoScreen';
import AgregarProductoScreen from './pages/AgregarProductoScreen';
import TwoFactorSettings from './pages/TwoFactorSettings';
import VerifyEmailScreen from './pages/VerifyEmailScreen';



function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/categorias" element={<CategoriasScreen />} />
          <Route path="/categoria/:id" element={<ProductosCategoriaScreen />} />
          <Route path="/gerente/productos/editar/:id" element={<EditarProductoScreen />} />
          <Route path="/productos/:id" element={<ProductoDetalleScreen />} />
          <Route path="/verify-email" element={<VerifyEmailScreen />} />
          <Route
            path="/gerente/productos/nuevo"
            element={
                <AgregarProductoScreen />
            
            }
          />


          {/* Rutas de perfil */}
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/direcciones" element={<DireccionesScreen />} />
          <Route path="/direcciones/nueva" element={<NuevaDireccionScreen />} />
          <Route path="/metodospago" element={<MetodosPagosScreen />} />
          <Route path="/metodospago/nueva" element={<NuevaTarjetaScreen />} />
          <Route path="/idioma" element={<IdiomaScreen />} />
          <Route path="/condicionessalud" element={<CondicionesSaludScreen />} />
          <Route path="/seleccionar-sucursal" element={<SeleccionarSucursalScreen />} />
          <Route path="/seleccionar-metodo-pago" element={<SeleccionarMetodoPagoScreen />} />
          <Route path="/pedido/:pedidoId" element={<SeguimientoPedidoScreen />} />
          <Route path="/mis-pedidos" element={<MisPedidosScreen />} />
          <Route path="/puntos-lealtad" element={<PuntosLealtadScreen />} />
          <Route path="/trivia" element={<TriviaScreen />} />
          <Route path="/trivia/:pedidoId" element={<TriviaScreen />} />

          <Route
            path="/panel-gerente"
            element={
              <ProtectedRoute>
                <PanelGerenteScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/producto/:id"
            element={
              <ProtectedRoute>
                <ProductoDetalleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/carrito"
            element={
              <ProtectedRoute>
                <CarritoScreen />
              </ProtectedRoute>
            }
          />

           {/* ==================== RUTA 2FA (NUEVA) ==================== */}
          <Route
            path="/seguridad/2fa"
            element={
              <ProtectedRoute>
                <TwoFactorSettings />
              </ProtectedRoute>
            }
          />

          




          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;