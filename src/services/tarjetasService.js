// frontend/src/services/tarjetasService.js
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

export const tarjetasService = {
  async validarTarjeta(numeroTarjeta, fechaExpiracion, cvv, nombreTitular) {
    const response = await api.post('/tarjetas/validar', {
      numero_tarjeta: numeroTarjeta,
      fecha_expiracion: fechaExpiracion,
      cvv: cvv,
      nombre_titular: nombreTitular
    });
    return response.data;
  },

  async procesarPago(numeroTarjeta, fechaExpiracion, cvv, nombreTitular, monto, pedidoId) {
    const response = await api.post('/tarjetas/procesar-pago', {
      numero_tarjeta: numeroTarjeta,
      fecha_expiracion: fechaExpiracion,
      cvv: cvv,
      nombre_titular: nombreTitular,
      monto: monto,
      pedido_id: pedidoId
    });
    return response.data;
  },

  async getTarjetasPrueba() {
    const response = await api.get('/tarjetas/tarjetas-prueba');
    return response.data;
  }
};