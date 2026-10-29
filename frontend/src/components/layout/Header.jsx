import { useState, useEffect } from 'react';
import { useLottie } from 'lottie-react';
import tutuLottie from '../../assets/tutu-lottie.json';

import { Bell, Heart, Map, Shield, User, Download, Compass, ArrowLeftRight } from 'lucide-react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { ThemeToggle } from '../ThemeToggle';
import { useAuthStore } from '../../store/useAuthStore';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import { useNotifications } from '../../hooks/useNotifications';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { NotificationPanel } from '../ui/NotificationPanel';

export function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { isJuniorMode, setJuniorMode, setActiveJuniorCategory, syncFromUser } = useGeneracionesStore();
  const { unreadCount, notificationsQuery } = useNotifications();
  const { isInstallable, installApp } = usePWAInstall();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isMapRoute = pathname.startsWith('/map');

  // Sincronizar spots e insignias guardados en el usuario autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      syncFromUser(user);
    }
  }, [isAuthenticated, user, syncFromUser]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const { View } = useLottie({
    animationData: tutuLottie,
    loop: false,
    style: {
      height: '56px',
      maxHeight: '100%',
    }
  });

  const handleExitJuniorMode = () => {
    setJuniorMode(false);
    setActiveJuniorCategory(null);
    navigate({ to: '/' });
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isJuniorMode
          ? 'bg-white/95 border-amber-300/80 shadow-sm'
          : 'bg-white/85 dark:bg-slate-900/85 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {isJuniorMode && (
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 via-amber-500 to-rose-500" />
      )}

      <div className="container mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity shrink-0" title="Tu-Turismo Logo">
            <div className="flex-shrink-0 drop-shadow-sm h-12 sm:h-14 flex items-center">
              {View}
            </div>
          </Link>

          {isJuniorMode && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold tracking-wide hover:bg-amber-100 transition-colors"
              >
                <Compass className="w-3.5 h-3.5 text-amber-600" />
                <span>Menú Joven 10-16</span>
              </Link>
              <button
                type="button"
                onClick={handleExitJuniorMode}
                title="Salir al menú estándar"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3 h-3 text-cyan-600" />
                <span>Menú Estándar</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation & Profile */}
        <nav className="flex items-center">
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
            {isInstallable && (
              <button
                type="button"
                onClick={installApp}
                title="Instalar aplicación Tu-Turismo"
                aria-label="Instalar app"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[11px] sm:text-xs shadow-md shadow-cyan-500/20 hover:from-cyan-600 hover:to-blue-700 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Instalar</span>
              </button>
            )}

            <Link
              to="/map"
              title="Ver mapa"
              className="hidden md:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Map className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>

            {isAuthenticated && (
              <Link
                to="/favorites"
                title="Mis Favoritos"
                className="hidden md:flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const nextState = !isPanelOpen;
                    setIsPanelOpen(nextState);
                    if (nextState) {
                      notificationsQuery?.refetch?.();
                    }
                  }}
                  className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-4 h-4 sm:min-w-5 sm:h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] sm:text-[10px] font-bold text-white pointer-events-none">
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
                title="Panel de Administración"
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            )}

            {isMapRoute && <ThemeToggle />}

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              title={isAuthenticated ? 'Mi Perfil' : 'Iniciar Sesión'}
              className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
