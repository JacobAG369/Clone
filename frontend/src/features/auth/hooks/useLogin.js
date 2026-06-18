import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials) => {
      // Endpoint real: POST /api/v1/core/auth/login/
      // Respuesta: { access_token, refresh_token, token_type, expires_in, user }
      // (Sin wrapper { success, data } — los endpoints de auth devuelven directo)
      const response = await api.post('/core/auth/login/', credentials);
      return response.data;
    },
    onMutate: () => {
      useAuthStore.getState().clearError();
    },
    onSuccess: (data) => {
      // El backend devuelve access_token (no token)
      useAuthStore.getState().setAuthSession(data.user, data.access_token);
      queryClient.setQueryData(['auth-user'], data.user);
    },
    onError: (error) => {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'No se pudo iniciar sesión.';
      useAuthStore.getState().setError(msg);
    },
  });
}
