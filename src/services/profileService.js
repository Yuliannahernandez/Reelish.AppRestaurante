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

export const profileService = {
  
  async getProfile() {
    const response = await api.get('/profile');
    return response.data;
  },

 async updateProfilePhoto(file) {
  const formData = new FormData();
  formData.append('fotoPerfil', file); 
  const response = await api.put('/profile/foto', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;

},


  async updateProfile(data) {
    const response = await api.put('/profile', data);
    return response.data;
  },

  // Direcciones
  async getDirecciones() {
    const response = await api.get('/profile/direcciones');
    return response.data;
  },

  async createDireccion(data) {
    const response = await api.post('/profile/direcciones', data);
    return response.data;
  },

  async updateDireccion(id, data) {
    const response = await api.put(`/profile/direcciones/${id}`, data);
    return response.data;
  },

  async deleteDireccion(id) {
    const response = await api.delete(`/profile/direcciones/${id}`);
    return response.data;
  },

  // Métodos de pago
  async getMetodosPago() {
    const response = await api.get('/profile/metodos-pago');
    return response.data;
  },

  async updateMetodoPago(id, data) {
  const response = await api.put(`/profile/metodos-pago/${id}`, data);
  return response.data;
},

  async createMetodoPago(data) {
    const response = await api.post('/profile/metodos-pago', data);
    return response.data;
  },

  async deleteMetodoPago(id) {
    const response = await api.delete(`/profile/metodos-pago/${id}`);
    return response.data;
  },


  // Condiciones de salud
  async getCondicionesSalud() {
    const response = await api.get('/profile/condiciones-salud');
    return response.data;
  },

  async getMisCondiciones() {
    const response = await api.get('/profile/mis-condiciones');
    return response.data;
  },

  async updateCondiciones(condicionIds) {
    const response = await api.post('/profile/mis-condiciones', { condicionIds });
    return response.data;
  },
};