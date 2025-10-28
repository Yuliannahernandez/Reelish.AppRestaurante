import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { gerenteService } from '../services/gerenteService';
import { productosService } from '../services/productosService';

const EditarProductoScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoriaId: '',
    imagenPrincipal: '',
    disponible: true,
    stock: 0,
    tiempoPreparacion: 15,
    esNuevo: false,
    enTendencia: false,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const cats = await productosService.getCategorias();
      setCategorias(cats);

      if (!isNew) {
        const producto = await productosService.getProductoDetalle(id);
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion || '',
          precio: producto.precio,
          categoriaId: producto.categoriaId,
          imagenPrincipal: producto.imagenPrincipal || '',
          disponible: producto.disponible ?? true,
          stock: producto.stock || 0,
          tiempoPreparacion: producto.tiempoPreparacion || 15,
          esNuevo: producto.esNuevo || false,
          enTendencia: producto.enTendencia || false,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }
    if (!formData.precio || formData.precio <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }
    if (!formData.categoriaId) {
      alert('Debes seleccionar una categoría');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        precio: Number(formData.precio),
        categoriaId: Number(formData.categoriaId),
        stock: Number(formData.stock),
        tiempoPreparacion: Number(formData.tiempoPreparacion),
      };

      if (isNew) {
        await gerenteService.crearProducto(data);
        alert('Producto creado exitosamente');
      } else {
        await gerenteService.actualizarProducto(id, data);
        alert('Producto actualizado exitosamente');
      }

      navigate('/panel-gerente');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white py-6 px-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/panel-gerente')}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">
            {isNew ? 'Nuevo Producto' : 'Editar Producto'}
          </h1>
        </div>
      </div>

      {/* Formulario */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
              placeholder="Ej: Hamburguesa Clásica"
              required
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent resize-none"
              placeholder="Describe el producto..."
            />
          </div>

          {/* Precio y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio (₡) *
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar...</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock y Tiempo de Preparación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tiempo de Preparación (min)
              </label>
              <input
                type="number"
                name="tiempoPreparacion"
                value={formData.tiempoPreparacion}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
                placeholder="15"
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL de Imagen
            </label>
            <input
              type="url"
              name="imagenPrincipal"
              value={formData.imagenPrincipal}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.imagenPrincipal && (
              <div className="mt-3">
                <img
                  src={formData.imagenPrincipal}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="disponible"
                checked={formData.disponible}
                onChange={handleChange}
                className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
              />
              <span className="text-gray-700 font-medium">Disponible para la venta</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="esNuevo"
                checked={formData.esNuevo}
                onChange={handleChange}
                className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
              />
              <span className="text-gray-700 font-medium">Marcar como Nuevo</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="enTendencia"
                checked={formData.enTendencia}
                onChange={handleChange}
                className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
              />
              <span className="text-gray-700 font-medium">Marcar en Tendencia</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/panel-gerente')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isNew ? 'Crear Producto' : 'Guardar Cambios'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProductoScreen;