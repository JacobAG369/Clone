import { Link, useNavigate } from '@tanstack/react-router';
import catedralImg from '../../assets/catedral.jpg';
import { useMapStore } from '../../store/useMapStore';

export function HomeHero() {
  const navigate = useNavigate();
  const setActiveCategory = useMapStore((state) => state.setActiveCategory);

  const handleViewEvents = () => {
    setActiveCategory('eventos');
    navigate({ to: '/map' });
  };

  return (
    <section className="relative min-h-[460px] sm:min-h-[520px] md:h-[600px] py-12 sm:py-20 md:py-24 w-full flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${catedralImg}")` }}
      >
        <div className="absolute inset-0 bg-slate-900/65 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-md leading-tight">
          Conoce la tierra del <br className="hidden sm:inline" />
          <span className="text-cyan-400">tequila y el mariachi</span>
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-slate-200 mb-6 sm:mb-10 drop-shadow max-w-2xl mx-auto leading-relaxed">
          Explora los mejores lugares turísticos, eventos culturales y sabores tradicionales de Guadalajara.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none mx-auto">
          <Link 
            to="/map" 
            onClick={() => setActiveCategory('lugares')} 
            className="px-6 sm:px-8 py-3 rounded-full font-bold text-sm sm:text-base bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow-lg hover:shadow-cyan-400/50 w-full sm:w-auto text-center inline-block active:scale-95"
          >
            Explorar lugares
          </Link>
          <button 
            onClick={handleViewEvents}
            className="px-6 sm:px-8 py-3 rounded-full font-bold text-sm sm:text-base bg-violet-500 text-white hover:bg-violet-400 transition-colors shadow-lg hover:shadow-violet-400/50 w-full sm:w-auto text-center inline-block cursor-pointer active:scale-95"
          >
            Ver Eventos
          </button>
        </div>
      </div>
    </section>
  );
}
