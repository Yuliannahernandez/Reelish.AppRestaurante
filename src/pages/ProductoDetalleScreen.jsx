import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Star, ShoppingCart, ChevronDown, Minus, Plus, Home as HomeIcon, ClipboardList, Award, User } from 'lucide-react';
import { productosService } from '../services/productosService';
import { carritoService } from '../services/carritoService';
import { favoritosService } from '../services/favoritosService'; 

const ProductoDetalleScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showIngredientes, setShowIngredientes] = useState(false);
  const [showNutricional, setShowNutricional] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [cargandoFavorito, setCargandoFavorito] = useState(false);
  const [activeTab, setActiveTab] = useState(''); // Sin tab activa por defecto en detalle

  useEffect(() => {
    loadProducto();
    verificarSiEsFavorito();
  }, [id]);

  const loadProducto = async () => {
    try {
      const data = await productosService.getProductoDetalle(id);
      setProducto(data);
    } catch (error) {
      console.error('Error loading producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarSiEsFavorito = async () => {
    try {
      const data = await favoritosService.esFavorito(id);
      setIsFavorite(data.esFavorito);
    } catch (error) {
      console.error('Error verificando favorito:', error);
    }
  };

  const handleFavorite = async () => {
    setCargandoFavorito(true);
    try {
      const data = await favoritosService.toggleFavorito(id);
      setIsFavorite(data.esFavorito);
      
      if (data.esFavorito) {
        alert('Agregado a favoritos');
      } else {
        alert('Eliminado de favoritos');
      }
    } catch (error) {
      console.error('Error en favorito:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setCargandoFavorito(false);
    }
  };

  const handleAddToCart = async () => {
    setAgregando(true);
    try {
      console.log('');
      console.log('producto.id:', producto.id, 'tipo:', typeof producto.id);
      console.log('cantidad:', cantidad, 'tipo:', typeof cantidad);
      console.log('');
      
      await carritoService.agregarProducto(producto.id, cantidad);
      alert(`${cantidad} ${producto.nombre} agregado(s) al carrito`);
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.message && Array.isArray(error.response.data.message)) {
        console.error('Mensajes de validación:');
        error.response.data.message.forEach((msg, i) => {
          console.error(`  ${i + 1}. ${msg}`);
        });
        
        alert(`Error:\n${error.response.data.message.join('\n')}`);
      } else {
        alert(`Error: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setAgregando(false);
    }
  };

  const incrementar = () => {
    setCantidad(cantidad + 1);
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Producto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header con imagen de fondo decorativo */}
      <div 
        className="relative h-72 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://i.imgur.com/4TmkdJd.png')",
          borderBottomLeftRadius: '50%',
          borderBottomRightRadius: '50%'
        }}
      >
        <div 
          className="absolute inset-0 bg-black/40"
          style={{
            borderBottomLeftRadius: '50%',
            borderBottomRightRadius: '50%'
          }}
        ></div>

        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={handleFavorite}
            disabled={cargandoFavorito}
            className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full flex items-center gap-2 hover:bg-black/40 transition disabled:opacity-50"
          >
            <Heart 
              className={`w-5 h-5 transition-all ${
                isFavorite 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-white'
              }`}
            />
            <span className="text-white text-sm font-medium">
              {cargandoFavorito ? 'Cargando...' : 'Favoritos'}
            </span>
          </button>
        </div>
      </div>

      <div className="flex justify-center -mt-32 mb-6 px-6 relative z-20">
        <div className="w-64 h-64 rounded-full bg-white shadow-2xl p-3 flex items-center justify-center">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img
              src={producto.imagenPrincipal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Contenido del producto */}
      <div className="px-6">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-burgundy-900 mb-3">
            {producto.nombre.toUpperCase()}
          </h1>
          
          <div className="flex justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className={`w-5 h-5 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>

          <div className="text-2xl font-bold text-yellow-600">
            ₡{producto.precio?.toLocaleString()}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-burgundy-900 mb-2">SOBRE</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {producto.descripcion || 'Delicioso platillo preparado con ingredientes frescos y de la más alta calidad.'}
          </p>
        </div>

        <div className="mb-4">
          <button
            onClick={() => setShowIngredientes(!showIngredientes)}
            className="w-full flex items-center justify-between py-3 border-b border-gray-200"
          >
            <h2 className="text-lg font-bold text-burgundy-900">INGREDIENTES</h2>
            <ChevronDown
              className={`w-5 h-5 text-burgundy-900 transition-transform ${
                showIngredientes ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showIngredientes && (
            <div className="py-4 space-y-2">
              {producto.ingredientes?.length > 0 ? (
                producto.ingredientes.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-burgundy-900 rounded-full"></span>
                    <span className="text-sm text-gray-700">
                      {typeof ing === 'string' ? ing : ing.nombre}
                      {ing.cantidad && ` (${ing.cantidad})`}
                      {ing.esAlergeno && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">
                          ⚠️ Alérgeno
                        </span>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No hay ingredientes registrados</p>
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowNutricional(!showNutricional)}
            className="w-full flex items-center justify-between py-3 border-b border-gray-200"
          >
            <h2 className="text-lg font-bold text-burgundy-900">
              INFORMACIÓN NUTRICIONAL
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-burgundy-900 transition-transform ${
                showNutricional ? 'rotate-180' : ''
              }`}
            />
          </button>
          {showNutricional && (
            <div className="py-4">
              {producto.informacionNutricional ? (
                <div className="grid grid-cols-2 gap-3">
                  {producto.informacionNutricional.calorias && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Calorías</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.calorias} kcal
                      </p>
                    </div>
                  )}
                  {producto.informacionNutricional.proteinas && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Proteínas</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.proteinas}g
                      </p>
                    </div>
                  )}
                  {producto.informacionNutricional.carbohidratos && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Carbohidratos</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.carbohidratos}g
                      </p>
                    </div>
                  )}
                  {producto.informacionNutricional.grasas && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Grasas</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.grasas}g
                      </p>
                    </div>
                  )}
                  {producto.informacionNutricional.fibra && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Fibra</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.fibra}g
                      </p>
                    </div>
                  )}
                  {producto.informacionNutricional.sodio && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Sodio</p>
                      <p className="text-lg font-bold text-burgundy-900">
                        {producto.informacionNutricional.sodio}mg
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No hay información nutricional disponible
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para agregar al carrito - Ahora con más espacio */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
            <button 
              onClick={decrementar} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition"
              disabled={cantidad <= 1}
            >
              <Minus className={`w-4 h-4 ${cantidad <= 1 ? 'text-gray-400' : 'text-burgundy-900'}`} />
            </button>
            <span className="w-8 text-center font-bold text-burgundy-900">{cantidad}</span>
            <button 
              onClick={incrementar} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded transition"
            >
              <Plus className="w-4 h-4 text-burgundy-900" />
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={agregando}
            className="flex-1 bg-burgundy-800 hover:bg-burgundy-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
            {agregando ? 'Agregando...' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-50">
        <div className="flex justify-around items-center max-w-md mx-auto px-4 py-3">
          <button
            onClick={() => {
              setActiveTab('home');
              navigate('/home');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'home' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <HomeIcon className={`w-5 h-5 ${activeTab === 'home' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'home' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}
            >
              Inicio
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favoritos');
              navigate('/favoritos');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'favoritos' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'favoritos'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  activeTab === 'favoritos' ? 'text-white fill-white' : 'text-gray-600'
                }`}
              />
            </div>
            <span
              className={`text-[10px] ${
                activeTab === 'favoritos' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
              }`}
            >
              Favoritos
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('carrito');
              navigate('/carrito');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'carrito' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'carrito'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <ShoppingCart
                className={`w-5 h-5 ${activeTab === 'carrito' ? 'text-white' : 'text-gray-600'}`}
              />
            </div>
            <span
              className={`text-[10px] ${
                activeTab === 'carrito' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
              }`}
            >
              Carrito
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('pedidos');
              navigate('/mis-pedidos');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'pedidos' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'pedidos'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <ClipboardList
                className={`w-5 h-5 ${activeTab === 'pedidos' ? 'text-white' : 'text-gray-600'}`}
              />
            </div>
            <span
              className={`text-[10px] ${
                activeTab === 'pedidos' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
              }`}
            >
              Pedidos
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('lealtad');
              navigate('/puntos-lealtad');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'lealtad' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'lealtad'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <Award className={`w-5 h-5 ${activeTab === 'lealtad' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span
              className={`text-[10px] ${
                activeTab === 'lealtad' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
              }`}
            >
              Lealtad
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('perfil');
              navigate('/profile');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              activeTab === 'perfil' ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${
                activeTab === 'perfil'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
              }`}
            >
              <User className={`w-5 h-5 ${activeTab === 'perfil' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span
              className={`text-[10px] ${
                activeTab === 'perfil' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
              }`}
            >
              Perfil
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalleScreen;