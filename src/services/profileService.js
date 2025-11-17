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
    
    const payload = {
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
    };

    if (data.edad) {
      payload.edad = data.edad;
    }

    if (data.fechaNacimiento) {
      payload.fecha_nacimiento = data.fechaNacimiento; 
    }

    if (data.localidadId) {
      payload.localidad_id = data.localidadId; 
    }

    const response = await api.put('/profile', payload);
    return response.data;
  },

  // Direcciones
  async getDirecciones() {
    const response = await api.get('/profile/direcciones');
    return response.data.map(d => ({
      id: d.id,
      alias: d.alias,
      direccionCompleta: d.direccion_completa,
      ciudad: d.ciudad,
      provincia: d.provincia,
      codigoPostal: d.codigo_postal,
      latitud: d.latitud,
      longitud: d.longitud,
      referencia: d.referencia,
      esPrincipal: d.es_principal,
      activa: d.activa,
      fechaCreacion: d.fecha_creacion
    }));
  },

  async createDireccion(data) {
    const payload = {
      alias: data.alias,
      direccion_completa: data.direccionCompleta,
      ciudad: data.ciudad,
      provincia: data.provincia,
      codigo_postal: data.codigoPostal || null,
      latitud: data.latitud || null,
      longitud: data.longitud || null,
      referencia: data.referencia || null,
      es_principal: data.esPrincipal ?? false
    };

    const response = await api.post('/profile/direcciones', payload);
    return response.data;
  },

  async updateDireccion(id, data) {
    const payload = {
      alias: data.alias,
      direccion_completa: data.direccionCompleta,
      ciudad: data.ciudad,
      provincia: data.provincia,
      codigo_postal: data.codigoPostal || null,
      latitud: data.latitud || null,
      longitud: data.longitud || null,
      referencia: data.referencia || null,
      es_principal: data.esPrincipal ?? false
    };

    const response = await api.put(`/profile/direcciones/${id}`, payload);
    return response.data;
  },

  // Métodos de pago
  async getMetodosPago() {
    const response = await api.get('/profile/metodos-pago');
    return response.data.map(m => ({
      id: m.id,
      tipo: m.tipo,
      alias: m.alias,
      ultimosDigitos: m.ultimos_digitos,
      marca: m.marca,
      nombreTitular: m.nombre_titular,
      fechaExpiracion: m.fecha_expiracion,
      esPrincipal: m.es_principal,
      activo: m.activo,
      tokenPago: m.token_pago
    }));
  },

  async createMetodoPago(data) {
    const payload = {
      tipo: data.tipo,
      alias: data.alias || null,
      ultimos_digitos: data.ultimosDigitos || null,
      marca: data.marca || null,
      nombre_titular: data.nombreTitular || null,
      fecha_expiracion: data.fechaExpiracion || null,
      es_principal: data.esPrincipal ?? false,
      token_pago: data.tokenPago || null
    };

    const response = await api.post('/profile/metodos-pago', payload);
    return response.data;
  },

  async updateMetodoPago(id, data) {
    const payload = {
      tipo: data.tipo,
      alias: data.alias || null,
      ultimos_digitos: data.ultimosDigitos || null,
      marca: data.marca || null,
      nombre_titular: data.nombreTitular || null,
      fecha_expiracion: data.fechaExpiracion || null,
      es_principal: data.esPrincipal ?? false,
      token_pago: data.tokenPago || null
    };

    const response = await api.put(`/profile/metodos-pago/${id}`, payload);
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
    const payload = {
      condicion_ids: condicionIds
    };
    
    const response = await api.post('/profile/mis-condiciones', payload);
    return response.data;
  }
}