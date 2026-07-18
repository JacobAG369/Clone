import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { getCategorias } from '../../api/home';
import { CategoryCard } from '../../components/ui/cards/CategoryCard';
import { CategorySkeleton } from '../../components/ui/cards/CategorySkeleton';
import { useMapStore } from '../../store/useMapStore';

// Map database category names to Lucide icons and colors
const CATEGORY_MAP = {
  'Monumentos': { iconName: 'Landmark', colorClass: 'text-blue-500', bgClass: 'bg-blue-50' },
  'Restaurantes': { iconName: 'Utensils', colorClass: 'text-orange-500', bgClass: 'bg-orange-50' },
  'Eventos': { iconName: 'Calendar', colorClass: 'text-purple-500', bgClass: 'bg-purple-50' },
  'Tours': { iconName: 'Map', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-50' },
  'Compras': { iconName: 'ShoppingBag', colorClass: 'text-pink-500', bgClass: 'bg-pink-50' },
  'Cultura': { iconName: 'Palette', colorClass: 'text-indigo-500', bgClass: 'bg-indigo-50' },
};

export function CategoryGrid() {
  const navigate = useNavigate();
  const setActiveCategory = useMapStore((state) => state.setActiveCategory);

  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias
  });

  const handleCategoryClick = (catName) => {
    const norm = (catName || '').toLowerCase();
    if (norm.includes('restaurante') || norm.includes('comida')) {
      setActiveCategory('restaurantes');
    } else if (norm.includes('evento') || norm.includes('festival')) {
      setActiveCategory('eventos');
    } else {
      setActiveCategory('lugares');
    }
    navigate({ to: '/map' });
  };

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Explora por Categoría</h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Encuentra exactamente lo que buscas navegando por nuestras secciones populares.
          </p>
        </div>

        {isError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 text-center max-w-2xl mx-auto">
            Hubo un error al cargar las categorías. Por favor, intenta de nuevo.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
          ) : (
            categorias?.slice(0, 6).map((cat) => {
              const mapping = CATEGORY_MAP[cat.nombre] || { iconName: 'Landmark', colorClass: 'text-slate-500', bgClass: 'bg-slate-50' };
              return (
                <CategoryCard
                  key={cat._id || cat.id}
                  name={cat.nombre}
                  iconName={mapping.iconName}
                  colorClass={mapping.colorClass}
                  bgClass={mapping.bgClass}
                  onClick={() => handleCategoryClick(cat.nombre)}
                />
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
