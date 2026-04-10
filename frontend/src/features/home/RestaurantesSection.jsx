import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getRestaurantesRecomendados } from '../../api/home';
import { LugarCard } from '../../components/ui/cards/LugarCard';
import { SkeletonCard } from '../../components/ui/cards/SkeletonCard';
import { useMapStore } from '../../store/useMapStore';

export const RestaurantesSection = () => {
  const setActiveCategory = useMapStore((s) => s.setActiveCategory);
  const { data: restaurantes, isLoading, isError } = useQuery({
    queryKey: ['restaurantes', 'recomendados'],
    queryFn: getRestaurantesRecomendados
  });

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-800/50">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-outfit tracking-tight">Restaurantes Recomendados</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Prueba los sabores tradicionales de nuestra tierra</p>
          </div>
          <Link
            to="/map"
            onClick={() => setActiveCategory('restaurantes')}
            className="hidden sm:block text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Ver todos
          </Link>
        </div>

        {isError && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-800 mb-8">
            Hubo un error al cargar los restaurantes recomendados. Por favor, intenta de nuevo.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            restaurantes?.slice(0, 4).map((restaurante) => (
              <LugarCard
                key={restaurante._id || restaurante.id}
                id={restaurante._id || restaurante.id}
                title={restaurante.nombre}
                image={restaurante.imagenes?.[0]}
                category={restaurante.categoria?.nombre || 'Restaurante'}
                rating={restaurante.rating_promedio ?? null}
                location={restaurante.direccion}
                description={restaurante.descripcion}
                extra={restaurante.horario}
                coords={restaurante.ubicacion?.coordinates
                  ? { lat: restaurante.ubicacion.coordinates[1], lng: restaurante.ubicacion.coordinates[0] }
                  : null}
              />
            ))
          )}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/map"
            onClick={() => setActiveCategory('restaurantes')}
            className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            Ver todos los restaurantes
          </Link>
        </div>
      </div>
    </section>
  );
};
