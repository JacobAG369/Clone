import { useState } from 'react';
import catedralImg from '../../assets/catedral.jpg';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { X, Map } from 'lucide-react';
import { getCategorias } from '../../api/home';
import { CategoryCard } from '../../components/ui/cards/CategoryCard';
import { CategorySkeleton } from '../../components/ui/cards/CategorySkeleton';
import { useMapStore } from '../../store/useMapStore';

const CATEGORY_MAP = {
  'Monumentos': {
    iconName: 'Landmark',
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-50',
    mapCategory: 'lugares',
    description:
      'Guadalajara guarda en sus calles monumentos que narran siglos de historia. Desde la imponente Catedral de Guadalajara hasta el Teatro Degollado y el Hospicio Cabañas, cada estructura es un testimonio vivo del patrimonio cultural jalisciense. Recorre los arcos, plazas y esculturas que hacen de esta ciudad un museo a cielo abierto.',
    image: catedralImg,
  },
  'Restaurantes': {
    iconName: 'Utensils',
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50',
    mapCategory: 'restaurantes',
    description:
      'La gastronomía jalisciense es reconocida mundialmente. Desde la tradicional torta ahogada y el birote hasta los chiles toreados y el pozole, los restaurantes de Guadalajara ofrecen una experiencia culinaria inigualable. Encuentra desde fondas familiares con sazón auténtico hasta restaurantes de autor con propuestas contemporáneas.',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200',
  },
  'Eventos': {
    iconName: 'Calendar',
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-50',
    mapCategory: 'eventos',
    description:
      'Guadalajara es una ciudad que nunca duerme culturalmente. El Festival Internacional de Cine de Guadalajara (FICG), la Feria Internacional del Libro (FIL), la Feria de Todos los Santos en Zapopan y decenas de festivales de música y arte hacen de cada mes una celebración. Mantente al tanto de los eventos más importantes de la región.',
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  },
  'Tours': {
    iconName: 'Map',
    colorClass: 'text-emerald-500',
    bgClass: 'bg-emerald-50',
    mapCategory: 'lugares',
    description:
      'Explora Jalisco más allá de la ciudad. Tours al pueblo mágico de Tequila para conocer las destilerías más famosas del mundo, recorridos por la zona de Los Altos, el lago de Chapala y el bosque La Primavera. Guías locales expertos te llevarán a descubrir los rincones más auténticos del estado con experiencias únicas e inolvidables.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200',
  },
  'Compras': {
    iconName: 'ShoppingBag',
    colorClass: 'text-pink-500',
    bgClass: 'bg-pink-50',
    mapCategory: 'lugares',
    description:
      'Guadalajara es la capital de la moda y el comercio en el occidente de México. El Mercado de San Juan de Dios, el mayor mercado techado de América Latina, el Mercado Libertad, la zona de Tlaquepaque con artesanías únicas y la Plaza Tapatía son destinos obligados para los amantes de las compras. Encuentra artesanías, joyería, textiles y mucho más.',
    image:
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
  },
  'Cultura': {
    iconName: 'Palette',
    colorClass: 'text-indigo-500',
    bgClass: 'bg-indigo-50',
    mapCategory: 'lugares',
    description:
      'Cuna del mariachi, el tequila y el arte popular, Guadalajara posee una riqueza cultural incomparable. Sus museos, galerías, centros culturales y espacios públicos albergan expresiones artísticas de primer nivel. El Instituto Cultural Cabañas, Patrimonio de la Humanidad por la UNESCO, la Sala Bicentenario y el Museo de las Artes son solo el inicio de un recorrido cultural extraordinario.',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
  },
};

export function CategoryGrid() {
  const navigate = useNavigate();
  const setActiveCategory = useMapStore((state) => state.setActiveCategory);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: categorias, isLoading, isError } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const handleCategoryClick = (catName) => {
    const detail = CATEGORY_MAP[catName];
    if (detail) {
      setSelectedCategory({ name: catName, ...detail });
    }
  };

  const handleGoToMap = (mapCategory) => {
    setSelectedCategory(null);
    setActiveCategory(mapCategory);
    navigate({ to: '/map' });
  };

  const closeModal = () => setSelectedCategory(null);

  return (
    <>
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Explora por Categoría</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Encuentra exactamente lo que buscas navegando por nuestras secciones populares.
            </p>
          </div>

          {isError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 text-center max-w-2xl mx-auto">
              Hubo un error al cargar las categorías. Por favor, intenta de nuevo.
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
              : categorias?.slice(0, 6).map((cat) => {
                  const mapping = CATEGORY_MAP[cat.nombre] || {
                    iconName: 'Landmark',
                    colorClass: 'text-slate-500',
                    bgClass: 'bg-slate-50',
                  };
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
                })}
          </div>
        </div>
      </section>

      {/* Modal de detalle por categoría */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen de cabecera */}
            <div className="relative h-56 w-full">
              <img
                src={selectedCategory.image}
                alt={selectedCategory.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="absolute bottom-4 left-6 text-2xl font-bold text-white drop-shadow-md">
                {selectedCategory.name}
              </h3>
            </div>

            {/* Contenido */}
            <div className="p-6">
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {selectedCategory.description}
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleGoToMap(selectedCategory.mapCategory)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Ver en el mapa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
