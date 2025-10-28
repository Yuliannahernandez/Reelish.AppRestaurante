import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react';
import { profileService } from '../services/profileService';

const CondicionesSaludScreen = () => {
  const navigate = useNavigate();
  const [condiciones, setCondiciones] = useState([]);
  const [misCondiciones, setMisCondiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [todasCondiciones, misCondicionesData] = await Promise.all([
        profileService.getCondicionesSalud(),
        profileService.getMisCondiciones(),
      ]);
      setCondiciones(todasCondiciones);
      setMisCondiciones(misCondicionesData.map(c => c.id));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCondicion = (id) => {
    setMisCondiciones(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      await profileService.updateCondiciones(misCondiciones);
      navigate('/profile');
    } catch (error) {
      console.error('Error saving conditions:', error);
    } finally {
      setSaving(false);
    }
  };

  // Mapeo de condiciones a las que están en la BD
  const condicionesRiesgo = [
    { id: 2, nombre: 'Hipertensión Arterial', dbNombre: 'Hipertensión' },
    { id: 1, nombre: 'Diabetes', dbNombre: 'Diabetes' },
    { id: 8, nombre: 'Enfermedades del Corazón', dbNombre: 'Enfermedad Cardíaca' },
    { id: 9, nombre: 'Enfermedad Renal', dbNombre: 'Enfermedad Renal' },
    { id: 10, nombre: 'Obesidad', dbNombre: 'Obesidad' },
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-italic text-gold">
            MI SALUD
          </h1>
          <button className="p-2 invisible">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-burgundy-700 flex-shrink-0" />
          <h2 className="text-lg font-italic text-burgundy-900">
            Condiciones de riesgo
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {condiciones.map((condicion) => (
                <label
                  key={condicion.id}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-burgundy-500 transition"
                >
                  <input
                    type="checkbox"
                    checked={misCondiciones.includes(condicion.id)}
                    onChange={() => toggleCondicion(condicion.id)}
                    className="w-5 h-5 text-burgundy-700 border-gray-300 rounded focus:ring-burgundy-500"
                  />
                  <span className="text-burgundy-900 flex-1">
                    {condicion.nombre}
                  </span>
                </label>
              ))}
            </div>

            {/* Botón Guardar fijo abajo */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={handleGuardar}
                disabled={saving}
                className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-italic py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'GUARDAR'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CondicionesSaludScreen;