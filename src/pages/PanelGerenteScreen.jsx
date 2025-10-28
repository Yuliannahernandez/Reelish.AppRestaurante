import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Plus,
  Edit,
  Power,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { gerenteService } from '../services/gerenteService';

const PanelGerenteScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metricas, setMetricas] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [reporteVentas, setReporteVentas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Actualizar pedidos cada 10 segundos
    const interval = setInterval(() => {
      if (activeTab === 'pedidos' || activeTab === 'dashboard') {
        loadPedidosActivos();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const [metricasData, pedidos] = await Promise.all([
          gerenteService.getMetricas(),
          gerenteService.getPedidosActivos(),
        ]);
        setMetricas(metricasData);
        setPedidosActivos(pedidos);
      } else if (activeTab === 'productos') {
        const data = await gerenteService.getProductos();
        setProductos(data);
      } else if (activeTab === 'pedidos') {
        const data = await gerenteService.getPedidosActivos();
        setPedidosActivos(data);
      } else if (activeTab === 'reportes') {
        const data = await gerenteService.getReporteVentas();
        setReporteVentas(data);
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('No tienes permisos para acceder');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPedidosActivos = async () => {
    try {
      const data = await gerenteService.getPedidosActivos();
      setPedidosActivos(data);
    } catch (error) {
      console.error('Error actualizando pedidos:', error);
    }
  };

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await gerenteService.cambiarEstadoPedido(pedidoId, nuevoEstado);
      await loadPedidosActivos();
      alert('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleToggleDisponibilidad = async (productoId) => {
    try {
      await gerenteService.toggleDisponibilidad(productoId);
      await loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar disponibilidad');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'productos', label: 'Productos', icon: Package },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
    { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white py-6 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Panel de Gerente</h1>
            <p className="text-amber-200 text-sm">Gestión del Restaurante</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition"
          >
            <Power className="w-5 h-5" />
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setLoading(true);
                }}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-burgundy-600 text-burgundy-700 bg-burgundy-50'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-burgundy-900">Cargando...</div>
          </div>
        ) : (
          <>
            {/* DASHBOARD */}
            {activeTab === 'dashboard' && metricas && (
              <div className="space-y-6">
                {/* Tarjetas de métricas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">Ventas Hoy</p>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₡{metricas.hoy.ventas.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">Pedidos Hoy</p>
                      <ShoppingBag className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {metricas.hoy.pedidos}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-orange-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">Pedidos Activos</p>
                      <Clock className="w-8 h-8 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {metricas.pedidosActivos}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 text-sm">Productos</p>
                      <Package className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {metricas.productos.disponibles}/{metricas.productos.total}
                    </p>
                  </div>
                </div>

                {/* Pedidos Activos */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Pedidos Activos
                  </h2>
                  {pedidosActivos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hay pedidos activos
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {pedidosActivos.slice(0, 5).map((pedido) => (
                        <div
                          key={pedido.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-burgundy-900">
                              Pedido #{pedido.id}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                pedido.estado === 'confirmado'
                                  ? 'bg-blue-100 text-blue-700'
                                  : pedido.estado === 'en_preparacion'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {pedido.estado.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {pedido.productos.length} productos - ₡
                            {Number(pedido.total).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(pedido.fechaCreacion).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCTOS */}
            {activeTab === 'productos' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gestión de Productos
                  </h2>
                  <button
                    onClick={() => navigate('/gerente/productos/nuevo')}
                    className="flex items-center gap-2 bg-burgundy-600 hover:bg-burgundy-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Producto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productos.map((producto) => (
                    <div
                      key={producto.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <div className="relative h-48">
                        <img
                          src={
                            producto.imagenPrincipal ||
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
                          }
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            producto.disponible
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                          }`}
                        >
                          {producto.disponible ? 'Disponible' : 'No disponible'}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {producto.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {producto.categoria}
                        </p>
                        <p className="text-xl font-bold text-burgundy-900 mb-3">
                          ₡{Number(producto.precio).toLocaleString()}
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              navigate(`/gerente/productos/editar/${producto.id}`)
                            }
                            className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition text-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleDisponibilidad(producto.id)}
                            className={`flex-1 py-2 rounded-lg transition text-sm font-semibold ${
                              producto.disponible
                                ? 'bg-red-100 hover:bg-red-200 text-red-700'
                                : 'bg-green-100 hover:bg-green-200 text-green-700'
                            }`}
                          >
                            {producto.disponible ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PEDIDOS */}
            {activeTab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gestión de Pedidos en Tiempo Real
                </h2>

                {pedidosActivos.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-md">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay pedidos activos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidosActivos.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="bg-white rounded-xl shadow-md p-6 border-l-4 border-burgundy-600"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">
                                Pedido #{pedido.id}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  pedido.estado === 'confirmado'
                                    ? 'bg-blue-100 text-blue-700'
                                    : pedido.estado === 'en_preparacion'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {pedido.estado.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {new Date(pedido.fechaCreacion).toLocaleString('es-CR')}
                            </p>
                            <p className="text-sm text-gray-600">
                              Sucursal: {pedido.sucursal || 'No especificada'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-burgundy-900">
                              ₡{Number(pedido.total).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {pedido.tipoEntrega === 'domicilio'
                                ? 'A domicilio'
                                : 'Recoger en tienda'}
                            </p>
                          </div>
                        </div>

                        {/* Productos */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-700 mb-2">
                            Productos:
                          </h4>
                          <div className="space-y-2">
                            {pedido.productos.map((prod, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-gray-700">
                                  {prod.cantidad}x {prod.nombre}
                                </span>
                                <span className="font-semibold text-gray-900">
                                  ₡{Number(prod.precio).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botones de cambio de estado */}
                        <div className="flex gap-2">
                          {pedido.estado === 'confirmado' && (
                            <button
                              onClick={() =>
                                handleCambiarEstado(pedido.id, 'en_preparacion')
                              }
                              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
                            >
                              Iniciar Preparación
                            </button>
                          )}
                          {pedido.estado === 'en_preparacion' && (
                            <button
                              onClick={() =>
                                handleCambiarEstado(pedido.id, 'listo')
                              }
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                            >
                              Marcar como Listo
                            </button>
                          )}
                          {pedido.estado === 'listo' && (
                            <button
                              onClick={() =>
                                handleCambiarEstado(pedido.id, 'completado')
                              }
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
                            >
                              Completar Pedido
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleCambiarEstado(pedido.id, 'cancelado')
                            }
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REPORTES */}
            {activeTab === 'reportes' && reporteVentas && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Reportes y Métricas
                </h2>

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-sm opacity-90 mb-1">Total Ventas</p>
                    <p className="text-3xl font-bold">
                      ₡{reporteVentas.resumen.totalVentas.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      {reporteVentas.periodo.inicio} - {reporteVentas.periodo.fin}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-sm opacity-90 mb-1">Total Pedidos</p>
                    <p className="text-3xl font-bold">
                      {reporteVentas.resumen.totalPedidos}
                    </p>
                    <p className="text-xs opacity-75 mt-2">Pedidos completados</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <p className="text-sm opacity-90 mb-1">Ticket Promedio</p>
                    <p className="text-3xl font-bold">
                      ₡{reporteVentas.resumen.ticketPromedio.toLocaleString()}
                    </p>
                    <p className="text-xs opacity-75 mt-2">Por pedido</p>
                  </div>
                </div>

                {/* Top Productos */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-burgundy-600" />
                    Top 5 Productos Más Vendidos
                  </h3>
                  <div className="space-y-3">
                    {reporteVentas.topProductos.map((producto, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-burgundy-600 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {producto.nombre}
                            </p>
                            <p className="text-sm text-gray-600">
                              {producto.cantidad} unidades vendidas
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-burgundy-900">
                          ₡{Number(producto.total).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ventas por Día */}
                {reporteVentas.ventasPorDia.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Ventas por Día
                    </h3>
                    <div className="space-y-2">
                      {reporteVentas.ventasPorDia.map((dia, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-sm text-gray-600">
                            {new Date(dia.fecha).toLocaleDateString('es-CR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          <span className="font-bold text-gray-900">
                            ₡{dia.total.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PanelGerenteScreen;