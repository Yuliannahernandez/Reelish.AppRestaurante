import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../services/authService';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
       <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
                    {/* Header con logo */}
                    <div className="bg-burgundy-800 pt-12 pb-8 text-center">
                        <div className="bg-burgundy-800 pt-12 pb-8 text-center">
                            {}
                            <div className="flex justify-center">
                                <img
                                    src={logoImage}
                                    alt="Logo Reelish"
                                    className="w-32 h-auto" 
                                />
                            </div>
                        </div>
        
                    </div>

      {/* Formulario */}
      <div className="bg-white rounded-t-3xl mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-burgundy-700 hover:text-burgundy-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </Link>

        <h2 className="text-2xl font-bold text-burgundy-900 mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-gray-600 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar tu contraseña.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">
              Se ha enviado un correo con las instrucciones para recuperar tu contraseña.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-burgundy-800 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Botón de enviar */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : success ? 'Correo enviado' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        {/* Link a login */}
        <div className="mt-6 text-center">
          <span className="text-gray-600">¿Recordaste tu contraseña? </span>
          <Link
            to="/login"
            className="text-burgundy-700 hover:text-burgundy-900 font-medium"
          >
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;