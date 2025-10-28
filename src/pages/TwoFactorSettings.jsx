import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const TwoFactorSettings = () => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState('initial'); // initial, qr, verify, disable
  const [qrData, setQrData] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate2FA = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await authService.generate2FA();
      console.log('Respuesta 2FA:', response); // Para debug
      setQrData(response);
      setStep('qr');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar código QR');
      console.error('Error generando 2FA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.enable2FA(code);
      updateUser({ is2FAEnabled: true });
      setSuccess('2FA habilitado exitosamente');
      setStep('initial');
      setCode('');
      setQrData(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authService.disable2FA(code);
      updateUser({ is2FAEnabled: false });
      setSuccess('2FA deshabilitado exitosamente');
      setStep('initial');
      setCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-burgundy-800" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Autenticación de Dos Factores
            </h2>
            <p className="text-sm text-gray-600">
              Protege tu cuenta con una capa adicional de seguridad
            </p>
          </div>
        </div>

        {/* Estado Actual */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          user?.is2FAEnabled 
            ? 'bg-green-50 border-green-200' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.is2FAEnabled ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.is2FAEnabled ? '2FA Habilitado' : '2FA Deshabilitado'}
                </p>
                <p className="text-sm text-gray-600">
                  {user?.is2FAEnabled 
                    ? 'Tu cuenta está protegida con 2FA' 
                    : 'Habilita 2FA para mayor seguridad'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        {/* Vista Inicial */}
        {step === 'initial' && (
          <div className="space-y-4">
            {!user?.is2FAEnabled ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    ¿Cómo funciona?
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                    <li>Descarga Google Authenticator en tu teléfono</li>
                    <li>Escanea el código QR que generaremos</li>
                    <li>Ingresa el código de 6 dígitos para verificar</li>
                    <li>¡Listo! Tu cuenta estará protegida</li>
                  </ol>
                </div>
                <button
                  onClick={handleGenerate2FA}
                  disabled={loading}
                  className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Generando...' : 'Habilitar 2FA'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep('disable')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Deshabilitar 2FA
              </button>
            )}
          </div>
        )}

        {/* Vista QR Code */}
        {step === 'qr' && qrData && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-4">Escanea este código QR</h3>
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                 
                  <img 
                    src={qrData.qrCode} 
                    alt="QR Code for 2FA" 
                    className="w-64 h-64"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                O ingresa este código manualmente:
              </p>
              <code className="bg-gray-100 px-4 py-2 rounded text-sm font-mono break-all">
                {qrData.secret}
              </code>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Continuar
            </button>

            <button
              onClick={() => {
                setStep('initial');
                setQrData(null);
                setError('');
                setSuccess('');
              }}
              className="w-full text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Vista Verificar Código */}
        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa el código de 6 dígitos
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Ingresa el código que aparece en Google Authenticator
              </p>
            </div>

            <button
              onClick={handleEnable2FA}
              disabled={loading || code.length !== 6}
              className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar y Activar'}
            </button>

            <button
              onClick={() => {
                setStep('qr');
                setCode('');
                setError('');
              }}
              className="w-full text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Volver al código QR
            </button>
          </div>
        )}

        {/* Vista Deshabilitar */}
        {step === 'disable' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                <strong>Advertencia:</strong> Al deshabilitar 2FA, tu cuenta será menos segura.
                Necesitarás un código de verificación para confirmar.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingresa un código de verificación
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                  setError('');
                }}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <button
              onClick={handleDisable2FA}
              disabled={loading || code.length !== 6}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Deshabilitando...' : 'Confirmar y Deshabilitar'}
            </button>

            <button
              onClick={() => {
                setStep('initial');
                setCode('');
                setError('');
              }}
              className="w-full text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSettings;