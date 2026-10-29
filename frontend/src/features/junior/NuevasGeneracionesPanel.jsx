/**
 * NuevasGeneracionesPanel — panel del modo adaptado para usuarios jóvenes (10 a 16 años).
 * Permite explorar por intereses juveniles, seguir insignias y activar el filtrado en el mapa.
 */
import React from 'react';
import { X, Trophy, Sparkles, MapPin, Award, Compass, UtensilsCrossed, FlaskConical, Camera } from 'lucide-react';
import { useGeneracionesStore, JUNIOR_CATEGORIES } from '../../store/useGeneracionesStore';
import { useNavigate } from '@tanstack/react-router';

const JUNIOR_ICONS = {
  aventura: Compass,
  antojos: UtensilsCrossed,
  curiosidades: FlaskConical,
  aesthetic: Camera,
};

const BADGES_INFO = {
  explorador_bronce: { label: 'Explorador Bronce', desc: 'Visitaste 3 lugares' },
  explorador_plata: { label: 'Explorador Plata', desc: 'Visitaste 10 lugares' },
  explorador_oro: { label: 'Explorador Oro', desc: 'Visitaste 25 lugares' },
};

export default function NuevasGeneracionesPanel({ onClose }) {
  const {
    isJuniorMode,
    setJuniorMode,
    toggleJuniorMode,
    activeJuniorCategory,
    setActiveJuniorCategory,
    badges,
    collectedSpots,
  } = useGeneracionesStore();

  const navigate = useNavigate();

  const handleSelectCategory = (categoryId) => {
    if (!isJuniorMode) {
      setJuniorMode(true);
    }
    setActiveJuniorCategory(categoryId);
    onClose();
    navigate({ to: '/map' });
  };

  const handleActivateAll = () => {
    if (!isJuniorMode) {
      setJuniorMode(true);
    }
    setActiveJuniorCategory(null);
    onClose();
    navigate({ to: '/map' });
  };

  const handleDeactivate = () => {
    if (isJuniorMode) {
      toggleJuniorMode();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header estilo Tu-Turismo */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative border-b border-indigo-900/40">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            aria-label="Cerrar panel"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles size={16} />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
              Tu-Turismo
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-white">
            Nuevas Generaciones
          </h2>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Experiencia diseñada para jóvenes y adolescentes de 10 a 16 años. Explora rutas interactivas, gastronomía típica, cultura y los mejores puntos de Jalisco.
          </p>
        </div>

        {/* Estadísticas de Exploración */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700 text-center">
            <div className="px-2">
              <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                {collectedSpots.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Lugares visitados
              </div>
            </div>
            <div className="px-2">
              <div className="text-lg font-black text-amber-500">
                {badges.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Insignias
              </div>
            </div>
            <div className="px-2">
              <div className="text-lg font-black text-cyan-600 dark:text-cyan-400">
                {JUNIOR_CATEGORIES.length}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                Categorías
              </div>
            </div>
          </div>
        </div>

        {/* Categorías Temáticas */}
        <div className="p-6 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Filtrar por interés
            </span>
            {isJuniorMode && activeJuniorCategory && (
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Filtro activo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {JUNIOR_CATEGORIES.map((cat) => {
              const Icon = JUNIOR_ICONS[cat.id] || Compass;
              const isSelected = isJuniorMode && activeJuniorCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm'
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                      {cat.sublabel}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Insignias Obtenidas */}
          {badges.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                Insignias desbloqueadas
              </span>
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  >
                    <Award size={13} className="text-amber-600 dark:text-amber-400" />
                    {BADGES_INFO[b]?.label || b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con Acciones */}
        <div className="p-6 pt-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
          {!isJuniorMode ? (
            <button
              type="button"
              onClick={handleActivateAll}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              <span>Activar modo Nuevas Generaciones</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDeactivate}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-300 dark:border-slate-700 transition-all active:scale-[0.99]"
            >
              Volver al modo estándar
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
