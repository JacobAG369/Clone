import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      mapTheme: 'light', // Separate theme state for map
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      toggleMapTheme: () =>
        set((state) => ({ mapTheme: state.mapTheme === 'light' ? 'dark' : 'light' })),
      resetMapTheme: () =>
        set({ mapTheme: 'light' }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
