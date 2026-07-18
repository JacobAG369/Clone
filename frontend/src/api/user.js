import api from './axios';
import { favoritesApi } from './favorites';

export const getUserProfile = async () => {
  const response = await api.get('/core/auth/me/');
  return response.data;
};

export const updateUserProfile = async (userData) => {
  const response = await api.put('/core/auth/me/', userData);
  return response.data;
};

export const getFavorites = async (options = {}) => {
  return favoritesApi.getFavorites(options);
};

export const getFavoritePlaces = async () => {
  return favoritesApi.getFavorites({ tipo: 'lugar' });
};

export const getFavoriteEvents = async () => {
  return favoritesApi.getFavorites({ tipo: 'evento' });
};

export const getFavoriteRestaurants = async () => {
  return favoritesApi.getFavorites({ tipo: 'restaurante' });
};

