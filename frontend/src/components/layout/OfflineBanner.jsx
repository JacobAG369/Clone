/**
 * OfflineBanner — Aviso visual cuando la app está sin conexión.
 *
 * Diseño:
 *  - Se monta en la cima del layout (sobre el Header), fijo en top-0.
 *  - Aparece/desaparece con una transición suave (translate-y).
 *  - Usa useNetworkStatus para reaccionar en tiempo real.
 *  - No requiere props; es completamente autónomo.
 */
import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { clsx } from 'clsx';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={isOnline ? '' : 'Sin conexión a internet'}
      className={clsx(
        // Posición: fija en la cima, sobre el header (z-[60] > z-50 del header)
        'fixed top-0 inset-x-0 z-[60]',
        // Layout y estilo
        'flex items-center justify-center gap-2.5',
        'px-4 py-2.5',
        'bg-rose-600 text-white text-sm font-semibold',
        'shadow-lg shadow-rose-900/30',
        // Transición suave: aparece desde arriba
        'transition-transform duration-300 ease-in-out',
        isOnline ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <WifiOff size={16} className="shrink-0 animate-pulse" aria-hidden="true" />
      <span>Sin conexión — mostrando contenido guardado</span>
    </div>
  );
}
