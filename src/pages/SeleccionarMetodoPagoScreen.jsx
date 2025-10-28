import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Banknote, Check, Plus, Star, Trash2 } from 'lucide-react';
import { profileService } from '../services/profileService';
import { carritoService } from '../services/carritoService';

const SeleccionarMetodoPagoScreen = () => {
  const navigate = useNavigate();
  const [metodos, setMetodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    loadMetodosPago();
    // Cargar el método previamente seleccionado
    const metodoGuardado = localStorage.getItem('metodoPagoSeleccionado');
    if (metodoGuardado) {
      const metodo = JSON.parse(metodoGuardado);
      setSeleccionado(metodo.id);
    }
  }, []);

  const loadMetodosPago = async () => {
    try {
      const data = await profileService.getMetodosPago();
      
      // Agregar opción de efectivo al inicio
      const efectivo = {
        id: 'efectivo',
        tipo: 'efectivo',
        alias: 'Efectivo',
        descripcion: 'Paga en efectivo al recoger tu pedido',
        esPrincipal: false,
      };
      
      setMetodos([efectivo, ...data]);
      
      // Si no hay método seleccionado, seleccionar el principal
      const metodoGuardado = localStorage.getItem('metodoPagoSeleccionado');
      if (!metodoGuardado) {
        const principal = data.find(m => m.esPrincipal);
        if (principal) {
          setSeleccionado(principal.id);
        } else {
          setSeleccionado('efectivo'); // Por defecto efectivo
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este método de pago?')) return;
    
    try {
      await profileService.deleteMetodoPago(id);
      await loadMetodosPago();
      
      // Si eliminamos el método seleccionado, cambiar a efectivo
      if (seleccionado === id) {
        setSeleccionado('efectivo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar método de pago');
    }
  };

  const handleConfirmar = async () => {
  if (!seleccionado && seleccionado !== 'efectivo') {
    alert('Por favor selecciona un método de pago');
    return;
  }
  
  try {
    // Guardar en localStorage (mantener para referencia local)
    const metodoSeleccionado = metodos.find(m => m.id === seleccionado);
    localStorage.setItem('metodoPagoSeleccionado', JSON.stringify(metodoSeleccionado));
    
    // Guardar en el backend
    if (seleccionado !== 'efectivo') {
      await carritoService.seleccionarMetodoPago(seleccionado);
    } else {
      
      await carritoService.seleccionarMetodoPago('efectivo');
    }
    
    navigate('/carrito');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al seleccionar método de pago');
  }
};
  const getIconoTarjeta = (marca) => {
    const iconos = {
      'visa': '',
      'mastercard': '',
      'amex': '',
    };
    return iconos[marca?.toLowerCase()] || '';
  };

  const formatExpiry = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getFullYear()).slice(-2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-burgundy-900">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-burgundy-600 text-white py-4 px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/carrito')} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-italic">MÉTODO DE PAGO</h1>
        </div>
      </div>

      <div className="px-6 py-6">
        <p className="text-gray-600 mb-6">
          Selecciona cómo quieres pagar tu pedido
        </p>

        {/* Lista de métodos de pago */}
        <div className="space-y-3 mb-4">
          {metodos.map((metodo) => (
            <div
              key={metodo.id}
              onClick={() => setSeleccionado(metodo.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                seleccionado === metodo.id
                  ? 'border-burgundy-600 bg-burgundy-50'
                  : 'border-gray-200 bg-white hover:border-burgundy-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {metodo.tipo === 'efectivo' ? (
                    <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                      <Banknote className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <div className="bg-burgundy-100 p-2 rounded-full flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-burgundy-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-burgundy-900">
                        {metodo.alias || (metodo.tipo === 'efectivo' ? 'Efectivo' : 'Tarjeta')}
                      </h3>
                      {metodo.esPrincipal && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Principal
                        </span>
                      )}
                    </div>
                    
                    {metodo.tipo === 'efectivo' ? (
                      <p className="text-sm text-gray-600 mt-1">
                        Paga en efectivo al recoger tu pedido
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mt-1">
                          {getIconoTarjeta(metodo.marca)} {metodo.marca?.toUpperCase()} •••• {metodo.ultimosDigitos}
                        </p>
                        {metodo.nombreTitular && (
                          <p className="text-xs text-gray-500">{metodo.nombreTitular}</p>
                        )}
                        {metodo.fechaExpiracion && (
                          <p className="text-xs text-gray-500">Vence: {formatExpiry(metodo.fechaExpiracion)}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {metodo.id !== 'efectivo' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminar(metodo.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  {seleccionado === metodo.id && (
                    <div className="bg-burgundy-600 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón agregar nueva tarjeta */}
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-burgundy-600 hover:text-burgundy-600 transition flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar nueva tarjeta</span>
        </button>
      </div>

      {/* Botón confirmar fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={handleConfirmar}
          disabled={!seleccionado && seleccionado !== 'efectivo'}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-italic py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Confirmar método de pago
        </button>
      </div>

      {/* Modal formulario agregar tarjeta */}
      {mostrarFormulario && (
        <FormularioTarjeta
          onClose={() => setMostrarFormulario(false)}
          onSuccess={() => {
            setMostrarFormulario(false);
            loadMetodosPago();
          }}
        />
      )}
    </div>
  );
};

// Componente para agregar tarjeta
const FormularioTarjeta = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    tipo: 'tarjeta_credito',
    alias: '',
    marca: 'visa',
    ultimosDigitos: '',
    nombreTitular: '',
    fechaExpiracion: '',
    esPrincipal: false,
  });
  const [guardando, setGuardando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ultimosDigitos || formData.ultimosDigitos.length !== 4) {
      alert('Ingresa los últimos 4 dígitos de la tarjeta');
      return;
    }

    if (!formData.nombreTitular.trim()) {
      alert('Ingresa el nombre del titular');
      return;
    }

    try {
      setGuardando(true);
      await profileService.createMetodoPago(formData);
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar tarjeta');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-burgundy-900 mb-4">Agregar Tarjeta</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de tarjeta
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            >
              <option value="tarjeta_credito">Tarjeta de crédito</option>
              <option value="tarjeta_debito">Tarjeta de débito</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <select
              value={formData.marca}
              onChange={(e) => setFormData({...formData, marca: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Últimos 4 dígitos *
            </label>
            <input
              type="text"
              maxLength="4"
              pattern="[0-9]{4}"
              value={formData.ultimosDigitos}
              onChange={(e) => setFormData({...formData, ultimosDigitos: e.target.value.replace(/\D/g, '')})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              placeholder="1234"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del titular *
            </label>
            <input
              type="text"
              value={formData.nombreTitular}
              onChange={(e) => setFormData({...formData, nombreTitular: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              placeholder="Nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de expiración
            </label>
            <input
              type="date"
              value={formData.fechaExpiracion}
              onChange={(e) => setFormData({...formData, fechaExpiracion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alias (opcional)
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => setFormData({...formData, alias: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500"
              placeholder="Ej: Mi tarjeta personal"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="principal"
              checked={formData.esPrincipal}
              onChange={(e) => setFormData({...formData, esPrincipal: e.target.checked})}
              className="w-4 h-4 text-burgundy-600 border-gray-300 rounded focus:ring-burgundy-500"
            />
            <label htmlFor="principal" className="text-sm text-gray-700">
              Establecer como método principal
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 px-4 py-2 bg-burgundy-600 text-white rounded-lg hover:bg-burgundy-700 transition disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeleccionarMetodoPagoScreen;