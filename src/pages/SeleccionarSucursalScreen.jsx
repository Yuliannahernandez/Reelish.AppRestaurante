import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Clock, Check } from 'lucide-react';
import { sucursalesService } from '../services/carritoService';
import { carritoService } from '../services/carritoService';

const SeleccionarSucursalScreen = () => {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      const data = await sucursalesService.getSucursales();
      setSucursales(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionar = async (sucursalId) => {
    try {
      await carritoService.seleccionarSucursal(sucursalId);
      navigate('/carrito');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al seleccionar sucursal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-burgundy-600 text-white py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/carrito')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-italic">SELECCIONAR SUCURSAL</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-gray-600 mb-6">
          Elige la sucursal más cercana para recoger tu pedido
        </p>

        <div className="space-y-4">
          {sucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              onClick={() => setSeleccionada(sucursal.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                seleccionada === sucursal.id
                  ? 'border-burgundy-600 bg-burgundy-50'
                  : 'border-gray-200 bg-white hover:border-burgundy-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-burgundy-900 text-lg mb-1">
                    {sucursal.nombre}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{sucursal.provincia}</span>
                  </div>
                </div>
                {seleccionada === sucursal.id && (
                  <div className="bg-burgundy-600 rounded-full p-1">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{sucursal.direccion}</span>
                </div>
                {sucursal.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{sucursal.telefono}</span>
                  </div>
                )}
                {sucursal.horario && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{sucursal.horario}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {seleccionada && (
          <button
            onClick={() => handleSeleccionar(seleccionada)}
            className="w-full mt-6 bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition shadow-lg"
          >
            Confirmar sucursal
          </button>
        )}
      </div>
    </div>
  );
};

export default SeleccionarSucursalScreen;