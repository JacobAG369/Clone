import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, History, MapPin, Sparkles, Navigation } from 'lucide-react';
import { useMapStore } from '../../../store/useMapStore';
import { getCategoryInfo } from '../utils/icons';

export default function MapSearchBar({ allMarkers = [] }) {
  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    addSearchHistory,
    clearSearchHistory,
    setSelectedMarkerId,
  } = useMapStore();

  const [isFocused, setIsFocused] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalQuery(searchQuery || '');
  }, [searchQuery]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sugerencias de autocompletado en tiempo real (Punto 1)
  const suggestions = useMemo(() => {
    if (!localQuery || localQuery.trim().length < 1) return [];
    const q = localQuery.trim().toLowerCase();

    return allMarkers
      .filter((m) => {
        const nameMatch = (m.nombre || '').toLowerCase().includes(q);
        const catMatch = (m.categoria || m.tipo || m.categoria_normalizada || '').toLowerCase().includes(q);
        const muniMatch = (m.municipio || m.direccion || '').toLowerCase().includes(q);
        return nameMatch || catMatch || muniMatch;
      })
      .slice(0, 6);
  }, [localQuery, allMarkers]);

  const handleSelectSuggestion = (marker) => {
    setLocalQuery(marker.nombre);
    setSearchQuery(marker.nombre);
    addSearchHistory(marker.nombre);
    setSelectedMarkerId(marker.id);
    setIsFocused(false);
  };

  const handleSelectHistoryItem = (item) => {
    setLocalQuery(item);
    setSearchQuery(item);
    addSearchHistory(item);
    setIsFocused(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(localQuery);
    if (localQuery.trim()) {
      addSearchHistory(localQuery);
      // Si hay una coincidencia exacta de sugerencia al dar enter, seleccionamos el marcador
      if (suggestions.length === 1 && suggestions[0].nombre.toLowerCase() === localQuery.trim().toLowerCase()) {
        setSelectedMarkerId(suggestions[0].id);
      }
    }
    setIsFocused(false);
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-2.5 sm:top-4 left-1/2 -translate-x-1/2 z-[450] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-lg transition-all duration-300 pointer-events-auto"
    >
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/80 transition-all duration-300 ${
          isFocused ? 'ring-2 sm:ring-4 ring-brand-500/25 border-brand-500 shadow-brand-500/10 scale-[1.005]' : 'hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <div className="pl-3 sm:pl-4 text-brand-500 dark:text-brand-400">
          <Search size={18} className="stroke-[2.5]" />
        </div>

        <input
          type="text"
          value={localQuery}
          onChange={(e) => {
            setLocalQuery(e.target.value);
            setSearchQuery(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Buscar destinos, eventos o lugares..."
          className="w-full bg-transparent px-2.5 sm:px-3 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          aria-label="Barra de búsqueda de lugares turísticos"
        />

        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 sm:p-2 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          className="mr-1.5 sm:mr-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 shrink-0"
        >
          Buscar
        </button>
      </form>

      {/* Menú desplegable con sugerencias e historial */}
      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200 z-50">
          {/* Sugerencias mientras se escribe (Punto 1) */}
          {localQuery.trim().length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-500" />
                <span>Sugerencias rápidas</span>
              </div>

              {suggestions.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  No se encontraron coincidencias para "{localQuery}"
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((marker) => {
                    const catInfo = getCategoryInfo(marker.categoria_normalizada || marker.tipo_recurso);
                    const Icon = catInfo.icon;

                    return (
                      <button
                        key={marker.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(marker)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${catInfo.badgeClass.split(' ')[0]} bg-opacity-15 dark:bg-opacity-20 flex items-center justify-center`}>
                            <Icon size={16} className="text-brand-500 dark:text-brand-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                              {marker.nombre}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {marker.municipio || marker.direccion || 'Jalisco'} • <span className="font-semibold text-brand-500">{marker.categoria || catInfo.label}</span>
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md font-medium shrink-0 ml-2 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          Ver en mapa
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Historial y búsquedas recientes (Punto 1) */}
          {!localQuery.trim() && (
            <div className="p-3">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <History size={12} />
                  <span>Búsquedas recientes</span>
                </span>
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSearchHistory}
                    className="text-[11px] text-red-500 hover:text-red-600 font-semibold transition-colors"
                  >
                    Borrar historial
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  El historial está vacío. ¡Empieza a explorar atractivos!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-3">
                  {searchHistory.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectHistoryItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:hover:text-brand-400 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-full border border-slate-200/60 dark:border-slate-700 transition-all active:scale-95"
                    >
                      <History size={12} className="opacity-60" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
