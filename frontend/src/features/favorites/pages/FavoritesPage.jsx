import { useState } from 'react';
import { Heart, MapPin, Star, Calendar, Utensils, Sparkles, Trash2, ArrowRight, Compass, WifiOff } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useFavorites } from '../../../hooks/useFavorites';
import { useLocalFavorites } from '../../../hooks/useLocalFavorites';
import { useAuthStore } from '../../../store/useAuthStore';
import { SkeletonCard } from '../../../components/ui/cards/SkeletonCard';

export function FavoritesPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { favoriteItems, favoritesQuery, removeFavoriteMutation, isEnriching } = useFavorites();
  const { localFavorites, removeLocalFavorite, localFavoritesCount } = useLocalFavorites();
  const [activeTab, setActiveTab] = useState('todos');

  // ---------------------------------------------------------------------------
  // Vista para usuarios NO autenticados: muestra favoritos locales (localStorage)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
        {/* Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 text-white pt-12 pb-24 shadow-xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider uppercase mb-4">
              <WifiOff className="w-4 h-4 text-sky-200" />
              <span>Guardados localmente &bull; Sin cuenta requerida</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center gap-3.5">
              <span>Mis Favoritos</span>
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-red-300 fill-current" />
            </h1>
            <p className="text-sky-100 text-sm sm:text-base max-w-xl leading-relaxed mt-3">
              Tus lugares guardados en este dispositivo. Inicia sesi&oacute;n para sincronizarlos en todos tus dispositivos.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-sm font-bold transition-all"
            >
              Iniciar sesi&oacute;n para sincronizar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Contenido */}
        <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20">
          {localFavoritesCount === 0 ? (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 shadow-xl space-y-6 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Heart size={36} className="stroke-2" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">A&uacute;n no tienes favoritos</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Explora el mapa interactivo y toca el icono de coraz&oacute;n en cualquier lugar para guardarlo aqu&iacute;. No necesitas cuenta.
                </p>
              </div>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
              >
                <span>Explorar Mapa Tur&iacute;stico</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-4">
              {localFavorites.map((fav) => {
                const rec = fav.recurso || {};
                return (
                  <div
                    key={fav.referencia_id}
                    className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Imagen */}
                      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {rec.imagen ? (
                          <img
                            src={rec.imagen}
                            alt={rec.nombre || 'Destino'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            <Compass className="w-10 h-10 text-cyan-500 animate-pulse" />
                            <span className="text-xs font-bold">Jalisco Destino</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                        {/* Badge tipo */}
                        <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white shadow-md border border-white/20">
                          {fav.tipo === 'restaurante' ? 'Restaurante' : fav.tipo === 'evento' ? 'Evento' : 'Lugar'}
                        </span>

                        {/* Botón quitar favorito */}
                        <button
                          onClick={() => removeLocalFavorite(fav.referencia_id)}
                          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90"
                          title="Quitar de mis favoritos"
                          aria-label="Quitar de favoritos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Título sobre la imagen */}
                        <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                          <h3 className="text-lg font-black tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">
                            {rec.nombre || 'Destino en Jalisco'}
                          </h3>
                          <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>{rec.municipio || 'Jalisco, México'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Descripci&oacute;n */}
                      <div className="p-5 space-y-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {rec.descripcion || 'Atractivo turístico destacado de Jalisco.'}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span>{rec.rating ? `${Number(rec.rating).toFixed(1)} / 5.0` : 'Destacado'}</span>
                          </div>
                          <span className="text-slate-400 font-medium">Guardado localmente</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="p-3 pt-0">
                      <Link
                        to="/map"
                        className="block w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 text-slate-700 dark:text-slate-300 text-center text-xs font-extrabold tracking-wide transition-all duration-300"
                      >
                        Ver en el Mapa Interactivo &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Vista para usuarios AUTENTICADOS: favoritos desde la API (comportamiento original)
  // ---------------------------------------------------------------------------
  const isLoading = favoritesQuery.isLoading || isEnriching;

  // Filtrado por pestañas
  const filteredItems = favoriteItems.filter((item) => {
    if (activeTab === 'todos') return true;
    return item.tipo === activeTab;
  });

  // Conteos
  const counts = {
    todos: favoriteItems.length,
    lugar: favoriteItems.filter((i) => i.tipo === 'lugar').length,
    restaurante: favoriteItems.filter((i) => i.tipo === 'restaurante').length,
    evento: favoriteItems.filter((i) => i.tipo === 'evento').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Hero Banner de Favoritos con Glassmorphism y degradado Jalisco */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-pink-600 to-purple-700 text-white pt-12 pb-24 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-pink-400/20 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-extrabold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Colección Personal • Tu-Turismo Suite</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight flex items-center gap-3.5">
              <span>Mis Favoritos</span>
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-red-300 fill-current" />
            </h1>
            <p className="text-pink-100 text-sm sm:text-base max-w-xl leading-relaxed">
              Administra tus destinos y eventos guardados en tiempo real. Organiza tu próxima aventura o consulta tu mapa interactivo.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-3xl border border-white/20 shadow-2xl shrink-0">
            <div className="text-center px-4 border-r border-white/15">
              <span className="block text-3xl font-black">{counts.todos}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200">Total</span>
            </div>
            <div className="text-center px-4 border-r border-white/15">
              <span className="block text-2xl font-extrabold text-amber-300">{counts.lugar + counts.restaurante}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200">Lugares</span>
            </div>
            <div className="text-center px-4">
              <span className="block text-2xl font-extrabold text-cyan-300">{counts.evento}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-200">Eventos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Central */}
      <div className="container mx-auto px-4 max-w-6xl -mt-10 relative z-20 space-y-8">
        
        {/* Barra de Navegación de Pestañas (Tabs) */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2.5 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'todos'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-md shadow-red-500/25 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Todos los recursos</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'todos' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {counts.todos}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('lugar')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'lugar'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Lugares</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'lugar' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {counts.lugar}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('restaurante')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'restaurante'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Restaurantes</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'restaurante' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {counts.restaurante}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('evento')}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'evento'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Eventos</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'evento' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                {counts.evento}
              </span>
            </button>
          </div>

          <Link
            to="/map"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-all"
          >
            <Compass className="w-4 h-4 text-cyan-500" />
            <span>Explorar en Mapa</span>
          </Link>
        </div>

        {/* Rejilla de Tarjetas o Estados de Carga / Vacío */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 shadow-xl space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Heart size={36} className="stroke-2" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {activeTab === 'todos' ? 'Aún no tienes ningún favorito' : `No tienes ningún ${activeTab} guardado`}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Navega por nuestro catálogo de Jalisco, descubre lugares mágicos y marca el ícono de corazón para armar tu colección personal.
              </p>
            </div>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Explorar Mapa Turístico</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((fav) => {
              const rec = fav.recurso || {};
              return (
                <div 
                  key={fav.referencia_id} 
                  className="group relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Imagen con Badges y Botón flotante de eliminar */}
                    <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      {rec.imagen ? (
                        <img 
                          src={rec.imagen} 
                          alt={rec.nombre || 'Destino'} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          <Compass className="w-10 h-10 text-cyan-500 animate-pulse" />
                          <span className="text-xs font-bold">Jalisco Destino</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                      {/* Badge de Tipo */}
                      <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-white shadow-md border border-white/20">
                        {fav.tipo === 'restaurante' ? 'Restaurante' : fav.tipo === 'evento' ? 'Evento' : 'Lugar'}
                      </span>

                      {/* Botón flotante de Quitar Favorito */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFavoriteMutation.mutate(fav.referencia_id);
                        }}
                        className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90"
                        title="Quitar de mis favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Título en la imagen */}
                      <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
                        <h3 className="text-lg font-black tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {rec.nombre || 'Destino en Jalisco'}
                        </h3>
                        <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-0.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{rec.municipio || rec.ubicacion || 'Jalisco, México'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Contenido / Metadatos */}
                    <div className="p-5 space-y-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {rec.descripcion || 'Atractivo turístico destacado para disfrutar con familia o amigos en el estado de Jalisco.'}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-bold">
                        {fav.tipo === 'evento' ? (
                          <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                            <Calendar className="w-4 h-4" />
                            <span>{rec.fecha || 'Próximamente'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span>{rec.rating ? `${Number(rec.rating).toFixed(1)} / 5.0` : 'Destino Destacado'}</span>
                          </div>
                        )}

                        <span className="text-slate-400 font-medium">
                          Guardado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Acción inferior */}
                  <div className="p-3 pt-0 bg-transparent">
                    <Link
                      to="/map"
                      className="block w-full py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-cyan-600 hover:text-white dark:hover:bg-cyan-600 text-slate-700 dark:text-slate-300 text-center text-xs font-extrabold tracking-wide transition-all duration-300"
                    >
                      Ver en el Mapa Interactivo →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
