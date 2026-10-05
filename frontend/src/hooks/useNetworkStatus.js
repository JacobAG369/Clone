/**
 * useNetworkStatus — hook reactivo para el estado online/offline del navegador.
 *
 * Devuelve { isOnline } y mantiene el valor actualizado sin polling:
 * escucha los eventos nativos 'online' y 'offline' del window.
 * Se limpia automáticamente al desmontar (sin memory leaks).
 */
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
}
