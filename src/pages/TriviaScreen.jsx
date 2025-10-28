import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { triviaService } from '../services/triviaService';
import { ArrowLeft, Trophy, Clock, Star, Gift, CheckCircle, XCircle } from 'lucide-react';

const TriviaScreen = () => {
  const navigate = useNavigate();
  const { pedidoId } = useParams();
  
  const [partidaId, setPartidaId] = useState(null);
  const [preguntaActual, setPreguntaActual] = useState(null);
  const [respuestas, setRespuestas] = useState([]);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);
  const [puntaje, setPuntaje] = useState(0);
  const [correctas, setCorrectas] = useState(0);
  const [numeroPregunta, setNumeroPregunta] = useState(1);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [cuponGanado, setCuponGanado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tiempoInicioPregunta, setTiempoInicioPregunta] = useState(Date.now());

  const TOTAL_PREGUNTAS = 5;
  const TIEMPO_POR_PREGUNTA = 15;

  useEffect(() => {
    iniciarJuego();
  }, []);

  useEffect(() => {
    if (!mostrandoResultado && !juegoTerminado && tiempoRestante > 0) {
      const timer = setTimeout(() => {
        setTiempoRestante(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0 && !mostrandoResultado) {
      handleTimeout();
    }
  }, [tiempoRestante, mostrandoResultado, juegoTerminado]);

  const iniciarJuego = async () => {
    try {
      const partida = await triviaService.iniciarPartida(pedidoId || null);
      setPartidaId(partida.id);
      await cargarPregunta(partida.id);
    } catch (error) {
      console.error('Error iniciando juego:', error);
      alert('Error al iniciar el juego');
    } finally {
      setLoading(false);
    }
  };

  const cargarPregunta = async (pId) => {
    try {
      const data = await triviaService.obtenerPregunta(pId || partidaId);
      
      if (!data || !data.pregunta || !data.pregunta.id) {
        console.error(' Error: Datos de pregunta inválidos', data);
        throw new Error('Datos de pregunta inválidos');
      }

      console.log(' Pregunta cargada:', data.pregunta);
      
      setPreguntaActual(data.pregunta);
      setRespuestas(data.respuestas);
      setTiempoRestante(TIEMPO_POR_PREGUNTA);
      setTiempoInicioPregunta(Date.now());
      setRespuestaSeleccionada(null);
      setMostrandoResultado(false);
    } catch (error) {
      console.error(' Error cargando pregunta:', error);
      alert('No hay más preguntas disponibles. Finalizando juego...');
      await finalizarJuego();
    }
  };

  
  const handleTimeout = async () => {
    if (mostrandoResultado || !preguntaActual) return;

    console.log('Tiempo agotado para la pregunta');
    setMostrandoResultado(true);
    setEsCorrecta(false);

    try {
      // Enviar respuesta como incorrecta por timeout
      await triviaService.responderPregunta(
        partidaId,
        preguntaActual.id,
        null, // Sin respuesta seleccionada
        TIEMPO_POR_PREGUNTA // Tiempo máximo alcanzado
      );

      setTimeout(async () => {
        if (numeroPregunta < TOTAL_PREGUNTAS) {
          setNumeroPregunta(prev => prev + 1);
          await cargarPregunta(partidaId);
        } else {
          await finalizarJuego();
        }
      }, 2000);
    } catch (error) {
      console.error(' Error al procesar timeout:', error);
      // Continuar de todas formas
      setTimeout(async () => {
        if (numeroPregunta < TOTAL_PREGUNTAS) {
          setNumeroPregunta(prev => prev + 1);
          await cargarPregunta(partidaId);
        } else {
          await finalizarJuego();
        }
      }, 2000);
    }
  };

  const handleRespuesta = async (respuesta) => {
    if (mostrandoResultado || respuestaSeleccionada) return;

    if (!preguntaActual || !preguntaActual.id) {
      console.error(' Error: No hay pregunta actual cargada');
      alert('Error: No se pudo cargar la pregunta. Intenta de nuevo.');
      return;
    }

    setRespuestaSeleccionada(respuesta.id);
    setMostrandoResultado(true);

    const tiempoRespuesta = Math.floor((Date.now() - tiempoInicioPregunta) / 1000);

    console.log(' Enviando respuesta:', {
      partidaId,
      preguntaId: preguntaActual.id,
      respuestaId: respuesta.id,
      tiempoRespuesta
    });

    try {
      const resultado = await triviaService.responderPregunta(
        partidaId,
        preguntaActual.id,
        respuesta.id,
        tiempoRespuesta
      );

      setEsCorrecta(resultado.esCorrecta);
      
      if (resultado.esCorrecta) {
        setPuntaje(resultado.puntajeTotal);
        setCorrectas(resultado.correctas);
      }

      setTimeout(async () => {
        if (numeroPregunta < TOTAL_PREGUNTAS) {
          setNumeroPregunta(prev => prev + 1);
          await cargarPregunta(partidaId);
        } else {
          await finalizarJuego();
        }
      }, 2000);
    } catch (error) {
      console.error(' Error enviando respuesta:', error);
      console.error(' Detalles del error:', error.response?.data);
      alert('Error al enviar la respuesta. Por favor intenta de nuevo.');
    }
  };

  const finalizarJuego = async () => {
    try {
      const resultado = await triviaService.finalizarPartida(partidaId);
      setPuntaje(resultado.puntajeTotal);
      setCorrectas(resultado.correctas);
      setCuponGanado(resultado.cuponGanado);
      setJuegoTerminado(true);
    } catch (error) {
      console.error('Error finalizando juego:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-burgundy-900 to-burgundy-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando trivia...</div>
      </div>
    );
  }

  if (juegoTerminado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-burgundy-900 to-burgundy-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Trophy className="w-20 h-20 text-gold mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-burgundy-900 mb-2">
              ¡Juego Terminado!
            </h1>
          </div>

          <div className="bg-gradient-to-r from-burgundy-100 to-indigo-100 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">Puntaje Final</p>
                <p className="text-3xl font-bold text-burgundy-900">{puntaje}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Correctas</p>
                <p className="text-3xl font-bold text-green-600">
                  {correctas}/{TOTAL_PREGUNTAS}
                </p>
              </div>
            </div>
          </div>

          {cuponGanado && (
            <div className="bg-gradient-to-r from-gold/20 to-yellow-100 border-2 border-gold rounded-2xl p-6 mb-6">
              <Gift className="w-12 h-12 text-gold mx-auto mb-3" />
              <h3 className="text-xl font-bold text-burgundy-900 mb-2">
                ¡Felicidades! 
              </h3>
              <p className="text-gray-700 mb-3">Has ganado un cupón:</p>
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-gold">
                <p className="text-2xl font-bold text-burgundy-900 mb-1">
                  {cuponGanado.codigo}
                </p>
                <p className="text-sm text-gray-600">{cuponGanado.descripcion}</p>
              </div>
            </div>
          )}

          {!cuponGanado && correctas >= 3 && (
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 mb-6">
              <Star className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-700">
                ¡Buen trabajo! Sigue jugando para ganar más recompensas.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition"
            >
              Jugar de Nuevo
            </button>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-full transition"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md text-white py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Trivia de Cine </h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Puntaje y Progreso */}
      <div className="px-6 py-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-white font-bold">{puntaje} pts</span>
            </div>
            <div className="text-white text-sm">
              Pregunta {numeroPregunta}/{TOTAL_PREGUNTAS}
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${(numeroPregunta / TOTAL_PREGUNTAS) * 100}%` }}
            />
          </div>
        </div>

        {/* Temporizador */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <Clock className={`w-6 h-6 ${tiempoRestante <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`} />
            <span className={`text-3xl font-bold ${tiempoRestante <= 5 ? 'text-red-400' : 'text-white'}`}>
              {tiempoRestante}s
            </span>
          </div>
        </div>
      </div>

      {/* Pregunta */}
      {preguntaActual && (
        <div className="px-6">
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl">
            <h2 className="text-xl font-bold text-burgundy-900 text-center mb-2">
              {preguntaActual.pregunta}
            </h2>
            <p className="text-center text-gray-500 text-sm">
              Dificultad: <span className="font-semibold capitalize">{preguntaActual.dificultad}</span>
            </p>
          </div>

          {/* Respuestas */}
          <div className="space-y-3 pb-8">
            {respuestas.map((respuesta) => {
              const estaSeleccionada = respuestaSeleccionada === respuesta.id;
              const mostrarColor = mostrandoResultado && estaSeleccionada;
              
              return (
                <button
                  key={respuesta.id}
                  onClick={() => handleRespuesta(respuesta)}
                  disabled={mostrandoResultado}
                  className={`w-full p-4 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:cursor-not-allowed ${
                    mostrarColor
                      ? esCorrecta
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-white text-burgundy-900 hover:bg-burgundy-100'
                  } ${estaSeleccionada && !mostrandoResultado ? 'ring-4 ring-purple-400' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{respuesta.respuesta}</span>
                    {mostrandoResultado && estaSeleccionada && (
                      esCorrecta ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TriviaScreen;