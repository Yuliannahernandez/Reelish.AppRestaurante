import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, ShoppingCart, Grid, List, SlidersHorizontal, Heart } from 'lucide-react';
import { Flame } from 'lucide-react';
import { categoriasService } from '../services/categoriasService';
import { carritoService } from '../services/carritoService';

const ProductosCategoriaScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(null);
  
  const [vistaGrid, setVistaGrid] = useState(true);
  const [ordenar, setOrdenar] = useState('destacados');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  useEffect(() => {
    loadProductos();
  }, [id]);

  useEffect(() => {
    if (data?.productos) {
      aplicarOrdenamiento();
    }
  }, [ordenar, data]);

  const loadProductos = async () => {
    try {
      const result = await categoriasService.getProductosPorCategoria(id);
      setData(result);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const aplicarOrdenamiento = () => {
    if (!data?.productos) return;

    let prods = [...data.productos];

    if (ordenar === 'precio-asc') {
      prods = prods.sort((a, b) => a.precio - b.precio);
    } else if (ordenar === 'precio-desc') {
      prods = prods.sort((a, b) => b.precio - a.precio);
    } else if (ordenar === 'nombre') {
      prods = prods.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    setProductosFiltrados(prods);
  };

  const handleAgregarCarrito = async (productoId) => {
    setAgregando(productoId);
    try {
      await carritoService.agregarProducto(productoId, 1);
      setTimeout(() => setAgregando(null), 1000);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar al carrito');
      setAgregando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando productos...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se encontró la categoría</p>
          <button
            onClick={() => navigate('/categorias')}
            className="text-burgundy-600 font-semibold hover:underline"
          >
            Volver a categorías
          </button>
        </div>
      </div>
    );
  }

  const productos = productosFiltrados.length > 0 ? productosFiltrados : data.productos;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* Header con imagen de categoría */}
      <div className="relative">
        {/* Imagen de fondo de categoría */}
        <div className="relative h-52 w-full overflow-hidden">
          <img
            src={data.categoria.icono || '/fallback.jpg'}
            alt={data.categoria.nombre}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/800x300?text=Categoría')}
          />

          {/* Degradado oscuro para contraste */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-transparent" />

          {/* Controles superiores */}
          <div className="absolute top-0 left-0 right-0 px-4 pt-8">
            {/* Fila de botones */}
            <div className="flex items-center justify-between">
              {/* Lado izquierdo: Volver + Grid/Lista */}
              <div className="flex items-center gap-2">
                {/* Botón de volver */}
                <button
                  onClick={() => navigate('/categorias')}
                  className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>

                {/* Controles de vista */}
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full p-0.5">
                  <button
                    onClick={() => setVistaGrid(true)}
                    className={`p-2 rounded-full transition-all ${vistaGrid ? 'bg-white text-burgundy-900' : 'text-white/90'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setVistaGrid(false)}
                    className={`p-2 rounded-full transition-all ${!vistaGrid ? 'bg-white text-burgundy-900' : 'text-white/90'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lado derecho: Ordenar */}
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5 text-white hover:bg-white/30 transition"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-xs font-medium">Ordenar</span>
              </button>
            </div>
          </div>

          {/* Título de categoría - Pegado al borde inferior */}
          <div className="absolute bottom-3 left-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">
              {data.categoria.nombre}
            </h1>
          </div>
        </div>

        {/* Panel de ordenamiento */}
        {mostrarFiltros && (
          <div className="absolute top-14 right-4 z-30 bg-white rounded-2xl p-3 shadow-2xl w-56">
            <button
              onClick={() => {
                setOrdenar('destacados');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                ordenar === 'destacados' 
                  ? 'bg-burgundy-600 text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Destacados
            </button>
            <button
              onClick={() => {
                setOrdenar('precio-asc');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                ordenar === 'precio-asc' 
                  ? 'bg-burgundy-600 text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Precio: Menor a Mayor
            </button>
            <button
              onClick={() => {
                setOrdenar('precio-desc');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                ordenar === 'precio-desc' 
                  ? 'bg-burgundy-600 text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Precio: Mayor a Menor
            </button>
            <button
              onClick={() => {
                setOrdenar('nombre');
                setMostrarFiltros(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl transition-all text-sm ${
                ordenar === 'nombre' 
                  ? 'bg-burgundy-600 text-white font-semibold' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Nombre A-Z
            </button>
          </div>
        )}
      </div>

      {/* Contador de productos */}
      <div className="px-4 py-3 bg-white">
        <p className="text-sm text-gray-600">
          <span className="font-bold text-burgundy-900">{productos.length}</span> productos disponibles
        </p>
      </div>

      {/* Lista de productos */}
      <div className="px-4 py-4">
        {productos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
          </div>
        ) : vistaGrid ? (
          // Vista Grid
          <div className="grid grid-cols-1 gap-4">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Imagen */}
                <div className="relative h-52 bg-gray-100">
                  <img
                    src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />

                  <button
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition shadow-md"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Heart className="w-4 h-4 text-burgundy-700" />
                  </button>

                  {producto.esNuevo && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                      Nuevo
                    </div>
                  )}
                  {producto.enTendencia && (
                    <div className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Tendencia
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-base mb-2">
                    {producto.nombre}
                  </h3>

                  <p className="text-2xl font-bold text-gold mb-3">
                    ₡{Number(producto.precio).toLocaleString()}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgregarCarrito(producto.id);
                    }}
                    disabled={agregando === producto.id}
                    className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white py-2.5 rounded-lg transition-all disabled:opacity-50 font-semibold text-sm"
                  >
                    {agregando === producto.id ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista Lista
          <div className="space-y-3">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
              >
                <img
                  src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}
                  alt={producto.nombre}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">
                    {producto.nombre}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {producto.descripcion}
                  </p>
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{producto.tiempoPreparacion || 15} min</span>
                  </div>
                  <p className="text-gold font-bold text-lg">
                    ₡{Number(producto.precio).toLocaleString()}
                  </p>
                </div>
                <button
                  className="w-11 h-11 bg-burgundy-800 hover:bg-burgundy-900 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAgregarCarrito(producto.id);
                  }}
                  disabled={agregando === producto.id}
                >
                  {agregando === producto.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante del carrito */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => navigate('/carrito')}
          className="bg-burgundy-800 hover:bg-burgundy-900 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductosCategoriaScreen;