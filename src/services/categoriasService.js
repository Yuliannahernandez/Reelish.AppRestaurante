import axios from 'axios';


const API_URL = 'http://localhost:3000/api';

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

export const categoriasService = {
  async getCategorias() {
    const response = await api.get('/categorias');
    return response.data;
  },

  async getProductosPorCategoria(categoriaId) {
    const response = await api.get(`/categorias/${categoriaId}/productos`);
    return response.data;
  },

    async getProductoDetalle(id) {
    const response = await api.get(`/productos/${id}`);
    return response.data;
  },

};