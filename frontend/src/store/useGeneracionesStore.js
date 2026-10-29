/**
 * useGeneracionesStore — estado global para el modo "Nuevas Generaciones"
 * (experiencia para jóvenes y adolescentes de 10 a 16 años).
 * Sincroniza los spots e insignias con la cuenta del usuario autenticado en MongoDB.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';
import { useAuthStore } from './useAuthStore';

export const JUNIOR_CATEGORIES = [
  {
    id: 'aventura',
    name: 'Aventura',
    label: 'Aventura',
    iconName: 'Compass',
    sublabel: 'Parques, zoológicos y deportes',
    color: 'from-teal-500 to-cyan-600',
    activeClass: 'bg-teal-600 text-white border-teal-400',
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
    color: 'from-amber-500 to-orange-600',
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
    color: 'from-indigo-600 to-violet-600',
    activeClass: 'bg-indigo-600 text-white border-indigo-400',
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
    color: 'from-rose-500 to-amber-500',
    activeClass: 'bg-rose-600 text-white border-rose-400',
    keywords: [
      'mirador', 'mural', 'letras', 'arte', 'urbano', 'fotografia', 'plaza',
      'jardín', 'centro', 'catedral', 'panorámica', 'arquitectura', 'monumento',
      'fuente', 'paseo', 'malecón', 'kiosco'
    ],
  },
];

function computeBadges(spotsCount, currentBadges = []) {
  const next = new Set(Array.isArray(currentBadges) ? currentBadges : []);
  if (spotsCount >= 3) next.add('explorador_bronce');
  if (spotsCount >= 10) next.add('explorador_plata');
  if (spotsCount >= 25) next.add('explorador_oro');
  return Array.from(next);
}

export const useGeneracionesStore = create(
  persist(
    (set, get) => ({
      isJuniorMode: false,
      activeJuniorCategory: null,
      badges: [],
      collectedSpots: [],
      isSyncingSpot: false,

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

      syncFromUser: (user) => {
        if (!user) {
          set({ collectedSpots: [], badges: [] });
          return;
        }
        const prefs = user.preferences || {};
        const userSpots = Array.isArray(prefs.collected_spots)
          ? prefs.collected_spots.map(String)
          : [];
        const userBadges = computeBadges(
          userSpots.length,
          Array.isArray(prefs.badges) ? prefs.badges : []
        );
        set({
          collectedSpots: userSpots,
          badges: userBadges,
        });
      },

      unlockBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      collectSpot: async (spotId) => {
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated || !authState.user) {
          return { ok: false, reason: 'unauthenticated' };
        }

        const state = get();
        const normalizedId = String(spotId || '').trim();
        if (!normalizedId) return { ok: false, reason: 'invalid' };
        if (state.collectedSpots.includes(normalizedId)) {
          return { ok: true, alreadyCollected: true };
        }

        const newSpots = [...state.collectedSpots, normalizedId];
        const newBadges = computeBadges(newSpots.length, state.badges);

        set({
          collectedSpots: newSpots,
          badges: newBadges,
          isSyncingSpot: true,
        });

        try {
          const response = await api.patch('/core/auth/me/', {
            preferences: {
              ...(authState.user.preferences || {}),
              collected_spots: newSpots,
              badges: newBadges,
            },
          });
          if (response?.data) {
            useAuthStore.getState().updateUser(response.data);
          }
          set({ isSyncingSpot: false });
          return { ok: true, spotsCount: newSpots.length, badges: newBadges };
        } catch (err) {
          console.warn('[useGeneracionesStore] No se pudo sincronizar spot con el servidor:', err);
          set({ isSyncingSpot: false });
          return { ok: true, spotsCount: newSpots.length, badges: newBadges };
        }
      },

      clearUserProgress: () =>
        set({
          badges: [],
          collectedSpots: [],
        }),

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
