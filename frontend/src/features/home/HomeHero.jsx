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
    <section className="relative h-[600px] w-full flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${catedralImg}")` }}
      >
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-md">
          Conoce la tierra del <br />
          <span className="text-primary-400">tequila y el mariachi</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-200 mb-10 drop-shadow max-w-2xl mx-auto">
          Explora los mejores lugares turísticos, eventos culturales y sabores tradicionales de Guadalajara.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/map" 
            onClick={() => setActiveCategory('lugares')} 
            className="px-8 py-3 rounded-full font-semibold bg-cyan-500 text-white hover:bg-cyan-400 transition-colors shadow-lg hover:shadow-cyan-400/50 w-full sm:w-auto text-center inline-block"
          >
            Explorar lugares
          </Link>
          <button 
            onClick={handleViewEvents}
            className="px-8 py-3 rounded-full font-semibold bg-violet-400 text-white hover:bg-violet-300 transition-colors shadow-lg hover:shadow-violet-400/50 w-full sm:w-auto text-center inline-block cursor-pointer"
          >
            Ver Eventos
          </button>
        </div>
      </div>
    </section>
  );
}
