
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Trash2, ShoppingCart, Sparkles } from 'lucide-react';
import { favoritosService } from '../services/favoritosService';
import { carritoService } from '../services/carritoService';

const FavoritosScreen = () => {
  const navigate = useNavigate();
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      const data = await favoritosService.getMisFavoritos();
      setFavoritos(data.favoritos || []);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarFavorito = async (productoId) => {
    if (!window.confirm('¿Eliminar de favoritos?')) return;

    setEliminando(productoId);
    try {
      await favoritosService.toggleFavorito(productoId);
      setFavoritos(favoritos.filter(fav => fav.producto.id !== productoId));
    } catch (error) {
      console.error('Error eliminando favorito:', error);
      alert('Error al eliminar favorito');
    } finally {
      setEliminando(null);
    }
  };

  const handleAgregarAlCarrito = async (producto) => {
    try {
      await carritoService.agregarProducto(producto.id, 1);
      alert(` ${producto.nombre} agregado al carrito`);
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      alert('Error al agregar al carrito');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando favoritos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-800 to-burgundy-900 px-6 pt-12 pb-6 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              
              Mis Favoritos
            </h1>
            <p className="text-gold text-sm mt-1 font-italic">
              {favoritos.length} {favoritos.length === 1 ? 'producto favorito' : 'productos favoritos'}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="px-6 py-6">
        {favoritos.length === 0 ? (
          // Estado vacío
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-burgundy-900 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-xs">
              Explora nuestro menú y guarda tus platillos favoritos aquí
            </p>
            <button
              onClick={() => navigate('/home')}
              className="bg-burgundy-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-burgundy-900 transition-all"
            >
              Ver Menú
            </button>
          </div>
        ) : (
          // Lista de favoritos
          <div className="space-y-4">
            {favoritos.map((favorito) => (
              <div
                key={favorito.producto.id}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gold hover:shadow-lg transition-all"
              >
                <div className="flex gap-4 p-4">
                  {/* Imagen del producto */}
                  <div
                    onClick={() => navigate(`/producto/${favorito.producto.id}`)}
                    className="flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={favorito.producto.imagenPrincipal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
                      alt={favorito.producto.nombre}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <div 
                      onClick={() => navigate(`/producto/${favorito.producto.id}`)}
                      className="cursor-pointer"
                    >
                      <h3 className="font-bold text-burgundy-900 mb-1 line-clamp-2">
                        {favorito.producto.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {favorito.producto.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-gold">
                          ₡{favorito.producto.precio?.toLocaleString()}
                        </span>
                        {favorito.producto.esNuevo && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            NUEVO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAgregarAlCarrito(favorito.producto)}
                        className="flex-1 bg-burgundy-800 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-burgundy-900 transition-all flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Agregar
                      </button>
                      
                      <button
                        onClick={() => handleEliminarFavorito(favorito.producto.id)}
                        disabled={eliminando === favorito.producto.id}
                        className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
                      >
                        {eliminando === favorito.producto.id ? (
                          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer con fecha */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Agregado el {new Date(favorito.fechaAgregado).toLocaleDateString('es-CR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón flotante para agregar todos al carrito */}
      {favoritos.length > 0 && (
        <div className="fixed bottom-20 right-6 z-50">
          <button
            onClick={async () => {
              try {
                for (const fav of favoritos) {
                  await carritoService.agregarProducto(fav.producto.id, 1);
                }
                alert(` ${favoritos.length} productos agregados al carrito`);
                navigate('/carrito');
              } catch (error) {
                console.error('Error:', error);
                alert('Error agregando productos');
              }
            }}
            className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white p-4 rounded-full shadow-2xl hover:shadow-burgundy-500/50 transition-all hover:scale-110 flex items-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="font-semibold pr-1">Agregar todos</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FavoritosScreen;