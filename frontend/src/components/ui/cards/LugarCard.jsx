import { Star, MapPin, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from '@tanstack/react-router';
import { useMapStore } from '../../../store/useMapStore';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const LugarCard = ({ 
  title, 
  image, 
  category, 
  rating = null, 
  location,
  description,
  extra,
  coords,
  className 
}) => {
  const navigate = useNavigate();
  const setMapCenter = useMapStore((state) => state.setMapCenter);

  const handleCardClick = () => {
    if (coords) {
      setMapCenter({ lat: coords.lat, lng: coords.lng });
    }
    navigate({ to: '/map' });
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn("bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 flex flex-col h-full group cursor-pointer", className)}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={image || 'https://images.unsplash.com/photo-1501504905252-473c47e087f8'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {category && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
            {title}
          </h3>
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-bold">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-2">{description}</p>
        )}

        {location && (
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-1">
            <MapPin className="w-4 h-4 mr-1 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </div>
        )}

        {extra && (
          <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm mb-2">
            <Clock className="w-4 h-4 mr-1 text-primary-400 flex-shrink-0" />
            <span className="line-clamp-1">{extra}</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
          <button className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 px-4 py-2 rounded-full transition-colors duration-200">
            Ver más
          </button>
        </div>
      </div>
    </div>
  );
};
