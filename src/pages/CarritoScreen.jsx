import { useState, useEffect } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import { carritoService } from '../services/carritoService';
import { cuponesService } from '../services/cuponesService';
import { tipoCambioService } from '../services/tipoCambioService';
import { ArrowLeft, Trash2, Plus, Minus, MapPin, CreditCard, Tag, AlertCircle, Store, Banknote, Gift, X,DollarSign } from 'lucide-react';

const CarritoScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [carrito, setCarrito] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [metodoPago, setMetodoPago] = useState(null);
  const [error, setError] = useState('');
  const [mostrarModalCupon, setMostrarModalCupon] = useState(false);
  const [codigoCupon, setCodigoCupon] = useState('');
  const [aplicandoCupon, setAplicandoCupon] = useState(false);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [tipoCambio, setTipoCambio] = useState(null);
  const [mostrarEnDolares, setMostrarEnDolares] = useState(false);
  useEffect(() => {
    loadCarrito();
    loadTipoCambio(); 

    const metodoGuardado = localStorage.getItem('metodoPagoSeleccionado');
    if (metodoGuardado) {
      setMetodoPago(JSON.parse(metodoGuardado));
    }
  }, []);

  const loadCarrito = async () => {
    try {
      console.log('Cargando carrito...');
      const data = await carritoService.getCarrito();
      console.log('Datos del carrito:', data);
      
      setCarrito(data);
      
      // Cargar información de la sucursal si existe
      if (data?.sucursal) {
        console.log('Sucursal encontrada en carrito:', data.sucursal);
        setSucursal(data.sucursal);
      } else if (data?.sucursal_id) {
        console.log('Cargando sucursal por ID:', data.sucursal_id);
        try {
          const sucursalData = await sucursalesService.getSucursal(data.sucursal_id);
          console.log('Sucursal cargada:', sucursalData);
          setSucursal(sucursalData);
        } catch (error) {
          console.error('Error cargando sucursal:', error);
        }
      } else {
        console.log('No hay sucursal seleccionada');
        setSucursal(null);
      }
      
      // Cargar cupón si existe
      if (data.cuponAplicado) {
        setCuponAplicado(data.cuponAplicado);
      }
    } catch (error) {
      console.error('Error loading carrito:', error);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

   // FUNCIÓN PARA CARGAR TIPO DE CAMBIO
  const loadTipoCambio = async () => {
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
    }
  };

    // FUNCIÓN PARA CONVERTIR A DÓLARES
  const convertirADolares = (montoCRC) => {
    if (!tipoCambio) return 0;
    return montoCRC / tipoCambio.venta;
  };

  // FUNCIÓN PARA FORMATEAR PRECIO
  const formatearPrecio = (monto) => {
    if (!mostrarEnDolares) {
      return `₡${Number(monto || 0).toLocaleString()}`;
    }
    const enDolares = convertirADolares(monto);
    return `$${enDolares.toFixed(2)}`;
  };

  const handleDecrementar = async (detalleId, cantidadActual) => {
    if (cantidadActual <= 1) return;
    setProcesando(true);
    try {
      const data = await carritoService.actualizarCantidad(detalleId, cantidadActual - 1);
      setCarrito(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcesando(false);
    }
  };

  const handleEliminar = async (detalleId) => {
    if (!confirm('¿Eliminar este producto del carrito?')) return;
    setProcesando(true);
    try {
      const data = await carritoService.eliminarProducto(detalleId);
      setCarrito(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcesando(false);
    }
  };

    const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) {
      alert('Ingresa un código de cupón');
      return;
    }

    console.log(' Aplicando cupón:', codigoCupon);

    setAplicandoCupon(true);
    try {
      const resultado = await cuponesService.aplicarCupon(codigoCupon.trim());
      console.log(' Cupón aplicado:', resultado);
      
      setCuponAplicado(resultado.cupon);
      setMostrarModalCupon(false);
      setCodigoCupon('');
      await loadCarrito(); // Recargar carrito con descuento aplicado
      alert(`¡Cupón aplicado exitosamente! Descuento: ₡${Number(resultado.cupon.descuento).toLocaleString()}`);
    } catch (error) {
      console.error(' Error aplicando cupón:', error);
      console.error(' Detalles:', error.response?.data);
      const mensaje = error.response?.data?.message || 'Cupón inválido o expirado';
      alert(mensaje);
    } finally {
      setAplicandoCupon(false);
    }
  };
  const handleRemoverCupon = async () => {
    if (!confirm('¿Deseas remover el cupón aplicado?')) return;
    
    setProcesando(true);
    try {
      await cuponesService.removerCupon();
      setCuponAplicado(null);
      await loadCarrito();
      alert('Cupón removido');
    } catch (error) {
      console.error('Error removiendo cupón:', error);
    } finally {
      setProcesando(false);
    }
  };

  const handlePagar = () => {
    if (!carrito || carrito.productos.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    if (!carrito.sucursal) {
      alert('Por favor selecciona una sucursal para recoger tu pedido');
      return;
    }

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-white pb-32">
    {/* Header */}
    <div className="bg-burgundy-600 text-white py-4 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between"> {/* ← CAMBIAR de gap-3 a justify-between */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-italic">MI PEDIDO</h1>
        </div>
        
        {/* ← BOTÓN PARA CAMBIAR MONEDA - AHORA DENTRO DEL HEADER */}
        {tipoCambio && (
          <button
            onClick={() => setMostrarEnDolares(!mostrarEnDolares)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition"
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">
              {mostrarEnDolares ? 'USD' : 'CRC'}
            </span>
          </button>
        )}
      </div>
    </div>

    {/* ← BANNER DE TIPO DE CAMBIO */}
    {tipoCambio && (
      <div className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Tipo de cambio:</span>
            <span className="font-bold text-green-900">₡{tipoCambio.venta.toFixed(2)}</span>
          </div>
          <span className="text-xs text-gray-600">
            {tipoCambio.fuente === 'BCCR' ? 'BCCR' : 'Caché'} • {tipoCambio.fecha}
          </span>
        </div>
      </div>
    )}

    {error && (
      <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-red-700 text-sm">{error}</p>
      </div>
    )}

      <div className="px-6 py-6">
        {/* Sucursal seleccionada */}
        <div className="mb-4 p-4 bg-gradient-to-r from-burgundy-50 to-burgundy-100 border-2 border-burgundy-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-burgundy-600 p-2 rounded-full">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700 font-semibold mb-1">
                  RECOGER EN SUCURSAL
                </p>
                <p className="text-sm font-bold text-burgundy-900 truncate">
                  {carrito?.sucursal ? carrito.sucursal.nombre : 'Seleccionar sucursal'}
                </p>
                {carrito?.sucursal && (
                  <>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {carrito.sucursal.direccion}
                    </p>
                    <p className="text-xs text-burgundy-600 font-medium">
                      {carrito.sucursal.provincia}
                    </p>
                  </>
                )}
                {!carrito?.sucursal && (
                  <p className="text-xs text-red-600 font-medium mt-1">
                     Debes seleccionar una sucursal
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/seleccionar-sucursal')}
              className="text-burgundy-900 text-2xl flex-shrink-0 ml-2 hover:text-burgundy-700 transition font-bold"
            >
              ›
            </button>
          </div>
        </div>

       
        {/* Cupón de Descuento */}
        <div className="mb-6">
          {cuponAplicado ? (
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Gift className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-700 font-semibold">CUPÓN APLICADO</p>
                    <p className="text-sm font-bold text-green-900">{cuponAplicado.codigo}</p>
                    <p className="text-xs text-gray-600">
                      Descuento: ₡{Number(carrito?.descuento || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoverCupon}
                  className="p-2 hover:bg-red-100 rounded-full transition"
                  disabled={procesando}
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setMostrarModalCupon(true)}
              className="w-full p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:border-burgundy-300 transition"
            >
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-burgundy-900" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">PROMOS</p>
                  <p className="text-sm font-medium text-burgundy-900">Aplicar código promo</p>
                </div>
              </div>
              <span className="text-burgundy-900 text-xl">›</span>
            </button>
          )}
        </div>

        {/* Tiempo Estimado */}
        {carrito && carrito.productos && carrito.productos.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-700 font-semibold">
                    TIEMPO ESTIMADO
                  </p>
                  <p className="text-lg font-bold text-green-900">
                    {carrito.tiempoEstimado} minutos
                  </p>
                  <p className="text-xs text-gray-600">
                    Listo para recoger en tienda
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-burgundy-900">PRODUCTO</h2>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-burgundy-900">DESCRIPCIÓN</span>
              <span className="text-sm font-bold text-burgundy-900 w-16 text-right">PRECIO</span>
            </div>
          </div>

          {carrito && carrito.productos && carrito.productos.length > 0 ? (
            <div className="space-y-3">
              {carrito.productos.map((producto) => (
                <div
                  key={producto.id}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <img
                    src={producto.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                    alt={producto.nombre}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-burgundy-900 text-sm mb-1 truncate">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Cantidad: {producto.cantidad}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrementar(producto.id, producto.cantidad)}
                        disabled={procesando || producto.cantidad <= 1}
                        className="w-6 h-6 flex items-center justify-center border border-burgundy-900 rounded-full hover:bg-burgundy-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3 text-burgundy-900" />
                      </button>
                      <span className="text-burgundy-900 font-bold text-sm min-w-[20px] text-center">
                        {producto.cantidad}
                      </span>
                      <button
                        onClick={() => handleIncrementar(producto.id, producto.cantidad)}
                        disabled={procesando}
                        className="w-6 h-6 flex items-center justify-center border border-burgundy-900 rounded-full hover:bg-burgundy-100 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3 h-3 text-burgundy-900" />
                      </button>
                      <button
                        onClick={() => handleEliminar(producto.id)}
                        disabled={procesando}
                        className="ml-2 text-red-500 hover:text-red-700 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-burgundy-900 font-bold text-sm">
                      {formatearPrecio(producto.subtotal)} {/* ← Usar función */}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay productos en el carrito</p>
              <button
                onClick={() => navigate('/home')}
                className="text-burgundy-900 font-semibold hover:underline"
              >
                Ir a comprar
              </button>
            </div>
          )}
        </div>

        {/* Resumen de totales */}
        {carrito && carrito.productos && carrito.productos.length > 0 && (
          <div className="space-y-2 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({carrito.productos.length} productos)</span>
              <span className="font-semibold">{formatearPrecio(carrito.subtotal)}</span>
            </div>
            {carrito.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descuento (Cupón)</span>
                <span className="font-semibold text-green-600">-{formatearPrecio(carrito.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IVA (13%)</span>
              <span className="font-semibold">{formatearPrecio(Number(carrito.subtotal || 0) * 0.13)}</span>
            </div>
            <div className="pt-2 border-t-2 border-burgundy-200 flex justify-between mt-3">
              <span className="font-bold text-burgundy-900 text-lg">Total</span>
              <span className="font-bold text-burgundy-900 text-xl">
                 {formatearPrecio(carrito.total)}
              </span>
            </div>
            {/* ← MOSTRAR CONVERSIÓN SI ESTÁ EN DÓLARES */}
            {mostrarEnDolares && tipoCambio && (
              <div className="pt-2 text-xs text-gray-500 text-right">
                Aprox. ₡{Number(carrito.total || 0).toLocaleString()} CRC
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cupón */}
      {mostrarModalCupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-burgundy-900">Aplicar Cupón</h2>
              <button
                onClick={() => setMostrarModalCupon(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de cupón
              </label>
              <input
                type="text"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                placeholder="Ej: DESCUENTO20"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 outline-none"
              />
            </div>

            <button
              onClick={handleAplicarCupon}
              disabled={aplicandoCupon || !codigoCupon.trim()}
              className="w-full bg-burgundy-600 hover:bg-burgundy-800 text-white font-bold py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aplicandoCupon ? 'Aplicando...' : 'Aplicar Cupón'}
            </button>
          </div>
        </div>
      )}

      {/* Botón de pagar fijo */}
      {carrito && carrito.productos && carrito.productos.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
          <button
            onClick={handlePagar}
            disabled={procesando || !carrito.sucursal}
            className="w-full bg-burgundy-600 hover:bg-burgundy-800 text-white font-bold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {procesando ? 'Procesando...' : !carrito.sucursal ? 'Selecciona una sucursal primero' : 'Confirmar pedido'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CarritoScreen;