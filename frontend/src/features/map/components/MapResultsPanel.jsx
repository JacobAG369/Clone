import React, { useRef, useEffect } from 'react';
import { X, Star, MapPin, Navigation, ChevronRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMapStore } from '../../../store/useMapStore';
import { getCategoryInfo } from '../utils/icons';
import { calculateDistanceMeters, formatDistance, isOpenNow } from '../utils/geo';

export default function MapResultsPanel({ markers = [], isLoading = false }) {
  const {
    showResultsPanel,
    setShowResultsPanel,
    selectedMarkerId,
    setSelectedMarkerId,
    userLocation,
  } = useMapStore();

  const activeCardRef = useRef(null);

  // Scroll automático a la tarjeta seleccionada cuando cambia selectedMarkerId
  useEffect(() => {
    if (selectedMarkerId && activeCardRef.current) {
      activeCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedMarkerId, showResultsPanel]);

  if (!showResultsPanel) return null;

  return (
    <div className="absolute top-16 sm:top-20 bottom-3 sm:bottom-6 left-2 sm:left-4 md:left-6 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-[380px] z-[460] transition-all duration-300 pointer-events-auto transform-gpu animate-in fade-in-0 slide-in-from-left-8">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col h-full max-h-[calc(100dvh-80px)] sm:max-h-[calc(100dvh-100px)]">
        
        {/* Encabezado del panel */}
        <div className="p-4 px-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-brand-500" />
              <span>Lista de resultados</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {isLoading ? 'Buscando destinos...' : `${markers.length} destinos encontrados`}
            </p>
          </div>

          <button
            onClick={() => setShowResultsPanel(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Cerrar lista de resultados"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lista de Tarjetas o Skeleton Loaders (Punto 5 y 9) */}
        <div className="p-3 flex-1 overflow-y-auto space-y-3 divide-y divide-transparent">
          {isLoading ? (
            // Skeleton loaders durante la carga (Punto 9)
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex gap-3.5 border border-slate-100 dark:border-slate-800 animate-pulse"
              >
                <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/3 pt-2" />
                </div>
              </div>
            ))
          ) : markers.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500 my-auto">
              <MapPin size={40} className="opacity-40 text-brand-500 mb-1" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No hay resultados para mostrar
              </p>
              <p className="text-xs max-w-[220px]">
                Intenta ajustar tus filtros de búsqueda o categoría en el mapa.
              </p>
            </div>
          ) : (
            markers.map((marker) => {
              const isSelected = selectedMarkerId === marker.id;
              const catInfo = getCategoryInfo(marker.categoria_normalizada || marker.tipo_recurso || marker.categoria);
              const Icon = catInfo.icon;
              const openStatus = isOpenNow(marker.horario);

              let distText = null;
              if (userLocation && marker.coordenadas) {
                const distM = calculateDistanceMeters(
                  userLocation.lat,
                  userLocation.lng,
                  marker.coordenadas.lat,
                  marker.coordenadas.lng
                );
                distText = formatDistance(distM);
              }

              return (
                <div
                  key={marker.id}
                  ref={isSelected ? activeCardRef : null}
                  onClick={() => setSelectedMarkerId(marker.id)}
                  className={`group relative flex gap-3.5 p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/90 dark:bg-brand-950/40 border-brand-500/80 shadow-lg shadow-brand-500/10 scale-[1.01]'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                  }`}
                >
                  {/* Imagen */}
                  <div className="relative w-22 h-22 w-[88px] h-[88px] rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                    {marker.imagen_url ? (
                      <img
                        src={marker.imagen_url}
                        alt={marker.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Icon size={24} className="opacity-40" />
                      </div>
                    )}

                    <div className="absolute top-1.5 left-1.5 z-10">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${catInfo.badgeClass}`}>
                        {marker.categoria || catInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Datos del lugar */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h3 className={`text-xs font-bold truncate transition-colors ${
                          isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-100 group-hover:text-brand-500'
                        }`}>
                          {marker.nombre}
                        </h3>
                        <div className="flex items-center gap-0.5 text-yellow-500 font-bold text-[11px] shrink-0 bg-yellow-50 dark:bg-yellow-950/40 px-1.5 py-0.5 rounded-md border border-yellow-200/60 dark:border-yellow-900">
                          <Star size={11} className="fill-current text-yellow-400" />
                          <span>{marker.rating ? marker.rating.toFixed(1) : '4.5'}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                        {marker.direccion || marker.municipio || 'Jalisco'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[10px]">
                      {/* Estado Abierto / Cerrado */}
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        openStatus ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}>
                        {openStatus ? <CheckCircle2 size={11} /> : <AlertCircle size={11} />}
                        <span>{openStatus ? 'Abierto' : 'Cerrado'}</span>
                      </span>

                      {/* Distancia si está disponible o Precio */}
                      {distText ? (
                        <span className="flex items-center gap-1 font-bold text-brand-600 dark:text-brand-400">
                          <Navigation size={10} />
                          <span>a {distText}</span>
                        </span>
                      ) : marker.precio_rango ? (
                        <span className="font-bold text-slate-600 dark:text-slate-300">
                          {marker.precio_rango}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="self-center pl-1 text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
