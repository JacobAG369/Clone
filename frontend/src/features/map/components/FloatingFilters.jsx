import React from 'react';
import { SlidersHorizontal, ListFilter, Moon, Sun, Monitor } from 'lucide-react';
import { CATEGORIES } from '../utils/icons';
import { useMapStore } from '../../../store/useMapStore';
import { useThemeStore } from '../../../store/useThemeStore';

export default function FloatingFilters({ onOpenFilters, markersCount = 0 }) {
  const { activeCategory, setActiveCategory, showResultsPanel, toggleResultsPanel, filters } = useMapStore();
  const { theme, mapTheme, toggleTheme, toggleMapTheme } = useThemeStore();

  // Calcular cuántos filtros avanzados están activos
  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'priceRange') return val !== 'all';
    if (key === 'minRating') return val > 0;
    return !!val;
  }).length;

  const handleToggleDark = () => {
    toggleTheme();
    toggleMapTheme();
  };

  return (
    <>
      {/* 1. Categorías en Dock Vertical a la izquierda (Punto 4) */}
      <div
        className="absolute top-1/2 left-2 sm:left-4 z-[450] flex -translate-y-1/2 flex-col gap-1.5 sm:gap-2.5 pointer-events-auto max-h-[calc(100%-140px)] overflow-y-auto no-scrollbar py-1"
        role="group"
        aria-label="Filtros por categoría de Tu-Turismo"
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          const buttonId = `map-filter-${category.id}`;
          const labelId = `map-filter-label-${category.id}`;

          return (
            <div key={category.id} className="group relative flex items-center">
              <button
                type="button"
                id={buttonId}
                name={`map-filter-${category.id}`}
                aria-pressed={isActive}
                aria-labelledby={labelId}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center justify-center rounded-xl sm:rounded-2xl p-2 sm:p-2.5 md:p-3 shadow-lg backdrop-blur-xl transition-all duration-300 transform-gpu active:scale-95 border ${
                  isActive
                    ? `${category.badgeClass} scale-110 ring-2 sm:ring-4 ring-white/30 dark:ring-slate-900/50 shadow-md`
                    : 'bg-white/95 text-slate-700 border-slate-200/80 hover:scale-105 hover:bg-white dark:bg-slate-900/95 dark:text-slate-200 dark:border-slate-700/80 dark:hover:bg-slate-800'
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-brand-500 transition-colors'
                  }`}
                />
              </button>

              <span
                id={labelId}
                className="absolute left-full ml-3.5 whitespace-nowrap rounded-xl bg-slate-900/95 dark:bg-slate-800/95 px-3 py-1.5 text-xs font-extrabold text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 hidden sm:block"
              >
                {category.label}
                <span className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900/95 dark:bg-slate-800/95" />
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Barra secundaria flotante superior (Lista de Resultados, Filtros Avanzados, Modo Oscuro) */}
      <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-[450] flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[calc(100%-1rem)] px-1">
        {/* Botón Lista de Resultados (Punto 5) */}
        <button
          type="button"
          onClick={toggleResultsPanel}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-xs shadow-lg backdrop-blur-xl transition-all duration-300 border ${
            showResultsPanel
              ? 'bg-brand-500 text-white border-brand-400 ring-2 ring-brand-500/30'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <ListFilter size={14} className="stroke-[2.5]" />
          <span className="hidden xs:inline">Lista</span>
          <span className="xs:hidden">Resultados</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            showResultsPanel ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}>
            {markersCount}
          </span>
        </button>

        {/* Botón Filtros Avanzados (Punto 6) */}
        <button
          type="button"
          onClick={onOpenFilters}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-xs shadow-lg backdrop-blur-xl transition-all duration-300 border ${
            activeFiltersCount > 0
              ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-500/30'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal size={14} className="stroke-[2.5]" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-white/25 text-white text-[10px] font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Botón Modo Oscuro / Mapa (Punto 8) */}
        <button
          type="button"
          onClick={handleToggleDark}
          className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-xs shadow-lg transition-all active:scale-95"
          title={`Cambiar a modo ${mapTheme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {mapTheme === 'dark' || theme === 'dark' ? (
            <Sun size={14} className="text-amber-400 fill-current" />
          ) : (
            <Moon size={14} className="text-slate-600" />
          )}
          <span>{mapTheme === 'dark' || theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
        </button>
      </div>
    </>
  );
}

