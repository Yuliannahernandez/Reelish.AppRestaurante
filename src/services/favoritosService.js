
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para token
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

export const favoritosService = {
  async getMisFavoritos() {
    const response = await api.get('/favoritos/mis-favoritos');
    return response.data;
  },

  async toggleFavorito(productoId) {
    const response = await api.post(`/favoritos/toggle/${productoId}`);
    return response.data;
  },

  async esFavorito(productoId) {
    const response = await api.get(`/favoritos/es-favorito/${productoId}`);
    return response.data;
  }
};