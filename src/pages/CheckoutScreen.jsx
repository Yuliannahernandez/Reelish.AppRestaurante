
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PayPalButton from '../components/PayPalButton';
import SinpeSimulador from '../components/SinpeSimulador';
import TarjetaForm from '../components/TarjetaForm';
import { pedidoService } from '../services/pedidoService'; 
import { carritoService } from '../services/carritoService';
import { ArrowLeft, Check, Store, Banknote, CreditCard } from 'lucide-react'; 

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mostrarSinpeSimulador, setMostrarSinpeSimulador] = useState(false);

 
  const SINPE_RESTAURANTE = '25905375';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const carritoData = await carritoService.getCarrito();
      setCarrito(carritoData);

      if (!carritoData.sucursal) {
        alert('Debes seleccionar una sucursal');
        navigate('/carrito');
        return;
      }

      if (carritoData.productos.length === 0) {
        alert('El carrito está vacío');
        navigate('/home');
        return;
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los datos');
      navigate('/carrito');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarEfectivo = async () => {
    if (!confirm('¿Confirmar pedido? Pagarás al recoger.')) return;
    
    setProcesando(true);
    try {
      const resultado = await pedidoService.crearPedido();
      alert('¡Pedido confirmado exitosamente!');
      localStorage.removeItem('metodoPagoSeleccionado');
      navigate(`/pedido/${resultado.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al confirmar el pedido');
    } finally {
      setProcesando(false);
    }
  };

  const handlePayPalSuccess = async (paymentDetails) => {
    setProcesando(true);
    try {
      const resultado = await pedidoService.crearPedido({
        paypalOrderId: paymentDetails.orderId,
        paypalPayerId: paymentDetails.payerId,
        paypalAmount: parseFloat(paymentDetails.amount)
      });
      
      alert('¡Pago exitoso! Pedido confirmado.');
      localStorage.removeItem('metodoPagoSeleccionado');
      navigate(`/pedido/${resultado.id}`);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al confirmar el pedido');
    } finally {
      setProcesando(false);
    }
  };

  const handleSinpeSuccess = async (sinpeData) => {
    console.log('SINPE completado:', sinpeData);
    
    setProcesando(true);
    try {
      const resultado = await pedidoService.crearPedido({
        metodoPago: 'sinpe',
        sinpeComprobante: sinpeData.comprobante,
        sinpeTelefono: SINPE_RESTAURANTE
      });
      
      alert('¡Pago exitoso! Pedido confirmado.');
      localStorage.removeItem('metodoPagoSeleccionado');
      navigate(`/pedido/${resultado.id}`);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al confirmar el pedido');
    } finally {
      setProcesando(false);
    }
  };



const handleTarjetaSuccess = async (pagoData) => {
  console.log('Pago con tarjeta exitoso:', pagoData);
  
  setProcesando(true);
  try {
    // Llamar a crearPedido con los datos de la tarjeta
    const resultado = await pedidoService.crearPedido({
      transactionId: pagoData.transaction_id,
      tarjetaTipo: pagoData.tipo_tarjeta,
      tarjetaUltimosDigitos: pagoData.ultimos_digitos
    });
    
    alert(`¡Pago exitoso!\n\nTarjeta: ${pagoData.tipo_tarjeta} ****${pagoData.ultimos_digitos}\nTransaction ID: ${pagoData.transaction_id}`);
    localStorage.removeItem('metodoPagoSeleccionado');
    navigate(`/pedido/${resultado.id}`);
    
  } catch (error) {
    console.error('Error:', error);
    setError('Error al confirmar el pedido con tarjeta');
  } finally {
    setProcesando(false);
  }
};

  const handleTarjetaError = (error) => {
    console.error('Error en pago con tarjeta:', error);
    setError('Error procesando el pago con tarjeta');
  };

  const handlePayPalError = (error) => {
    setError(error.message || 'Error procesando el pago');
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
      <div className="bg-burgundy-600 text-white py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/carrito')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">CONFIRMAR PEDIDO</h1>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sucursal */}
        {carrito?.sucursal && (
          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-burgundy-600">
            <div className="flex items-start gap-3">
              <div className="bg-burgundy-100 p-2 rounded-full">
                <Store className="w-5 h-5 text-burgundy-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-burgundy-900 mb-1">Recoger en:</h3>
                <p className="font-semibold">{carrito.sucursal.nombre}</p>
                <p className="text-sm text-gray-600">{carrito.sucursal.direccion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resumen del pedido */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-burgundy-900 mb-3">Resumen del pedido</h3>
          
          <div className="space-y-2 mb-4">
            {carrito?.productos.map((producto) => (
              <div key={producto.id} className="flex justify-between py-2 border-b border-gray-100">
                <div className="flex-1">
                  <p className="font-medium text-sm">{producto.nombre}</p>
                  <p className="text-xs text-gray-600">Cantidad: {producto.cantidad}</p>
                </div>
                <p className="font-semibold text-burgundy-900">
                  ₡{Number(producto.subtotal).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="space-y-2 pt-3 border-t-2 border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₡{Number(carrito?.subtotal || 0).toLocaleString()}</span>
            </div>
            
            {carrito?.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento:</span>
                <span className="font-medium text-green-600">
                  -₡{Number(carrito.descuento).toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (13%):</span>
              <span className="font-medium">
                ₡{(Number(carrito?.subtotal || 0) * 0.13).toFixed(0)}
              </span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-lg text-burgundy-900">Total:</span>
              <span className="font-bold text-xl text-burgundy-900">
                ₡{Number(carrito?.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Selector de método de pago */}
        <div className="bg-white rounded-lg p-4 shadow">
          <h3 className="font-bold text-burgundy-900 mb-3">Método de Pago</h3>
          
          <div className="space-y-3 mb-4">
            {/* Tarjeta de crédito/débito - NUEVO */}
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
              metodoPago === 'tarjeta' ? 'border-burgundy-500 bg-burgundy-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoPago"
                value="tarjeta"
                checked={metodoPago === 'tarjeta'}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">Tarjeta de crédito/débito</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, AmEx</p>
              </div>
              <CreditCard className="w-6 h-6 text-burgundy-600" />
            </label>

            {/* PayPal */}
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
              metodoPago === 'paypal' ? 'border-burgundy-500 bg-burgundy-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoPago"
                value="paypal"
                checked={metodoPago === 'paypal'}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">PayPal / Tarjeta</p>
                <p className="text-sm text-gray-600">Pago internacional</p>
              </div>
            </label>

            {/* SINPE Móvil */}
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
              metodoPago === 'sinpe' ? 'border-burgundy-500 bg-burgundy-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoPago"
                value="sinpe"
                checked={metodoPago === 'sinpe'}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">SINPE Móvil 🇨🇷</p>
                <p className="text-sm text-gray-600">Transferencia simulada</p>
              </div>
            </label>

            {/* Efectivo */}
            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
              metodoPago === 'efectivo' ? 'border-burgundy-500 bg-burgundy-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoPago"
                value="efectivo"
                checked={metodoPago === 'efectivo'}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className="font-medium">Efectivo</p>
                <p className="text-sm text-gray-600">Pagar al recoger</p>
              </div>
              <Banknote className="w-6 h-6 text-green-600" />
            </label>
          </div>

          {/* Renderizar según método */}
          <div className="mt-4">
            {/* NUEVO: Formulario de Tarjeta */}
            {metodoPago === 'tarjeta' && (
              <TarjetaForm
                monto={carrito?.total || 0}
                pedidoId={carrito?.id}
                onPagoExitoso={handleTarjetaSuccess}
                onPagoError={handleTarjetaError}
              />
            )}

            {metodoPago === 'paypal' && (
              <PayPalButton
                total={carrito?.total || 0}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
              />
            )}

            {metodoPago === 'sinpe' && !mostrarSinpeSimulador && (
              <button
                onClick={() => setMostrarSinpeSimulador(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-full transition flex items-center justify-center gap-2"
              >
                <span>Pagar con SINPE Móvil</span>
                <span className="text-2xl">🇨🇷</span>
              </button>
            )}

            {metodoPago === 'sinpe' && mostrarSinpeSimulador && (
              <SinpeSimulador
                total={carrito?.total || 0}
                telefonoDestino={SINPE_RESTAURANTE}
                onSuccess={handleSinpeSuccess}
                onCancel={() => setMostrarSinpeSimulador(false)}
              />
            )}

            {metodoPago === 'efectivo' && (
              <button
                onClick={handleConfirmarEfectivo}
                disabled={procesando}
                className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition disabled:opacity-50"
              >
                {procesando ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            )}
          </div>
        </div>

        {/* Tiempo estimado */}
        {carrito?.tiempoEstimado && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-full">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-700 font-semibold">TIEMPO ESTIMADO</p>
                <p className="text-lg font-bold text-green-900">
                  {carrito.tiempoEstimado} minutos
                </p>
                <p className="text-xs text-gray-600">Tu pedido estará listo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutScreen;