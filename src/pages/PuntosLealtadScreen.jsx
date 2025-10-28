import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lealtadService } from '../services/lealtadService';
import { ArrowLeft, Award, Gift, Clock, TrendingUp, Star, CheckCircle } from 'lucide-react';

const PuntosLealtadScreen = () => {
  const navigate = useNavigate();
  const [puntos, setPuntos] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canjeando, setCanjeando] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [puntosData, historialData, recompensasData] = await Promise.all([
        lealtadService.getPuntos(),
        lealtadService.getHistorial(),
        lealtadService.getRecompensas(),
      ]);
      setPuntos(puntosData.puntos);
      setHistorial(historialData);
      setRecompensas(recompensasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCanjear = async (recompensaId) => {
    if (canjeando) return;
    
    console.log(' Intentando canjear recompensa ID:', recompensaId);
    console.log('Tipo:', typeof recompensaId);
    
    const recompensa = recompensas.find(r => r.id === recompensaId);
    if (!recompensa) {
      console.error(' Recompensa no encontrada:', recompensaId);
      return;
    }

    console.log(' Recompensa encontrada:', recompensa);

    if (puntos < recompensa.puntosRequeridos) {
      alert('No tienes suficientes puntos para canjear esta recompensa');
      return;
    }

    if (!confirm(`¿Canjear ${recompensa.puntosRequeridos} puntos por ${recompensa.nombre}?`)) {
      return;
    }

    setCanjeando(true);
    try {
      console.log(' Enviando solicitud de canje...');
      const resultado = await lealtadService.canjearRecompensa(recompensaId);
      console.log('Respuesta del servidor:', resultado);
      
      // Si se generó un cupón, mostrarlo
      if (resultado.cupon) {
        alert(`¡Recompensa canjeada exitosamente!\n\n Cupón generado: ${resultado.cupon.codigo}\n\nPuedes usarlo en tu próxima compra.`);
      } else {
        alert('¡Recompensa canjeada exitosamente!');
      }
      
      await loadData();
    } catch (error) {
      console.error(' Error canjeando recompensa:', error);
      console.error(' Detalles del error:', error.response?.data);
      
      // Mostrar el mensaje de error específico
      let mensaje = 'Error al canjear la recompensa';
      if (error.response?.data?.message) {
        if (Array.isArray(error.response.data.message)) {
          mensaje = error.response.data.message.join('\n');
        } else {
          mensaje = error.response.data.message;
        }
      }
      
      alert(mensaje);
    } finally {
      setCanjeando(false);
    }
  };

  const getIconoTipo = (tipo) => {
    switch (tipo) {
      case 'ganado':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'canjeado':
        return <Gift className="w-5 h-5 text-burgundy-600" />;
      case 'expirado':
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return <Star className="w-5 h-5 text-gold" />;
    }
  };

  const getColorPuntos = (tipo) => {
    switch (tipo) {
      case 'ganado':
        return 'text-green-600';
      case 'canjeado':
        return 'text-red-600';
      case 'expirado':
        return 'text-gray-400';
      default:
        return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white px-6 py-8">
        <button onClick={() => navigate('/home')} className="mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        {/* Tarjeta de Puntos */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gold p-3 rounded-full">
                <Award className="w-8 h-8 text-burgundy-900" />
              </div>
              <div>
                <p className="text-gold text-sm font-semibold">TUS PUNTOS</p>
                <p className="text-white text-4xl font-bold">{puntos}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-4">
            <p className="text-white/80 text-sm">
              Acumula puntos con cada compra y canjéalos por increíbles recompensas
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Recompensas Disponibles */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6" />
            RECOMPENSAS DISPONIBLES
          </h2>
          
          {recompensas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay recompensas disponibles
            </div>
          ) : (
            <div className="space-y-4">
              {recompensas.map((recompensa) => {
                const puedesCanjear = puntos >= recompensa.puntosRequeridos;
                const porcentajeProgreso = Math.min((puntos / recompensa.puntosRequeridos) * 100, 100);

                return (
                  <div
                    key={recompensa.id}
                    className={`bg-white rounded-xl p-4 border-2 transition-all ${
                      puedesCanjear 
                        ? 'border-green-500 shadow-lg' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-burgundy-900 mb-1">
                          {recompensa.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {recompensa.descripcion}
                        </p>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-gold" />
                          <span className="text-sm font-semibold text-burgundy-900">
                            {recompensa.puntosRequeridos} puntos
                          </span>
                        </div>
                      </div>
                      
                      {puedesCanjear && (
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Barra de progreso */}
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            puedesCanjear ? 'bg-green-500' : 'bg-burgundy-600'
                          }`}
                          style={{ width: `${porcentajeProgreso}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {puedesCanjear 
                          ? '¡Puedes canjear esta recompensa!' 
                          : `Te faltan ${recompensa.puntosRequeridos - puntos} puntos`
                        }
                      </p>
                    </div>

                    <button
                      onClick={() => handleCanjear(recompensa.id)}
                      disabled={!puedesCanjear || canjeando}
                      className={`w-full py-2 rounded-full font-semibold transition ${
                        puedesCanjear
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      } disabled:opacity-50`}
                    >
                      {canjeando ? 'Canjeando...' : 'Canjear'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historial de Puntos */}
        <div>
          <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            HISTORIAL DE PUNTOS
          </h2>
          
          {historial.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay historial de puntos
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((registro) => (
                <div
                  key={registro.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    {getIconoTipo(registro.tipo)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-burgundy-900 text-sm">
                      {registro.descripcion}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(registro.fecha).toLocaleDateString('es-CR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  
                  <div className="flex-shrink-0 text-right">
                    <p className={`text-lg font-bold ${getColorPuntos(registro.tipo)}`}>
                      {registro.tipo === 'ganado' ? '+' : '-'}
                      {Math.abs(registro.puntos)}
                    </p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-gradient-to-r from-burgundy-50 to-gold/10 rounded-xl p-6">
          <h3 className="font-bold text-burgundy-900 mb-3">¿Cómo ganar puntos?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Por cada ₡1,000 gastados = 10 puntos</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Completa tu perfil = 50 puntos</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Primera compra = 100 puntos</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span>Referir a un amigo = 200 puntos</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PuntosLealtadScreen;