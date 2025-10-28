import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { authService } from '../services/authService';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const VerifyEmailScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no válido');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const result = await authService.verifyEmail(token);
      
      // Guardar token y usuario
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      setStatus('success');
      setMessage(result.message);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/home');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Error al verificar el correo');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoImage}
            alt="Logo"
            className="w-32 h-auto mx-auto mb-6"
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-burgundy-700 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificando tu correo...
              </h2>
              <p className="text-gray-600">
                Por favor espera un momento
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Correo Verificado!
              </h2>
              <p className="text-gray-600 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirigiendo a la página principal...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Error de Verificación
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailScreen;