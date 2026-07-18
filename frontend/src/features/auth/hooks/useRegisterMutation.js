import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/axios';
import { useAuthStore } from '../../../store/useAuthStore';

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const payload = {
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre,
        apellido: userData.apellido,
        telefono: userData.telefono,
        rol: 'turista',
      };
      const response = await api.post('/core/auth/register/', payload);
      return response.data;
    },
    onMutate: () => {
      useAuthStore.getState().clearError();
    },
    onSuccess: (data) => {
      useAuthStore.getState().setAuthSession(data.user, data.access_token);
      queryClient.setQueryData(['auth-user'], data.user);
    },
    onError: (error) => {
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        'No se pudo completar el registro.';
      useAuthStore.getState().setError(msg);
    },
  });
}
