

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log(' Token JWT cargado:', token ? token.slice(0, 25) + '...' : ' No hay token');
  return { Authorization: `Bearer ${token}` };
};

export const triviaService = {
  //  INICIAR UNA NUEVA PARTIDA
 
  async iniciarPartida(pedidoId = null) {
    try {
      console.log(' Iniciando partida de trivia...');
      console.log(' API_URL:', API_URL);
      console.log(' Pedido ID recibido:', pedidoId);

      // Verificamos token antes de llamar al backend
      const token = localStorage.getItem('token');
      if (!token) {
        console.error(' No hay token JWT en localStorage');
        throw new Error('No se encontró token. El usuario no está autenticado.');
      }

     
      const headers = getAuthHeader();
      console.log('Headers preparados:', headers);

      const body = { pedidoId };
      console.log(' Body enviado:', body);

      // Petición al backend
      const response = await axios.post(`${API_URL}/trivia/iniciar`, body, { headers });

      console.log(' Respuesta completa del servidor:', response);
      console.log(' Datos del servidor:', response.data);

      // Validamos respuesta
      if (!response.data) {
        console.warn(' El servidor no devolvió datos válidos');
      }

      return response.data;
    } catch (error) {
      console.error(' Error iniciando partida:', error);

      if (error.response) {
        console.error(' Código de estado:', error.response.status);
        console.error(' Respuesta del servidor:', error.response.data);
      } else if (error.request) {
        console.error(' No hubo respuesta del servidor. Posible problema de red.');
      } else {
        console.error(' Error al configurar la solicitud:', error.message);
      }

      throw new Error('Error al iniciar partida de trivia.');
    }
  },

  // Obtener una pregunta
  async obtenerPregunta(partidaId) {
    try {
      const response = await axios.get(
        `${API_URL}/trivia/pregunta/${partidaId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(' Error obteniendo pregunta:', error);
      throw error;
    }
  },

  // Responder una pregunta
  async responderPregunta(partidaId, preguntaId, respuestaId, tiempoRespuesta) {
    try {
      
      console.log(' triviaService.responderPregunta - Parámetros recibidos:', {
        partidaId,
        preguntaId,
        respuestaId,
        tiempoRespuesta,
      });

      console.log(' triviaService.responderPregunta - Tipos:', {
        partidaId: typeof partidaId,
        preguntaId: typeof preguntaId,
        respuestaId: typeof respuestaId,
        tiempoRespuesta: typeof tiempoRespuesta,
      });

      
      if (partidaId === undefined || preguntaId === undefined || respuestaId === undefined) {
        console.error(' ERROR: Parámetros undefined detectados!');
        throw new Error('Parámetros inválidos: algunos valores son undefined');
      }

      const payload = {
        partidaId: Number(partidaId),
        preguntaId: Number(preguntaId),
        respuestaId: Number(respuestaId),
        tiempoRespuesta: Number(tiempoRespuesta || 0),
      };

      console.log('Payload a enviar:', payload);

      const response = await axios.post(
        `${API_URL}/trivia/responder`,
        payload,
        { 
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log(' Respuesta enviada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      console.error(' Error response:', error.response?.data);
      throw error;
    }
  },

  // Finalizar partida
  async finalizarPartida(partidaId) {
    try {
      console.log(' Finalizando partida...');
      const response = await axios.post(
        `${API_URL}/trivia/finalizar/${partidaId}`,
        {},
        { headers: getAuthHeader() }
      );
      console.log(' Partida finalizada:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error finalizando partida:', error);
      throw error;
    }
  },

  // Obtener historial de partidas
  async obtenerHistorial() {
    try {
      const response = await axios.get(
        `${API_URL}/trivia/historial`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error(' Error obteniendo historial:', error);
      throw error;
    }
  },
};