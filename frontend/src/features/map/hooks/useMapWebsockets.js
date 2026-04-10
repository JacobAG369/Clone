// notificaciones en tiempo real. cuando llega un nuevo evento por websocket,
// invalidamos el query de notificaciones para que el panel se refresque solo.
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho, leaveEchoChannel } from '../../../lib/echo';
import { useToast } from '../../../hooks/useToast';

const CHANNEL_NAME = 'mapa-actualizaciones';
const EVENT_NAME = '.nuevo-evento-publicado';

export function useMapWebsockets() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const echo = getEcho();

    if (!echo) {
      return undefined;
    }

    const channel = echo.channel(CHANNEL_NAME);

    channel.listen(EVENT_NAME, (payload) => {
      // Refrescar marcadores del mapa
      queryClient.invalidateQueries({ queryKey: ['map-markers'] });
      queryClient.invalidateQueries({ queryKey: ['map-markers', 'eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos', 'proximos'] });

      // Refrescar el panel de notificaciones para que aparezca la nueva
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      toast({
        title: `🗓️ Nuevo evento: ${payload.nombre || 'Evento disponible'}`,
        description: 'Ya puedes verlo en el mapa.',
      });
    });

    return () => {
      leaveEchoChannel(CHANNEL_NAME);
    };
  }, [queryClient, toast]);
}
