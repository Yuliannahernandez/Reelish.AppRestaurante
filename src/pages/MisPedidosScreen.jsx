import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { pedidoService } from '../services/pedidoService';

const MisPedidosScreen = () => {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); 

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      const data = await pedidoService.getMisPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtro === 'activos') {
      return ['recibido', 'en_preparacion', 'listo'].includes(pedido.estado);
    } else if (filtro === 'completados') {
      return ['completado', 'entregado', 'cancelado'].includes(pedido.estado);
    }
    return true;
  });

  const getEstadoColor = (estado) => {
    const colores = {
      'recibido': 'bg-blue-100 text-blue-700',
      'en_preparacion': 'bg-yellow-100 text-yellow-700',
      'listo': 'bg-green-100 text-green-700',
      'completado': 'bg-gray-100 text-gray-700',
      'entregado': 'bg-gray-100 text-gray-700',
      'cancelado': 'bg-red-100 text-red-700',
    };
    return colores[estado] || 'bg-gray-100 text-gray-700';
  };

  const getEstadoIcono = (estado) => {
    switch (estado) {
      case 'recibido':
      case 'en_preparacion':
        return <Clock className="w-5 h-5" />;
      case 'listo':
      case 'completado':
      case 'entregado':
        return <CheckCircle className="w-5 h-5" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'recibido': 'Recibido',
      'en_preparacion': 'En Preparación',
      'listo': 'Listo para Recoger',
      'completado': 'Completado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado',
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-burgundy-600 text-white py-6 px-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/home')} className="p-2 hover:bg-burgundy-700 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-italic">MIS PEDIDOS</h1>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filtro === 'todos'
                ? 'bg-white text-burgundy-600'
                : 'bg-burgundy-700 text-white hover:bg-burgundy-800'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro('activos')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filtro === 'activos'
                ? 'bg-white text-burgundy-600'
                : 'bg-burgundy-700 text-white hover:bg-burgundy-800'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setFiltro('completados')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filtro === 'completados'
                ? 'bg-white text-burgundy-600'
                : 'bg-burgundy-700 text-white hover:bg-burgundy-800'
            }`}
          >
            Completados
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="px-6 py-6">
        {pedidosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {filtro === 'todos'
                ? 'Aún no tienes pedidos'
                : `No tienes pedidos ${filtro}`}
            </p>
            <button
              onClick={() => navigate('/home')}
              className="text-burgundy-600 font-semibold hover:underline"
            >
              Ir a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => navigate(`/pedido/${pedido.id}`)}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(pedido.fechaCreacion).toLocaleDateString('es-CR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Estado */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getEstadoColor(pedido.estado)}`}>
                    {getEstadoIcono(pedido.estado)}
                    <span>{getEstadoTexto(pedido.estado)}</span>
                  </div>
                </div>

                {/* Información */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {pedido.cantidadProductos} {pedido.cantidadProductos === 1 ? 'producto' : 'productos'}
                    </p>
                    {pedido.sucursal && (
                      <p className="text-xs text-gray-600 font-medium">
                        {pedido.sucursal}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-burgundy-900">
                    ₡{Number(pedido.total).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisPedidosScreen;