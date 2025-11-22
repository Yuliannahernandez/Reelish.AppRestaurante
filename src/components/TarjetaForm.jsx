
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { tarjetasService } from '../services/tarjetasService';

const TarjetaForm = ({ monto, pedidoId, onPagoExitoso, onPagoError }) => {
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [nombreTitular, setNombreTitular] = useState('');
  
  const [tipoTarjeta, setTipoTarjeta] = useState('');
  const [saldoDisponible, setSaldoDisponible] = useState(null);
  const [tarjetaValida, setTarjetaValida] = useState(null);
  const [mensajeValidacion, setMensajeValidacion] = useState('');
  
  const [validando, setValidando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [mostrarTarjetasPrueba, setMostrarTarjetasPrueba] = useState(false);
  const [tarjetasPrueba, setTarjetasPrueba] = useState([]);

  useEffect(() => {
    cargarTarjetasPrueba();
  }, []);

  const cargarTarjetasPrueba = async () => {
    try {
      const data = await tarjetasService.getTarjetasPrueba();
      setTarjetasPrueba(data.tarjetas_prueba || []);
    } catch (error) {
      console.error('Error cargando tarjetas de prueba:', error);
    }
  };

  const formatearNumeroTarjeta = (valor) => {
    // Remover todo lo que no sea número
    const numeros = valor.replace(/\D/g, '');
    
    // Agregar espacio cada 4 dígitos
    const grupos = numeros.match(/.{1,4}/g);
    return grupos ? grupos.join(' ') : '';
  };

  const handleNumeroTarjetaChange = (e) => {
    const valor = e.target.value;
    const formateado = formatearNumeroTarjeta(valor);
    
    if (formateado.replace(/\s/g, '').length <= 19) {
      setNumeroTarjeta(formateado);
      
      // Auto-detectar tipo de tarjeta
      const sinEspacios = formateado.replace(/\s/g, '');
      if (sinEspacios.startsWith('4')) {
        setTipoTarjeta('Visa');
      } else if (sinEspacios.startsWith('5')) {
        setTipoTarjeta('Mastercard');
      } else if (sinEspacios.startsWith('3')) {
        setTipoTarjeta('American Express');
      } else {
        setTipoTarjeta('');
      }
    }
  };

  const formatearFechaExpiracion = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    
    if (numeros.length >= 2) {
      return numeros.slice(0, 2) + '/' + numeros.slice(2, 4);
    }
    return numeros;
  };

  const handleFechaExpiracionChange = (e) => {
    const valor = e.target.value;
    const formateado = formatearFechaExpiracion(valor);
    
    if (formateado.length <= 5) {
      setFechaExpiracion(formateado);
    }
  };

  const handleCvvChange = (e) => {
    const valor = e.target.value.replace(/\D/g, '');
    
    if (valor.length <= 4) {
      setCvv(valor);
    }
  };

  const handleValidarTarjeta = async () => {
    if (!numeroTarjeta || !fechaExpiracion || !cvv || !nombreTitular) {
      setMensajeValidacion('Por favor completa todos los campos');
      setTarjetaValida(false);
      return;
    }

    setValidando(true);
    setMensajeValidacion('');
    
    try {
      const data = await tarjetasService.validarTarjeta(
        numeroTarjeta,
        fechaExpiracion,
        cvv,
        nombreTitular
      );

      if (data.valida) {
        setTarjetaValida(true);
        setTipoTarjeta(data.tipo);
        setSaldoDisponible(data.saldo);
        setMensajeValidacion(`Tarjeta ${data.tipo} válida. Saldo: ₡${data.saldo.toLocaleString()}`);
      } else {
        setTarjetaValida(false);
        setMensajeValidacion(data.mensaje);
        setSaldoDisponible(null);
      }
    } catch (error) {
      console.error('Error validando tarjeta:', error);
      setTarjetaValida(false);
      setMensajeValidacion('Error al validar la tarjeta');
    } finally {
      setValidando(false);
    }
  };

  const handleProcesarPago = async () => {
    if (!tarjetaValida) {
      alert('Por favor valida la tarjeta primero');
      return;
    }

    if (saldoDisponible < monto) {
      alert(`Saldo insuficiente. Disponible: ₡${saldoDisponible.toLocaleString()}`);
      return;
    }

    setProcesando(true);
    
    try {
      const data = await tarjetasService.procesarPago(
        numeroTarjeta,
        fechaExpiracion,
        cvv,
        nombreTitular,
        monto,
        pedidoId
      );

      if (data.success) {
        console.log('Pago exitoso:', data);
        onPagoExitoso(data);
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      const mensaje = error.response?.data?.detail || 'Error al procesar el pago';
      alert(mensaje);
      onPagoError(error);
    } finally {
      setProcesando(false);
    }
  };

  const usarTarjetaPrueba = (tarjeta) => {
    setNumeroTarjeta(tarjeta.numero);
    setFechaExpiracion(tarjeta.expiracion);
    setCvv(tarjeta.cvv);
    setNombreTitular(tarjeta.nombre);
    setMostrarTarjetasPrueba(false);
    
   
    setTimeout(() => {
      handleValidarTarjeta();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-burgundy-800" />
          <h3 className="text-lg font-bold text-burgundy-900">
            Pago con Tarjeta
          </h3>
        </div>
        
        {/* Botón para ver tarjetas de prueba */}
        <button
          onClick={() => setMostrarTarjetasPrueba(!mostrarTarjetasPrueba)}
          className="text-sm text-burgundy-700 hover:text-burgundy-900 font-semibold"
        >
          {mostrarTarjetasPrueba ? '✕ Cerrar' : 'Ver mis tarjetas'}
        </button>
      </div>

      {/* Tarjetas de prueba */}
      {mostrarTarjetasPrueba && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Tarjetas de prueba disponibles:
          </p>
          {tarjetasPrueba.map((tarjeta, index) => (
            <button
              key={index}
              onClick={() => usarTarjetaPrueba(tarjeta)}
              className="w-full text-left bg-white border border-blue-200 rounded-lg p-3 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900">{tarjeta.tipo}</p>
                  <p className="text-sm text-gray-600">{tarjeta.numero}</p>
                  <p className="text-xs text-gray-500">
                    Saldo: ₡{tarjeta.saldo.toLocaleString()} - {tarjeta.descripcion}
                  </p>
                </div>
                <span className="text-blue-600 text-sm font-semibold">Usar →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Monto a pagar */}
      <div className="bg-burgundy-50 border-2 border-burgundy-200 rounded-xl p-4">
        <p className="text-sm text-burgundy-700 mb-1">Monto a pagar</p>
        <p className="text-3xl font-bold text-burgundy-900">
          ₡{monto.toLocaleString()}
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        {/* Número de tarjeta */}
        <div>
          <label className="block text-sm font-semibold text-burgundy-900 mb-2">
            Número de tarjeta
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={numeroTarjeta}
              onChange={handleNumeroTarjetaChange}
              placeholder="1234 5678 9012 3456"
              className="w-full pl-10 pr-20 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none"
            />
            {tipoTarjeta && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="bg-burgundy-100 text-burgundy-800 text-xs font-bold px-2 py-1 rounded">
                  {tipoTarjeta}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fecha y CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-burgundy-900 mb-2">
              Fecha de expiración
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={fechaExpiracion}
                onChange={handleFechaExpiracionChange}
                placeholder="MM/YY"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-burgundy-900 mb-2">
              CVV
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                maxLength={4}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Nombre del titular */}
        <div>
          <label className="block text-sm font-semibold text-burgundy-900 mb-2">
            Nombre del titular
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={nombreTitular}
              onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
              placeholder="JUAN PÉREZ"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-burgundy-500 focus:outline-none uppercase"
            />
          </div>
        </div>
      </div>

      {/* Mensaje de validación */}
      {mensajeValidacion && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${
          tarjetaValida 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {tarjetaValida ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold ${
              tarjetaValida ? 'text-green-900' : 'text-red-900'
            }`}>
              {mensajeValidacion}
            </p>
            {tarjetaValida && saldoDisponible !== null && (
              <p className="text-xs text-green-700 mt-1">
                {saldoDisponible >= monto 
                  ? '✓ Saldo suficiente para realizar el pago' 
                  : '✗ Saldo insuficiente'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="space-y-3">
        {/* Botón validar */}
        {!tarjetaValida && (
          <button
            onClick={handleValidarTarjeta}
            disabled={validando || !numeroTarjeta || !fechaExpiracion || !cvv || !nombreTitular}
            className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validando ? 'Validando...' : 'Validar Tarjeta'}
          </button>
        )}

        {/* Botón pagar */}
        {tarjetaValida && (
          <button
            onClick={handleProcesarPago}
            disabled={procesando || saldoDisponible < monto}
            className="w-full bg-burgundy-800 text-white py-4 rounded-xl font-bold hover:bg-burgundy-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {procesando ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando pago...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Pagar ₡{monto.toLocaleString()}
              </>
            )}
          </button>
        )}
      </div>

      {/* Mensaje de seguridad */}
      <p className="text-xs text-gray-500 text-center">
        Transacción simulada segura. Tus datos están protegidos.
      </p>
    </div>
  );
};

export default TarjetaForm;