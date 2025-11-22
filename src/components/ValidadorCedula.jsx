// frontend/src/components/ValidadorCedula.jsx
import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, User, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { tseService } from '../services/tseService';

const ValidadorCedula = ({ onCedulaValidada, mostrarCedulasPrueba = true }) => {
  const [cedula, setCedula] = useState('');
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [cedulasPrueba, setCedulasPrueba] = useState([]);
  const [mostrarPruebas, setMostrarPruebas] = useState(false);

  useEffect(() => {
    if (mostrarCedulasPrueba) {
      cargarCedulasPrueba();
    }
  }, []);

  const cargarCedulasPrueba = async () => {
    try {
      const data = await tseService.getCedulasPrueba();
      setCedulasPrueba(data.cedulas_prueba || []);
    } catch (error) {
      console.error('Error cargando cédulas de prueba:', error);
    }
  };

  const formatearCedula = (valor) => {
    // Remover todo lo que no sea número
    let numeros = valor.replace(/\D/g, '');
    
    // Limitar a 12 dígitos
    numeros = numeros.slice(0, 12);
    
    // Formatear según longitud
    if (numeros.length <= 9) {
      // Cédula física: X-XXXX-XXXX
      if (numeros.length > 5) {
        return `${numeros[0]}-${numeros.slice(1, 5)}-${numeros.slice(5)}`;
      } else if (numeros.length > 1) {
        return `${numeros[0]}-${numeros.slice(1)}`;
      }
      return numeros;
    } else {
      // Cédula de extranjero: sin formato
      return numeros;
    }
  };

  const handleCedulaChange = (e) => {
    const valor = e.target.value;
    const formateado = formatearCedula(valor);
    setCedula(formateado);
    setResultado(null);
  };

  const handleValidar = async () => {
    if (!cedula) {
      alert('Por favor ingresa un número de cédula');
      return;
    }

    setValidando(true);
    setResultado(null);

    try {
      const data = await tseService.validarCedula(cedula);
      
      setResultado(data);
      
      if (data.valida && onCedulaValidada) {
        onCedulaValidada(data.datos);
      }
    } catch (error) {
      console.error('Error validando cédula:', error);
      setResultado({
        valida: false,
        mensaje: 'Error al validar la cédula',
        datos: null
      });
    } finally {
      setValidando(false);
    }
  };

  const usarCedulaPrueba = (cedulaPrueba) => {
    setCedula(cedulaPrueba.numero);
    setMostrarPruebas(false);
    setTimeout(() => {
      handleValidar();
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            🇨🇷
          </div>
          <div>
            <h3 className="text-lg font-bold text-burgundy-900">
              Validador TSE
            </h3>
            <p className="text-xs text-gray-600">
              Tribunal Supremo de Elecciones
            </p>
          </div>
        </div>

        {mostrarCedulasPrueba && (
          <button
            onClick={() => setMostrarPruebas(!mostrarPruebas)}
            className="text-sm text-blue-700 hover:text-blue-900 font-semibold"
          >
            {mostrarPruebas ? '✕ Cerrar' : ' Cédulas de prueba'}
          </button>
        )}
      </div>

      {/* Cédulas de prueba */}
      {mostrarPruebas && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900 mb-2">
            Cédulas de prueba disponibles:
          </p>
          {cedulasPrueba.map((cedula, index) => (
            <button
              key={index}
              onClick={() => usarCedulaPrueba(cedula)}
              className="w-full text-left bg-white border border-blue-200 rounded-lg p-3 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-blue-900">{cedula.numero}</p>
                  <p className="text-sm text-gray-700">{cedula.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {cedula.estado} - {cedula.descripcion}
                  </p>
                </div>
                <span className="text-blue-600 text-sm font-semibold">Usar →</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Input de cédula */}
      <div>
        <label className="block text-sm font-semibold text-burgundy-900 mb-2">
          Número de cédula
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={cedula}
              onChange={handleCedulaChange}
              placeholder="1-0111-0111"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleValidar}
            disabled={validando || !cedula}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {validando ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Validando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Validar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`rounded-xl p-4 border-2 ${
          resultado.valida 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {resultado.valida ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            )}
            
            <div className="flex-1">
              <p className={`font-bold text-lg mb-2 ${
                resultado.valida ? 'text-green-900' : 'text-red-900'
              }`}>
                {resultado.mensaje}
              </p>

              {resultado.valida && resultado.datos && (
                <div className="space-y-3 mt-4">
                  {/* Nombre completo */}
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Nombre completo</p>
                    <p className="font-bold text-green-900 text-lg">
                      {resultado.datos.nombre_completo}
                    </p>
                  </div>

                  {/* Grid de información */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Cédula */}
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Cédula</p>
                      </div>
                      <p className="font-semibold text-green-900">
                        {resultado.datos.formato_cedula}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resultado.datos.tipo_documento}
                      </p>
                    </div>

                    {/* Edad */}
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Edad</p>
                      </div>
                      <p className="font-semibold text-green-900">
                        {resultado.datos.edad} años
                      </p>
                      <p className="text-xs text-gray-500">
                        Nacido: {resultado.datos.fecha_nacimiento}
                      </p>
                    </div>

                    {/* Provincia */}
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        <p className="text-xs text-gray-600">Ubicación</p>
                      </div>
                      <p className="font-semibold text-green-900">
                        {resultado.datos.provincia}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resultado.datos.canton}, {resultado.datos.distrito}
                      </p>
                    </div>

                    {/* Nacionalidad */}
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm"></span>
                        <p className="text-xs text-gray-600">Nacionalidad</p>
                      </div>
                      <p className="font-semibold text-green-900">
                        {resultado.datos.nacionalidad}
                      </p>
                      <p className="text-xs text-gray-500">
                        {resultado.datos.estado_civil}
                      </p>
                    </div>
                  </div>

                  {/* Vencimiento */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo */}
      <p className="text-xs text-gray-500 text-center">
        🇨🇷 Sistema simulado del TSE para desarrollo. Los datos son ficticios.
      </p>
    </div>
  );
};

export default ValidadorCedula;