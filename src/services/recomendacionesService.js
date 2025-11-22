// frontend/src/services/recomendacionesService.js
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

export const recomendacionesService = {
  async getRecomendacionesCarrito() {
    const response = await api.get('/recomendaciones/mi-carrito');
    return response.data;
  },

  async getRecomendacionesPedido(pedidoId) {
    const response = await api.get(`/recomendaciones/pedido/${pedidoId}`);
    return response.data;
  },

  async getCategorias() {
    const response = await api.get('/recomendaciones/categorias');
    return response.data;
  }
};