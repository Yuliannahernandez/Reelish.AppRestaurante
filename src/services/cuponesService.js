import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const cuponesService = {
  // Validar cupón
  async validarCupon(codigo) {
    try {
      const response = await axios.post(
        `${API_URL}/cupones/validar`,
        { codigo },
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('Error validando cupón:', error);
      throw error;
    }
  },

  // Aplicar cupón al carrito
  async aplicarCupon(codigo) {
    try {
      console.log(' Enviando código de cupón:', codigo);
      const response = await axios.post(
        `${API_URL}/cupones/aplicar`,
        { codigo: codigo.trim() },
        { headers: getAuthHeader() }
      );
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error aplicando cupón:', error);
      console.error(' Detalles:', error.response?.data);
      throw error;
    }
  },

  // Remover cupón del carrito
  async removerCupon() {
    try {
      const response = await axios.delete(`${API_URL}/cupones/remover`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error removiendo cupón:', error);
      throw error;
    }
  },

  // Obtener cupones disponibles para el cliente
  async getCuponesDisponibles() {
    try {
      const response = await axios.get(`${API_URL}/cupones/disponibles`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting cupones:', error);
      throw error;
    }
  },
};