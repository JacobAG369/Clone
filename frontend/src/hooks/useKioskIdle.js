/**
 * useKioskIdle — detecta inactividad táctil/mouse para el modo kiosco.
 * Si no hay interacción en `timeoutMs` milisegundos, activa el attractor screen.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export function useKioskIdle(timeoutMs = 75000) {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
  }, [timeoutMs]);

  useEffect(() => {
    const events = ['touchstart', 'touchmove', 'mousedown', 'mousemove', 'keydown', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // Inicia el timer
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);

  return { isIdle, resetTimer };
}
