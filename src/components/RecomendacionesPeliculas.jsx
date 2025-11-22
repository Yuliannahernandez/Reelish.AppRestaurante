
import { useState, useEffect } from 'react';
import { Film, Star, Clock } from 'lucide-react';
import { recomendacionesService } from '../services/recomendacionesService';

const RecomendacionesPeliculas = ({ pedidoId = null, onClose = null }) => {
  const [recomendaciones, setRecomendaciones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarRecomendaciones();
  }, [pedidoId]);

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true);
      setError('');

      const data = pedidoId
        ? await recomendacionesService.getRecomendacionesPedido(pedidoId)
        : await recomendacionesService.getRecomendacionesCarrito();

      setRecomendaciones(data);
    } catch (err) {
      setError('Error al cargar recomendaciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-burgundy-700 rounded-2xl p-8 text-center">
        <Film className="w-14 h-14 text-yellow-400 mx-auto mb-4 opacity-80 animate-pulse" />
        <p className="text-white/80 text-sm">Buscando recomendaciones...</p>
      </div>
    );
  }

  if (error || !recomendaciones) return null;

  return (
    <div className="bg-burgundy-800 rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Recomendaciones</h3>
          <p className="text-white/60 text-sm mt-0.5">{recomendaciones.mensaje}</p>
        </div>

        {onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white transition text-sm">
            Cerrar
          </button>
        )}
      </div>

      {/* Lista de Películas */}
      <div className="space-y-4">
        {recomendaciones.recomendaciones.map((pelicula, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition"
          >
            <div className="flex gap-4">
              {/* Poster */}
              <img
                src={pelicula.poster}
                alt={pelicula.titulo}
                className="w-24 h-36 object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = 'https://i.pinimg.com/736x/ff/ea/a3/ffeaa30337bdae98769385953f1692cb.jpg';
                }}
              />

              {/* Información */}
              <div className="flex-1">
                <h4 className="text-white font-semibold text-lg leading-tight">
                  {pelicula.titulo}
                </h4>

                <div className="flex items-center gap-4 text-sm text-white/70 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {pelicula.año}
                  </span>

                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {pelicula.rating}/10
                  </span>
                </div>

                <p className="text-white/60 text-sm mt-3 line-clamp-3">
                  {pelicula.sinopsis}
                </p>

                <div className="mt-3 text-white/70 text-sm border border-white/10 rounded-lg p-3">
                  <span className="font-medium text-white/90">Razón:</span> {pelicula.razon}
                </div>

                <span className="inline-block mt-3 text-xs text-white/70 border border-white/10 px-3 py-1 rounded-full">
                  {pelicula.genero}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecomendacionesPeliculas;
