// frontend/src/screens/ReservacionesScreen.jsx
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
  AlertCircle
} from 'lucide-react';
import { reservacionesService } from '../services/reservacionesService';

const ReservacionesScreen = () => {
  const navigate = useNavigate();
  const [paso, setPaso] = useState(1); // 1: Seleccionar sucursal, 2: Fecha/Hora, 3: Detalles, 4: Confirmación
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [fecha, setFecha] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [numeroPersonas, setNumeroPersonas] = useState(2);
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [reservacionCreada, setReservacionCreada] = useState(null);

  useEffect(() => {
    cargarSucursales();
  }, []);

  useEffect(() => {
    if (fecha && sucursalSeleccionada) {
      cargarDisponibilidad();
    }
  }, [fecha, sucursalSeleccionada]);

  const cargarSucursales = async () => {
    try {
      const data = await reservacionesService.getSucursalesDisponibles();
      setSucursales(data.sucursales);
    } catch (error) {
      console.error('Error cargando sucursales:', error);
      alert('Error al cargar sucursales');
    }
  };

  const cargarDisponibilidad = async () => {
    try {
      setLoading(true);
      const data = await reservacionesService.getDisponibilidad(
        sucursalSeleccionada.id,
        fecha
      );
      setHorariosDisponibles(data.horarios_disponibles || []);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearReservacion = async () => {
    if (!telefono) {
      alert('Por favor ingresa un teléfono de contacto');
      return;
    }

    setLoading(true);
    try {
      const data = await reservacionesService.crearReservacion({
        sucursal_id: sucursalSeleccionada.id,
        fecha_reservacion: fecha,
        hora_reservacion: horaSeleccionada,
        numero_personas: numeroPersonas,
        telefono_contacto: telefono,
        notas_especiales: notas || null
      });

      setReservacionCreada(data.reservacion);
      setPaso(4);
    } catch (error) {
      console.error('Error creando reservación:', error);
      alert(error.response?.data?.detail || 'Error al crear reservación');
    } finally {
      setLoading(false);
    }
  };

  const getFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  const getFechaMaxima = () => {
    const hoy = new Date();
    const tresMeses = new Date(hoy.setMonth(hoy.getMonth() + 3));
    return tresMeses.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-800 to-burgundy-900 px-6 pt-12 pb-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => paso === 1 ? navigate('/home') : setPaso(paso - 1)}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-7 h-7 text-gold" />
              Reservar Mesa
            </h1>
            <p className="text-gold text-sm mt-1">
              {paso === 1 && 'Selecciona una sucursal'}
              {paso === 2 && 'Elige fecha y hora'}
              {paso === 3 && 'Completa los detalles'}
              {paso === 4 && '¡Reservación confirmada!'}
            </p>
          </div>
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex-1 h-2 rounded-full transition-all ${
                num <= paso ? 'bg-gold' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* PASO 1: Seleccionar Sucursal */}
        {paso === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-burgundy-900 mb-4">
              ¿Dónde quieres reservar?
            </h2>
            {sucursales.map((sucursal) => (
              <div
                key={sucursal.id}
                onClick={() => {
                  setSucursalSeleccionada(sucursal);
                  setPaso(2);
                }}
                className={`bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  sucursalSeleccionada?.id === sucursal.id
                    ? 'border-gold shadow-lg'
                    : 'border-gray-200 hover:border-burgundy-300'
                }`}
              >
                <h3 className="font-bold text-burgundy-900 mb-2">
                  {sucursal.nombre}
                </h3>
                <div className="flex items-start gap-2 text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{sucursal.direccion}, {sucursal.provincia}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>{sucursal.telefono}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PASO 2: Seleccionar Fecha y Hora */}
        {paso === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-burgundy-900 mb-2">
                Sucursal seleccionada
              </h2>
              <div className="bg-white border-2 border-gold rounded-xl p-4">
                <h3 className="font-bold text-burgundy-900">
                  {sucursalSeleccionada?.nombre}
                </h3>
                <p className="text-gray-600 text-sm">
                  {sucursalSeleccionada?.direccion}
                </p>
              </div>
            </div>

            {/* Selector de Fecha */}
            <div>
              <label className="block text-sm font-bold text-burgundy-900 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={getFechaMinima()}
                max={getFechaMaxima()}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none"
              />
            </div>

            {/* Selector de Número de Personas */}
            <div>
              <label className="block text-sm font-bold text-burgundy-900 mb-2">
                Número de personas
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumeroPersonas(Math.max(1, numeroPersonas - 1))}
                  className="w-10 h-10 bg-burgundy-800 text-white rounded-full flex items-center justify-center hover:bg-burgundy-900 transition"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-burgundy-900 w-12 text-center">
                  {numeroPersonas}
                </span>
                <button
                  onClick={() => setNumeroPersonas(Math.min(20, numeroPersonas + 1))}
                  className="w-10 h-10 bg-burgundy-800 text-white rounded-full flex items-center justify-center hover:bg-burgundy-900 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Horarios Disponibles */}
            {fecha && (
              <div>
                <h3 className="text-sm font-bold text-burgundy-900 mb-3">
                  Horarios disponibles
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Cargando horarios...
                  </div>
                ) : horariosDisponibles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No hay horarios disponibles para esta fecha
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {horariosDisponibles.map((horario) => (
                      <button
                        key={horario.hora}
                        onClick={() => {
                          if (horario.disponible) {
                            setHoraSeleccionada(horario.hora);
                            setPaso(3);
                          }
                        }}
                        disabled={!horario.disponible}
                        className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          horaSeleccionada === horario.hora
                            ? 'bg-gold text-burgundy-900 shadow-lg'
                            : horario.disponible
                            ? 'bg-white border-2 border-gray-200 text-burgundy-900 hover:border-burgundy-300'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4" />
                          {horario.hora}
                        </div>
                        <div className="text-xs mt-1">
                          {horario.disponible
                            ? `${horario.capacidad_disponible} disponibles`
                            : 'Lleno'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PASO 3: Detalles de Contacto */}
        {paso === 3 && (
          <div className="space-y-6">
            <div className="bg-white border-2 border-gold rounded-xl p-4">
              <h3 className="font-bold text-burgundy-900 mb-2">
                Resumen de tu reservación
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4" />
                  <span>{sucursalSeleccionada?.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(fecha).toLocaleDateString('es-CR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>{horaSeleccionada}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4" />
                  <span>{numeroPersonas} {numeroPersonas === 1 ? 'persona' : 'personas'}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-burgundy-900 mb-2">
                Teléfono de contacto *
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="8888-8888"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-burgundy-900 mb-2">
                Notas especiales (opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Alergias, preferencias de ubicación, celebración especial..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleCrearReservacion}
              disabled={loading || !telefono}
              className="w-full bg-burgundy-800 text-white py-4 rounded-xl font-bold hover:bg-burgundy-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Reservación'}
            </button>
          </div>
        )}

        {/* PASO 4: Confirmación */}
        {paso === 4 && reservacionCreada && (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-burgundy-900 mb-2">
                ¡Reservación Confirmada!
              </h2>
              <p className="text-gray-600">
                Tu mesa ha sido reservada exitosamente
              </p>
            </div>

            <div className="bg-white border-2 border-green-500 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sucursal:</span>
                <span className="font-bold text-burgundy-900">
                  {reservacionCreada.sucursalNombre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-bold text-burgundy-900">
                  {new Date(reservacionCreada.fechaReservacion).toLocaleDateString('es-CR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hora:</span>
                <span className="font-bold text-burgundy-900">
                  {reservacionCreada.horaReservacion}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Personas:</span>
                <span className="font-bold text-burgundy-900">
                  {reservacionCreada.numeroPersonas}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/mis-reservaciones')}
                className="w-full bg-burgundy-800 text-white py-4 rounded-xl font-bold hover:bg-burgundy-900 transition-all"
              >
                Ver Mis Reservaciones
              </button>
              
              <button
                onClick={() => navigate('/home')}
                className="w-full bg-white border-2 border-burgundy-800 text-burgundy-800 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservacionesScreen;