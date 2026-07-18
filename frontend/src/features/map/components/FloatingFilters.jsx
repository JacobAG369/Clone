import { CATEGORIES } from '../utils/icons';
import { useMapStore } from '../../../store/useMapStore';

export default function FloatingFilters() {
  const activeCategory = useMapStore((state) => state.activeCategory);
  const setActiveCategory = useMapStore((state) => state.setActiveCategory);

  return (
    <div
      className="absolute top-1/2 left-4 z-[400] flex -translate-y-1/2 flex-col gap-3"
      role="group"
      aria-label="Filtros del mapa"
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
              className={[
                'flex items-center justify-center rounded-full border p-3 shadow-xl backdrop-blur-md transition-all duration-300 transform-gpu',
                isActive
                  ? 'bg-brand-500 text-white scale-110 shadow-brand-500/50 border-brand-400'
                  : 'bg-white/90 text-slate-700 shadow-black/10 border-slate-200/60 hover:scale-110 hover:bg-white dark:bg-slate-900/90 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:shadow-black/40',
              ].join(' ')}
            >
              <Icon size={24} className={isActive ? 'text-white' : 'text-brand-500 dark:text-brand-400'} />
            </button>

            <span
              id={labelId}
              className="absolute left-full ml-4 whitespace-nowrap rounded-lg bg-slate-900/95 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 dark:bg-slate-800/95"
            >
              {category.label}
              <span className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-900/95 dark:bg-slate-800/95" />
            </span>
          </div>
        );
      })}
    </div>
  );
}
