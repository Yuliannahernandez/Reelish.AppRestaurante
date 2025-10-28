import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidoService } from '../services/pedidoService'; 
import { carritoService } from '../services/carritoService';
import { ArrowLeft, Check, Store, CreditCard, Banknote } from 'lucide-react';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [metodoPago, setMetodoPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Cargando datos de checkout...');
      
      // Cargar carrito
      const carritoData = await carritoService.getCarrito();
      console.log(' Carrito cargado:', carritoData);
      setCarrito(carritoData);

      // Cargar método de pago del localStorage
      const metodoGuardado = localStorage.getItem('metodoPagoSeleccionado');
      if (metodoGuardado) {
        const metodo = JSON.parse(metodoGuardado);
        console.log(' Método de pago cargado:', metodo);
        setMetodoPago(metodo);
      }

      // Validaciones
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
      console.error(' Error al cargar datos:', error);
      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente.');
        navigate('/login');
      } else {
        alert('Error al cargar los datos');
        navigate('/carrito');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarPedido = async () => {
  if (!confirm('¿Confirmar pedido?')) return;
  
  setProcesando(true);
  try {
    const resultado = await pedidoService.crearPedido();
    
    alert('¡Pedido confirmado exitosamente!');
    
    // Limpiar localStorage
    localStorage.removeItem('metodoPagoSeleccionado');
    
    // Redirigir al seguimiento
    navigate(`/pedido/${resultado.id}`);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al confirmar el pedido');
  } finally {
    setProcesando(false);
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
                <p className="text-sm text-burgundy-600 font-medium">{carrito.sucursal.provincia}</p>
              </div>
            </div>
          </div>
        )}

        {/* Método de pago */}
        {metodoPago && (
          <div className="bg-white rounded-lg p-4 shadow border-l-4 border-green-600">
            <div className="flex items-start gap-3">
              {metodoPago.tipo === 'efectivo' ? (
                <div className="bg-green-100 p-2 rounded-full">
                  <Banknote className="w-5 h-5 text-green-600" />
                </div>
              ) : (
                <div className="bg-green-100 p-2 rounded-full">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-burgundy-900 mb-1">Método de pago:</h3>
                <p className="font-semibold">
                  {metodoPago.tipo === 'efectivo'
                    ? 'Efectivo'
                    : `${metodoPago.marca?.toUpperCase()} ••${metodoPago.ultimosDigitos}`}
                </p>
                {metodoPago.alias && (
                  <p className="text-sm text-gray-600">{metodoPago.alias}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
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

      {/* Botón confirmar fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={handleConfirmarPedido}
          disabled={procesando}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {procesando ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutScreen;