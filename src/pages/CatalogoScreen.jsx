import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search, Home as HomeIcon, ShoppingCart, Heart, User, Grid, List, SlidersHorizontal } from 'lucide-react';
import { productosService } from '../services/productosService';

const CatalogoScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoriaId = searchParams.get('categoria');

  const [productos, setProductos] = useState([]);
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [ordenar, setOrdenar] = useState('destacados');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    loadProductos();
  }, [categoriaId, ordenar]);

  const loadProductos = async () => {
    try {
      setLoading(true);
      // Obtener productos por categoría
      let prods = await productosService.getProductosPorCategoria(categoriaId);

      // Obtener info de la categoría
      const cats = await productosService.getCategorias();
      const cat = cats.find(c => c.id === categoriaId);
      setCategoria(cat);

      // Aplicar ordenamiento
      if (ordenar === 'precio-asc') {
        prods = prods.sort((a, b) => a.precio - b.precio);
      } else if (ordenar === 'precio-desc') {
        prods = prods.sort((a, b) => b.precio - a.precio);
      } else if (ordenar === 'nombre') {
        prods = prods.sort((a, b) => a.nombre.localeCompare(b.nombre));
      }

      setProductos(prods);
    } catch (error) {
      console.error('Error loading productos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-burgundy-900 px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white flex-1 text-center">
            {categoria?.nombre.toUpperCase() || 'CATÁLOGO'}
          </h1>
          <button
            onClick={() => navigate('/buscar')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Controles de vista y filtros */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setVistaGrid(true)}
              className={`p-2 rounded-full transition ${vistaGrid ? 'bg-white text-burgundy-900' : 'text-white'
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVistaGrid(false)}
              className={`p-2 rounded-full transition ${!vistaGrid ? 'bg-white text-burgundy-900' : 'text-white'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Ordenar</span>
          </button>
        </div>

        {/* Panel de ordenamiento */}
        {mostrarFiltros && (
          <div className="mt-4 bg-white rounded-xl p-4 space-y-2">
            <button
              onClick={() => {
                setOrdenar('destacados');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${ordenar === 'destacados' ? 'bg-burgundy-100 text-burgundy-900 font-semibold' : 'text-gray-700'
                }`}
            >
              Destacados
            </button>
            <button
              onClick={() => {
                setOrdenar('precio-asc');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${ordenar === 'precio-asc' ? 'bg-burgundy-100 text-burgundy-900 font-semibold' : 'text-gray-700'
                }`}
            >
              Precio: Menor a Mayor
            </button>
            <button
              onClick={() => {
                setOrdenar('precio-desc');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${ordenar === 'precio-desc' ? 'bg-burgundy-100 text-burgundy-900 font-semibold' : 'text-gray-700'
                }`}
            >
              Precio: Mayor a Menor
            </button>
            <button
              onClick={() => {
                setOrdenar('nombre');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition ${ordenar === 'nombre' ? 'bg-burgundy-100 text-burgundy-900 font-semibold' : 'text-gray-700'
                }`}
            >
              Nombre A-Z
            </button>
          </div>
        )}
      </div>

      {/* Imagen de la categoría */}
      {categoria?.icono && (
        <div className="relative w-full h-48">
          <img
            src={categoria.icono}
            alt={categoria.nombre}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/800x300?text=Categoría')}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-white text-2xl font-bold drop-shadow-md">{categoria.nombre}</h2>
          </div>
        </div>
      )}

      {/* Contador de productos */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-burgundy-900">{productos.length}</span> productos encontrados
        </p>
      </div>

      {/* Lista de productos */}
      <div className="px-6 py-4">
        {productos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No hay productos en esta categoría</p>
            <button
              onClick={() => navigate('/')}
              className="text-burgundy-900 font-semibold hover:underline"
            >
              Volver al inicio
            </button>
          </div>
        ) : vistaGrid ? (
          
          <div className="grid grid-cols-2 gap-4">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <div className="relative">
                  <img
                    src={producto.imagenPrincipal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
                    alt={producto.nombre}
                    className="w-full h-40 object-cover"
                  />
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Agregar a favoritos
                    }}
                  >
                    <Heart className="w-4 h-4 text-burgundy-900" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-burgundy-900 text-sm mb-1 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-gold font-bold text-lg">
                    ₡{producto.precio?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista en Lista
          <div className="space-y-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition flex items-center gap-4"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <img
                  src={producto.imagenPrincipal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}
                  alt={producto.nombre}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-burgundy-900 mb-1">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {producto.descripcion || 'Delicioso platillo'}
                  </p>
                  <p className="text-gold font-bold text-lg">
                    ₡{producto.precio?.toLocaleString()}
                  </p>
                </div>
                <button
                  className="w-10 h-10 border-2 border-burgundy-900 rounded-full flex items-center justify-center hover:bg-burgundy-900 hover:text-white transition flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Agregar al carrito
                  }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-8 shadow-lg z-20">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1"
          >
            <HomeIcon className="w-6 h-6 text-burgundy-700" />
            <span className="text-xs text-burgundy-700">Inicio</span>
          </button>

          <button
            onClick={() => navigate('/carrito')}
            className="flex flex-col items-center gap-1"
          >
            <ShoppingCart className="w-6 h-6 text-burgundy-700" />
            <span className="text-xs text-burgundy-700">Carrito</span>
          </button>

          <button
            onClick={() => navigate('/favoritos')}
            className="flex flex-col items-center gap-1"
          >
            <Heart className="w-6 h-6 text-burgundy-700" />
            <span className="text-xs text-burgundy-700">Favoritos</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1"
          >
            <User className="w-6 h-6 text-burgundy-700" />
            <span className="text-xs text-burgundy-700">Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatalogoScreen;