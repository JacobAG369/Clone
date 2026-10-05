import { Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';
import { BottomNavBar } from './BottomNavBar';
import { OfflineBanner } from './OfflineBanner';
import { useFavorites } from '../../hooks/useFavorites';
import { useThemeStore } from '../../store/useThemeStore';
import { ToastViewport } from '../ui/toast';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { TopRatedBubble } from '../TopRatedBubble';
import { PWAInstallBanner } from '../common/PWAInstallBanner';

export function AppLayout() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isMapRoute = pathname.startsWith('/map');
  const prevIsMapRoute = useRef(isMapRoute);

  useFavorites();

  // Restore light theme when leaving the map
  useEffect(() => {
    if (prevIsMapRoute.current && !isMapRoute) {
      setTheme('light');
    }
    prevIsMapRoute.current = isMapRoute;
  }, [isMapRoute, setTheme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-[100dvh] flex flex-col pt-0 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${isMapRoute ? 'h-[100dvh] overflow-hidden' : ''}`}>
      {/* FASE 4: Aviso de sin conexión — se monta sobre todo el layout */}
      <OfflineBanner />
      <Header />
      <main className={`flex-1 flex flex-col relative w-full ${isMapRoute ? 'pb-0 overflow-hidden h-[calc(100dvh-64px)] sm:h-[calc(100dvh-72px)] min-h-[500px]' : 'pb-20 md:pb-0'}`}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      {!isMapRoute && <Footer />}
      {/* Burbuja flotante — solo en la página principal */}
      {pathname === '/' && <TopRatedBubble />}
      {/* Banner de instalación PWA */}
      <PWAInstallBanner />
      {/* Bottom nav: visible únicamente en móvil (md:hidden interno) */}
      <BottomNavBar />
      <ToastViewport />
    </div>
  );
}
