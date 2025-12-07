import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png';

const LoginScreen = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        correo: '',
        password: '',
        twoFACode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [requiresVerification, setRequiresVerification] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setResendSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setResendSuccess(false);

        try {
            const result = await login(formData);

            // Manejar verificación de email
            if (result.requiresVerification) {
                setRequiresVerification(true);
                setVerificationEmail(result.correo || formData.correo);
                setLoading(false);
                return;
            }

            // Manejar 2FA
            if (result.requires2FA) {
                setRequires2FA(true);
                setLoading(false);
                return;
            }

            // Login exitoso - redirigir según rol
            const user = result.user;
            if (user.rol === 'gerente') {
                navigate('/panel-gerente');
            } else if (user.rol === 'cliente') {
                navigate('/home');
            } else if (user.rol === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/home');
            }
        } catch (err) {
            console.error('Error completo:', err);
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            setError('');
            setResendSuccess(false);

            await authService.resendVerification(verificationEmail);
            
            setResendSuccess(true);
        } catch (err) {
            console.error('Error al reenviar:', err);
            setError(err.response?.data?.message || 'Error al reenviar el email');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
    try {
        setLoading(true);
        
        // DEBUG
        console.log('🔐 Intentando login con Google...');
        console.log('🔗 URL base:', import.meta.env.VITE_API_URL);
        
        // Llamar directamente con fetch en lugar de axios
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/google/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ googleToken: credentialResponse.credential }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Error al iniciar sesión');
        }
        
        localStorage.setItem('token', result.token);
        
        const user = result.user;
        if (user.rol === 'gerente') {
            navigate('/panel-gerente');
        } else if (user.rol === 'cliente') {
            navigate('/home');
        } else if (user.rol === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/home');
        }
    } catch (err) {
        console.error('Error con Google:', err);
        setError(err.message || 'Error con Google');
    } finally {
        setLoading(false);
    }
};

    const handleGoogleError = () => {
        setError('Error al iniciar sesión con Google');
    };

    const handleBackToLogin = () => {
        setRequiresVerification(false);
        setRequires2FA(false);
        setError('');
        setResendSuccess(false);
        setFormData({ correo: '', password: '', twoFACode: '' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900">
            <div className="bg-burgundy-800 pt-12 pb-8 text-center">
                <div className="flex justify-center">
                    <img
                        src={logoImage}
                        alt="Logo Reelish"
                        className="w-32 h-auto" 
                    />
                </div>
            </div>

            <div className="bg-white rounded-tl-[60px] mt-4 px-8 py-8 min-h-[calc(100vh-180px)]">
                <h2 className="text-2xl font-bold text-burgundy-900 mb-2">
                    {requires2FA 
                        ? 'Código de Verificación' 
                        : requiresVerification
                        ? 'Verifica tu correo'
                        : 'Iniciar Sesión'
                    }
                </h2>
                <p className="text-gray-600 mb-6">
                    {requires2FA 
                        ? 'Ingresa el código de tu aplicación de autenticación.'
                        : requiresVerification
                        ? 'Debes verificar tu correo antes de iniciar sesión.'
                        : 'Ingresa tu correo y contraseña para iniciar sesión.'
                    }
                </p>

                {/* Mensaje de verificación pendiente */}
                {requiresVerification && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-yellow-800 text-sm font-medium mb-2">
                                    Correo no verificado
                                </p>
                                <p className="text-yellow-700 text-sm mb-3">
                                    Se envió un correo de verificación a <strong>{verificationEmail}</strong>
                                </p>
                                <p className="text-yellow-600 text-xs mb-4">
                                    Revisa tu bandeja de entrada (y spam) y haz clic en el enlace para verificar tu cuenta.
                                </p>
                                <button
                                    onClick={handleResendVerification}
                                    disabled={loading}
                                    className="text-burgundy-700 hover:text-burgundy-900 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Enviando...' : 'Reenviar correo de verificación'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensaje de éxito al reenviar */}
                {resendSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <p className="text-green-700 text-sm">
                            Email de verificación enviado exitosamente. Revisa tu bandeja de entrada.
                        </p>
                    </div>
                )}

                {/* Mensaje de error */}
                {error && !requiresVerification && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Error durante reenvío */}
                {error && requiresVerification && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Formulario de login */}
                {!requiresVerification && (
                    <>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!requires2FA ? (
                                <>
                                    <div>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                name="correo"
                                                placeholder="email@domain.com"
                                                value={formData.correo}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="password"
                                                name="password"
                                                placeholder="••••••••••••"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="twoFACode"
                                            placeholder="000000"
                                            value={formData.twoFACode}
                                            onChange={handleChange}
                                            required
                                            maxLength={6}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-burgundy-800 hover:bg-burgundy-900 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Cargando...' : 'Continuar'}
                            </button>
                        </form>

                        {requires2FA && (
                            <button
                                onClick={() => {
                                    setRequires2FA(false);
                                    setFormData({ ...formData, twoFACode: '' });
                                }}
                                className="w-full mt-4 text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
                            >
                                ← Volver al inicio de sesión
                            </button>
                        )}

                        {!requires2FA && (
                            <>
                                <div className="mt-6 text-center">
                                    <Link
                                        to="/forgot-password"
                                        className="text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                 <div className="mt-6 text-center">
                                    <Link
                                        to="/find-account"
                                        className="text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
                                    >
                                        ¿Olvidaste tu cuenta?
                                    </Link>
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">o continuar con</span>
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        useOneTap
                                        theme="outline"
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                    />
                                </div>

                                <div className="mt-8 text-center">
                                    <span className="text-gray-600">¿No tienes cuenta? </span>
                                    <Link
                                        to="/register"
                                        className="text-burgundy-700 hover:text-burgundy-900 font-medium"
                                    >
                                        Regístrate aquí
                                    </Link>
                                </div>

                                <p className="mt-6 text-xs text-gray-500 text-center">
                                    Al continuar, aceptas nuestros{' '}
                                    <a href="#" className="underline">Términos de Servicio</a>
                                    {' '}y{' '}
                                    <a href="#" className="underline">Política de Privacidad</a>
                                </p>
                            </>
                        )}
                    </>
                )}

                {/* Botón para volver desde verificación */}
                {requiresVerification && (
                    <button
                        onClick={handleBackToLogin}
                        className="w-full mt-4 text-burgundy-700 hover:text-burgundy-900 text-sm font-medium"
                    >
                        ← Volver al inicio de sesión
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginScreen;