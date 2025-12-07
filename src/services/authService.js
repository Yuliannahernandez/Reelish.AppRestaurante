import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

alert('🚨 AUTHSERVICE CARGADO - URL: ' + API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    alert('📤 REQUEST: ' + config.baseURL + config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

const toCamel = (s) =>
  s.replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

const keysToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamel(k), keysToCamel(v)])
    );
  }
  return obj;
};

api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamel(response.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  async googleLogin(googleToken) {
    alert('🔐 LLAMANDO GOOGLE LOGIN');
    const response = await api.post('/auth/google/login', { googleToken });
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(token) {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  async resendVerification(correo) {
    const response = await api.post('/auth/resend-verification', { correo });
    return response.data;
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { correo: email });
    return response.data;
  },

  async resetPassword(data) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export default authService;
