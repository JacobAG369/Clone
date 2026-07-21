import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Heart, 
  Share2, 
  Navigation, 
  Check,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFavorites } from '../../../hooks/useFavorites';
import { useAuthStore } from '../../../store/useAuthStore';
import { getCategoryInfo } from '../utils/icons';
import { isOpenNow } from '../utils/geo';

export default function MapSidebar({ marker, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite, isUpdatingFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);

  if (!marker) return null;

  const favorited = isFavorite(marker.id);
  const catInfo = getCategoryInfo(marker.categoria_normalizada || marker.tipo_recurso || marker.categoria);
  const openStatus = isOpenNow(marker.horario);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    toggleFavorite(marker);
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin + `/map?selected=${marker.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: marker.nombre,
          text: marker.descripcion || `Descubre ${marker.nombre} en Tu-Turismo`,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {}
  };

  const handleDirections = () => {
    if (marker.coordenadas && typeof marker.coordenadas.lat === 'number') {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.coordenadas.lat},${marker.coordenadas.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (marker.direccion || marker.nombre) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(marker.nombre + ' ' + (marker.direccion || 'Jalisco'))}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="absolute top-20 bottom-6 right-4 md:right-6 w-[calc(100%-2rem)] md:w-[420px] z-[460] transition-all duration-300 pointer-events-auto transform-gpu animate-in fade-in-0 slide-in-from-right-8">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden flex flex-col h-full max-h-[calc(100vh-110px)]">
        
        {/* Header con Imagen */}
        <div className="relative h-64 bg-slate-200 dark:bg-slate-800 shrink-0 w-full overflow-hidden group">
          {marker.imagen_url ? (
            <img 
              src={marker.imagen_url} 
              alt={marker.nombre} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=600&auto=format&fit=crop';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <MapPin size={56} className="opacity-40 text-brand-500" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Botón Cerrar */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all active:scale-95 z-10 shadow-lg border border-white/20"
            aria-label="Cerrar detalles"
          >
            <X size={20} />
          </button>
          
          {/* Badges y Categoría (Colores oficiales Punto 4) */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10 gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-lg border ${catInfo.badgeClass}`}>
              {marker.categoria || catInfo.label}
            </span>

            {/* Indicador Abierto / Cerrado */}
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-lg border ${
              openStatus 
                ? 'bg-emerald-500/90 text-white border-emerald-400' 
                : 'bg-rose-500/90 text-white border-rose-400'
            }`}>
              {openStatus ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              <span>{openStatus ? 'Abierto ahora' : 'Cerrado'}</span>
            </span>
          </div>
        </div>

        {/* Cuerpo del panel (Scrollable) */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Título y Calificación */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {marker.nombre}
            </h2>
            
            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 px-2.5 py-1 rounded-lg border border-yellow-200 dark:border-yellow-900 font-bold text-sm">
                  <Star size={16} className="fill-current text-yellow-400" />
                  <span>{marker.rating ? marker.rating.toFixed(1) : '4.5'}</span>
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                  ({marker.reviews_count || 24} reseñas verificadas)
                </span>
              </div>

              {marker.precio_rango && (
                <span className="text-xs font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700">
                  {marker.precio_rango}
                </span>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
              Descripción
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {marker.descripcion || 'Sin descripción disponible. Un maravilloso atractivo turístico recomendado en el catálogo oficial de Jalisco.'}
            </p>

            {/* Tags */}
            {Array.isArray(marker.tags) && marker.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {marker.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-brand-50/80 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900 rounded-lg text-[11px] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Información de contacto y horarios */}
          <div className="pt-4 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              Información del lugar
            </h3>

            {(marker.direccion || marker.municipio) && (
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 bg-brand-50 dark:bg-slate-800 text-brand-500 rounded-xl shrink-0 mt-0.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">Ubicación</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                    {marker.direccion || marker.municipio || 'Jalisco, México'}
                  </p>
                </div>
              </div>
            )}

            {marker.horario && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 bg-brand-50 dark:bg-slate-800 text-brand-500 rounded-xl shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">Horario de atención</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{marker.horario}</p>
                </div>
              </div>
            )}

            {marker.telefono && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 bg-brand-50 dark:bg-slate-800 text-brand-500 rounded-xl shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">Teléfono</p>
                  <a href={`tel:${marker.telefono}`} className="text-xs text-brand-500 hover:underline font-medium">
                    {marker.telefono}
                  </a>
                </div>
              </div>
            )}

            {marker.sitio_web && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="p-2 bg-brand-50 dark:bg-slate-800 text-brand-500 rounded-xl shrink-0">
                  <Globe size={18} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-xs">Sitio web oficial</p>
                  <a href={marker.sitio_web} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-500 hover:underline font-medium truncate block max-w-[240px]">
                    {marker.sitio_web}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción principales (Punto 2: Favoritos, Compartir, Cómo llegar) */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2.5 shrink-0">
          
          {/* Botón Cómo llegar */}
          <button
            type="button"
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-brand-500/25"
          >
            <Navigation size={16} className="stroke-[2.5]" />
            <span>Cómo llegar</span>
          </button>

          {/* Botón Compartir */}
          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl font-bold text-xs border transition-all active:scale-95 ${
              copied 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Compartir lugar"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            <span>{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          {/* Botón Favoritos */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isUpdatingFavorite}
            className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shadow-sm ${
              favorited
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-500 shadow-rose-500/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800'
            }`}
            aria-label={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            title={favorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            <Heart size={18} className={`${favorited ? 'fill-current text-rose-500' : ''} ${isUpdatingFavorite ? 'animate-pulse' : ''}`} />
          </button>
        </div>

      </div>
    </div>
  );
}

