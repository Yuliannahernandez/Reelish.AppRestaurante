
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

export const tseService = {
  async validarCedula(numeroCedula) {
    const response = await api.post('/tse/validar-cedula', {
      numero_cedula: numeroCedula
    });
    return response.data;
  },

  async getCedulasPrueba() {
    const response = await api.get('/tse/cedulas-prueba');
    return response.data;
  }
};