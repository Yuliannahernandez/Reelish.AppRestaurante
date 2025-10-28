import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Flame, Salad, Coffee, IceCream } from 'lucide-react';
import { categoriasService } from '../services/categoriasService';


const CATEGORIA_CONFIGS = {
  'Entradas': {
    gradient: 'from-orange-400 to-red-500',
    icon: Sparkles,
    pattern: 'dots',
    textColor: 'text-orange-900',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-300',
  },
  'Platos Principales': {
    gradient: 'from-red-600 to-burgundy-900',
    icon: Flame,
    pattern: 'diagonal',
    textColor: 'text-burgundy-900',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-300',
  },
  'Bebidas': {
    gradient: 'from-blue-400 to-cyan-600',
    icon: Coffee,
    pattern: 'waves',
    textColor: 'text-blue-900',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  'Postres': {
    gradient: 'from-pink-400 to-purple-600',
    icon: IceCream,
    pattern: 'circles',
    textColor: 'text-pink-900',
    bgLight: 'bg-pink-50',
    borderColor: 'border-pink-300',
  },
  'Ensaladas': {
    gradient: 'from-green-400 to-emerald-600',
    icon: Salad,
    pattern: 'grid',
    textColor: 'text-green-900',
    bgLight: 'bg-green-50',
    borderColor: 'border-green-300',
  },
};

const CategoriasScreen = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const data = await categoriasService.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPatternStyle = (pattern) => {
    const patterns = {
      dots: {
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      },
      diagonal: {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
      },
      waves: {
        backgroundImage: 'repeating-radial-gradient(circle at 0 0, transparent 0, rgba(255,255,255,0.1) 10px, transparent 20px)',
      },
      circles: {
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 15%, transparent 16%)',
        backgroundSize: '40px 40px',
      },
      grid: {
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      },
    };
    return patterns[pattern] || {};
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando categorías...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white py-6 px-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Categorías</h1>
            <p className="text-sm text-burgundy-200">Explora nuestro menú</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Grid de categorías */}
        <div className="grid grid-cols-1 gap-4">
          {categorias.map((categoria) => {
            const config = CATEGORIA_CONFIGS[categoria.nombre] || CATEGORIA_CONFIGS['Entradas'];
            const Icon = config.icon;
            const patternStyle = getPatternStyle(config.pattern);

            return (
              <div
                key={categoria.id}
                onClick={() => navigate(`/categoria/${categoria.id}`)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  {/* Fondo con gradiente y patrón */}
                  <div className="h-40 relative rounded-2xl overflow-hidden">
                    {/* Imagen de fondo */}
                    {categoria.icono ? (
                      <img
                        src={categoria.icono}
                        alt={categoria.nombre}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
                        style={patternStyle}
                      />
                    )}
                    {/* Overlay decorativo */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />

                    {/* Icono flotante */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {categoria.nombre}
                      </h2>
                      <p className="text-white/90 text-sm">
                        {categoria.descripcion || 'Descubre nuestras delicias'}
                      </p>
                    </div>

                    {/* Badge decorativo */}
                    <div className="absolute top-4 left-4">
                      <div className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full">
                        <span className="text-white text-xs font-semibold">
                          Ver productos →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoriasScreen;