
import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { sinpeService } from '../services/sinpeService';

const SinpeSimulador = ({ total, telefonoDestino, onSuccess, onCancel }) => {
    const [step, setStep] = useState(1); 
    const [cuenta, setCuenta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transaccion, setTransaccion] = useState(null);
    const [codigo, setCodigo] = useState('');
    const [error, setError] = useState('');
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        loadCuenta();
    }, []);

    const loadCuenta = async () => {
        try {
            const data = await sinpeService.getMiCuenta();
            setCuenta(data);
        } catch (error) {
            console.error('Error cargando cuenta:', error);
            setError('Error cargando tu cuenta bancaria');
        } finally {
            setLoading(false);
        }
    };

  

    const handleIniciarTransferencia = async () => {
        if (cuenta.saldo < total) {
            setError(`Saldo insuficiente. Disponible: ₡${cuenta.saldo.toLocaleString()}`);
            return;
        }

        setProcesando(true);
        setError('');

        try {
            const resultado = await sinpeService.iniciarTransferencia({
                telefonoOrigen: cuenta.telefono,
                telefonoDestino: telefonoDestino,
                monto: total,
                descripcion: 'Pago pedido restaurante'
            });

            setTransaccion(resultado);
            setStep(2);

            console.log('Código de verificación:', resultado.codigo_verificacion);
            alert(`Código de verificación (DEMO): ${resultado.codigo_verificacion}`);

        } catch (error) {
            console.error('Error completo:', error);
            console.error('Response:', error.response);

           
            let mensajeError = 'Error al iniciar transferencia';

            if (error.response?.data) {
                const data = error.response.data;

                
                if (Array.isArray(data.detail)) {
                    mensajeError = data.detail.map(err => err.msg).join(', ');
                } else if (typeof data.detail === 'string') {
                    mensajeError = data.detail;
                } else if (data.message) {
                    mensajeError = data.message;
                }
            } else if (error.message) {
                mensajeError = error.message;
            }

            setError(mensajeError);
        } finally {
            setProcesando(false);
        }
    };

    const handleVerificarCodigo = async () => {
        if (codigo.length !== 6) {
            setError('Ingresa el código de 6 dígitos');
            return;
        }

        setProcesando(true);
        setError('');

        try {
            const resultado = await sinpeService.verificarCodigo({
                transaccionId: transaccion.transaccion_id,
                codigo: codigo
            });

            setStep(3);

            // Esperar 2 segundos y notificar éxito
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess({
                        comprobante: resultado.comprobante,
                        monto: resultado.monto
                    });
                }
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            setError(error.response?.data?.detail || 'Código incorrecto');
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
        );
    }

    if (!cuenta) {
        return (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-red-700 text-center">No se pudo cargar tu cuenta bancaria</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header simulador */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onCancel} className="p-1 hover:bg-white/20 rounded">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-lg">SINPE Móvil</h3>
                    <Shield className="w-5 h-5" />
                </div>
                <p className="text-sm opacity-90">{cuenta.banco}</p>
                <p className="text-xs opacity-75">Cuenta: {cuenta.numeroCuenta}</p>
            </div>

            {/* Paso 1: Confirmar transferencia */}
            {step === 1 && (
                <>
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-sm text-gray-600">Desde:</span>
                                <div className="text-right">
                                    <p className="font-semibold">{cuenta.telefono}</p>
                                    <p className="text-xs text-gray-500">{cuenta.banco}</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-sm text-gray-600">Para:</span>
                                <div className="text-right">
                                    <p className="font-semibold">{telefonoDestino}</p>
                                    <p className="text-xs text-gray-500">Restaurante</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pb-3 border-b">
                                <span className="text-sm text-gray-600">Monto:</span>
                                <p className="text-2xl font-bold text-burgundy-900">
                                    ₡{total.toLocaleString()}
                                </p>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Saldo disponible:</span>
                                <p className={`font-semibold ${cuenta.saldo >= total ? 'text-green-600' : 'text-red-600'}`}>
                                    ₡{cuenta.saldo.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleIniciarTransferencia}
                        disabled={procesando || cuenta.saldo < total}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {procesando ? 'Procesando...' : 'Transferir'}
                    </button>
                </>
            )}

            {/* Paso 2: Ingresar código */}
            {step === 2 && (
                <>
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-6 h-6 text-blue-600" />
                            <h3 className="font-bold text-blue-900">Código de Seguridad</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Ingresa el código de 6 dígitos enviado a tu teléfono {cuenta.telefono}
                        </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Código de verificación
                        </label>
                        <input
                            type="text"
                            value={codigo}
                            onChange={(e) => {
                                const valor = e.target.value.replace(/\D/g, '');
                                if (valor.length <= 6) setCodigo(valor);
                            }}
                            placeholder="000000"
                            maxLength="6"
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-3xl font-mono tracking-widest"
                            autoFocus
                        />
                    </div>

         
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            
                            <p className="text-sm">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-lg transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleVerificarCodigo}
                            disabled={procesando || codigo.length !== 6}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {procesando ? 'Verificando...' : 'Confirmar'}
                        </button>
                    </div>
                </>
            )}

            {/* Paso 3: Éxito */}
            {step === 3 && (
                <div className="text-center py-8">
                    <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-900 mb-2">
                        ¡Transferencia Exitosa!
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Se transfirieron ₡{total.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                        Comprobante: {transaccion?.comprobante}
                    </p>
                </div>
            )}
        </div>
    );
};

export default SinpeSimulador;