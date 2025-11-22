import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productosService } from '../services/productosService';
import { categoriasService } from '../services/categoriasService';
import { clienteService } from '../services/clienteService';
import { Search, Home as HomeIcon, ShoppingCart, Heart, User, Plus, Menu, X, TrendingUp, Sparkles, Tag, ClipboardList, Award, Film,Calendar } from 'lucide-react'; // ← Agregar Film

const HomeScreen = () => {
  const navigate = useNavigate();
  const [productoDestacado, setProductoDestacado] = useState(null);
  const [productosTendencia, setProductosTendencia] = useState([]);
  const [productosNuevos, setProductosNuevos] = useState([]);
  const [productosPromocion, setProductosPromocion] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [puntosLealtad, setPuntosLealtad] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    loadData();
    loadPuntosLealtad();
  }, []);

  const loadData = async () => {
    try {
      const [destacado, tendencia, cats] = await Promise.all([
        productosService.getProductoDestacado(),
        productosService.getProductosTendencia(),
        categoriasService.getCategorias(),
      ]);
      setProductoDestacado(destacado);
      setProductosTendencia(tendencia);

      setProductosNuevos(tendencia.slice(0, 4));
      setProductosPromocion(tendencia.slice(0, 3));

      setCategorias(cats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPuntosLealtad = async () => {
    try {
      const perfil = await clienteService.getPerfil();
      console.log(' Perfil recibido:', perfil);

      const puntos = perfil.puntosLealtad || perfil.puntos_lealtad || 0;
      console.log('Puntos:', puntos);

      setPuntosLealtad(puntos);
    } catch (error) {
      console.error('Error loading puntos:', error);
    }
  };

  const handleCategoriaClick = (cat) => {
    setCategoriaSeleccionada(cat.id);
    setMenuAbierto(false);
    navigate(`/categoria/${cat.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-italic text-gold">¡Qué gusto</h1>
            <p className="text-xl font-italic text-gold">tenerte por acá!</p>
          </div>
          
        </div>

        {/* Barra de búsqueda con botón de reservaciones */}
        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              onClick={() => navigate('/buscar')}
              readOnly
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-burgundy-500 cursor-pointer"
            />
          </div>

          {/* Botón de Reservaciones */}
          <button
            onClick={() => navigate('/reservaciones')}
            className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-burgundy-700 to-burgundy-900 rounded-full flex items-center justify-center hover:shadow-lg transition-all hover:scale-105 shadow-md"
            title="Reservar mesa"
            aria-label="Ir a reservaciones"
          >
            <Calendar className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>



      {/* Banner de Películas Minimalista */}
      <div className="px-6 mb-6">
        <div
          onClick={() => navigate('/recomendaciones')}
          className="relative bg-burgundy-700 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.01] shadow-md"
        >
          <div className="relative p-5 flex items-center gap-3">
            <Film className="w-6 h-6 text-white opacity-90" />
            <div className="flex-1">
              <h3 className="text-white font-semibold text-base">Películas para tu comida</h3>
              <p className="text-white/80 text-sm">Qué ver mientras disfrutas tu pedido</p>
            </div>
            <svg
              className="w-5 h-5 text-white/90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>





      {/* Botón de Menú Circular */}
      {!menuAbierto && (
        <button
          onClick={() => setMenuAbierto(true)}
          className="fixed left-0 top-1/4 z-30 bg-burgundy-900 text-white shadow-xl transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-r-full"
          style={{ transform: 'translateY(-50%)' }}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Menu Lateral Desplegable */}
      <div
        className={`fixed left-0 top-0 bottom-20 bg-gradient-to-br from-burgundy-700 via-burgundy-800 to-burgundy-900 z-20 flex flex-col justify-center py-6 space-y-2 overflow-y-auto transition-all duration-300 shadow-2xl ${menuAbierto ? 'w-40 opacity-100' : 'w-0 opacity-0'
          }`}
        style={{
          borderTopRightRadius: '45%',
          borderBottomRightRadius: '45%',
        }}
      >
        {/* Botón cerrar dentro del menú */}
        <button
          onClick={() => setMenuAbierto(false)}
          className={`absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-white hover:bg-burgundy-600 rounded-full transition-all duration-300 ${menuAbierto ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Título del menú */}
        <div
          className={`px-6 pb-3 border-b border-burgundy-700 mb-2 pt-8 transition-all duration-300 ${menuAbierto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
        >
          <p className="text-gold text-xs font-italic tracking-wider">CATEGORÍAS</p>
        </div>

        {/*  Opción para ver todas las categorías */}
        <button
          onClick={() => {
            setMenuAbierto(false);
            navigate('/categorias');
          }}
          className={`px-6 py-2.5 text-white hover:bg-burgundy-700 hover:border-l-4 hover:border-gold transition-all duration-300 text-left font-italic text-xs whitespace-nowrap group ${menuAbierto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
        >
          <span className="group-hover:ml-1 transition-all duration-200 font-italic">
            VER TODAS
          </span>
        </button>

        <div className="px-6 border-t border-burgundy-700 my-2"></div>

        {categorias.map((cat, index) => (
          <button
            key={cat.id}
            onClick={() => handleCategoriaClick(cat)}
            className={`px-6 py-2.5 text-white hover:bg-burgundy-700 hover:border-l-4 hover:border-gold transition-all duration-300 text-left font-italic text-xs whitespace-nowrap group ${menuAbierto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              } ${categoriaSeleccionada === cat.id ? 'bg-burgundy-700 border-l-4 border-gold' : ''}`}
            style={{
              transitionDelay: menuAbierto ? `${(index + 1) * 40}ms` : '0ms',
            }}
          >
            <span className="group-hover:ml-1 transition-all duration-200">
              {cat.nombre.toUpperCase()}
            </span>
          </button>
        ))}

        {/* Footer decorativo */}
        <div
          className={`px-6 pt-4 mt-4 border-t border-burgundy-700 transition-all duration-300 ${menuAbierto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
            }`}
          style={{ transitionDelay: menuAbierto ? `${(categorias.length + 1) * 40}ms` : '0ms' }}
        ></div>
      </div>

      {/* Overlay para cerrar el menú */}
      {menuAbierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-10"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* Contenido Principal */}
      <div className="px-6">
        {/* Botón destacado para ver todas las categorías */}
        <div className="mb-6"></div>

        {/* Productos Destacados - Carrusel Deslizable */}
        <div className="mb-6 -mx-6">
          <div className="flex overflow-x-auto gap-4 px-6 pb-2 scrollbar-hide snap-x snap-mandatory">
            {productosTendencia.slice(0, 5).map((producto) => (
              <div key={producto.id} className="flex-shrink-0 w-72 snap-center">
                <div
                  className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-64"
                  onClick={() => navigate(`/producto/${producto.id}`)}
                >
                  <img
                    src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-burgundy-900 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {producto.nombre.toUpperCase()}
                    </h2>
                    <div className="bg-gold text-burgundy-900 inline-block px-4 py-1 rounded-full font-bold">
                      ₡{producto.precio}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Indicador de scroll */}
          <div className="flex justify-center gap-1 mt-3">
            {productosTendencia.slice(0, 5).map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-gray-300"></div>
            ))}
          </div>
        </div>



        {/* Sección POPULAR */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-burgundy-900" />
            <h3 className="text-xl font-bold text-burgundy-900">POPULAR</h3>
          </div>
          <div className="space-y-4">
            {productosTendencia.slice(0, 5).map((producto) => (
              <div
                key={producto.id}
                className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <button className="flex-shrink-0 w-8 h-8 flex items-center justify-center border-2 border-burgundy-900 rounded-full hover:bg-burgundy-900 hover:text-white transition">
                  <Plus className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <h4 className="font-semibold text-burgundy-900">{producto.nombre}</h4>
                  <p className="text-gold font-bold">₡{producto.precio}</p>
                </div>
                {/* NUEVO: Indicador de favorito */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                   
                  }}
                  className="flex-shrink-0"
                >
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
                </button>
                <img
                  src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}
                  alt={producto.nombre}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Sección NUEVOS */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-burgundy-900" />
            <h3 className="text-xl font-bold text-burgundy-900">NUEVOS</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {productosNuevos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <div className="relative">
                  <img
                    src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
                    alt={producto.nombre}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    NUEVO
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-burgundy-900 text-sm mb-1 line-clamp-1">
                    {producto.nombre}
                  </h4>
                  <p className="text-gold font-bold text-sm">₡{producto.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección PROMOCIONES */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-burgundy-900" />
            <h3 className="text-xl font-bold text-burgundy-900">PROMOCIONES</h3>
          </div>
          <div className="space-y-4">
            {productosPromocion.map((producto) => (
              <div
                key={producto.id}
                className="relative bg-gradient-to-r from-burgundy-50 to-gold/10 border-2 border-gold rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                  -20%
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'}
                    alt={producto.nombre}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-burgundy-900 mb-2">{producto.nombre}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-400 line-through text-sm">
                        ₡{(producto.precio * 1.25).toFixed(0)}
                      </p>
                      <p className="text-gold font-bold text-lg">₡{producto.precio}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Banner Favoritos Minimalista */}
        <div className="px-6 mb-6">
          <div
            onClick={() => navigate('/favoritos')}
            className="bg-burgundy-800 rounded-xl cursor-pointer transition transform hover:scale-[1.01] p-5 flex items-center gap-3 shadow-md"
          >
            <Heart className="w-6 h-6 text-white" />

            <div className="flex-1">
              <h3 className="text-white font-semibold text-base">Tus Favoritos</h3>
              <p className="text-white/70 text-sm">Accede rápido a tus platillos guardados</p>
            </div>

            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>



        {/* Sección RECOMENDADOS */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-burgundy-900 mb-4">RECOMENDADOS PARA TI</h3>
          <div className="grid grid-cols-2 gap-4">
            {productosTendencia.slice(2, 6).map((producto) => (
              <div
                key={producto.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition"
                onClick={() => navigate(`/producto/${producto.id}`)}
              >
                <img
                  src={producto.imagen_principal || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'}
                  alt={producto.nombre}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <h4 className="font-semibold text-burgundy-900 text-sm mb-1 line-clamp-1">
                    {producto.nombre}
                  </h4>
                  <p className="text-gold font-bold text-sm">₡{producto.precio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      // frontend/src/screens/HomeScreen.jsx - Solo actualizar el Bottom Navigation

      {/* Bottom Navigation  */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-20">
        <div className="flex justify-around items-center max-w-md mx-auto px-4 py-3">
          {/* Botón Inicio */}
          <button
            onClick={() => {
              setActiveTab('home');
              navigate('/home');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'home' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'home'
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

          {/* Botón Favoritos - NUEVO */}
          <button
            onClick={() => {
              setActiveTab('favoritos');
              navigate('/favoritos');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'favoritos' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'favoritos'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
                }`}
            >
              <Heart
                className={`w-5 h-5 ${activeTab === 'favoritos'
                    ? 'text-white fill-white'
                    : 'text-gray-600'
                  }`}
              />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'favoritos' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
                }`}
            >
              Favoritos
            </span>
          </button>

          {/* Botón Carrito */}
          <button
            onClick={() => {
              setActiveTab('carrito');
              navigate('/carrito');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'carrito' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'carrito'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
                }`}
            >
              <ShoppingCart
                className={`w-5 h-5 ${activeTab === 'carrito' ? 'text-white' : 'text-gray-600'}`}
              />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'carrito' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}
            >
              Carrito
            </span>
          </button>

          {/* Botón Pedidos */}
          <button
            onClick={() => {
              setActiveTab('pedidos');
              navigate('/mis-pedidos');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'pedidos' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'pedidos'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
                }`}
            >
              <ClipboardList
                className={`w-5 h-5 ${activeTab === 'pedidos' ? 'text-white' : 'text-gray-600'}`}
              />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'pedidos' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}
            >
              Pedidos
            </span>
          </button>

          {/* Botón Lealtad */}
          <button
            onClick={() => {
              setActiveTab('lealtad');
              navigate('/puntos-lealtad');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'lealtad' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'lealtad'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
                }`}
            >
              <Award className={`w-5 h-5 ${activeTab === 'lealtad' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'lealtad' ? 'text-burgundy-800 font-medium' : 'text-gray-500'
                }`}
            >
              Lealtad
            </span>
          </button>

          {/* Botón Perfil */}
          <button
            onClick={() => {
              setActiveTab('perfil');
              navigate('/profile');
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === 'perfil' ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
          >
            <div
              className={`p-2 rounded-xl transition-all ${activeTab === 'perfil'
                  ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg'
                  : 'bg-gray-100'
                }`}
            >
              <User className={`w-5 h-5 ${activeTab === 'perfil' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span
              className={`text-[10px] ${activeTab === 'perfil' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}
            >
              Perfil
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;