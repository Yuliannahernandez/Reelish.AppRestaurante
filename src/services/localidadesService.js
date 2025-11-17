
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const localidadesService = {
  async getPaises() {
    const response = await api.get('/localidades/paises');
    return response.data;
  },

  async getHijos(padreId) {
    const response = await api.get(`/localidades/hijos/${padreId}`);
    return response.data;
  },

  async getJerarquia(localidadId) {
    const response = await api.get(`/localidades/jerarquia/${localidadId}`);
    return response.data;
  }
};
