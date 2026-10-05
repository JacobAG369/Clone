import { Link, useRouterState } from '@tanstack/react-router';
import { Home, Map, Heart, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Inicio',
    Icon: Home,
    exact: true,
  },
  {
    to: '/map',
    label: 'Explorar',
    Icon: Map,
    exact: false,
  },
  {
    to: '/favorites',
    label: 'Favoritos',
    Icon: Heart,
    exact: false,
    authRequired: true,
  },
  {
    to: '/profile',
    label: 'Perfil',
    Icon: User,
    exact: false,
    // Si no está autenticado, re-redirige a /login desde la ruta
    authFallback: '/login',
  },
];

export function BottomNavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Ocultar en la pantalla del mapa para no tapar controles de Leaflet
  const isMapRoute = pathname.startsWith('/map');
  if (isMapRoute) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden"
      aria-label="Navegación principal"
    >
      {/* Backdrop blur con borde superior sutil */}
      <div className="bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <ul className="flex items-stretch justify-around h-16 px-2 safe-area-pb">
          {NAV_ITEMS.map(({ to, label, Icon, exact, authRequired, authFallback }) => {
            // Calcular destino real según autenticación
            const resolvedTo =
              authFallback && !isAuthenticated ? authFallback : to;

            // Determinar si es la ruta activa
            const isActive = exact
              ? pathname === to
              : pathname.startsWith(to) && to !== '/';

            // Ocultar items que requieren auth si no está autenticado
            if (authRequired && !isAuthenticated) return null;

            return (
              <li key={to} className="flex-1">
                <Link
                  to={resolvedTo}
                  className={clsx(
                    'flex flex-col items-center justify-center gap-0.5 h-full w-full',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg',
                    'group'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Indicador activo: pill arriba del icono */}
                  <span
                    className={clsx(
                      'absolute top-0 h-0.5 w-8 rounded-full transition-all duration-300',
                      isActive
                        ? 'bg-cyan-500 opacity-100 scale-x-100'
                        : 'opacity-0 scale-x-0'
                    )}
                    aria-hidden="true"
                  />

                  {/* Ícono con micro-animación */}
                  <span
                    className={clsx(
                      'flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200',
                      isActive
                        ? 'bg-cyan-500/10 dark:bg-cyan-400/10 scale-110'
                        : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800 group-hover:scale-105'
                    )}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.75}
                      className={clsx(
                        'transition-colors duration-200',
                        isActive
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      )}
                    />
                  </span>

                  {/* Label */}
                  <span
                    className={clsx(
                      'text-[10px] font-semibold leading-none transition-colors duration-200',
                      isActive
                        ? 'text-cyan-600 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
