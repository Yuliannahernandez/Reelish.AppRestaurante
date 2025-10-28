import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, FileText, AlertCircle } from 'lucide-react';
import { profileService } from '../services/profileService';

const NuevaDireccionScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    alias: '',
    direccionCompleta: '',
    ciudad: 'Cartago',
    provincia: 'Cartago',
    codigoPostal: '',
    referencia: '',
    esPrincipal: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await profileService.createDireccion(formData);
      navigate('/direcciones');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la dirección');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/direcciones')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-italic text-gold">
            AGREGAR NUEVA DIRECCIÓN
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Dirección */}
        <div className="mb-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-burgundy-600 w-5 h-5" />
            <input
              type="text"
              name="direccionCompleta"
              placeholder="Dirección"
              value={formData.direccionCompleta}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Piso/Oficina */}
        <div className="mb-4">
          <div className="relative">
            <Building2 className="absolute left-3 top-3 text-burgundy-600 w-5 h-5" />
            <input
              type="text"
              name="alias"
              placeholder="Piso/Oficina"
              value={formData.alias}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Especificaciones o Notas */}
        <div className="mb-6">
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-burgundy-600 w-5 h-5" />
            <textarea
              name="referencia"
              placeholder="Especificaciones o Notas"
              value={formData.referencia}
              onChange={handleChange}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-italic py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'GUARDAR'}
        </button>
      </form>
    </div>
  );
};

export default NuevaDireccionScreen;