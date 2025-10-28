import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MapPin as MapPinIcon } from 'lucide-react';
import { profileService } from '../services/profileService';

const DireccionesScreen = () => {
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDirecciones();
  }, []);

  const loadDirecciones = async () => {
    try {
      const data = await profileService.getDirecciones();
      setDirecciones(data);
    } catch (error) {
      console.error('Error loading direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-32 h-32 mb-6">
        <svg viewBox="0 0 200 200" className="w-full h-full text-burgundy-800">
          <rect x="40" y="80" width="60" height="80" fill="currentColor" opacity="0.3"/>
          <rect x="50" y="90" width="15" height="15" fill="white"/>
          <rect x="75" y="90" width="15" height="15" fill="white"/>
          <rect x="50" y="115" width="15" height="15" fill="white"/>
          <rect x="75" y="115" width="15" height="15" fill="white"/>
          <path d="M 70 80 L 100 60 L 130 80" stroke="currentColor" strokeWidth="3" fill="none"/>
          <line x1="100" y1="40" x2="100" y2="60" stroke="currentColor" strokeWidth="3"/>
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-burgundy-900 mb-2 text-center">
        NO TIENES
      </h3>
      <h3 className="text-2xl font-bold text-burgundy-900 mb-2 text-center">
        DIRECCIONES
      </h3>
      <h3 className="text-2xl font-bold text-burgundy-900 text-center">
        GUARDADAS
      </h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-italic text-gold">
            MIS DIRECCIONES
          </h1>
          <button
            onClick={() => navigate('/direcciones/nueva')}
            className="p-2"
          >
            <Plus className="w-6 h-6 text-burgundy-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : direcciones.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {direcciones.map((dir) => (
              <div
                key={dir.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-burgundy-500 transition cursor-pointer"
                onClick={() => navigate(`/direcciones/${dir.id}`)}
              >
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-burgundy-700 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-burgundy-900 mb-1">
                      {dir.alias || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {dir.direccionCompleta}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {dir.ciudad}, {dir.provincia}
                    </p>
                    {dir.esPrincipal && (
                      <span className="inline-block mt-2 px-2 py-1 bg-gold text-burgundy-900 text-xs rounded">
                        Principal
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DireccionesScreen;