import React from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, DollarSign, Star, Clock, Heart, Wifi, Car, Accessibility, RotateCcw } from 'lucide-react';
import { useMapStore } from '../../../store/useMapStore';

export default function MapAdvancedFiltersModal({ isOpen, onClose }) {
  const { filters, setFilter, resetFilters } = useMapStore();

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl sm:max-w-3xl overflow-hidden flex flex-col transform-gpu animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Encabezado */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/80 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl shadow-sm">
              <SlidersHorizontal className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Filtros avanzados
              </h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Personaliza y refina tu experiencia de exploración en el mapa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Cerrar filtros"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Contenido de filtros */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* 1. Rango de precio */}
          <div>
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-brand-500" />
              <span>Rango de precio</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { id: 'all', label: 'Todos' },
                { id: '$', label: '$ Económico' },
                { id: '$$', label: '$$ Moderado' },
                { id: '$$$', label: '$$$ Premium' },
              ].map((item) => {
                const active = filters.priceRange === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter('priceRange', item.id)}
                    className={`px-4 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all border ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Calificación mínima */}
          <div className="pt-8">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-brand-500" />
              <span>Calificación mínima</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {[
                { value: 0, label: 'Cualquiera' },
                { value: 4.0, label: '⭐ 4.0 o superior' },
                { value: 4.5, label: '⭐ 4.5 o superior' },
              ].map((item) => {
                const active = filters.minRating === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter('minRating', item.value)}
                    className={`px-4 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all border ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg shadow-blue-500/25 scale-[1.02]'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Disponibilidad y Atributos */}
          <div className="pt-8 space-y-4">
            <label className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-4">
              Disponibilidad y Atributos
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { key: 'openNow', label: 'Abierto ahora', desc: 'Mostrar solo lugares en servicio ahora', icon: Clock },
                { key: 'petFriendly', label: 'Pet Friendly 🐾', desc: 'Permite el ingreso con mascotas', icon: Heart },
                { key: 'accessible', label: 'Accesible ♿', desc: 'Instalaciones para silla de ruedas', icon: Accessibility },
                { key: 'wifi', label: 'Wi-Fi disponible', desc: 'Conexión a internet gratuita', icon: Wifi },
                { key: 'parking', label: 'Estacionamiento', desc: 'Estacionamiento privado o cercano', icon: Car },
              ].map((toggle) => {
                const checked = !!filters[toggle.key];
                const Icon = toggle.icon;
                return (
                  <label
                    key={toggle.key}
                    className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      checked
                        ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-400 dark:border-brand-600 shadow-md shadow-brand-500/5'
                        : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 sm:gap-4 pr-3">
                      <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${checked ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 block leading-snug">
                          {toggle.label}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 block mt-0.5 leading-normal">
                          {toggle.desc}
                        </span>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setFilter(toggle.key, e.target.checked)}
                      className="w-6 h-6 rounded-lg text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-600 dark:bg-slate-800 cursor-pointer shrink-0"
                    />
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* Pie del modal */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-5 py-3 text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-sm sm:text-base font-bold rounded-2xl shadow-xl shadow-blue-500/25 transition-all"
          >
            Aplicar filtros
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
