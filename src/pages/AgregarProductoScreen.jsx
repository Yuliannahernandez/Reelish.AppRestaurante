import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, X, Loader } from 'lucide-react';
import { gerenteService } from '../services/gerenteService';
import { productosService } from '../services/productosService';

const AgregarProductoScreen = () => {
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
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
    esNuevo: true,
    enTendencia: false,
  });

  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [informacionNutricional, setInformacionNutricional] = useState({
    calorias: '',
    proteinas: '',
    carbohidratos: '',
    grasas: '',
    fibra: '',
    sodio: '',
    azucares: '',
    porcion: '',
  });

  const [previewImage, setPreviewImage] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cats, ings] = await Promise.all([
        productosService.getCategorias(),
        productosService.getIngredientes?.() || Promise.resolve([]),
      ]);
      setCategorias(cats);
      setIngredientes(ings);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      imagenPrincipal: url,
    }));
    setPreviewImage(url);
  };

  const handleNutricionalChange = (e) => {
    const { name, value } = e.target;
    setInformacionNutricional(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleIngrediente = (ingredienteId) => {
    setIngredientesSeleccionados(prev => {
      if (prev.includes(ingredienteId)) {
        return prev.filter(id => id !== ingredienteId);
      } else {
        return [...prev, ingredienteId];
      }
    });
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.precio || formData.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }
    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Debes seleccionar una categoría';
    }
    if (formData.tiempoPreparacion < 1) {
      newErrors.tiempoPreparacion = 'El tiempo debe ser al menos 1 minuto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const productoData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: Number(formData.precio),
        categoriaId: Number(formData.categoriaId),
        imagenPrincipal: formData.imagenPrincipal || null,
        disponible: formData.disponible,
        stock: Number(formData.stock),
        tiempoPreparacion: Number(formData.tiempoPreparacion),
        esNuevo: formData.esNuevo,
        enTendencia: formData.enTendencia,
      };

      await gerenteService.crearProducto(productoData);
      
      alert('Producto creado exitosamente');
      navigate('/panel-gerente');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'Error al crear producto');
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
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-burgundy-700 to-burgundy-900 text-white py-6 px-6 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/panel-gerente')}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Agregar Nuevo Producto</h1>
            <p className="text-amber-200 text-sm">Completa todos los campos requeridos</p>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sección 1: Información Básica */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-burgundy-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              Información Básica
            </h2>

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Hamburguesa Clásica"
                />
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition resize-none"
                  placeholder="Describe el producto, ingredientes especiales, recomendaciones..."
                />
              </div>

              {/* Precio y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio (₡) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₡</span>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition ${
                        errors.precio ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5000.00"
                    />
                  </div>
                  {errors.precio && <p className="text-red-500 text-sm mt-1">{errors.precio}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition ${
                      errors.categoriaId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.categoriaId && <p className="text-red-500 text-sm mt-1">{errors.categoriaId}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Stock y Preparación */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-burgundy-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              Stock y Tiempo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tiempo de Preparación (minutos) *
                </label>
                <input
                  type="number"
                  name="tiempoPreparacion"
                  value={formData.tiempoPreparacion}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition ${
                    errors.tiempoPreparacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="15"
                />
                {errors.tiempoPreparacion && <p className="text-red-500 text-sm mt-1">{errors.tiempoPreparacion}</p>}
              </div>
            </div>
          </div>

          {/* Sección 3: Imagen */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-burgundy-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              Imagen del Producto
            </h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de la Imagen
              </label>
              <input
                type="url"
                name="imagenPrincipal"
                value={formData.imagenPrincipal}
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Ingresa la URL completa de la imagen</p>
            </div>

            {previewImage && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</p>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sección 4: Información Nutricional */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-burgundy-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              Información Nutricional (Opcional)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Calorías</label>
                <input
                  type="number"
                  name="calorias"
                  value={informacionNutricional.calorias}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Proteínas (g)</label>
                <input
                  type="number"
                  name="proteinas"
                  value={informacionNutricional.proteinas}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Carbohidratos (g)</label>
                <input
                  type="number"
                  name="carbohidratos"
                  value={informacionNutricional.carbohidratos}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Grasas (g)</label>
                <input
                  type="number"
                  name="grasas"
                  value={informacionNutricional.grasas}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Fibra (g)</label>
                <input
                  type="number"
                  name="fibra"
                  value={informacionNutricional.fibra}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sodio (mg)</label>
                <input
                  type="number"
                  name="sodio"
                  value={informacionNutricional.sodio}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Azúcares (g)</label>
                <input
                  type="number"
                  name="azucares"
                  value={informacionNutricional.azucares}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Porción</label>
                <input
                  type="text"
                  name="porcion"
                  value={informacionNutricional.porcion}
                  onChange={handleNutricionalChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-burgundy-500"
                  placeholder="1 porción"
                />
              </div>
            </div>
          </div>

          {/* Sección 5: Estado del Producto */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-burgundy-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-burgundy-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
              Estado del Producto
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
                />
                <span className="text-gray-700 font-medium">Disponible para la venta</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="esNuevo"
                  checked={formData.esNuevo}
                  onChange={handleChange}
                  className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Marcar como Nuevo</span>
                  <p className="text-xs text-gray-500">Aparecerá en la sección de productos nuevos</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  name="enTendencia"
                  checked={formData.enTendencia}
                  onChange={handleChange}
                  className="w-5 h-5 text-burgundy-600 rounded focus:ring-2 focus:ring-burgundy-500"
                />
                <div>
                  <span className="text-gray-700 font-medium">Marcar en Tendencia</span>
                  <p className="text-xs text-gray-500">Se destacará en el inicio con un badge especial</p>
                </div>
              </label>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4">
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
                  Crear Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarProductoScreen;