import { useState, useEffect, useMemo } from 'react';
import { Camera, Save, ArrowLeft, User, Mail, Phone, Lock, Globe, CheckCircle2, Sparkles, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { updateUserProfile } from '../../../api/user';

const PRESET_AVATARS = [
  { id: '1', name: 'Explorador Playa', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { id: '2', name: 'Viajera Cultural', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300' },
  { id: '3', name: 'Aventurero Sierra', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300' },
  { id: '4', name: 'Turista Jalisco', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  { id: '5', name: 'Mochilero Agave', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300' },
  { id: '6', name: 'Guía Local', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300' },
];

export function ConfigPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const [formData, setFormData] = useState(() => ({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    avatar: user?.avatar || '',
    password: '',
    password_confirmation: '',
  }));

  const [language, setLanguage] = useState(() => user?.preferences?.language || 'es');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const initialFormData = useMemo(() => ({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    avatar: user?.avatar || '',
    password: '',
    password_confirmation: '',
  }), [user]);

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSelectPresetAvatar = (url) => {
    setFormData((prev) => ({ ...prev, avatar: url }));
    setShowAvatarPicker(false);
  };

  const handleApplyCustomUrl = (e) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setFormData((prev) => ({ ...prev, avatar: customAvatarUrl.trim() }));
      setShowAvatarPicker(false);
      setCustomAvatarUrl('');
    }
  };

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      const updatedUser = data.user || data;
      updateUser(updatedUser);
      queryClient.invalidateQueries(['user-profile']);
      
      setSuccessMessage('¡Configuración guardada exitosamente! Tu perfil se ha actualizado en tiempo real.');
      setFormData((prev) => ({ ...prev, password: '', password_confirmation: '' }));
      
      setTimeout(() => {
        navigate({ to: '/profile' });
      }, 1500);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      setErrorMessage(error.response?.data?.detail || error.response?.data?.message || 'Error al actualizar el perfil. Verifica tus datos.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const payload = { ...formData };
    payload.preferences = {
      ...user?.preferences,
      language,
      telefono: payload.telefono,
      apellido: payload.apellido,
      avatar: payload.avatar,
    };

    if (!payload.password && !payload.password_confirmation) {
      delete payload.password;
      delete payload.password_confirmation;
    } else {
      if (payload.password !== payload.password_confirmation) {
        setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
        return;
      }
      if (payload.password.length < 6) {
        setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
    }

    updateMutation.mutate(payload);
  };

  const displayAvatar = formData.avatar || user?.avatar || `https://ui-avatars.com/api/?name=${formData.nombre || 'User'}&background=0D8ABC&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-extrabold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gestión de Cuenta</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Configuración del Perfil
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Actualiza tu información personal y preferencias en Tu-Turismo
          </p>
        </div>

        {/* Alertas */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-500" />
            <span className="text-sm font-bold">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <span className="text-sm font-bold">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Avatar e Idioma */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
              
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-cyan-500/30 dark:border-cyan-400/30 bg-slate-100 dark:bg-slate-800 shadow-xl group">
                <img
                  src={displayAvatar}
                  alt="Avatar de Usuario"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                >
                  <Camera className="w-8 h-8 text-cyan-400" />
                  <span className="text-xs font-bold">Cambiar foto</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
              >
                <ImageIcon className="w-4 h-4 text-cyan-500" />
                <span>Elegir / Cambiar Imagen</span>
              </button>

              {/* Selector de Avatares Flotante */}
              {showAvatarPicker && (
                <div className="mt-6 w-full pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 text-center">
                    Selecciona un Avatar de Jalisco
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {PRESET_AVATARS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(item.url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                          formData.avatar === item.url
                            ? 'border-cyan-500 ring-2 ring-cyan-500/30 scale-105 shadow-md'
                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-80 hover:opacity-100'
                        }`}
                        title={item.name}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleApplyCustomUrl} className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 block">O pega una URL personalizada:</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        placeholder="https://ejemplo.com/mifoto.jpg"
                        className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shrink-0"
                      >
                        Usar
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Selector de Idioma */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-cyan-500" />
                <span>Idioma de la Plataforma</span>
              </h3>
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-white font-bold'
                    : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇲🇽</span>
                    <span className="text-sm">Español (México)</span>
                  </div>
                  <input
                    type="radio"
                    name="language"
                    value="es"
                    checked={language === 'es'}
                    onChange={() => setLanguage('es')}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  />
                </label>

                <label className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-cyan-500/10 border-cyan-500 text-slate-900 dark:text-white font-bold'
                    : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🇺🇸</span>
                    <span className="text-sm">English (United States)</span>
                  </div>
                  <input
                    type="radio"
                    name="language"
                    value="en"
                    checked={language === 'en'}
                    onChange={() => setLanguage('en')}
                    className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-slate-300"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario Principal */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <span>Información Personal y Credenciales</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Email Principal
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                      placeholder="tucorreo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                    Teléfono de Contacto
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                      placeholder="Ej. 33 1234 5678"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-1">
                  Cambiar Contraseña
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Deja estos campos en blanco si deseas mantener tu contraseña actual intacta.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 ml-1">
                      Repetir Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white font-medium text-sm"
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
                <Link
                  to="/profile"
                  className="px-6 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                >
                  {updateMutation.isPending ? (
                    <span className="animate-pulse">Guardando cambios...</span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Guardar Configuración</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
