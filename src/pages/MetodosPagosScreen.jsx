// src/pages/MetodosPagoScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Trash2 } from 'lucide-react';
import { profileService } from '../services/profileService';

const MetodosPagoScreen = () => {
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadMetodosPago();
  }, []);

  const loadMetodosPago = async () => {
    try {
      const data = await profileService.getMetodosPago();
      setMetodosPago(data);
    } catch (error) {
      console.error('Error loading métodos de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Seguro que quieres eliminar esta tarjeta?');
    if (!ok) return;
    try {
      setDeletingId(id);
      await profileService.deleteMetodoPago(id);
      setMetodosPago(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error eliminando tarjeta:', err);
      alert(err.response?.data?.message || 'Error eliminando tarjeta');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCardNumber = (digits) => `•••• •••• •••• ${digits}`;

  const formatExpiry = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="p-2">
            <ArrowLeft className="w-6 h-6 text-burgundy-900" />
          </button>
          <h1 className="text-xl font-italic text-gold">MIS TARJETAS</h1>
          <button onClick={() => navigate('/metodospago/nueva')} className="p-2">
            <Plus className="w-6 h-6 text-burgundy-900" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <h2 className="text-xl font-italic text-burgundy-900 mb-6">TUS TARJETAS INSCRITAS</h2>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : (
          <>
            <button
              onClick={() => navigate('/metodospago/nueva')}
              className="w-full mb-6 py-4 border-2 border-gold border-dashed rounded-lg flex items-center justify-center gap-2 text-burgundy-900 hover:bg-gold-50 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Agregar tarjeta</span>
            </button>

            <div className="space-y-4">
              {metodosPago.map((metodo) => (
                <div
                  key={metodo.id}
                  className="relative bg-gradient-to-r from-burgundy-700 to-burgundy-900 rounded-2xl p-6 text-white shadow-lg cursor-pointer"
                >
                  {/* Al hacer click en el contenedor se abre edición */}
                  <div
                    onClick={() => navigate(`/metodospago/editar/${metodo.id}`)}
                    className="pb-2"
                  >
                    <div className="flex items-start justify-between mb-8">
                      <CreditCard className="w-10 h-10" />
                      <span className="text-sm opacity-80">{metodo.marca || 'VISA'}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-lg tracking-wider font-mono">
                        {formatCardNumber(metodo.ultimosDigitos || '9087')}
                      </p>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-70 mb-1">Titular</p>
                        <p className="text-sm font-semibold">
                          {metodo.nombreTitular || 'NOMBRE APELLIDO'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-70 mb-1">Vence</p>
                        <p className="text-sm font-semibold">
                          {formatExpiry(metodo.fechaExpiracion) || '29/09'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción (no forman parte del area clickable de edición) */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(metodo.id);
                      }}
                      className="bg-white/20 hover:bg-white/30 p-2 rounded-full flex items-center justify-center"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  {/* Indicador borrando */}
                  {deletingId === metodo.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                      <div className="text-white">Eliminando...</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetodosPagoScreen;
