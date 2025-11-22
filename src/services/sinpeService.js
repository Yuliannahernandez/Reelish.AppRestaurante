// services/sinpeService.js

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

export const sinpeService = {
  // Obtener cuenta bancaria del usuario
  async getMiCuenta() {
    const response = await api.get('/sinpe/mi-cuenta');
    return response.data;
  },

  // Iniciar transferencia SINPE
  async iniciarTransferencia(data) {
    const response = await api.post('/sinpe/iniciar-transferencia', {
      telefono_origen: data.telefonoOrigen,
      telefono_destino: data.telefonoDestino,
      monto: data.monto,
      descripcion: data.descripcion
    });
    return response.data;
  },

  // Verificar código de seguridad
  async verificarCodigo(data) {
    const response = await api.post('/sinpe/verificar-codigo', {
      transaccion_id: data.transaccionId,
      codigo: data.codigo
    });
    return response.data;
  },

  // Obtener historial de transacciones
  async getMisTransacciones() {
    const response = await api.get('/sinpe/transacciones');
    return response.data;
  }
};