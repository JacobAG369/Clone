import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Settings, LogOut, MapPin, Mail, Phone, Calendar, Star, Sparkles,
  Send, CheckCircle2, AlertCircle, Loader2, Compass, ShieldCheck, Heart, Award
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLogoutMutation } from '../../auth/hooks/useLogoutMutation';
import { sendAiRecommendations } from '../../../api/user';
import { useFavorites } from '../../../hooks/useFavorites';
import { LugarCard } from '../../../components/ui/cards/LugarCard';
import { EventoCard } from '../../../components/ui/cards/EventoCard';
import { SkeletonCard } from '../../../components/ui/cards/SkeletonCard';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogoutMutation();
  const { favoriteItems, favoritesQuery, isEnriching } = useFavorites();

  // Redirigir a login si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({ to: '/login' });
  };

  // Filtrar favoritos enriquecidos de forma segura
  const places = favoriteItems.filter((f) => f.tipo === 'lugar' || f.tipo === 'restaurante');
  const events = favoriteItems.filter((f) => f.tipo === 'evento');
  const isLoadingPlaces = favoritesQuery.isLoading || isEnriching;
  const isLoadingEvents = favoritesQuery.isLoading || isEnriching;

  const aiMutation = useMutation({
    mutationFn: sendAiRecommendations,
    onError: (error) => {
      // Log detallado para debugging
      console.error('[AI Recommendations] Error:', {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
        isNetworkError: !error?.response,
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-16">
      {/* Hero Banner de Perfil con degradado Jalisco e iluminación de fondo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-700 to-indigo-800 text-white pt-12 pb-24 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 flex justify-between items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            <span>Perfil Verificado • Tu-Turismo Jalisco</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/config"
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 shadow-md"
              title="Configuración de la cuenta"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 h-10 rounded-2xl bg-red-500/20 hover:bg-red-500/30 backdrop-blur-md border border-red-400/30 text-red-200 font-bold text-sm transition-all hover:scale-105 shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-16 relative z-20 space-y-8">
        {/* Tarjeta de Identidad (Glassmorphism + Anillo de Avatar) */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-cyan-500/50 bg-slate-200 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${(user?.nombre || user?.name || 'User')}&background=0D8ABC&color=fff&size=256`}
                alt="Avatar de Usuario"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 right-2 p-2 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Award size={18} />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {user ? (user.nombre || user.name || 'Turista') : 'Turista'} {user?.apellido || ''}
              </h1>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60 self-center md:self-auto">

              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-5 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-500 shrink-0" />
                <span className="font-medium">{user?.email || 'usuario@tuturismo.mx'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="font-medium">{user?.telefono || '+52 33 0000 0000'}</span>
              </div>
            </div>

            <div className="pt-1 flex justify-center md:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold">
                <MapPin className="w-4 h-4 text-cyan-500" />
                <span>{user?.direccion ? user.direccion : 'Guadalajara, Jalisco • México'}</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/60 dark:from-slate-800 dark:to-slate-800/40 border border-slate-200 dark:border-slate-700 min-w-[150px]">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {(places?.length || 0) + (events?.length || 0)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              Favoritos
            </span>
          </div>
        </div>

        {/* Tarjeta Interactiva de Recomendaciones IA (Random Forest + Correo) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase border border-white/25">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                <span>Motor de Recomendaciones IA</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                ¿Listo para tu próximo itinerario turístico en Jalisco?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
                Nuestro motor de IA analiza tus lugares favoritos, afinidad por categorías y municipios para generar una ruta personalizada y enviarla al instante a tu correo.
              </p>
            </div>

            <button
              onClick={() => aiMutation.mutate()}
              disabled={aiMutation.isPending}
              className="flex items-center justify-center gap-3 px-7 py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm sm:text-base shadow-xl hover:bg-blue-50 active:scale-95 disabled:opacity-75 disabled:pointer-events-none transition-all duration-300 shrink-0 w-full lg:w-auto"
            >
              {aiMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  <span className="flex flex-col items-start leading-tight">
                    <span>Generando itinerario...</span>
                    <span className="text-xs font-normal text-indigo-400">Puede tardar hasta 1 minuto</span>
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 text-indigo-600" />
                  <span>Recibir Recomendaciones personalizadas</span>
                </>
              )}
            </button>
          </div>

          {/* Resultado o Adelanto de Recomendaciones IA */}
          {aiMutation.isSuccess && (
            <div className="mt-8 pt-6 border-t border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-3.5 bg-emerald-500/25 backdrop-blur-md border border-emerald-400/40 p-4.5 rounded-2xl text-emerald-100 mb-6 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <div>
                  <p className="font-extrabold text-white text-base">¡Itinerario personalizado generado y enviado con éxito, revise su correo!</p>
                  <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                    {aiMutation.data?.message || 'Revisa tu bandeja de correo o explora el adelanto predicho por nuestro algoritmo abajo.'}
                  </p>
                </div>
              </div>

              {aiMutation.data?.data && aiMutation.data.data.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-blue-200 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-300" />
                      <span>Adelanto del itinerario predicho para ti:</span>
                    </h4>
                    <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">Top 3 recomendados para ti: </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aiMutation.data.data.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="bg-white/10 hover:bg-white/15 backdrop-blur-xl rounded-2xl p-5 border border-white/20 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                      >
                        <div>
                          <div className="flex justify-between items-center text-xs mb-3">
                            <span className="bg-indigo-500/60 border border-indigo-400/40 px-2.5 py-0.5 rounded-full font-bold text-white uppercase tracking-wider">
                              {item.categoria || 'Atractivo'}
                            </span>
                            <span className="text-amber-300 font-black flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                              {Math.round(Number(item.probabilidad_ia || 0.88) * 100)}% Afinidad
                            </span>
                          </div>
                          <h5 className="font-extrabold text-white text-lg leading-tight line-clamp-1">{item.nombre}</h5>
                          <p className="text-xs font-semibold text-blue-200 mt-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-cyan-300 shrink-0" /> {item.municipio || 'Jalisco'}
                          </p>
                        </div>
                        <p className="text-xs text-blue-100/90 mt-4 pt-3 border-t border-white/15 italic line-clamp-2 leading-relaxed">
                          {item.razon}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {aiMutation.isError && (
            <div className="mt-6 pt-6 border-t border-white/20 animate-in fade-in duration-300">
              <div className="flex items-center gap-3.5 bg-red-500/25 backdrop-blur-md border border-red-400/40 p-4.5 rounded-2xl text-red-100 shadow-lg">
                <AlertCircle className="w-6 h-6 text-red-300 shrink-0" />
                <div>
                  <p className="font-extrabold text-white text-base">No se pudo generar el itinerario en este momento</p>
                  <p className="text-xs sm:text-sm text-red-200 mt-0.5">
                    {!aiMutation.error?.response
                      ? ' Error de conexión: el servidor no está disponible. Verifica que el backend esté activo e intenta nuevamente.'
                      : aiMutation.error?.response?.status === 401
                        ? ' Tu sesión ha expirado. Cierra sesión y vuelve a iniciar.'
                        : aiMutation.error?.response?.data?.error || aiMutation.error?.response?.data?.detail || aiMutation.error?.message || 'Error interno del servidor. Intenta nuevamente en unos momentos.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cuadrícula de Favoritos (Lugares y Eventos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Sección: Lugares Favoritos */}
          <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Lugares Favoritos</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Atractivos y museos guardados en tu lista</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {places?.length || 0} items
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {isLoadingPlaces ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : places && places.length > 0 ? (
                places.map((favorito) => (
                  <div key={favorito.referencia_id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-lg rounded-2xl overflow-hidden">
                    <LugarCard
                      title={favorito?.recurso?.nombre || 'Destino de Jalisco'}
                      image={favorito?.recurso?.imagen || null}
                      category={favorito?.recurso?.categoria || 'Lugar'}
                      rating={favorito?.recurso?.rating || null}
                      location={favorito?.recurso?.ubicacion || favorito?.recurso?.municipio || 'Jalisco, México'}
                      className="!flex-row !h-32 shadow-sm border border-slate-200/60 dark:border-slate-800"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                  <Heart className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No tienes lugares favoritos aún.</p>
                  <p className="text-xs text-slate-400 max-w-xs">Explora el mapa turístico y presiona el ícono de corazón para guardar tus destinos preferidos aquí.</p>
                </div>
              )}
            </div>
          </section>

          {/* Sección: Eventos Guardados */}
          <section className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Eventos Guardados</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tu agenda cultural y festivales de Jalisco</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {events?.length || 0} items
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {isLoadingEvents ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : events && events.length > 0 ? (
                events.map((favorito) => (
                  <div key={favorito.referencia_id} className="transition-all duration-300 hover:scale-[1.01] hover:shadow-lg rounded-2xl overflow-hidden">
                    <EventoCard
                      title={favorito?.recurso?.nombre || 'Evento en Jalisco'}
                      image={favorito?.recurso?.imagen || null}
                      date={favorito?.recurso?.fecha || new Date().toISOString().split('T')[0]}
                      location={favorito?.recurso?.ubicacion || favorito?.recurso?.municipio || 'Jalisco, México'}
                      category="Evento"
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4 bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No tienes eventos guardados aún.</p>
                  <p className="text-xs text-slate-400 max-w-xs">Encuentra los próximos eventos y festivales de Jalisco en el mapa para sumarlos a tu agenda.</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
