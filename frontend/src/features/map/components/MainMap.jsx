import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

import { useThemeStore } from '../../../store/useThemeStore';
import { useFavorites } from '../../../hooks/useFavorites';
import { mapApi } from '../../../api/map';
import { useMapStore } from '../../../store/useMapStore';
import { useMapWebsockets } from '../hooks/useMapWebsockets';
import FloatingFilters from './FloatingFilters';
import { getCategoryIcon } from '../utils/icons';
import PlaceDetailCard from './PlaceDetailCard';

const LightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const DarkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

// Subcomponent to automatically fly to a location or fit bounds
function MapUpdater({ markers, selectedCategory }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [
        m.ubicacion?.coordinates[1] || 0, // lat
        m.ubicacion?.coordinates[0] || 0 // lng
      ]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [markers, map, selectedCategory]);

  return null;
}

function MarkersLayer({ markers, favoriteIds, onMarkerClick }) {
  const map = useMap();

  useEffect(() => {
    const layerGroup = L.layerGroup().addTo(map);

    markers.forEach((marker) => {
      if (!marker.ubicacion || !Array.isArray(marker.ubicacion.coordinates)) {
        return;
      }

      const [lng, lat] = marker.ubicacion.coordinates;
      const IconComponent = getCategoryIcon(marker.tipo_recurso || marker.tipo);
      const isFavorite = favoriteIds.includes(marker.id);

      const iconHtml = `<div class="relative w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 shadow-brand-500/40 transition-transform hover:scale-110">${renderToString(<IconComponent size={20} />)}${isFavorite ? `<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">${renderToString(<Heart size={12} fill="currentColor" />)}</span>` : ''}</div>`;

      const divIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon-container bg-transparent border-none',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const leafletMarker = L.marker([lat, lng], { icon: divIcon });
      leafletMarker.on('click', () => onMarkerClick(marker.id));
      layerGroup.addLayer(leafletMarker);
    });

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [favoriteIds, map, markers, onMarkerClick]);

  return null;
}

export default function MainMap() {
  // Usa el theme de la app directamente: si el usuario desactiva dark mode, el mapa también cambia
  const theme = useThemeStore((state) => state.theme);
  const { favoriteItems } = useFavorites();
  const { activeCategory, selectedMarkerId, setSelectedMarkerId } = useMapStore();

  // Convert favoriteItems array to favoriteIds for MarkersLayer
  const favoriteIds = useMemo(() => {
    return favoriteItems.map((fav) => fav.referencia_id);
  }, [favoriteItems]);

  useMapWebsockets();

  const { data: markers = [], isLoading, error } = useQuery({
    queryKey: ['map-markers', activeCategory],
    queryFn: () => mapApi.getMarkers(activeCategory),
  });

  const selectedMarker = useMemo(() => {
    return markers.find(m => m.id === selectedMarkerId);
  }, [markers, selectedMarkerId]);

  // Center defaults to somewhere, e.g., Mexico City or a generic location
  const defaultCenter = [19.4326, -99.1332];

  return (
    <div className="relative w-full h-full flex-1 min-h-[600px] z-0 bg-slate-100 dark:bg-slate-900">
      
      {isLoading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-red-100 text-red-600 px-4 py-2 rounded-lg shadow-md font-medium text-sm">
          Error al cargar marcadores. Intente nuevamente.
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        className="w-full h-full min-h-[600px] z-0 font-sans"
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={theme === 'dark' ? DarkTiles : LightTiles}
        />

        <MarkersLayer markers={markers} favoriteIds={favoriteIds} onMarkerClick={setSelectedMarkerId} />

        <MapUpdater markers={markers} selectedCategory={activeCategory} />
      </MapContainer>

      {/* Floating UI */}
      <FloatingFilters />
      
      <PlaceDetailCard marker={selectedMarker} onClose={() => setSelectedMarkerId(null)} />
    </div>
  );
}
