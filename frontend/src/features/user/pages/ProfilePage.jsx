import { useQuery } from '@tanstack/react-query';
import { Settings, LogOut, MapPin, Mail, Phone, User, Calendar, Star } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useLogoutMutation } from '../../auth/hooks/useLogoutMutation';
import { getFavoritePlaces, getFavoriteEvents } from '../../../api/user';
import { LugarCard } from '../../../components/ui/cards/LugarCard';
import { EventoCard } from '../../../components/ui/cards/EventoCard';
import { SkeletonCard } from '../../../components/ui/cards/SkeletonCard';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogoutMutation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate({ to: '/login' });
  };

  const { data: places, isLoading: isLoadingPlaces } = useQuery({
    queryKey: ['favorite-places'],
    queryFn: getFavoritePlaces,
    retry: 1,
  });

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['favorite-events'],
    queryFn: getFavoriteEvents,
    retry: 1,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative mb-8">
        <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-3">
          <Link 
            to="/config" 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-700 bg-slate-200 flex-shrink-0">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.nombre || 'User'}&background=random`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {user?.nombre || user?.name || ''} {user?.apellido || ''}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2 opacity-80">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4" />
                <span>{user?.email || 'email@ejemplo.com'}</span>
              </div>
              <div className="hidden sm:block text-slate-300 dark:text-slate-600">•</div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4" />
                <span>{user?.telefono || '+1 234 567 890'}</span>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm font-medium mt-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              {user?.direccion ? user.direccion : 'Ubicación no especificada'}
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lugares Favoritos */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lugares Favoritos</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {isLoadingPlaces ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : places && places.length > 0 ? (
              places.map((favorito) => (
               <LugarCard 
                  key={favorito.referencia_id} 
                  title={favorito.recurso.nombre}
                  image={favorito.recurso.imagen}
                  category="Lugar"
                  rating={favorito.recurso.rating}
                  location={favorito.recurso.ubicacion || favorito.recurso.localidad || 'Ubicación no especificada'}
                  className="!flex-row !h-32"
                />
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No tienes lugares favoritos aún.</p>
              </div>
            )}
          </div>
        </section>

        {/* Eventos Guardados */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-2">
            <Calendar className="w-6 h-6 text-primary-500" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Eventos Guardados</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {isLoadingEvents ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            ) : events && events.length > 0 ? (
              events.map((favorito) => (
                <EventoCard 
                  key={favorito.referencia_id} 
                  title={favorito.recurso.nombre}
                  image={favorito.recurso.imagen}
                  date={favorito.recurso.fecha || new Date().toISOString().split('T')[0]}
                  location={favorito.recurso.ubicacion || favorito.recurso.localidad || 'Ubicación no especificada'}
                  category="Evento"
                />
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400">No tienes eventos guardados aún.</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
