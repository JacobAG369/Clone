import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { Heart, Navigation } from 'lucide-react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

import { useThemeStore } from '../../../store/useThemeStore';
import { useFavorites } from '../../../hooks/useFavorites';
import { mapApi } from '../../../api/map';
import { useMapStore } from '../../../store/useMapStore';
import { useMapWebsockets } from '../hooks/useMapWebsockets';
import { getCategoryIcon, getMarkerColorInfo, getCategoryInfo } from '../utils/icons';
import { clusterMarkers } from '../utils/clustering';
import { filterAndSearchMarkers } from '../utils/geo';

// Componentes modulares propuestos en la mejora (Puntos 1 al 9)
import MapSearchBar from './MapSearchBar';
import MapSidebar from './MapSidebar';
import MapResultsPanel from './MapResultsPanel';
import MapAdvancedFiltersModal from './MapAdvancedFiltersModal';
import ExploreNearbyControls from './ExploreNearbyControls';
import FloatingFilters from './FloatingFilters';

const cartoKey = import.meta.env.VITE_CARTO_API_KEY;

const LightTiles = cartoKey
  ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${cartoKey}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const DarkTiles = cartoKey
  ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const mapAttribution = cartoKey
  ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Subcomponent to automatically fit bounds on category change
function MapUpdater({ markers, selectedCategory }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const validCoords = markers
        .filter(m => m.coordenadas && typeof m.coordenadas.lat === 'number' && typeof m.coordenadas.lng === 'number' && !(m.coordenadas.lat === 0 && m.coordenadas.lng === 0))
        .map(m => [m.coordenadas.lat, m.coordenadas.lng]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [80, 80], maxZoom: validCoords.length === 1 ? 16 : 15 });
        }
      }
    }
  }, [markers, map, selectedCategory]);

  return null;
}

// Subcomponent to fly to selected marker
function SelectedMarkerFlyTo({ selectedMarker }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedMarker?.coordenadas && typeof selectedMarker.coordenadas.lat === 'number' && typeof selectedMarker.coordenadas.lng === 'number' && !(selectedMarker.coordenadas.lat === 0 && selectedMarker.coordenadas.lng === 0)) {
      map.flyTo([selectedMarker.coordenadas.lat, selectedMarker.coordenadas.lng], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedMarker, map]);

  return null;
}

// Subcomponente para mostrar la ubicación GPS actual del usuario (Punto 7)
function UserLocationLayer({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || typeof userLocation.lat !== 'number' || typeof userLocation.lng !== 'number') {
      return;
    }

    const iconHtml = `<div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inline-flex w-full h-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
      <span class="relative inline-flex items-center justify-center w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg text-white">${renderToString(<Navigation size={10} className="stroke-[3]" />)}</span>
    </div>`;

    const divIcon = L.divIcon({
      html: iconHtml,
      className: 'bg-transparent border-none',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([userLocation.lat, userLocation.lng], { icon: divIcon, zIndexOffset: 1000 }).addTo(map);

    return () => {
      map.removeLayer(marker);
    };
  }, [userLocation, map]);

  return null;
}

