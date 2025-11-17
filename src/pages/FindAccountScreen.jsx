import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, User, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { authService } from '../services/authService';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const FindAccountScreen = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('phone'); 
  const [formData, setFormData] = useState({
    telefono: '',
    nombre: '',
    apellido: '',
  });
  const [error, setError] = useState('');
  const [foundAccount, setFoundAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setFoundAccount(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFoundAccount(null);
    setLoading(true);

    try {
      const result = await authService.findAccount(searchType, formData);
      
      if (result.found) {
        setFoundAccount(result);
      } else {
        setError('No se encontró ninguna cuenta con esa información');
      }
    } catch (err) {
      console.error('Error buscando cuenta:', err);
      setError(err.response?.data?.message || 'Error al buscar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login', { state: { email: foundAccount.correo } });
  };

  const handleGoToResetPassword = () => {
    navigate('/forgot-password', { state: { email: foundAccount.correo } });
  };

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
          ¿Olvidaste tu correo?
        </h2>
        <p className="text-gray-600 mb-6">
          Te ayudaremos a encontrar tu cuenta. Ingresa la información que recuerdes.
        </p>

        {/* Tabs para tipo de búsqueda */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSearchType('phone')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              searchType === 'phone'
                ? 'bg-burgundy-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Phone className="w-5 h-5 inline mr-2" />
            Por teléfono
          </button>
          <button
            onClick={() => setSearchType('name')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              searchType === 'name'
                ? 'bg-burgundy-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Por nombre
          </button>
        </div>

        {/* Cuenta encontrada */}
        {foundAccount && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-semibold mb-2">
                  ¡Cuenta encontrada!
                </p>
                <div className="bg-white border border-green-300 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Tu correo es:</p>
                  <p className="text-burgundy-800 font-semibold text-lg break-all">
                    {foundAccount.correo}
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Ir a iniciar sesión
                  </button>
                  <button
                    onClick={handleGoToResetPassword}
                    className="w-full bg-white border-2 border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50 font-semibold py-3 rounded-lg transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Formulario */}
        {!foundAccount && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {searchType === 'phone' ? (
              <div>
                <label className="block text-sm font-medium text-burgundy-800 mb-1">
                  Número de Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="telefono"
                    placeholder="88888888"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el teléfono que usaste al registrarte
                </p>
              </div>
            ) : (
              <>
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
                <p className="text-xs text-gray-500">
                  Ingresa el nombre completo que usaste al registrarte
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Buscando...' : 'Buscar mi cuenta'}
            </button>
          </form>
        )}

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/login"
            className="block text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
          >
            ← Volver al inicio de sesión
          </Link>
          <Link
            to="/register"
            className="block text-gray-600 hover:text-gray-800 text-sm"
          >
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>💡 Consejo:</strong> Si no recuerdas ninguno de estos datos, contacta a nuestro equipo de soporte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FindAccountScreen;