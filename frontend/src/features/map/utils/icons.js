import {
  MapPin,
  Utensils,
  Calendar,
  Landmark,
  BedDouble,
  Palette,
  Heart,
  Building2,
  Compass,
} from 'lucide-react';

/**
 * Propuesta oficial de colores (Punto 4):
 * - Turismo: Azul (#2563eb)
 * - Restaurantes: Naranja (#ea580c)
 * - Museos: Morado (#9333ea)
 * - Eventos: Verde (#059669)
 * - Favoritos: Rojo (#e11d48)
 */
export const CATEGORIES = [
  { 
    id: 'all', 
    label: 'Todos', 
    icon: Compass, 
    color: 'blue', 
    colorHex: '#3b82f6',
    badgeClass: 'bg-blue-600 text-white border-blue-400',
    markerClass: 'bg-blue-600 shadow-blue-500/50 border-white dark:border-slate-800'
  },
  { 
    id: 'turismo', 
    label: 'Turismo', 
    icon: Landmark, 
    color: 'blue', 
    colorHex: '#2563eb',
    badgeClass: 'bg-blue-600 text-white border-blue-400',
    markerClass: 'bg-blue-600 shadow-blue-500/50 border-white dark:border-slate-800'
  },
  { 
    id: 'restaurantes', 
    label: 'Restaurantes', 
    icon: Utensils, 
    color: 'orange', 
    colorHex: '#ea580c',
    badgeClass: 'bg-orange-600 text-white border-orange-400',
    markerClass: 'bg-orange-600 shadow-orange-500/50 border-white dark:border-slate-800'
  },
  { 
    id: 'museos', 
    label: 'Museos', 
    icon: Palette, 
    color: 'purple', 
    colorHex: '#9333ea',
    badgeClass: 'bg-purple-600 text-white border-purple-400',
    markerClass: 'bg-purple-600 shadow-purple-500/50 border-white dark:border-slate-800'
  },
  { 
    id: 'eventos', 
    label: 'Eventos', 
    icon: Calendar, 
    color: 'emerald', 
    colorHex: '#059669',
    badgeClass: 'bg-emerald-600 text-white border-emerald-400',
    markerClass: 'bg-emerald-600 shadow-emerald-500/50 border-white dark:border-slate-800'
  },
  { 
    id: 'favoritos', 
    label: 'Favoritos', 
    icon: Heart, 
    color: 'rose', 
    colorHex: '#e11d48',
    badgeClass: 'bg-rose-600 text-white border-rose-400',
    markerClass: 'bg-rose-600 shadow-rose-500/50 border-white dark:border-slate-800'
  },
];

export const getCategoryIcon = (categoryName) => {
  const norm = (categoryName || '').toLowerCase();
  if (norm.includes('restaurante') || norm.includes('comida') || norm.includes('gastronomía')) return Utensils;
  if (norm.includes('evento') || norm.includes('festival') || norm.includes('feria')) return Calendar;
  if (norm.includes('museo') || norm.includes('galería') || norm.includes('arte')) return Palette;
  if (norm.includes('hotel') || norm.includes('hospedaje')) return BedDouble;
  if (norm.includes('favorito')) return Heart;
  return Landmark;
};

export const getCategoryInfo = (categoryName) => {
  const norm = (categoryName || '').toLowerCase();
  if (norm.includes('restaurante') || norm === 'restaurantes') {
    return CATEGORIES.find(c => c.id === 'restaurantes');
  }
  if (norm.includes('evento') || norm === 'eventos') {
    return CATEGORIES.find(c => c.id === 'eventos');
  }
  if (norm.includes('museo') || norm === 'museos' || norm.includes('arte')) {
    return CATEGORIES.find(c => c.id === 'museos');
  }
  if (norm.includes('favorito') || norm === 'favoritos') {
    return CATEGORIES.find(c => c.id === 'favoritos');
  }
  return CATEGORIES.find(c => c.id === 'turismo');
};

export const getMarkerColorInfo = (marker, isSelected = false, isFavorite = false) => {
  const catInfo = getCategoryInfo(marker?.categoria_normalizada || marker?.tipo_recurso || marker?.categoria || marker?.tipo);
  
  if (isSelected) {
    return {
      ...catInfo,
      markerClass: 'bg-amber-500 scale-125 ring-4 ring-white dark:ring-slate-900 shadow-amber-500/70 z-[100] animate-bounce',
      colorHex: '#f59e0b',
    };
  }

  return catInfo;
};
