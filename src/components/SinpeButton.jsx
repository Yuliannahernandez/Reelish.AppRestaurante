
import { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

const SinpeButton = ({ total, nombreRestaurante = "Restaurante", onConfirm }) => {
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [telefono, setTelefono] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [step, setStep] = useState(1); 

  const SINPE_TELEFONO = "2590-5678"; 
  const SINPE_NOMBRE = "Reelish S.A."; 
  const SINPE_CEDULA = "3-101-123456"; 

  const copiarTelefono = () => {
    navigator.clipboard.writeText(SINPE_TELEFONO.replace('-', ''));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleContinuar = () => {
    if (!telefono || telefono.length < 8) {
      alert('Ingresa tu número de teléfono');
      return;
    }
    setStep(2);
  };

  const handleConfirmar = () => {
    if (!numeroComprobante || numeroComprobante.length < 8) {
      alert('Ingresa el número de comprobante SINPE (mínimo 8 dígitos)');
      return;
    }

    if (!confirm('¿Confirmas que realizaste el pago por SINPE?')) return;

    if (onConfirm) {
      onConfirm({
        comprobante: numeroComprobante,
        telefono: telefono
      });
    }
  };

  return (
    <div className="space-y-4">
      {step === 1 ? (
        <>
          {/* Instrucciones */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl">🇨🇷</span>
              <div>
                <h3 className="font-bold text-blue-900 mb-1">Pagar con SINPE Móvil</h3>
                <p className="text-sm text-gray-700">Sigue estos pasos para completar tu pago:</p>
              </div>
            </div>

            <div className="space-y-3 bg-white rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <p className="text-sm text-gray-700">Abre tu app bancaria (BAC, BCR, BN, etc.)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <p className="text-sm text-gray-700">Selecciona SINPE Móvil</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <p className="text-sm text-gray-700">Transfiere a este número:</p>
              </div>
            </div>

            {/* Número para copiar */}
            <div className="bg-white border-2 border-blue-400 rounded-lg p-4 mt-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-600">Transferir a:</p>
                  <p className="text-2xl font-bold text-blue-900">{SINPE_TELEFONO}</p>
                  <p className="text-sm text-gray-700">{SINPE_NOMBRE}</p>
                </div>
                <button
                  onClick={copiarTelefono}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  {copiado ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiado ? 'Copiado' : 'Copiar'}
                </button>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-gray-600">Monto a transferir:</p>
                <p className="text-3xl font-bold text-burgundy-900">₡{total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Input de teléfono */}
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu número de teléfono (desde donde transferiste)
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
              placeholder="88888888"
              maxLength="8"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 outline-none text-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa solo números, sin guiones</p>
          </div>

          <button
            onClick={handleContinuar}
            disabled={telefono.length < 8}
            className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ya transferí, continuar →
          </button>
        </>
      ) : (
        <>
          {/* Paso 2: Ingresar comprobante */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-green-900">Casi listo</h3>
            </div>
            <p className="text-sm text-gray-700">
              Ingresa el número de comprobante que aparece en tu app bancaria
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de comprobante SINPE
            </label>
            <input
              type="text"
              value={numeroComprobante}
              onChange={(e) => setNumeroComprobante(e.target.value.toUpperCase())}
              placeholder="Ej: 12345678"
              maxLength="20"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-burgundy-500 outline-none text-lg font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Generalmente son 8-12 dígitos/letras
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-full transition"
            >
              ← Volver
            </button>
            <button
              onClick={handleConfirmar}
              disabled={numeroComprobante.length < 8}
              className="flex-1 bg-burgundy-600 hover:bg-burgundy-700 text-white font-bold py-4 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SinpeButton;