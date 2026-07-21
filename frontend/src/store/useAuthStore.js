// el estado de autenticación vive aquí. localStorage incluido. no es elegante, pero cumple su trabajo.
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
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
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
  },
}));
