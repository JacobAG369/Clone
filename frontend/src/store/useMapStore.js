import { create } from 'zustand';

const loadSearchHistory = () => {
  try {
    const data = localStorage.getItem('tu_turismo_search_history');
    return data ? JSON.parse(data) : ['Tequila', 'Restaurantes', 'Museo Cabañas'];
  } catch (e) {
    return ['Tequila', 'Restaurantes', 'Museo Cabañas'];
  }
};

const saveSearchHistory = (history) => {
  try {
    localStorage.setItem('tu_turismo_search_history', JSON.stringify(history.slice(0, 10)));
  } catch (e) {}
};

export const useMapStore = create((set, get) => ({
  activeCategory: 'all',
  selectedMarkerId: null,
  mapCenter: null,

  // Búsqueda (Punto 1)
  searchQuery: '',
  searchHistory: loadSearchHistory(),
  
  // Panel de resultados / lista (Punto 5)
  showResultsPanel: false,
  
  // Filtros avanzados (Punto 6)
  filters: {
    priceRange: 'all', // 'all', '$', '$$', '$$$'
    minRating: 0,      // 0, 4.0, 4.5
    openNow: false,
    accessible: false,
    petFriendly: false,
    wifi: false,
    parking: false,
  },

  // Explorar cerca (Punto 7)
  userLocation: null,          // { lat, lng }
  nearbyRadiusKm: 5,           // 1, 3, 5, 10, 20
  exploreNearbyActive: false,

  // Acciones
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),
  setMapCenter: (center) => set({ mapCenter: center }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  addSearchHistory: (item) => {
    if (!item || !item.trim()) return;
    const clean = item.trim();
    const current = get().searchHistory.filter(h => h.toLowerCase() !== clean.toLowerCase());
    const next = [clean, ...current].slice(0, 8);
    saveSearchHistory(next);
    set({ searchHistory: next });
  },
  clearSearchHistory: () => {
    saveSearchHistory([]);
    set({ searchHistory: [] });
  },

  setShowResultsPanel: (show) => set({ showResultsPanel: show }),
  toggleResultsPanel: () => set((state) => ({ showResultsPanel: !state.showResultsPanel })),

  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value }
  })),
  resetFilters: () => set({
    filters: {
      priceRange: 'all',
      minRating: 0,
      openNow: false,
      accessible: false,
      petFriendly: false,
      wifi: false,
      parking: false,
    }
  }),

  setUserLocation: (location) => set({ userLocation: location }),
  setNearbyRadiusKm: (radius) => set({ nearbyRadiusKm: radius }),
  setExploreNearbyActive: (active) => set({ exploreNearbyActive: active }),
}));
