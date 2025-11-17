// components/TipoCambio.jsx

import { useState, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { tipoCambioService } from '../services/tipoCambioService';

const TipoCambio = () => {
  const [tipoCambio, setTipoCambio] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTipoCambio();
  }, []);

  const loadTipoCambio = async () => {
    setLoading(true);
    try {
      const data = await tipoCambioService.getTipoCambioActual();
      setTipoCambio(data);
    } catch (error) {
      console.error('Error cargando tipo de cambio:', error);
      // Intentar con caché
      try {
        const cacheData = await tipoCambioService.getTipoCambioCache();
        setTipoCambio(cacheData);
      } catch (e) {
        console.error('Error cargando caché:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tipoCambio) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Tipo de Cambio</p>
          <p className="text-lg font-semibold text-gray-900">
            ₡{tipoCambio.venta.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            {tipoCambio.fuente === 'BCCR' ? 'BCCR' : 'Caché'} • {tipoCambio.fecha}
          </p>
        </div>
      </div>
      
      <button
        onClick={loadTipoCambio}
        disabled={loading}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default TipoCambio;