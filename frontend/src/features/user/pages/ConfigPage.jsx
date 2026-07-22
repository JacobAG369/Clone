import { useState, useEffect, useMemo, useRef } from 'react';
import { Save, ArrowLeft, User, Mail, Phone, Lock, CheckCircle2, Camera, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import { updateUserProfile } from '../../../api/user';
import api from '../../../lib/axios';

export function ConfigPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState(() => ({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    avatar: user?.avatar || '',
    password: '',
    password_confirmation: '',
  }));

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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
    setAvatarPreview(null);
  }, [initialFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // Subida de foto a Cloudinary via endpoint del backend
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      setErrorMessage('El archivo seleccionado no es una imagen válida.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('La imagen no puede superar los 5 MB.');
      return;
    }

    // Preview local inmediato
    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);
    setErrorMessage('');

    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('folder', 'tuturismo/avatars');

      const response = await api.post('/core/upload/', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data?.url || response.data?.secure_url;
      if (!uploadedUrl) throw new Error('No se recibió URL de la imagen.');

      setFormData((prev) => ({ ...prev, avatar: uploadedUrl }));
    } catch (err) {
      console.error('Error al subir foto:', err);
      setErrorMessage('No se pudo subir la imagen. Verifica tu conexión e intenta de nuevo.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      const updatedUser = data.user || data;
      updateUser(updatedUser);
      queryClient.invalidateQueries(['user-profile']);
      setSuccessMessage('Configuración guardada correctamente.');
      setFormData((prev) => ({ ...prev, password: '', password_confirmation: '' }));
      setTimeout(() => {
        navigate({ to: '/profile' });
      }, 1500);
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      setErrorMessage(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Error al actualizar el perfil. Verifica tus datos.'
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const payload = { ...formData };
    payload.preferences = {
      ...user?.preferences,
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

  const displayAvatar =
    avatarPreview ||
    formData.avatar ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nombre || 'U')}&background=0D8ABC&color=fff&size=256`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gestión de cuenta</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Configuración del perfil
              </h1>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Actualiza tu información personal en Tu-Turismo
          </p>
        </div>

        {/* Alertas */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-center gap-3">
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna Izquierda: Foto de perfil */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 self-start">
              Foto de perfil
            </p>

            {/* Avatar con overlay para cambiar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-md group">
              <img
                src={displayAvatar}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
              {!isUploadingPhoto && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                >
                  <Camera className="w-7 h-7" />
                  <span className="text-xs font-medium">Cambiar</span>
                </button>
              )}
            </div>

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="mt-4 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors disabled:opacity-50"
            >
              {isUploadingPhoto ? 'Subiendo imagen...' : 'Seleccionar imagen'}
            </button>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">
              JPG, PNG o WEBP. Máximo 5 MB.
            </p>
          </div>

          {/* Columna Derecha: Formulario principal */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              Información personal y credenciales
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                      placeholder="tucorreo@ejemplo.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                    Teléfono de contacto
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                      placeholder="Ej. 33 1234 5678"
                    />
                  </div>
                </div>
              </div>

              {/* Cambio de contraseña */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Cambiar contraseña
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  Deja estos campos en blanco para mantener tu contraseña actual.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-0.5">
                      Confirmar contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all dark:bg-slate-800/60 dark:border-slate-700 dark:focus:bg-slate-800 dark:text-white text-sm"
                        placeholder="Confirma la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Link
                  to="/profile"
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || isUploadingPhoto}
                  className="flex items-center gap-2 px-7 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none shadow-sm"
                >
                  {updateMutation.isPending ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar cambios</span>
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
