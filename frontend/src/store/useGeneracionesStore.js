/**
 * useGeneracionesStore — estado global para el modo "Nuevas Generaciones"
 * (experiencia para jóvenes y adolescentes de 10 a 16 años).
 * Persiste en localStorage para mantener el estado entre sesiones.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const JUNIOR_CATEGORIES = [
  {
    id: 'aventura',
    name: 'Aventura',
    label: 'Aventura',
    iconName: 'Compass',
    sublabel: 'Parques, zoológicos y deportes',
    color: 'from-blue-600 to-indigo-600',
    activeClass: 'bg-blue-600 text-white border-blue-400',
    keywords: [
      'parque', 'aventura', 'deporte', 'zoológico', 'acuario', 'bici', 'skate',
      'ecoturismo', 'natural', 'bosque', 'selva', 'lago', 'cascada', 'cañón',
      'senderismo', 'tirolesa', 'recreativo', 'acuático', 'balneario'
    ],
  },
  {
    id: 'antojos',
    name: 'Antojos',
    label: 'Antojos',
    iconName: 'UtensilsCrossed',
    sublabel: 'Nieves, postres y comida típica',
    color: 'from-amber-600 to-orange-600',
    activeClass: 'bg-orange-600 text-white border-orange-400',
    keywords: [
      'nieve', 'dulce', 'pastelería', 'café', 'heladería', 'torta', 'taco',
      'restaurante', 'comida', 'gastronom', 'antojito', 'mercado', 'birria',
      'chocolate', 'pan', 'churros', 'postre', 'lonchería', 'mariscos'
    ],
  },
  {
    id: 'curiosidades',
    name: 'Curiosidades',
    label: 'Curiosidades',
    iconName: 'FlaskConical',
    sublabel: 'Museos interactivos, ciencia e historia',
    color: 'from-purple-600 to-violet-600',
    activeClass: 'bg-purple-600 text-white border-purple-400',
    keywords: [
      'museo', 'ciencia', 'historia', 'planetario', 'exposición', 'cultura',
      'arte', 'teatro', 'cabañas', 'trompo', 'arqueol', 'templo', 'palacio',
      'recorrido', 'galería', 'taller', 'centro cultural'
    ],
  },
  {
    id: 'aesthetic',
    name: 'Spots de Foto',
    label: 'Spots de Foto',
    iconName: 'Camera',
    sublabel: 'Miradores, murales y panorámicas',
    color: 'from-rose-600 to-pink-600',
    activeClass: 'bg-rose-600 text-white border-rose-400',
    keywords: [
      'mirador', 'mural', 'letras', 'arte', 'urbano', 'fotografia', 'plaza',
      'jardín', 'centro', 'catedral', 'panorámica', 'arquitectura', 'monumento',
      'fuente', 'paseo', 'malecón', 'kiosco'
    ],
  },
];

export const useGeneracionesStore = create(
  persist(
    (set, get) => ({
      isJuniorMode: false,
      activeJuniorCategory: null,
      badges: [],
      collectedSpots: [],

      toggleJuniorMode: () =>
        set((state) => ({
          isJuniorMode: !state.isJuniorMode,
          activeJuniorCategory: null,
        })),

      setJuniorMode: (val) => set({ isJuniorMode: val }),

      setActiveJuniorCategory: (categoryId) =>
        set((state) => ({
          activeJuniorCategory: state.activeJuniorCategory === categoryId ? null : categoryId,
        })),

      unlockBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      collectSpot: (spotId) => {
        const state = get();
        if (!spotId || state.collectedSpots.includes(spotId)) return;
        const newSpots = [...state.collectedSpots, spotId];
        set({ collectedSpots: newSpots });
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
