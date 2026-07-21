import React, { useState } from 'react';
import { Navigation, Compass, Loader2, X, MapPin } from 'lucide-react';
import { useMapStore } from '../../../store/useMapStore';

export default function ExploreNearbyControls({ onFlyToLocation }) {
  const {
    userLocation,
    setUserLocation,
    nearbyRadiusKm,
    setNearbyRadiusKm,
    exploreNearbyActive,
    setExploreNearbyActive,
    setShowResultsPanel,
  } = useMapStore();

  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geoError, setGeoError] = useState(null);

  const handleToggleExplore = () => {
    if (exploreNearbyActive) {
      setExploreNearbyActive(false);
      return;
    }

    if (userLocation && typeof userLocation.lat === 'number') {
      setExploreNearbyActive(true);
      setShowResultsPanel(true);
      if (onFlyToLocation) {
        onFlyToLocation(userLocation.lat, userLocation.lng, 14);
      }
      return;
    }

    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización');
      return;
    }

    setLoadingGeo(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setExploreNearbyActive(true);
        setShowResultsPanel(true);
        setLoadingGeo(false);

        if (onFlyToLocation) {
          onFlyToLocation(coords.lat, coords.lng, 14);
        }
      },
      (error) => {
        setLoadingGeo(false);
        console.error('Error obteniendo geolocalización:', error);
        setGeoError('No se pudo obtener tu ubicación. Verifica los permisos.');
        setTimeout(() => setGeoError(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute bottom-6 left-4 md:left-6 z-[450] flex flex-col items-start gap-2 pointer-events-auto">
      {/* Alerta de error si falla el GPS */}
      {geoError && (
        <div className="px-3.5 py-2 bg-rose-500 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{geoError}</span>
          <button onClick={() => setGeoError(null)} className="p-0.5 hover:bg-rose-600 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Selector de radio de distancia (sólo visible si Explorar cerca está activo) */}
      {exploreNearbyActive && userLocation && (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-3 py-2 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 pl-1">
            <Compass size={13} className="text-brand-500" />
            <span>Radio:</span>
          </span>

          <div className="flex items-center gap-1">
            {[1, 3, 5, 10, 20].map((km) => {
              const active = nearbyRadiusKm === km;
              return (
                <button
                  key={km}
                  type="button"
                  onClick={() => setNearbyRadiusKm(km)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {km} km
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setExploreNearbyActive(false)}
            className="p-1 ml-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Desactivar exploración cercana"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Botón principal Explorar cerca */}
      <button
        type="button"
        onClick={handleToggleExplore}
        disabled={loadingGeo}
        className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl font-bold text-xs shadow-2xl transition-all duration-300 transform-gpu active:scale-95 border ${
          exploreNearbyActive
            ? 'bg-brand-500 text-white border-brand-400 shadow-brand-500/40 ring-4 ring-brand-500/25'
            : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg'
        }`}
      >
        {loadingGeo ? (
          <Loader2 size={18} className="animate-spin text-brand-500" />
        ) : (
          <Navigation size={18} className={`stroke-[2.5] ${exploreNearbyActive ? 'text-white' : 'text-brand-500'}`} />
        )}
        <span>{exploreNearbyActive ? 'Explorando tu zona' : 'Explorar cerca'}</span>
      </button>
    </div>
  );
}
