// notificaciones en tiempo real con actualizaciones optimistas. marca leído, borra, todo sin esperar.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications';
import { useAuthStore } from '../store/useAuthStore';

const NOTIFICATIONS_QUERY_KEY = ['notifications'];

/**
 * useNotifications Hook — fuente única de verdad via useQuery con actualizaciones optimistas.
 */
export function useNotifications() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // fuente única de verdad para notificaciones
  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationsApi.getNotifications,
    enabled: isAuthenticated,
    staleTime: 15000,
    refetchInterval: isAuthenticated ? 20000 : false, // polling cada 20s cuando autenticado
    refetchIntervalInBackground: false,
    placeholderData: [],
  });

  // estado derivado: calculado desde los datos del query
  const unreadCount = () => {
    if (!notificationsQuery.data) return 0;
    return notificationsQuery.data.filter((notif) => !notif.leido).length;
  };

  const hasUnread = () => {
    return unreadCount() > 0;
  };

  const getUnreadNotifications = () => {
    if (!notificationsQuery.data) return [];
    return notificationsQuery.data.filter((notif) => !notif.leido);
  };

  // marcar como leído con actualización optimista
  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousNotifications =
        queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY) || [];

      // actualizar optimistamente: marcar como leído de inmediato
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.map((notif) =>
          notif.id === notificationId ? { ...notif, leido: true } : notif
        )
      );

      return { previousNotifications, notificationId };
    },

    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  // marcar todas como leídas con actualización optimista
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousNotifications =
        queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY) || [];

      // actualizar optimistamente: marcar todas como leídas
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.map((notif) => ({ ...notif, leido: true }))
      );

      return { previousNotifications };
    },

    onError: (_error, _args, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  // eliminar una notificación con actualización optimista
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,

    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousNotifications =
        queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY) || [];

      // actualizar optimistamente: eliminar notificación de inmediato
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.filter((notif) => notif.id !== notificationId)
      );

      return { previousNotifications, notificationId };
    },

    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  // eliminar todas las notificaciones con actualización optimista
  const deleteAllMutation = useMutation({
    mutationFn: notificationsApi.deleteAllNotifications,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousNotifications =
        queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY) || [];

      // actualizar optimistamente: limpiar todo de inmediato
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, []);

      return { previousNotifications };
    },

    onError: (_error, _args, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  return {
    notifications: notificationsQuery.data || [],

    unreadCount: unreadCount(),
    unreadNotifications: getUnreadNotifications(),
    hasUnread: hasUnread(),

    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    error: notificationsQuery.error,

    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    isDeletingAll: deleteAllMutation.isPending,

    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    deleteAllNotifications: deleteAllMutation.mutate,

    notificationsQuery,
  };
}
