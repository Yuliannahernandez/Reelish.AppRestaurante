
import { useState, useEffect } from 'react';
import { localidadesService } from '../services/localidadesService';
import { ChevronDown } from 'lucide-react';

const SelectorDireccion = ({ onDireccionChange, direccionInicial = null }) => {
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [cantonSeleccionado, setCantonSeleccionado] = useState('');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaises();
  }, []);

  const loadPaises = async () => {
    try {
      const data = await localidadesService.getPaises();
      setPaises(data);
    } catch (error) {
      console.error('Error cargando países:', error);
    }
  };

  const handlePaisChange = async (paisId) => {
    setPaisSeleccionado(paisId);
    setProvinciaSeleccionada('');
    setCantonSeleccionado('');
    setDistritoSeleccionado('');
    setCantones([]);
    setDistritos([]);

    if (!paisId) {
      setProvincias([]);
      return;
    }

    setLoading(true);
    try {
      const data = await localidadesService.getHijos(paisId);
      setProvincias(data);
    } catch (error) {
      console.error('Error cargando provincias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinciaChange = async (provinciaId) => {
    setProvinciaSeleccionada(provinciaId);
    setCantonSeleccionado('');
    setDistritoSeleccionado('');
    setDistritos([]);

    if (!provinciaId) {
      setCantones([]);
      return;
    }

    setLoading(true);
    try {
      const data = await localidadesService.getHijos(provinciaId);
      setCantones(data);
    } catch (error) {
      console.error('Error cargando cantones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCantonChange = async (cantonId) => {
    setCantonSeleccionado(cantonId);
    setDistritoSeleccionado('');

    if (!cantonId) {
      setDistritos([]);
      return;
    }

    setLoading(true);
    try {
      const data = await localidadesService.getHijos(cantonId);
      setDistritos(data);
    } catch (error) {
      console.error('Error cargando distritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistritoChange = (distritoId) => {
    setDistritoSeleccionado(distritoId);

    // Notificar al componente padre
    if (onDireccionChange) {
      onDireccionChange({
        paisId: paisSeleccionado,
        provinciaId: provinciaSeleccionada,
        cantonId: cantonSeleccionado,
        distritoId: distritoId
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* País */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          País *
        </label>
        <div className="relative">
          <select
            value={paisSeleccionado}
            onChange={(e) => handlePaisChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-burgundy-500 outline-none"
          >
            <option value="">Seleccione un país</option>
            {paises.map((pais) => (
              <option key={pais.id} value={pais.id}>
                {pais.descripcion}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Provincia */}
      {paisSeleccionado && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provincia *
          </label>
          <div className="relative">
            <select
              value={provinciaSeleccionada}
              onChange={(e) => handleProvinciaChange(e.target.value)}
              disabled={loading || provincias.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-burgundy-500 outline-none disabled:bg-gray-100"
            >
              <option value="">Seleccione una provincia</option>
              {provincias.map((provincia) => (
                <option key={provincia.id} value={provincia.id}>
                  {provincia.descripcion}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Cantón */}
      {provinciaSeleccionada && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantón *
          </label>
          <div className="relative">
            <select
              value={cantonSeleccionado}
              onChange={(e) => handleCantonChange(e.target.value)}
              disabled={loading || cantones.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-burgundy-500 outline-none disabled:bg-gray-100"
            >
              <option value="">Seleccione un cantón</option>
              {cantones.map((canton) => (
                <option key={canton.id} value={canton.id}>
                  {canton.descripcion}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Distrito */}
      {cantonSeleccionado && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distrito *
          </label>
          <div className="relative">
            <select
              value={distritoSeleccionado}
              onChange={(e) => handleDistritoChange(e.target.value)}
              disabled={loading || distritos.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-burgundy-500 outline-none disabled:bg-gray-100"
            >
              <option value="">Seleccione un distrito</option>
              {distritos.map((distrito) => (
                <option key={distrito.id} value={distrito.id}>
                  {distrito.descripcion}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectorDireccion;