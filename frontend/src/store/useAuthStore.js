import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,

  setAuthSession: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });

    import('./useGeneracionesStore')
      .then((m) => m.useGeneracionesStore.getState().syncFromUser(user))
      .catch(() => {});
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });

    import('./useGeneracionesStore')
      .then((m) => m.useGeneracionesStore.getState().syncFromUser(user))
      .catch(() => {});
  },

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });

    import('./useGeneracionesStore')
      .then((m) => m.useGeneracionesStore.getState().clearUserProgress())
      .catch(() => {});
  },
}));
