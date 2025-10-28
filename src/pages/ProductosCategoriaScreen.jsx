import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Star, Clock, ShoppingCart } from 'lucide-react';
import { Flame } from 'lucide-react';
import { categoriasService } from '../services/categoriasService';
import { carritoService } from '../services/carritoService';

const ProductosCategoriaScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agregando, setAgregando] = useState(null);

  useEffect(() => {
    loadProductos();
  }, [id]);

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

  const handleAgregarCarrito = async (productoId) => {
    setAgregando(productoId);
    try {
      await carritoService.agregarProducto(productoId, 1);
      // Mostrar feedback visual
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
     
     {/* Header con imagen de categoría */}
<div className="relative h-48 w-full overflow-hidden">
  <img
    src={data.categoria.icono || '/fallback.jpg'}
    alt={data.categoria.nombre}
    className="w-full h-full object-cover"
    onError={(e) => (e.target.src = 'https://via.placeholder.com/800x300?text=Categoría')}
  />
  
  {/* Degradado burdeos para contraste */}
  <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/90 via-burgundy-800/60 to-transparent" />

  {/* Botón de volver */}
  <div className="absolute top-4 left-4 z-10">
    <button
      onClick={() => navigate('/categorias')}
      className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/30 transition"
    >
      <ArrowLeft className="w-6 h-6 text-white" />
    </button>
  </div>

  {/* Texto sobre la imagen */}
  <div className="absolute bottom-6 left-6 right-6 z-10">
    <h1 className="text-3xl font-bold text-white drop-shadow-md mb-1">
      {data.categoria.nombre}
    </h1>
    <p className="text-white/90">
      {data.productos.length} productos disponibles
    </p>
  </div>
</div>


      {/* Lista de productos */}
      <div className="px-6 py-6">
        {data.productos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Imagen */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={producto.imagen || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                  {producto.esNuevo && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Nuevo
                    </div>
                  )}
                  {producto.enTendencia && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      Tendencia
                    </div>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="font-bold text-burgundy-900 text-lg mb-2">
                    {producto.nombre}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {producto.descripcion}
                  </p>

                  <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{producto.tiempoPreparacion || 15} min</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-burgundy-900">
                        ₡{Number(producto.precio).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAgregarCarrito(producto.id)}
                      disabled={agregando === producto.id}
                      className="bg-burgundy-600 hover:bg-burgundy-700 text-white p-3 rounded-full transition disabled:opacity-50 shadow-lg"
                    >
                      {agregando === producto.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante del carrito */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate('/carrito')}
          className="bg-burgundy-600 hover:bg-burgundy-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ProductosCategoriaScreen;