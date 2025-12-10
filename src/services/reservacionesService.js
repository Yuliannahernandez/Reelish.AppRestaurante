// frontend/src/services/reservacionesService.js
import axios from 'axios';
import { pythonApi } from './categoriasService';

const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL;



export const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar token
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

export const reservacionesService = {
  async getDisponibilidad(sucursalId, fecha) {
    const response = await pythonApi.get('/reservaciones/disponibilidad', {
      params: { sucursal_id: sucursalId, fecha }
    });
    return response.data;
  },

  async crearReservacion(data) {
    const response = await pythonApi.post('/reservaciones/crear', data);
    return response.data;
  },

  async getMisReservaciones() {
    const response = await pythonApi.get('/reservaciones/mis-reservaciones');
    return response.data;
  },

  async getSucursalesDisponibles() {
    const response = await pythonApi.get('/reservaciones/sucursales/disponibles');
    return response.data;
  },

  async getDetalleReservacion(id) {
    const response = await pythonApi.get(`/reservaciones/${id}`);
    return response.data;
  },

  async cancelarReservacion(id) {
    const response = await pythonApi.delete(`/reservaciones/${id}/cancelar`);
    return response.data;
  }
};