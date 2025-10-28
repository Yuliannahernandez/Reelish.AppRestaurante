import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const clienteService = {
  // Obtener perfil del cliente
  async getPerfil() {
    try {
      const response = await axios.get(`${API_URL}/clientes/perfil`, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error getting perfil:', error);
      throw error;
    }
  },

  // Actualizar perfil del cliente
  async actualizarPerfil(data) {
    try {
      const response = await axios.put(`${API_URL}/clientes/perfil`, data, {
        headers: getAuthHeader(),
      });
      return response.data;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  },
};