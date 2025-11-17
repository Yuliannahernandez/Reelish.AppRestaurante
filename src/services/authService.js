import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ==================== CONFIG AXIOS ====================
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== CONVERTIDOR snake_case → camelCase ====================
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

// Interceptor de respuesta: convierte automáticamente todas las respuestas del backend
api.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = keysToCamel(response.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// ==================== LOGIN CON GOOGLE ====================
export const loginWithGoogle = async (credentialResponse) => {
  try {
    console.log('Enviando credential:', credentialResponse);
    console.log('Token:', credentialResponse.credential?.substring(0, 50) + '...');

    const response = await fetch('http://localhost:3000/api/auth/google/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken: credentialResponse.credential }),
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Error en login con Google');
    }

    // Convertimos también el fetch manual
    return keysToCamel(data);
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
};

// ==================== SERVICIO DE AUTENTICACIÓN ====================
export const authService = {
  // --- AUTENTICACIÓN TRADICIONAL ---
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
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

  // --- GOOGLE OAUTH ---
  async googleLogin(googleToken) {
    const response = await api.post('/auth/google/login', { googleToken });
    return response.data;
  },

  // --- 2FA ---
  async generate2FA() {
    const response = await api.post('/auth/2fa/generate');
    return response.data;
  },

  async enable2FA(token) {
    const response = await api.post('/auth/2fa/enable', { token });
    return response.data;
  },

  async disable2FA(token) {
    const response = await api.post('/auth/2fa/disable', { token });
    return response.data;
  },

  async verify2FA(token) {
    const response = await api.post('/auth/2fa/verify', { token });
    return response.data;
  },

  // --- RECUPERACIÓN DE CONTRASEÑA ---
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { correo: email });
    return response.data;
  },

  async resetPassword(data) {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // --- BUSCAR CUENTA ---
  async findAccount(searchType, searchData) {
    const response = await api.post('/auth/find-account', { searchType, searchData });
    return response.data;
  },

  // --- PERFIL Y VERIFICACIÓN ---
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
