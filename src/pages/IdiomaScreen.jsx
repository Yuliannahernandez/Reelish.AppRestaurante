import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { profileService } from '../services/profileService';

const IdiomaScreen = () => {
  const navigate = useNavigate();
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState('es');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setIdiomaSeleccionado(profile.idioma || 'es');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const idiomas = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const handleGuardar = async () => {
    setLoading(true);
    try {
      await profileService.updateProfile({ idioma: idiomaSeleccionado });
      navigate('/profile');
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
      {/* Header con logo en fondo burgundy */}
      <div className="bg-burgundy-800 pt-12 pb-20 text-center">
        {/* Espacio para la foto de perfil superpuesta */}
      </div>

      {/* Modal blanco superpuesto */}
      <div className="bg-white rounded-t-3xl -mt-16 px-8 py-8 min-h-[calc(100vh-180px)] relative">
        <div className="absolute top-8 left-8">
          <button onClick={() => navigate('/profile')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
        </div>

        <h2 className="text-xl font-italic text-gold mb-8 text-center">
          IDIOMA
        </h2>

        <div className="mb-8">
          <label className="block text-sm font-medium text-burgundy-900 mb-3">
            Elegir idioma
          </label>
          <div className="space-y-3">
            {idiomas.map((idioma) => (
              <button
                key={idioma.code}
                onClick={() => setIdiomaSeleccionado(idioma.code)}
                className={`w-full flex items-center justify-between p-4 border rounded-lg transition ${
                  idiomaSeleccionado === idioma.code
                    ? 'border-burgundy-700 bg-burgundy-50'
                    : 'border-gray-200 hover:border-burgundy-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{idioma.flag}</span>
                  <span className="font-medium text-burgundy-900">
                    {idioma.name}
                  </span>
                </div>
                {idiomaSeleccionado === idioma.code && (
                  <Check className="w-5 h-5 text-burgundy-700" />
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGuardar}
          disabled={loading}
          className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-italic py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'GUARDAR'}
        </button>
      </div>
    </div>
  );
};

export default IdiomaScreen;