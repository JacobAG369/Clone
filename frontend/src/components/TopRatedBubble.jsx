import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, X, MapPin, ChevronRight, Award, Trophy } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '../store/useAuthStore';
import { useMapStore } from '../store/useMapStore';
import { getTopRatedPlaces } from '../api/places';

export const TopRatedBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const setMapCenter = useMapStore((s) => s.setMapCenter);

  // ⚠️ IMPORTANTE: todos los hooks DEBEN llamarse antes de cualquier return condicional
  // (Rules of Hooks). El filtro de rol va DESPUÉS de los hooks.
  const { data: topPlaces = [], isLoading } = useQuery({
    queryKey: ['places', 'top-rated'],
    queryFn: () => getTopRatedPlaces(5),
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Solo visible para usuarios turistas o visitantes no autenticados
  if (user && (user.rol === 'admin' || user.rol === 'proveedor')) {
    return null;
  }

  const handleExplore = (place) => {
    const lat = place.latitud || place.coordenadas?.lat;
    const lng = place.longitud || place.coordenadas?.lng;
    if (lat && lng) {
      setMapCenter({ lat, lng });
    }
    setIsOpen(false);
    navigate({ to: '/map' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Modal / Card flotante expandido */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header del widget */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-200 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                Bayesian Score
              </span>
            </div>
            <h3 className="text-lg font-extrabold tracking-tight">Top 5 Joyas de Jalisco</h3>
            <p className="text-xs text-amber-100 opacity-90 mt-1">
              Seleccionados por puntuación bayesiana equilibrada y comunidad turística.
            </p>
          </div>

          {/* Contenido de lista */}
          <div className="p-4 max-h-80 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Calculando mejores puntuaciones...
              </div>
            ) : topPlaces.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No hay atractivos suficientes para mostrar el Top en este momento.
              </div>
            ) : (
              topPlaces.map((place, idx) => {
                const rating = place.rating_promedio ?? place.calificacion ?? 4.5;
                const reviewsCount = place.reviews_count ?? 12;
                return (
                  <div
                    key={place._id || place.id}
                    onClick={() => handleExplore(place)}
                    className="pt-3 first:pt-0 flex items-center gap-3.5 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-all"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                      <img
                        src={place.imagen_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=200&q=80'}
                        alt={place.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-md flex items-center justify-center shadow">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {place.nombre}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{place.municipio || 'Jalisco'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-amber-500" />
                          <span>{Number(rating).toFixed(1)}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({reviewsCount} valoraciones)
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer modal */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 text-center border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium">
              💡 Puntuación bayesiana ponderada para turistas
            </span>
          </div>
        </div>
      )}

      {/* Botón flotante / Burbuja */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white p-4 sm:px-6 sm:py-4 rounded-full shadow-[0_10px_25px_-5px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/30 dark:border-slate-800"
        title="Lugares con mejor puntuación"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-white"></span>
        </span>
        <Award className="w-6 h-6 animate-bounce" />
        <span className="font-bold text-sm sm:text-base pr-1 tracking-tight hidden sm:inline">
          Top Atractivos
        </span>
      </button>
    </div>
  );
};