// Capa de Marcadores con Clustering Progresivo (Punto 3 y 4)
function MarkersLayer({ markers, favoriteIds, selectedMarkerId, onMarkerClick }) {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());

  useEffect(() => {
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map]);

  const clusteredItems = useMemo(() => {
    return clusterMarkers(markers, currentZoom);
  }, [markers, currentZoom]);

  useEffect(() => {
    const layerGroup = L.layerGroup().addTo(map);

    clusteredItems.forEach((item) => {
      if (!item.coordenadas || typeof item.coordenadas.lat !== 'number' || typeof item.coordenadas.lng !== 'number') {
        return;
      }

      if (item.isCluster) {
        // Renderizar Clúster (Punto 3)
        const domCatInfo = getCategoryInfo(item.dominantCategory);
        const count = item.count;
        
        const clusterHtml = `<div class="relative flex items-center justify-center font-black text-white rounded-full shadow-2xl border-4 border-white dark:border-slate-800 cursor-pointer transition-all duration-300 hover:scale-110 ${domCatInfo.markerClass.split(' ')[0]} ${count > 10 ? 'w-14 h-14 text-sm' : 'w-12 h-12 text-xs'}">
          <span>${count}</span>
          <span class="absolute -bottom-1 text-[9px] bg-slate-900 text-white px-1.5 py-0.2 rounded-full font-bold shadow">${domCatInfo.label}</span>
        </div>`;

        const divIcon = L.divIcon({
          html: clusterHtml,
          className: 'bg-transparent border-none',
          iconSize: [56, 56],
          iconAnchor: [28, 28],
        });

        const clusterMarker = L.marker([item.coordenadas.lat, item.coordenadas.lng], { icon: divIcon });
        clusterMarker.on('click', () => {
          if (item.bounds) {
            const latLngBounds = L.latLngBounds(item.bounds);
            map.fitBounds(latLngBounds, { padding: [60, 60], maxZoom: 16 });
          }
        });
        layerGroup.addLayer(clusterMarker);

      } else {
        // Renderizar Pin Individual con color de categoría o favorito (Punto 4)
        const { lat, lng } = item.coordenadas;
        const isFavorite = favoriteIds.includes(item.id);
        const isSelected = selectedMarkerId === item.id;
        const colorInfo = getMarkerColorInfo(item, isSelected, isFavorite);
        const IconComponent = colorInfo.icon;

        const baseClasses = isSelected
          ? 'w-12 h-12 bg-amber-500 scale-125 ring-4 ring-white dark:ring-slate-900 shadow-amber-500/70 z-[200] animate-bounce'
          : `w-11 h-11 ${colorInfo.markerClass} hover:scale-110`;

        const iconHtml = `<div class="relative rounded-full text-white flex items-center justify-center shadow-xl border-[3px] border-white dark:border-slate-800 transition-all duration-300 cursor-pointer ${baseClasses}">
          ${renderToString(<IconComponent size={isSelected ? 24 : 20} />)}
          ${isFavorite ? `<span class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md border border-white dark:border-slate-800">${renderToString(<Heart size={11} fill="currentColor" />)}</span>` : ''}
        </div>`;

        const divIcon = L.divIcon({
          html: iconHtml,
          className: 'bg-transparent border-none',
          iconSize: [44, 44],
          iconAnchor: [22, 44],
        });

        const leafletMarker = L.marker([lat, lng], { icon: divIcon });
        leafletMarker.on('click', () => onMarkerClick(item.id));
        layerGroup.addLayer(leafletMarker);
      }
    });

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [clusteredItems, favoriteIds, map, selectedMarkerId, onMarkerClick]);

  return null;
}

export default function MainMap() {
  const { theme, mapTheme } = useThemeStore();
  const { favoriteItems } = useFavorites();
  const {
    activeCategory,
    selectedMarkerId,
    setSelectedMarkerId,
    searchQuery,
    filters,
    userLocation,
    nearbyRadiusKm,
    exploreNearbyActive,
  } = useMapStore();

  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Convertir favoriteItems a IDs
  const favoriteIds = useMemo(() => {
    return favoriteItems.map((fav) => fav.referencia_id || fav.id);
  }, [favoriteItems]);

  useMapWebsockets();

  // Cargar catálogo completo para búsqueda instantánea
  const { data: allMarkers = [], isLoading: isAllLoading } = useQuery({
    queryKey: ['map-all-markers'],
    queryFn: () => mapApi.getAllMarkers(),
  });

  // Cargar marcadores de la categoría activa
  const { data: categoryMarkers = [], isLoading: isCategoryLoading, error } = useQuery({
    queryKey: ['map-markers', activeCategory],
    queryFn: () => mapApi.getMarkers(activeCategory),
  });

  // Si activeCategory es 'favoritos', tomamos el catálogo y filtramos por IDs en favoriteIds
  const rawMarkers = useMemo(() => {
    if (activeCategory === 'favoritos') {
      return allMarkers.filter(m => favoriteIds.includes(m.id));
    }
    return categoryMarkers;
  }, [activeCategory, allMarkers, categoryMarkers, favoriteIds]);

  // Aplicar filtros avanzados, búsqueda y radio GPS (Punto 1, 6 y 7)
  const filteredMarkers = useMemo(() => {
    return filterAndSearchMarkers(rawMarkers, {
      searchQuery,
      activeCategory,
      filters,
      userLocation,
      nearbyRadiusKm,
      exploreNearbyActive,
    });
  }, [rawMarkers, searchQuery, activeCategory, filters, userLocation, nearbyRadiusKm, exploreNearbyActive]);

  const selectedMarker = useMemo(() => {
    return allMarkers.find(m => m.id === selectedMarkerId) || filteredMarkers.find(m => m.id === selectedMarkerId);
  }, [allMarkers, filteredMarkers, selectedMarkerId]);

  const defaultCenter = [20.6668, -103.3518]; // Guadalajara / Jalisco centro

  return (
    <div className="relative w-full h-full flex-1 min-h-[600px] z-0 bg-slate-100 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      
      {/* 1. Barra de búsqueda superior (Punto 1) */}
      <MapSearchBar allMarkers={allMarkers} />

      {/* 2. Dock de categorías y controles superiores flotantes (Punto 4 y 8) */}
      <FloatingFilters
        onOpenFilters={() => setIsAdvancedFiltersOpen(true)}
        markersCount={filteredMarkers.length}
      />

      {/* Indicador de carga general */}
      {(isCategoryLoading || isAllLoading) && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-[450] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
          <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Actualizando destinos en Jalisco...</span>
        </div>
      )}

      {error && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-[500] bg-rose-500 text-white px-4 py-2 rounded-xl shadow-xl font-bold text-xs">
          Error al cargar marcadores del mapa. Intenta nuevamente.
        </div>
      )}

      {/* Mapa Principal Leaflet */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        zoomControl={false}
        className="w-full h-full min-h-[600px] z-0 font-sans"
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <TileLayer
          key={mapTheme === 'dark' || theme === 'dark' ? 'dark' : 'light'}
          attribution={mapAttribution}
          url={mapTheme === 'dark' || theme === 'dark' ? DarkTiles : LightTiles}
          className={(mapTheme === 'dark' || theme === 'dark') && !cartoKey ? 'map-tiles-dark' : ''}
          maxZoom={19}
        />

        <MarkersLayer
          markers={filteredMarkers}
          favoriteIds={favoriteIds}
          selectedMarkerId={selectedMarkerId}
          onMarkerClick={setSelectedMarkerId}
        />

        <UserLocationLayer userLocation={userLocation} />

        <MapUpdater markers={filteredMarkers} selectedCategory={activeCategory} />
        <SelectedMarkerFlyTo selectedMarker={selectedMarker} />
      </MapContainer>

      {/* 3. Botón Explorar Cerca y control de radio GPS (Punto 7) */}
      <ExploreNearbyControls />

      {/* 4. Panel / Lista de resultados sincronizada (Punto 5 y 9) */}
      <MapResultsPanel
        markers={filteredMarkers}
        isLoading={isCategoryLoading || isAllLoading}
      />

      {/* 5. Panel Lateral con detalles completos (Punto 2) */}
      <MapSidebar
        marker={selectedMarker}
        onClose={() => setSelectedMarkerId(null)}
      />

      {/* 6. Modal de Filtros Avanzados (Punto 6) */}
      <MapAdvancedFiltersModal
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
      />
    </div>
  );
}
