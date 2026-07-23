// 1. Agregamos useEffect a la importación de React
import { useState, useEffect } from 'react';
import { useLottie } from 'lottie-react';
import tutuLottie from '../../assets/tutu-lottie.json';

import { Bell, Heart, Map, Shield, User } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ThemeToggle } from '../ThemeToggle';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationPanel } from '../ui/NotificationPanel';

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // 2. NUEVOS ESTADOS PARA CONTROLAR EL SCROLL
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isMapRoute = pathname.startsWith('/map');

  // 3. EFECTO QUE DETECTA LA DIRECCIÓN DEL SCROLL
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Si bajamos (current > last) y ya pasamos los primeros 50px, ocultamos el header
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        // Si subimos, lo mostramos
        setIsVisible(true);
      }

      // Actualizamos la última posición
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);

    // Limpieza del event listener al desmontar el componente
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]); // El efecto se vuelve a ejecutar cada vez que cambia lastScrollY

  const { View } = useLottie({
    animationData: tutuLottie,
    loop: false,
    style: {
      height: '72px'
    }
  });

  // 4. MODIFICAMOS LAS CLASES DEL HEADER PARA APLICAR LA ANIMACIÓN
  return (
    <header
      className={`sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity" title="Tu-Turismo Logo">
          <div className="flex-shrink-0 drop-shadow-sm">
            {View}
          </div>
        </Link>

        {/* Navigation & Profile */}
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link
              to="/map"
              title="Ver mapa"
              className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Map className="w-6 h-6" />
            </Link>

            {isAuthenticated && (
              <Link
                to="/favorites"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen((prev) => !prev)}
                  className="relative flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white pointer-events-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationPanel
                  isOpen={isPanelOpen}
                  onClose={() => setIsPanelOpen(false)}
                />
              </div>
            )}

            {user?.rol === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="w-6 h-6" />
              </Link>
            )}

            {isMapRoute && <ThemeToggle />}

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
        </nav>
      </div>
    </header >
  );
}