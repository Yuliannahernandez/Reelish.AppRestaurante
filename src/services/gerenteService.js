import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Interceptor para agregar token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const gerenteService = {
  // ==================== PRODUCTOS ====================

  async getProductos() {
    const response = await axios.get(`${API_URL}/gerente/productos`);
    return response.data;
  },

  async crearProducto(data) {
    const response = await axios.post(`${API_URL}/gerente/productos`, data);
    return response.data;
  },

  async actualizarProducto(id, data) {
    const response = await axios.put(`${API_URL}/gerente/productos/${id}`, data);
    return response.data;
  },

  async toggleDisponibilidad(id) {
    const response = await axios.put(
      `${API_URL}/gerente/productos/${id}/toggle-disponibilidad`
    );
    return response.data;
  },

  async eliminarProducto(id) {
    const response = await axios.delete(`${API_URL}/gerente/productos/${id}`);
    return response.data;
  },

  // ==================== PEDIDOS ====================

  async getPedidosActivos() {
    const response = await axios.get(`${API_URL}/gerente/pedidos/activos`);
    return response.data;
  },

  async cambiarEstadoPedido(id, estado) {
    const response = await axios.put(`${API_URL}/gerente/pedidos/${id}/estado`, {
      estado,
    });
    return response.data;
  },

  // ==================== REPORTES ====================

  async getReporteVentas(fechaInicio, fechaFin) {
    const params = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    const response = await axios.get(`${API_URL}/gerente/reportes/ventas`, {
      params,
    });
    return response.data;
  },

  async getMetricas() {
    const response = await axios.get(`${API_URL}/gerente/metricas`);
    return response.data;
  },
};