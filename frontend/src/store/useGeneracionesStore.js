/**
 * useGeneracionesStore — estado global para el modo "Nuevas Generaciones"
 * (UX gamificada para jóvenes de 10 a 16 años).
 * Persiste en localStorage para mantener el modo entre sesiones.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const JUNIOR_CATEGORIES = [
  {
    id: 'aventura',
    label: '🎮 Aventura',
    sublabel: 'Parques · Tirolesas · Skate',
    color: 'from-emerald-400 to-teal-500',
    keywords: ['parque', 'aventura', 'deporte', 'zoológico', 'acuario', 'bici', 'skate'],
  },
  {
    id: 'antojos',
    label: '🍦 Antojos',
    sublabel: 'Nieves · Dulces · Cafés',
    color: 'from-rose-400 to-pink-500',
    keywords: ['nieve', 'dulce', 'pastelería', 'café', 'heladería', 'torta', 'taco', 'restaurante'],
  },
  {
    id: 'curiosidades',
    label: '🧪 Curiosidades',
    sublabel: 'Ciencia · Mitos · Historia',
    color: 'from-violet-400 to-purple-500',
    keywords: ['museo', 'ciencia', 'historia', 'planetario', 'exposición', 'cultura', 'arte'],
  },
  {
    id: 'aesthetic',
    label: '📸 Fotos',
    sublabel: 'Miradores · Murales · Spots',
    color: 'from-amber-400 to-orange-500',
    keywords: ['mural', 'mirador', 'letras', 'arte', 'urbano', 'fotografia', 'plaza', 'jardín'],
  },
];

export const useGeneracionesStore = create(
  persist(
    (set, get) => ({
      isJuniorMode: false,
      activeJuniorCategory: null,
      badges: [], // IDs de medallas desbloqueadas
      collectedSpots: [], // IDs de lugares visitados

      toggleJuniorMode: () =>
        set((state) => ({
          isJuniorMode: !state.isJuniorMode,
          activeJuniorCategory: null,
        })),

      setJuniorMode: (val) => set({ isJuniorMode: val }),

      setActiveJuniorCategory: (categoryId) =>
        set({ activeJuniorCategory: categoryId }),

      unlockBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      collectSpot: (spotId) => {
        const state = get();
        if (state.collectedSpots.includes(spotId)) return;
        const newSpots = [...state.collectedSpots, spotId];
        set({ collectedSpots: newSpots });
        // Desbloquear medalla al llegar a hitos
        if (newSpots.length >= 3) get().unlockBadge('explorador_bronce');
        if (newSpots.length >= 10) get().unlockBadge('explorador_plata');
        if (newSpots.length >= 25) get().unlockBadge('explorador_oro');
      },

      reset: () =>
        set({
          isJuniorMode: false,
          activeJuniorCategory: null,
          badges: [],
          collectedSpots: [],
        }),
    }),
    {
      name: 'tu-turismo-generaciones',
      partialize: (state) => ({
        isJuniorMode: state.isJuniorMode,
        badges: state.badges,
        collectedSpots: state.collectedSpots,
      }),
    }
  )
);
