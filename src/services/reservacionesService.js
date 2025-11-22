// frontend/src/services/reservacionesService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
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

export const reservacionesService = {
  async getDisponibilidad(sucursalId, fecha) {
    const response = await api.get('/reservaciones/disponibilidad', {
      params: { sucursal_id: sucursalId, fecha }
    });
    return response.data;
  },

  async crearReservacion(data) {
    const response = await api.post('/reservaciones/crear', data);
    return response.data;
  },

  async getMisReservaciones() {
    const response = await api.get('/reservaciones/mis-reservaciones');
    return response.data;
  },

  async getSucursalesDisponibles() {
    const response = await api.get('/reservaciones/sucursales/disponibles');
    return response.data;
  },

  async getDetalleReservacion(id) {
    const response = await api.get(`/reservaciones/${id}`);
    return response.data;
  },

  async cancelarReservacion(id) {
    const response = await api.delete(`/reservaciones/${id}/cancelar`);
    return response.data;
  }
};