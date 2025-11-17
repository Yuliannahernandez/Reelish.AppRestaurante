import axios from 'axios';
import SeleccionarMetodoPagoScreen from '../pages/SeleccionarMetodoPagoScreen';

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

export const carritoService = {
  async getCarrito() {
    const response = await api.get('/carrito');
    return response.data;
  },

  async agregarProducto(productoId, cantidad = 1) {
    const response = await api.post('/carrito/agregar', { productoId, cantidad });
    return response.data;
  },



  async actualizarCantidad(detalleId, cantidad) {
    const response = await api.put(`/carrito/detalle/${detalleId}`, { cantidad });
    return response.data;
  },

  async eliminarProducto(detalleId) {
    const response = await api.delete(`/carrito/detalle/${detalleId}`);
    return response.data;
  },

  async cambiarTipoEntrega(tipoEntrega) {
    const response = await api.put('/carrito/tipo-entrega', { tipoEntrega });
    return response.data;
  },

  async vaciarCarrito() {
    const response = await api.delete('/carrito/vaciar');
    return response.data;
  },
  
  async seleccionarSucursal(sucursalId) {
    try {
      // Primero obtener el carrito actual
      const carrito = await this.getCarrito();
      
      if (!carrito || !carrito.id) {
        throw new Error('No hay un carrito activo');
      }

      console.log('Actualizando pedido', carrito.id, 'con sucursal', sucursalId);

      // Actualizar la sucursal del pedido (carrito)
      const response = await api.put(`/pedidos/${carrito.id}?sucursalId=${sucursalId}`);
      
      console.log('Sucursal actualizada:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(' Error al seleccionar sucursal:', error.response?.data || error.message);
      throw error;
    }
  },



async seleccionarMetodoPago(metodoPagoId) {
  console.log('💳 Llamando a seleccionarMetodoPago con:', metodoPagoId);
  console.log('Token actual:', localStorage.getItem('token')?.substring(0, 20) + '...');
  
  try {
    // Enviar en snake_case
    const response = await api.put('/carrito/metodopago', { 
      metodo_pago_id: metodoPagoId  // ← Cambiar a snake_case
    });
    console.log('✅ Respuesta exitosa:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error en seleccionarMetodoPago:', error);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    throw error;
  }
}
};
// Servicio de sucursales
export const sucursalesService = {
  async getSucursales() {
    const response = await api.get('/sucursales');
    return response.data;
  },

  async getSucursal(id) {
    const response = await api.get(`/sucursales/${id}`);
    return response.data;
  },
};
