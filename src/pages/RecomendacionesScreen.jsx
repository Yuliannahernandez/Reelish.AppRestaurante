
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, RefreshCw } from 'lucide-react';
import RecomendacionesPeliculas from '../components/RecomendacionesPeliculas';

const RecomendacionesScreen = () => {
  const navigate = useNavigate();
  const [key, setKey] = useState(0);

  return (
    <div className="min-h-screen bg-burgundy-950 pb-8">
      {/* Header */}
      <div className="px-6 pt-7 pb-5 bg-burgundy-800 shadow-md flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-yellow-300" />
            Películas
          </h1>
          <p className="text-yellow-200 text-xs mt-0.5">Basadas en tu comida</p>
        </div>

        <button
          onClick={() => setKey(prev => prev + 1)}
          className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 transition"
        >
          <RefreshCw className="w-4 h-4 text-burgundy-900" />
        </button>
      </div>

      {/* Películas */}
      <div className="px-6 py-6">
        <RecomendacionesPeliculas key={key} />
      </div>

      {/* Info */}
      <div className="px-6 mt-4 text-gray-300 text-sm leading-relaxed bg-white/5 border border-white/10 rounded-xl p-5">
        Recomendamos películas según los productos en tu carrito. Disfruta tu comida y la película. 
      </div>
    </div>
  );
};

export default RecomendacionesScreen;
