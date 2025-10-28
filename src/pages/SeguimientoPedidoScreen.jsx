import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Package, Store, Phone, Trophy } from 'lucide-react';
import { pedidoService } from '../services/pedidoService';

const SeguimientoPedidoScreen = () => {
  const { pedidoId } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPedido();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(loadPedido, 10000);
    return () => clearInterval(interval);
  }, [pedidoId]);

  const loadPedido = async () => {
    try {
      const data = await pedidoService.getPedido(pedidoId);
      setPedido(data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    {
      key: 'recibido',
      label: 'Recibido',
      icon: Check,
      descripcion: 'Tu pedido ha sido confirmado'
    },
    {
      key: 'en_preparacion',
      label: 'En Preparación',
      icon: Clock,
      descripcion: 'Estamos preparando tu pedido'
    },
    {
      key: 'listo',
      label: 'Listo',
      icon: Package,
      descripcion: 'Tu pedido está listo para recoger'
    }
  ];

  const getEstadoIndex = (estado) => {
    const mapping = {
      'pendiente': 0,
      'confirmado': 0,
      'recibido': 0,
      'en_preparacion': 1,
      'listo': 2,
      'completado': 2
    };
    return mapping[estado] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pedido no encontrado</p>
          <button
            onClick={() => navigate('/home')}
            className="text-burgundy-600 font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const estadoActualIndex = getEstadoIndex(pedido.estado);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-700 text-white py-6 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate('/home')}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        
        <h1 className="text-2xl font-italic text-yellow-300 mb-2">
          SEGUIMIENTO DE MI PEDIDO
        </h1>
        <p className="text-amber-100 text-sm">
          Pedido #{pedido.id}
        </p>
      </div>

      {/* Barra de Progreso */}
      <div className="px-6 py-8">
        <div className="relative">
          {/* Línea de progreso */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full"
              style={{ 
                width: `${(estadoActualIndex / (estados.length - 1)) * 100}%` 
              }}
            />
          </div>

          {/* Estados */}
          <div className="relative z-10 flex justify-between">
            {estados.map((estado, index) => {
              const Icon = estado.icon;
              const completado = index <= estadoActualIndex;
              const activo = index === estadoActualIndex;

              return (
                <div key={estado.key} className="flex flex-col items-center flex-1">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                      completado 
                        ? 'bg-gradient-to-br from-burgundy-600 to-burgundy-600 shadow-lg shadow-burgundy-700/50' 
                        : 'bg-gray-200'
                    } ${
                      activo ? 'ring-4 ring-burgundy-300 scale-110' : ''
                    }`}
                  >
                    <Icon 
                      className={`w-7 h-7 ${
                        completado ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </div>

                  <p className={`text-sm font-bold text-center mb-1 ${
                    completado ? 'text-burgundy-600' : 'text-gray-400'
                  }`}>
                    {estado.label}
                  </p>
                  
                  {activo && (
                    <p className="text-xs text-gray-600 text-center max-w-[100px]">
                      {estado.descripcion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tiempo estimado */}
        {pedido.estado !== 'listo' && pedido.estado !== 'completado' && (
          <div className="mt-8 bg-gradient-to-r from-burgundy-50 to-burgundy-100 border-2 border-burgundy-300 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-burgundy-600 p-3 rounded-full shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 font-semibold">
                    TIEMPO ESTIMADO
                  </p>
                  <p className="text-2xl font-bold text-burgundy-900">
                    {pedido.tiempoEstimado || 30} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando está listo */}
        {(pedido.estado === 'listo' || pedido.estado === 'completado') && (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-2xl p-6 shadow-md">
            <div className="text-center">
              <div className="inline-flex bg-amber-600 p-4 rounded-full shadow-lg mb-4">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-2">
                ¡Tu pedido está listo!
              </h3>
              <p className="text-amber-700">
                Puedes recogerlo en la sucursal
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Curiosidad de Harry Potter */}
      <div className="mx-6 mb-6 bg-gradient-to-br from-burgundy-700 to-burgundy-700 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-xl font-italic text-yellow-300 mb-3">
          ¿Sabías que...
        </h3>
        <p className="text-sm font-italic text-amber-50 leading-relaxed">
          El cine se inventó en 1895 por los hermanos Lumière en Francia.
        </p>
      </div>

          {/* CTA Trivia */}
        <div className="bg-gradient-to-r from-burgundy-100 to-golden-100 border-2 border-burgundy-300 rounded-2xl p-6 mb-6">
          <div className="text-center mb-4">
            <Trophy className="w-12 h-12 text-burgundy-600 mx-auto mb-2" />
            <h3 className="text-lg font-bold text-burgundy-900 mb-1">
              ¡Juega mientras esperas! 
            </h3>
            <p className="text-sm text-gray-700">
              Responde trivia de cine y gana cupones de descuento
            </p>
          </div>
          
          <button
            onClick={() => navigate(`/trivia/${pedidoId}`)}
            className="w-full bg-gradient-to-r from-burgundy-600 to-burgundy-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
          >
             Jugar Trivia Ahora
          </button>
        </div>

      {/* Información de la sucursal */}
      {pedido.sucursal && (
        <div className="mx-6 bg-white rounded-2xl p-5 shadow-md border border-gray-100">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-burgundy-100 p-2 rounded-full">
              <Store className="w-5 h-5 text-burgundy-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-burgundy-900 mb-1">
                Recoger en:
              </h3>
              <p className="font-semibold text-gray-800">
                {pedido.sucursal.nombre}
              </p>
              <p className="text-sm text-gray-600">
                {pedido.sucursal.direccion}
              </p>
              {pedido.sucursal.telefono && (
                <a 
                  href={`tel:${pedido.sucursal.telefono}`}
                  className="text-sm text-burgundy-700 font-medium mt-1 flex items-center gap-1"
                >
                  <Phone className="w-4 h-4" />
                  {pedido.sucursal.telefono}
                </a>
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-bold text-gray-700 mb-3 text-sm">
              Resumen del pedido
            </h4>
            {pedido.productos?.map((producto, index) => (
              <div key={index} className="flex justify-between py-2 text-sm">
                <span className="text-gray-600">
                  {producto.cantidad}x {producto.nombre}
                </span>
                <span className="font-semibold text-gray-800">
                  ₡{Number(producto.subtotal).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-200 mt-2">
              <span className="font-bold text-amber-900">Total:</span>
              <span className="font-bold text-xl text-amber-900">
                ₡{Number(pedido.total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón de ayuda */}
      <div className="mx-6 mt-6">
        <button className="w-full bg-white border-2 border-burgundy-600 text-burgundy-700 font-bold py-3 rounded-full hover:bg-burgundy-50 transition shadow-md">
          ¿Necesitas ayuda?
        </button>
      </div>
    </div>
  );
};

export default SeguimientoPedidoScreen;