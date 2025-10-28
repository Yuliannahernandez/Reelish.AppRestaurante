import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Lock, AlertCircle } from 'lucide-react';
import { profileService } from '../services/profileService';

const NuevaTarjetaScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    tipo: 'tarjeta_credito',
    ultimosDigitos: '',
    nombreTitular: '',
    fechaExpiracion: '',
    marca: 'VISA',
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

  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setFormData(prev => ({
        ...prev,
        ultimosDigitos: value.slice(-4),
      }));
    }
  };

  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
     
      const [mes, anio] = formData.fechaExpiracion.split('/');
      const fechaExp = `20${anio}-${mes}-01`;

      await profileService.createMetodoPago({
        ...formData,
        fechaExpiracion: fechaExp,
      });
      navigate('/metodospago');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/metodospago')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-italic text-gold">
            AGREGAR TARJETA
          </h1>
        </div>
      </div>

      {/* Modal Form */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Número de tarjeta */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Número en la tarjeta
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="numeroTarjeta"
                  placeholder="1234 5678 9012 3456"
                  onChange={handleCardNumber}
                  maxLength={19}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Vencimiento */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Vencimiento
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fechaExpiracion"
                  placeholder="MM/YY"
                  value={formData.fechaExpiracion}
                  onChange={(e) => {
                    handleExpiry(e);
                    setFormData(prev => ({ ...prev, fechaExpiracion: e.target.value }));
                  }}
                  maxLength={5}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* CVV */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                CVV
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  maxLength={4}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-italic py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Guardando...' : 'GUARDAR'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaTarjetaScreen;