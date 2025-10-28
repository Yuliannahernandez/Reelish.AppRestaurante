import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const lealtadService = {
  // Obtener puntos del cliente
  async getPuntos() {
    try {
      const response = await axios.get(`${API_URL}/lealtad/puntos`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting puntos:', error);
      throw error;
    }
  },

  // Obtener historial de puntos
  async getHistorial() {
    try {
      const response = await axios.get(`${API_URL}/lealtad/historial`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting historial:', error);
      throw error;
    }
  },

  // Obtener recompensas disponibles
  async getRecompensas() {
    try {
      const response = await axios.get(`${API_URL}/lealtad/recompensas`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recompensas:', error);
      throw error;
    }
  },

  // Canjear una recompensa
  async canjearRecompensa(recompensaId) {
    try {
      console.log(' Enviando solicitud de canje. Recompensa ID:', recompensaId);
      console.log(' Tipo de recompensaId:', typeof recompensaId);
      
      const response = await axios.post(
        `${API_URL}/lealtad/canjear`,
        { recompensaId: Number(recompensaId) }, 
        { headers: getAuthHeader() }
      );
      
      console.log(' Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error canjeando recompensa:', error);
      console.error(' Response data:', error.response?.data);
      console.error(' Request data:', error.config?.data);
      throw error;
    }
  },
};