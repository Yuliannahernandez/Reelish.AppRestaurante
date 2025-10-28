import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    correo: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setResendSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendSuccess(false);

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      // Si el registro requiere verificación, mostrar pantalla de verificación
      if (result.requiresVerification) {
        setRegistrationComplete(true);
        setRegisteredEmail(registerData.correo);
      } else {
        
        navigate('/home');
      }
    } catch (err) {
      console.error('Error al registrarse:', err);
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      setResendSuccess(false);

      await authService.resendVerification(registeredEmail);
      
      setResendSuccess(true);
    } catch (err) {
      console.error('Error al reenviar:', err);
      setError(err.response?.data?.message || 'Error al reenviar el email');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PANTALLA DE VERIFICACIÓN ====================
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
        {/* Header con logo */}
        <div className="bg-burgundy-800 pt-12 pb-8 text-center">
          <div className="flex justify-center">
            <img
              src={logoImage}
              alt="Logo Reelish"
              className="w-32 h-auto" 
            />
          </div>
        </div>

        {/* Contenido de verificación */}
        <div className="bg-white rounded-t-3xl mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
          <div className="max-w-md mx-auto">
            {/* Icono de email */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-burgundy-100 rounded-full flex items-center justify-center">
                <Send className="w-10 h-10 text-burgundy-700" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-burgundy-900 mb-3 text-center">
              ¡Verifica tu correo!
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Hemos enviado un correo de verificación a:
            </p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-burgundy-800 font-semibold text-center break-all">
                {registeredEmail}
              </p>
            </div>

            {/* Mensaje de éxito al reenviar */}
            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-green-700 text-sm">
                  Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.
                </p>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Pasos siguientes:</strong>
              </p>
              <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
                <li>Revisa tu bandeja de entrada</li>
                <li>Haz clic en el enlace de verificación</li>
                <li>Inicia sesión en la aplicación</li>
              </ol>
            </div>

            <p className="text-gray-600 text-sm text-center mb-4">
              ¿No recibiste el correo? Revisa tu carpeta de spam o:
            </p>

            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full bg-white border-2 border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading ? 'Enviando...' : 'Reenviar correo de verificación'}
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Ir a iniciar sesión
            </button>

            <p className="mt-6 text-xs text-gray-500 text-center">
              Si tienes problemas, contacta a soporte
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================== FORMULARIO DE REGISTRO ====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
      {/* Header con logo */}
      <div className="bg-burgundy-800 pt-12 pb-8 text-center">
        <div className="flex justify-center">
          <img
            src={logoImage}
            alt="Logo Reelish"
            className="w-32 h-auto" 
          />
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-t-3xl mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
        <h2 className="text-2xl font-bold text-burgundy-900 mb-2">
          Registrarse
        </h2>
        <p className="text-gray-600 mb-6">
          Ingresa un correo y contraseña para poder registrarse.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="apellido"
                placeholder="Tu apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="correo"
                placeholder="email@domain.com"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
          </div>

          {/* Botón de continuar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creando cuenta...' : 'Continuar'}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-6 text-center">
          <span className="text-gray-600">¿Ya tienes una cuenta? </span>
          <Link
            to="/login"
            className="text-burgundy-700 hover:text-burgundy-900 font-medium"
          >
            Inicia sesión aquí
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Al continuar, aceptas nuestros{' '}
          <a href="#" className="underline">Términos de Servicio</a>
          {' '}y{' '}
          <a href="#" className="underline">Política de Privacidad</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;