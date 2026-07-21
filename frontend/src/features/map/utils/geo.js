/**
 * Utilidades geoespaciales y de filtrado para el mapa de Tu-Turismo.
 */

/**
 * Calcula la distancia en metros entre dos coordenadas usando la fórmula de Haversine.
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (typeof lat1 !== 'number' || typeof lon1 !== 'number' || typeof lat2 !== 'number' || typeof lon2 !== 'number') {
    return null;
  }
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Formatea la distancia en metros a un texto legible (ej. "350 m" o "2.4 km").
 */
export function formatDistance(meters) {
  if (meters === null || meters === undefined || isNaN(meters)) return null;
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Evalúa el estado Abierto / Cerrado basándose en el texto de horario o el día y hora actual.
 */
export function isOpenNow(horario) {
  if (!horario || typeof horario !== 'string') {
    // Si no tiene horario especificado, asumimos abierto por defecto para turismo público
    return true;
  }
  const lower = horario.toLowerCase();
  if (lower.includes('24 horas') || lower.includes('siempre abierto')) return true;
  if (lower.includes('cerrado permanentemente') || lower.includes('temporalmente cerrado')) return false;

  // Si tiene un formato como "09:00 - 18:00" o "9:00 - 21:00"
  const timeMatch = lower.match(/(\d{1,2}):(\d{2})\s*(?:-|a|to)\s*(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
    const endMinutes = parseInt(timeMatch[3], 10) * 60 + parseInt(timeMatch[4], 10);
    
    if (endMinutes < startMinutes) {
      // Abre tarde y cierra al día siguiente (ej. 18:00 - 02:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return true;
}

/**
 * Filtra marcadores según la búsqueda de texto y los filtros avanzados seleccionados.
 */
export function filterAndSearchMarkers(markers, {
  searchQuery = '',
  activeCategory = 'all',
  filters = {},
  userLocation = null,
  nearbyRadiusKm = 5,
  exploreNearbyActive = false,
}) {
  if (!Array.isArray(markers)) return [];

  return markers.filter((marker) => {
    // 0. Coordenadas válidas
    if (!marker.coordenadas || typeof marker.coordenadas.lat !== 'number' || typeof marker.coordenadas.lng !== 'number') {
      return false;
    }
    if (marker.coordenadas.lat === 0 && marker.coordenadas.lng === 0) {
      return false;
    }

    // 1. Filtro por categoría (si no es 'all' o 'favoritos', el filtrado lo hace o aquí o por API)
    if (activeCategory && activeCategory !== 'all' && activeCategory !== 'favoritos') {
      const catNorm = marker.categoria_normalizada || 'turismo';
      if (catNorm !== activeCategory && marker.tipo_recurso !== activeCategory) {
        // También checamos si el usuario busca específicamente en colecciones
        if (activeCategory === 'turismo' && catNorm !== 'turismo') return false;
        if (activeCategory === 'restaurantes' && catNorm !== 'restaurantes') return false;
        if (activeCategory === 'museos' && catNorm !== 'museos') return false;
        if (activeCategory === 'eventos' && catNorm !== 'eventos') return false;
      }
    }

    // 2. Búsqueda por texto (Nombre, categoría o ciudad) - Punto 1
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = (marker.nombre || '').toLowerCase().includes(query);
      const matchCat = (marker.categoria || marker.tipo || marker.categoria_normalizada || '').toLowerCase().includes(query);
      const matchMuni = (marker.municipio || marker.direccion || '').toLowerCase().includes(query);
      const matchTags = Array.isArray(marker.tags) && marker.tags.some(t => String(t).toLowerCase().includes(query));

      if (!matchName && !matchCat && !matchMuni && !matchTags) {
        return false;
      }
    }

    // 3. Explorar cerca (Punto 7)
    if (exploreNearbyActive && userLocation) {
      const distMeters = calculateDistanceMeters(
        userLocation.lat,
        userLocation.lng,
        marker.coordenadas.lat,
        marker.coordenadas.lng
      );
      if (distMeters !== null && distMeters > nearbyRadiusKm * 1000) {
        return false;
      }
    }

    // 4. Filtros Avanzados (Punto 6)
    if (filters.minRating && filters.minRating > 0) {
      const r = marker.rating || 0;
      if (r < filters.minRating) return false;
    }

    if (filters.priceRange && filters.priceRange !== 'all') {
      const pr = (marker.precio_rango || marker.rango_precio || '$').trim();
      if (pr !== filters.priceRange) return false;
    }

    if (filters.openNow) {
      if (!isOpenNow(marker.horario)) return false;
    }

    const checkTagOrText = (keywords) => {
      const text = `${marker.descripcion || ''} ${marker.direccion || ''} ${marker.nombre || ''}`.toLowerCase();
      const hasInTags = Array.isArray(marker.tags) && marker.tags.some(t => keywords.some(k => String(t).toLowerCase().includes(k)));
      const hasInText = keywords.some(k => text.includes(k));
      return hasInTags || hasInText;
    };

    if (filters.accessible) {
      if (!checkTagOrText(['accesib', 'silla de ruedas', 'rampa'])) return false;
    }
    if (filters.petFriendly) {
      if (!checkTagOrText(['pet', 'mascot', 'perro'])) return false;
    }
    if (filters.wifi) {
      if (!checkTagOrText(['wifi', 'wi-fi', 'internet'])) return false;
    }
    if (filters.parking) {
      if (!checkTagOrText(['estacionamiento', 'parking', 'cochera', 'valet'])) return false;
    }

    return true;
  });
}
