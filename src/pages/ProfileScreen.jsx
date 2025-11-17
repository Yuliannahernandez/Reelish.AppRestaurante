// ProfileScreen.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  User,
  Calendar,
  Mail,
  Lock,
  Phone,
  MapPin,
  CreditCard,
  MessageSquare,
  Heart,
  UserCircle2,
  Edit2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Camera,
  Shield,
} from 'lucide-react';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import SelectorDireccion from '../components/SelectorDireccion';

const ProfileScreen = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [direccion, setDireccion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    edad: '',
    fechaNacimiento: '',
  });

  const [activeTab, setActiveTab] = useState('perfil');

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();

      if (!data) {
        throw new Error('No se encontró el perfil');
      }

      setProfile(data);
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        telefono: data.telefono || '',
        edad: data.edad || '',
        fechaNacimiento: data.fechaNacimiento || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccess('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      nombre: profile.nombre || '',
      apellido: profile.apellido || '',
      telefono: profile.telefono || '',
      edad: profile.edad || '',
      fechaNacimiento: profile.fechaNacimiento || '',
    });
    setError('');
    setSuccess('');
  };

  const handleDireccionChange = (nuevaDireccion) => {
    setDireccion(nuevaDireccion);
    console.log('Dirección seleccionada:', nuevaDireccion);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  const handleSave = async () => {
  setError('');
  setSuccess('');
  setSaving(true);

  try {
    const updateData = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      telefono: formData.telefono,
    };

    if (formData.edad) {
      updateData.edad = parseInt(formData.edad);
    }

    if (formData.fechaNacimiento) {
      updateData.fechaNacimiento = formData.fechaNacimiento;
    }

    // Agregar dirección si fue seleccionada
    if (direccion && direccion.distritoId) {
      updateData.localidadId = parseInt(direccion.distritoId); 
    }

    console.log(' Datos a enviar:', updateData); 

    await profileService.updateProfile(updateData);
    await loadProfile();
    setIsEditing(false);
    setSuccess('Perfil actualizado correctamente');

    setTimeout(() => setSuccess(''), 3000);
  } catch (err) {
    setError(err.response?.data?.message || 'Error al actualizar el perfil');
  } finally {
    setSaving(false);
  }
};

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await profileService.updateProfilePhoto(file);
      await loadProfile();
      setSuccess('Foto actualizada correctamente');
    } catch (err) {
      setError('Error al subir la foto');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-900 pb-24">

      {/* Header minimalista con botón de regreso */}
      <div className="relative px-6 pt-8 pb-6">
        <button
          onClick={() => navigate('/home')}
          className="absolute left-6 top-8 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <h1 className="text-center text-2xl font-light text-white tracking-wide">
          Mi Perfil
        </h1>
      </div>

      {/* Foto de perfil con diseño flotante */}
      <div className="flex justify-center mb-8 relative">
        <div className="relative group">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              {profile?.fotoPerfil ? (
                <img
                  src={profile.fotoPerfil ? `http://localhost:3000/uploads/${profile.fotoPerfil}` : '/default-profile.png'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="w-28 h-28 text-burgundy-300" />
              )}
            </div>
          </div>

          {isEditing && (
            <>
              <label
                htmlFor="fotoPerfil"
                className="absolute bottom-2 right-2 bg-yellow-500 text-white p-3 rounded-full shadow-xl cursor-pointer hover:bg-yellow-600 transition-all hover:scale-110"
              >
                <Camera className="w-5 h-5" />
              </label>
              <input
                type="file"
                id="fotoPerfil"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={handleEdit}
            className="absolute right-8 top-0 bg-white text-burgundy-800 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-medium">Editar</span>
          </button>
        )}
      </div>

      {/* Contenedor principal con diseño de tarjetas */}
      <div className="px-6 space-y-4">

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">{success}</p>
          </div>
        )}

        {/* Tarjeta de información personal */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 space-y-4">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">NOMBRE</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 transition-all border-2 ${isEditing
                    ? 'bg-white border-burgundy-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200'
                    : 'bg-gray-50 border-transparent'
                  }`}
              />
            </div>
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">APELLIDO</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 transition-all border-2 ${isEditing
                    ? 'bg-white border-burgundy-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200'
                    : 'bg-gray-50 border-transparent'
                  }`}
              />
            </div>
          </div>

          {/* Grid para Edad y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">EDAD</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  min="1"
                  max="120"
                  placeholder="Edad"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 transition-all border-2 ${isEditing
                      ? 'bg-white border-burgundy-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200'
                      : 'bg-gray-50 border-transparent'
                    }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">NACIMIENTO</label>
              <div className="relative">
                <input
                  type="date"
                  name="fechaNacimiento"
                  value={formData.fechaNacimiento}
                  onChange={handleChange}
                  readOnly={!isEditing}
                  className={`w-full px-4 py-3.5 rounded-xl text-gray-800 transition-all border-2 ${isEditing
                      ? 'bg-white border-burgundy-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200'
                      : 'bg-gray-50 border-transparent'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tarjeta de contacto */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6 space-y-4">

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">CORREO ELECTRÓNICO</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
              <input
                type="email"
                value={profile?.correo || ''}
                readOnly
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-gray-800 border-2 border-transparent"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">CONTRASEÑA</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
              <input
                type="password"
                value="••••••••••••"
                readOnly
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-gray-800 border-2 border-transparent"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-medium text-burgundy-600 mb-2 ml-1">TELÉFONO</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-burgundy-400 w-5 h-5" />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                readOnly={!isEditing}
                placeholder="+506-0000-0000"
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 transition-all border-2 ${isEditing
                    ? 'bg-white border-burgundy-300 focus:border-burgundy-500 focus:ring-2 focus:ring-burgundy-200'
                    : 'bg-gray-50 border-transparent'
                  }`}
              />
            </div>
          </div>
        </div>

        {/* SELECTOR DE DIRECCIÓN */}
        {isEditing && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6">
            <label className="block text-xs font-medium text-burgundy-600 mb-4 ml-1">DIRECCIÓN</label>
            <SelectorDireccion 
              onDireccionChange={handleDireccionChange}
              direccionInicial={profile?.localidadId}
            />
          </div>
        )}

        {/* Tarjeta de seguridad 2FA */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${user?.is2FAEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Shield className={`w-6 h-6 ${user?.is2FAEnabled ? 'text-green-600' : 'text-gray-500'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Autenticación 2FA</h3>
                <p className="text-sm text-gray-500">
                  {user?.is2FAEnabled ? 'Activada' : 'Desactivada'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/seguridad/2fa')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                user?.is2FAEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-burgundy-100 text-burgundy-700 hover:bg-burgundy-200'
              }`}
            >
              {user?.is2FAEnabled ? 'Configurar' : 'Activar'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-burgundy-600 hover:bg-burgundy-700 text-white font-medium py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión
        </button>

        {/* Botones de acción cuando está editando */}
        {isEditing && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 bg-white text-burgundy-800 font-medium py-4 rounded-2xl transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-burgundy-700 to-burgundy-900 hover:from-burgundy-800 hover:to-burgundy-950 text-white font-medium py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {saving ? (
                'Guardando...'
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navegación inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto px-6 py-4">
          <button onClick={() => handleNavigation('direcciones')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'direcciones' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'direcciones' ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg' : 'bg-gray-100'}`}>
              <MapPin className={`w-5 h-5 ${activeTab === 'direcciones' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs ${activeTab === 'direcciones' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}>Direcciones</span>
          </button>

          <button onClick={() => handleNavigation('metodospago')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'metodospago' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'metodospago' ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg' : 'bg-gray-100'}`}>
              <CreditCard className={`w-5 h-5 ${activeTab === 'metodospago' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs ${activeTab === 'metodospago' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}>Pagos</span>
          </button>

          <button onClick={() => handleNavigation('idioma')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'idioma' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'idioma' ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg' : 'bg-gray-100'}`}>
              <MessageSquare className={`w-5 h-5 ${activeTab === 'idioma' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs ${activeTab === 'idioma' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}>Idioma</span>
          </button>

          <button onClick={() => handleNavigation('condicionessalud')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'condicionessalud' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'condicionessalud' ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg' : 'bg-gray-100'}`}>
              <Heart className={`w-5 h-5 ${activeTab === 'condicionessalud' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs ${activeTab === 'condicionessalud' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}>Salud</span>
          </button>

          <button onClick={() => handleNavigation('perfil')} className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${activeTab === 'perfil' ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}>
            <div className={`p-2.5 rounded-2xl transition-all ${activeTab === 'perfil' ? 'bg-gradient-to-br from-burgundy-700 to-burgundy-900 shadow-lg' : 'bg-gray-100'}`}>
              <User className={`w-5 h-5 ${activeTab === 'perfil' ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className={`text-xs ${activeTab === 'perfil' ? 'text-burgundy-800 font-medium' : 'text-gray-500'}`}>Perfil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;