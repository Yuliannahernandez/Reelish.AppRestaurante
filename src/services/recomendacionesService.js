// frontend/src/services/recomendacionesService.js
import axios from 'axios';

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL;

export const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para token
pythonApi.interceptors.request.use(
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
    const response = await pythonApi.get('/recomendaciones/mi-carrito');
    return response.data;
  },

  async getRecomendacionesPedido(pedidoId) {
    const response = await pythonApi.get(`/recomendaciones/pedido/${pedidoId}`);
    return response.data;
  },

  async getCategorias() {
    const response = await pythonApi.get('/recomendaciones/categorias');
    return response.data;
  }
};