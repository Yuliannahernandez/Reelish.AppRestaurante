
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { reservacionesService } from '../services/reservacionesService';

const MisReservacionesScreen = () => {
  const navigate = useNavigate();
  const [reservaciones, setReservaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [filtro, setFiltro] = useState('todas'); 

  useEffect(() => {
    cargarReservaciones();
  }, []);

  const cargarReservaciones = async () => {
    try {
      setLoading(true);
      const data = await reservacionesService.getMisReservaciones();
      setReservaciones(data.reservaciones || []);
    } catch (error) {
      console.error('Error cargando reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reservación?')) {
      return;
    }

    setCancelando(id);
    try {
      await reservacionesService.cancelarReservacion(id);
      await cargarReservaciones(); 
      alert('Reservación cancelada exitosamente');
    } catch (error) {
      console.error('Error cancelando:', error);
      alert(error.response?.data?.detail || 'Error al cancelar reservación');
    } finally {
      setCancelando(null);
    }
  };

  const getEstadoBadge = (estado) => {
    const configs = {
      pendiente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: AlertCircle,
        label: 'Pendiente'
      },
      confirmada: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle,
        label: 'Confirmada'
      },
      cancelada: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Cancelada'
      },
      completada: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: CheckCircle,
        label: 'Completada'
      },
      no_asistio: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: XCircle,
        label: 'No asistió'
      }
    };

    const config = configs[estado] || configs.pendiente;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const esFechaFutura = (fecha, hora) => {
    const fechaHora = new Date(`${fecha}T${hora}`);
    return fechaHora > new Date();
  };

  const reservacionesFiltradas = reservaciones.filter(res => {
    const esFutura = esFechaFutura(res.fechaReservacion, res.horaReservacion);
    
    switch(filtro) {
      case 'proximas':
        return esFutura && res.estado !== 'cancelada';
      case 'pasadas':
        return !esFutura;
      case 'canceladas':
        return res.estado === 'cancelada';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando reservaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-800 to-burgundy-900 px-6 pt-12 pb-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-7 h-7 text-gold" />
              Mis Reservaciones
            </h1>
            <p className="text-gold text-sm mt-1">
              {reservaciones.length} {reservaciones.length === 1 ? 'reservación' : 'reservaciones'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { value: 'todas', label: 'Todas' },
            { value: 'proximas', label: 'Próximas' },
            { value: 'pasadas', label: 'Pasadas' },
            { value: 'canceladas', label: 'Canceladas' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                filtro === f.value
                  ? 'bg-gold text-burgundy-900'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Estado vacío */}
        {reservaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-burgundy-900 mb-2">
              No tienes reservaciones
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-xs">
              Reserva una mesa y disfruta de una experiencia única
            </p>
            <button
              onClick={() => navigate('/reservaciones')}
              className="bg-burgundy-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-burgundy-900 transition-all"
            >
              Hacer Reservación
            </button>
          </div>
        ) : reservacionesFiltradas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay reservaciones en esta categoría
          </div>
        ) : (
          <div className="space-y-4">
            {reservacionesFiltradas.map((reservacion) => {
              const esFutura = esFechaFutura(reservacion.fechaReservacion, reservacion.horaReservacion);
              const puedeCancelar = esFutura && !['cancelada', 'completada'].includes(reservacion.estado);

              return (
                <div
                  key={reservacion.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Header de la tarjeta */}
                  <div className={`p-4 ${
                    esFutura && reservacion.estado !== 'cancelada'
                      ? 'bg-gradient-to-r from-burgundy-50 to-gold/10'
                      : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-burgundy-900">
                        {reservacion.sucursal.nombre}
                      </h3>
                      {getEstadoBadge(reservacion.estado)}
                    </div>
                    <div className="flex items-start gap-2 text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{reservacion.sucursal.direccion}</span>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="p-4 space-y-3">
                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-burgundy-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-burgundy-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Fecha</p>
                          <p className="font-semibold text-burgundy-900 text-sm">
                            {new Date(reservacion.fechaReservacion).toLocaleDateString('es-CR', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-burgundy-100 rounded-lg">
                          <Clock className="w-5 h-5 text-burgundy-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Hora</p>
                          <p className="font-semibold text-burgundy-900 text-sm">
                            {reservacion.horaReservacion}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personas y Mesa */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-burgundy-100 rounded-lg">
                          <Users className="w-5 h-5 text-burgundy-700" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Personas</p>
                          <p className="font-semibold text-burgundy-900 text-sm">
                            {reservacion.numeroPersonas}
                          </p>
                        </div>
                      </div>

                      {reservacion.mesaAsignada && (
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-gold/20 rounded-lg">
                            <span className="text-sm font-bold text-burgundy-900">
                              🪑
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Mesa</p>
                            <p className="font-semibold text-burgundy-900 text-sm">
                              {reservacion.mesaAsignada}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Teléfono de contacto */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                      <Phone className="w-4 h-4" />
                      <span>{reservacion.telefonoContacto}</span>
                    </div>

                    {/* Notas especiales */}
                    {reservacion.notasEspeciales && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-800 font-semibold mb-1">
                          Notas especiales:
                        </p>
                        <p className="text-sm text-yellow-900">
                          {reservacion.notasEspeciales}
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => navigate(`/reservaciones/${reservacion.id}`)}
                        className="flex-1 bg-burgundy-100 text-burgundy-800 py-2 px-4 rounded-lg font-semibold text-sm hover:bg-burgundy-200 transition-all"
                      >
                        Ver Detalles
                      </button>
                      
                      {puedeCancelar && (
                        <button
                          onClick={() => handleCancelar(reservacion.id)}
                          disabled={cancelando === reservacion.id}
                          className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
                        >
                          {cancelando === reservacion.id ? (
                            <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Footer con fecha de creación */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Reservado el {new Date(reservacion.fechaCreacion).toLocaleDateString('es-CR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botón flotante para nueva reservación */}
      {reservaciones.length > 0 && (
        <div className="fixed bottom-24 right-6 z-50">
          <button
            onClick={() => navigate('/reservaciones')}
            className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white p-4 rounded-full shadow-2xl hover:shadow-burgundy-500/50 transition-all hover:scale-110 flex items-center gap-2"
          >
            <Calendar className="w-6 h-6" />
            <span className="font-semibold pr-1">Nueva Reservación</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MisReservacionesScreen;