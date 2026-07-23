import { Link } from '@tanstack/react-router';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useMapStore } from '../../store/useMapStore';
import { useLottie } from 'lottie-react';
import tutuLottie from '../../assets/tutu-lottie.json';
import adapticodeLogo from '../../assets/adapti-code.png';

export function Footer() {
  const setActiveCategory = useMapStore((state) => state.setActiveCategory);

  const { View } = useLottie({
    animationData: tutuLottie,
    loop: false,
    style: {
      width: '160px',
      height: '160px'
    }
  });

  return (
    <footer className="bg-slate-800 text-slate-300 py-12 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo / Desc */}
          <div className="flex flex-col items-center">
            <div className="flex justify-center drop-shadow-sm -my-6">
              {View}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed text-center">
              Descubre los mejores lugares, eventos y restaurantes en la ciudad. Tu experiencia perfecta comienza aquí.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/map"
                  onClick={() => setActiveCategory('lugares')}
                  className="hover:text-primary transition-colors"
                >
                  Lugares Populares
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  onClick={() => setActiveCategory('eventos')}
                  className="hover:text-primary transition-colors"
                >
                  Próximos Eventos
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  onClick={() => setActiveCategory('restaurantes')}
                  className="hover:text-primary transition-colors"
                >
                  Restaurantes Recomendados
                </Link>
              </li>
              <li>
                <Link
                  to="/map"
                  onClick={() => setActiveCategory('eventos')}
                  className="hover:text-primary transition-colors"
                >
                  Tours Guiados
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Información</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/acerca" className="hover:text-primary transition-colors">Acerca de nosotros</Link></li>
              <li><Link to="/terminos" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
              <li><Link to="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
              <li><Link to="/faq" className="hover:text-primary transition-colors">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Carretera Santa Cruz-San Isidro Km. 4.5, 45644 Santa Cruz de las Flores, Jal.</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>33 40 72 18 35</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>contacto@tu-turismo.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-row items-center justify-center gap-3 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdaptiCode. Todos los derechos reservados.</p>
          <img src={adapticodeLogo} alt="AdaptiCode Logo" className="h-6 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </footer>
  );
}
