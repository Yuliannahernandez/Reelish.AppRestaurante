// services/tipoCambioService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ← AGREGAR INTERCEPTOR PARA EL TOKEN
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

export const tipoCambioService = {
  async getTipoCambioActual() {
    const response = await api.get('/tipo-cambio/actual');
    return response.data;
  },

  async getTipoCambioCache() {
    const response = await api.get('/tipo-cambio/cache');
    return response.data;
  },

  async convertirMoneda(monto, de = 'USD', a = 'CRC') {
    const response = await api.get('/tipo-cambio/convertir', {
      params: { monto, de, a }
    });
    return response.data;
  }
};