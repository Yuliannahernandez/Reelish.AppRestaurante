import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productosService = {
  async getProductos(categoriaId) {
    const params = categoriaId ? { categoria: categoriaId } : {};
    const response = await api.get('/productos', { params });
    return response.data;
  },

  async getProductosNuevos() {
    const response = await api.get('/productos/nuevos');
    return response.data;
  },

  async getProductosTendencia() {
    const response = await api.get('/productos/tendencia');
    return response.data;
  },

  async getProductoDestacado() {
    const response = await api.get('/productos/destacado');
    return response.data;
  },

  async getCategorias() {
    const response = await api.get('/productos/categorias');
    return response.data;
  },

  async getProductoDetalle(id) {
    const res = await api.get(`/productos/${id}/detalle`);
    const p = res.data;

    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      precio: p.precio,
      imagenPrincipal: p.imagen_principal,
      disponible: p.disponible,
      categoriaNombre: p.categoria_nombre,
      esNuevo: p.es_nuevo,
      enTendencia: p.en_tendencia,
      ingredientes: p.ingredientes,
      informacionNutricional: p.informacion_nutricional,
      tiempoPreparacion: p.tiempo_preparacion
    };
  }
};