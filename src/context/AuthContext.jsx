import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authService.verifyToken();
        setUser(response.user);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    
    // Si requiere 2FA, devolver la respuesta sin guardar el token aún
    if (response.requires2FA) {
      return response;
    }
    
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

    const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      // Si requiere verificación, devolver la respuesta sin hacer login
      if (response.requiresVerification) {
        return response;
      }

      // Si el registro fue exitoso y tiene token, hacer login automático
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  };
  const googleLogin = async (googleToken) => {
    const response = await authService.googleLogin(googleToken);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Actualizar usuario después de habilitar/deshabilitar 2FA
  const updateUser = (updatedData) => {
    setUser({ ...user, ...updatedData });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      googleLogin,
      logout, 
      loading,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};