import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Calendar, Lock, AlertCircle } from 'lucide-react';
import { profileService } from '../services/profileService';

const EditarTarjetaScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
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
  const [loadingInit, setLoadingInit] = useState(true);

  // Cargar datos de la tarjeta al montar
  useEffect(() => {
    const loadTarjeta = async () => {
      try {
        const metodos = await profileService.getMetodosPago();
        const tarjeta = metodos.find(t => String(t.id) === String(id));
        if (!tarjeta) {
          alert('Tarjeta no encontrada');
          navigate('/metodospago');
          return;
        }

        // Formatear fecha MM/YY para el input
        let fecha = '';
        if (tarjeta.fechaExpiracion) {
          const d = new Date(tarjeta.fechaExpiracion);
          fecha = `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
        }

        setFormData({
          tipo: tarjeta.tipo || 'tarjeta_credito',
          ultimosDigitos: tarjeta.ultimosDigitos || '',
          nombreTitular: tarjeta.nombreTitular || '',
          fechaExpiracion: fecha,
          marca: tarjeta.marca || 'VISA',
          esPrincipal: tarjeta.esPrincipal || false,
        });
      } catch (err) {
        console.error(err);
        alert('Error cargando tarjeta');
        navigate('/metodospago');
      } finally {
        setLoadingInit(false);
      }
    };

    loadTarjeta();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) value = value.slice(0,2) + '/' + value.slice(2,4);
    e.target.value = value;
    setFormData(prev => ({ ...prev, fechaExpiracion: value }));
  };

  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 16) {
      setFormData(prev => ({ ...prev, ultimosDigitos: value.slice(-4) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const [mes, anio] = formData.fechaExpiracion.split('/');
      const fechaExp = `20${anio}-${mes.padStart(2,'0')}-01`;

      // PUT para actualizar tarjeta
      await profileService.updateMetodoPago(id, {
        ...formData,
        fechaExpiracion: fechaExp,
      });

      navigate('/metodospago');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al actualizar la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/metodospago')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-semibold text-gold">EDITAR TARJETA</h1>
        </div>
      </div>

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
              <label className="block text-sm text-gray-600 mb-1">Número en la tarjeta</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="numeroTarjeta"
                  placeholder="1234 5678 9012 3456"
                  onChange={handleCardNumber}
                  maxLength={19}
                  value={formData.ultimosDigitos}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Vencimiento */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vencimiento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fechaExpiracion"
                  placeholder="MM/YY"
                  value={formData.fechaExpiracion}
                  onChange={handleExpiry}
                  maxLength={5}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Titular */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Titular</label>
              <input
                type="text"
                name="nombreTitular"
                value={formData.nombreTitular}
                onChange={handleChange}
                required
                className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Marca / Principal */}
            <div className="flex items-center gap-4">
              <select name="marca" value={formData.marca} onChange={handleChange} className="py-2 px-3 border rounded">
                <option>VISA</option>
                <option>MASTERCARD</option>
                <option>AMEX</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="esPrincipal" checked={formData.esPrincipal} onChange={handleChange} />
                Método principal
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white py-3 rounded-lg">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarTarjetaScreen;
