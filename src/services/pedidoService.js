// frontend/src/services/pedidoService.js
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

  async crearPedido(paymentData = null) {
    const payload = {};
    
    // Si viene con datos de pago, agregarlos
    if (paymentData) {
      if (paymentData.paypalOrderId) {
        // PayPal
        payload.metodoPago = 'paypal';
        payload.paypalOrderId = paymentData.paypalOrderId;
        payload.paypalPayerId = paymentData.paypalPayerId;
        payload.paypalAmount = paymentData.paypalAmount;
      } else if (paymentData.sinpeComprobante) {
        // SINPE
        payload.metodoPago = 'sinpe';
        payload.sinpeComprobante = paymentData.sinpeComprobante;
        payload.sinpeTelefono = paymentData.sinpeTelefono;
      } else if (paymentData.transactionId) {
        // Tarjeta de crédito/débito
        payload.metodoPago = 'tarjeta';
        payload.transactionId = paymentData.transactionId;
        payload.tarjetaTipo = paymentData.tarjetaTipo;
        payload.tarjetaUltimosDigitos = paymentData.tarjetaUltimosDigitos;
      }
    } else {
      // Efectivo (default)
      payload.metodoPago = 'efectivo';
    }
    
    console.log(' Creando pedido con payload:', payload);
    
    
    const response = await api.post('/pedidos/crear-desde-carrito', payload);
    return response.data;
  },

  // Cancelar pedido
  async cancelarPedido(pedidoId) {
    const response = await api.put(`/pedidos/${pedidoId}/cancelar`);
    return response.data;
  }
};