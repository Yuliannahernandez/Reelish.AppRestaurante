import axios from 'axios';


const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL;



export const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: { 'Content-Type': 'application/json' }
});

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

export const categoriasService = {
  async getCategorias() {
    const response = await pythonApi.get('/categorias');
    return response.data;
  },

  async getProductosPorCategoria(categoriaId) {
    const response = await pythonApi.get(`/categorias/${categoriaId}/productos`);
    return response.data;
  },

    async getProductoDetalle(id) {
    const response = await pythonApi.get(`/productos/${id}`);
    return response.data;
  },

};