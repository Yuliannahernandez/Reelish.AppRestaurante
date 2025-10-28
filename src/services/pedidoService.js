import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token
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

export const pedidoService = {
  // Obtener un pedido específico
  async getPedido(pedidoId) {
    const response = await api.get(`/pedidos/${pedidoId}`);
    return response.data;
  },

  // Obtener todos los pedidos del usuario
  async getMisPedidos() {
    const response = await api.get('/pedidos/mis-pedidos');
    return response.data;
  },

  // Crear pedido desde el carrito
  async crearPedido() {
    const response = await api.post('/pedidos/crear');
    return response.data;
  },

  // Cancelar pedido
  async cancelarPedido(pedidoId) {
    const response = await api.put(`/pedidos/${pedidoId}/cancelar`);
    return response.data;
  }
};