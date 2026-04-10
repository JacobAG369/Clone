import { Link } from '@tanstack/react-router';
import { Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 py-12 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo / Desc */}
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Tu-Turismo</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Descubre los mejores lugares, eventos y restaurantes en la ciudad. Tu experiencia perfecta comienza aquí.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Lugares Populares</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Próximos Eventos</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Restaurantes Recomendados</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Tours Guiados</Link></li>
            </ul>
          </div>

          {/* Información */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Información</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-primary transition-colors">Acerca de nosotros</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Términos y condiciones</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Política de privacidad</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Guadalajara, Jalisco, México</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span>+52 (33) 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span>contacto@tu-turismo.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdaptiCode. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
