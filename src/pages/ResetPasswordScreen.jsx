import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';
import PasswordValidator, { validatePassword } from '../components/PasswordValidator';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de recuperación no encontrado');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar seguridad de contraseña
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    if (!token) {
      setError('Token de recuperación inválido');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token: token,
        nuevaPassword: formData.password,
      });

      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setError(
        err.response?.data?.message || 
        'Error al restablecer la contraseña. El token puede haber expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
        <div className="bg-burgundy-800 pt-12 pb-8 text-center">
          <div className="flex justify-center">
            <img
              src={logoImage}
              alt="Logo Reelish"
              className="w-32 h-auto"
            />
          </div>
        </div>

        <div className="bg-white rounded-tl-[60px] mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-burgundy-900 mb-3">
              ¡Contraseña actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
      <div className="bg-burgundy-800 pt-12 pb-8 text-center">
        <div className="flex justify-center">
          <img
            src={logoImage}
            alt="Logo Reelish"
            className="w-32 h-auto"
          />
        </div>
      </div>

      <div className="bg-white rounded-tl-[60px] mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
        <h2 className="text-2xl font-bold text-burgundy-900 mb-2">
          Restablecer Contraseña
        </h2>
        <p className="text-gray-600 mb-6">
          Ingresa tu nueva contraseña segura para tu cuenta.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nueva contraseña */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <PasswordValidator 
              password={formData.password} 
              showValidation={formData.password.length > 0}
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Confirmar Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
              {formData.confirmPassword && 
               formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;