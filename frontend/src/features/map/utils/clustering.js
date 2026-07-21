/**
 * clustering.js
 * =============
 * Agrupación de marcadores en clústeres según el nivel de zoom (Punto 3).
 * Funciona de manera progresiva y sin dependencias externas incompatibles con Leaflet v5.
 */

export function clusterMarkers(markers, zoom = 13) {
  if (!Array.isArray(markers) || markers.length === 0) return [];

  // Al acercar mucho (zoom >= 16), separamos progresivamente todos los marcadores para claridad total
  if (zoom >= 16) {
    return markers.map((m) => ({
      ...m,
      isCluster: false,
    }));
  }

  // El tamaño de la celda de la cuadrícula varía exponencialmente con el zoom
  // A menor zoom (ej. 8), la celda es grande y agrupa muchos puntos.
  // A mayor zoom (ej. 15), la celda es pequeña y separa los puntos cercanos.
  const gridSizeDegrees = 40 / Math.pow(2, zoom);

  const grid = new Map();

  markers.forEach((marker) => {
    if (!marker.coordenadas || typeof marker.coordenadas.lat !== 'number' || typeof marker.coordenadas.lng !== 'number') {
      return;
    }

    const cellX = Math.floor(marker.coordenadas.lng / gridSizeDegrees);
    const cellY = Math.floor(marker.coordenadas.lat / gridSizeDegrees);
    const cellKey = `${cellX}_${cellY}`;

    if (!grid.has(cellKey)) {
      grid.set(cellKey, []);
    }
    grid.get(cellKey).push(marker);
  });

  const clusteredResults = [];

  grid.forEach((cellMarkers, cellKey) => {
    if (cellMarkers.length === 1) {
      // Un solo marcador en esta celda no requiere clúster
      clusteredResults.push({
        ...cellMarkers[0],
        isCluster: false,
      });
    } else {
      // Varios marcadores se agrupan en un clúster
      let sumLat = 0;
      let sumLng = 0;
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      const categoryCounts = {
        turismo: 0,
        restaurantes: 0,
        museos: 0,
        eventos: 0,
        favoritos: 0,
      };

      cellMarkers.forEach((m) => {
        const { lat, lng } = m.coordenadas;
        sumLat += lat;
        sumLng += lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;

        const cat = m.categoria_normalizada || 'turismo';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const count = cellMarkers.length;
      const avgLat = sumLat / count;
      const avgLng = sumLng / count;

      // Categoría dominante
      let dominantCategory = 'turismo';
      let maxCatCount = -1;
      Object.entries(categoryCounts).forEach(([catKey, catCount]) => {
        if (catCount > maxCatCount) {
          maxCatCount = catCount;
          dominantCategory = catKey;
        }
      });

      clusteredResults.push({
        id: `cluster_${cellKey}`,
        isCluster: true,
        count,
        coordenadas: { lat: avgLat, lng: avgLng },
        bounds: [
          [minLat, minLng],
          [maxLat, maxLng],
        ],
        dominantCategory,
        categoryCounts,
        markers: cellMarkers,
      });
    }
  });

  return clusteredResults;
}
