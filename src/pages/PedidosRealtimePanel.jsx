import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Package, AlertCircle, Bell } from 'lucide-react';

const PedidosRealtimePanel = ({ pedidos, onCambiarEstado }) => {
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    setUltimaActualizacion(new Date());
  }, [pedidos]);

  const getEstadoInfo = (estado) => {
    const info = {
      confirmado: {
        color: 'blue',
        icon: Clock,
        label: 'Confirmado',
        accion: 'Iniciar Preparación',
        siguiente: 'en_preparacion',
      },
      en_preparacion: {
        color: 'orange',
        icon: Package,
        label: 'En Preparación',
        accion: 'Marcar Listo',
        siguiente: 'listo',
      },
      listo: {
        color: 'green',
        icon: CheckCircle,
        label: 'Listo',
        accion: 'Completar',
        siguiente: 'completado',
      },
    };
    return info[estado] || info.confirmado;
  };

  const getTiempoEspera = (fechaCreacion) => {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const minutos = Math.floor((ahora - fecha) / 1000 / 60);
    
    if (minutos < 1) return 'Recién llegado';
    if (minutos === 1) return '1 minuto';
    return `${minutos} minutos`;
  };

  const getPrioridad = (fechaCreacion) => {
    const ahora = new Date();
    const fecha = new Date(fechaCreacion);
    const minutos = Math.floor((ahora - fecha) / 1000 / 60);
    
    if (minutos > 30) return 'alta';
    if (minutos > 15) return 'media';
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {/* Header con última actualización */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-burgundy-600" />
            <span className="font-semibold text-gray-900">
              Monitor en Tiempo Real
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Actualizado: {ultimaActualizacion.toLocaleTimeString('es-CR')}
          </div>
        </div>
      </div>

      {/* Lista de pedidos por estado */}
      {['confirmado', 'en_preparacion', 'listo'].map((estado) => {
        const pedidosEstado = pedidos.filter((p) => p.estado === estado);
        if (pedidosEstado.length === 0) return null;

        const estadoInfo = getEstadoInfo(estado);
        const Icon = estadoInfo.icon;

        return (
          <div key={estado} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header del estado */}
            <div className={`bg-${estadoInfo.color}-50 border-b-2 border-${estadoInfo.color}-200 px-6 py-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 text-${estadoInfo.color}-600`} />
                  <span className={`font-bold text-${estadoInfo.color}-900`}>
                    {estadoInfo.label}
                  </span>
                  <span className={`bg-${estadoInfo.color}-200 text-${estadoInfo.color}-900 px-2 py-1 rounded-full text-xs font-semibold`}>
                    {pedidosEstado.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Pedidos */}
            <div className="divide-y divide-gray-100">
              {pedidosEstado.map((pedido) => {
                const prioridad = getPrioridad(pedido.fechaCreacion);
                const tiempoEspera = getTiempoEspera(pedido.fechaCreacion);

                return (
                  <div
                    key={pedido.id}
                    className={`p-4 hover:bg-gray-50 transition ${
                      prioridad === 'alta' ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg text-burgundy-900">
                            Pedido #{pedido.id}
                          </span>
                          {prioridad === 'alta' && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              URGENTE
                            </span>
                          )}
                          {prioridad === 'media' && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                              ATENCIÓN
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tiempoEspera}
                          </span>
                          <span>•</span>
                          <span>{pedido.tipoEntrega === 'domicilio' ? 'Domicilio' : 'Recoger'}</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          {pedido.productos.slice(0, 3).map((prod, idx) => (
                            <div key={idx} className="text-sm text-gray-700 mb-1">
                              <span className="font-semibold">{prod.cantidad}x</span> {prod.nombre}
                            </div>
                          ))}
                          {pedido.productos.length > 3 && (
                            <div className="text-xs text-gray-500 mt-1">
                              +{pedido.productos.length - 3} productos más
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-burgundy-900">
                            ₡{Number(pedido.total).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {pedido.sucursal}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => onCambiarEstado(pedido.id, estadoInfo.siguiente)}
                        className={`flex-1 bg-${estadoInfo.color}-600 hover:bg-${estadoInfo.color}-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm`}
                      >
                        {estadoInfo.accion}
                      </button>
                      <button
                        onClick={() => onCambiarEstado(pedido.id, 'cancelado')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {pedidos.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay pedidos activos</p>
          <p className="text-gray-400 text-sm mt-2">
            Los nuevos pedidos aparecerán aquí automáticamente
          </p>
        </div>
      )}
    </div>
  );
};

export default PedidosRealtimePanel;