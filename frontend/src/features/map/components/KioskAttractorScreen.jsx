/**
 * KioskAttractorScreen — pantalla de atracción para kioscos desatendidos.
 * Se activa tras 75s de inactividad. Muestra animación e invita a explorar.
 */
import { useEffect, useState } from 'react';
import { MapPin, Star, Utensils, Calendar } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: MapPin, label: 'Plaza de Armas', sub: 'A 5 min caminando', color: 'from-cyan-500 to-blue-600' },
  { icon: Star, label: 'Catedral de Guadalajara', sub: 'Patrimonio histórico', color: 'from-amber-400 to-orange-500' },
  { icon: Utensils, label: 'Gastronomía Tapatía', sub: 'Birria · Tortas Ahogadas', color: 'from-rose-500 to-pink-600' },
  { icon: Calendar, label: 'Eventos de Hoy', sub: 'Cultura y entretenimiento', color: 'from-violet-500 to-purple-600' },
];

export default function KioskAttractorScreen({ onInteract }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const hl = HIGHLIGHTS[activeIdx];
  const Icon = hl.icon;

  return (
    <div
      className="absolute inset-0 z-[2000] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
      onClick={onInteract}
      onTouchStart={onInteract}
    >
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 80 + 20}px`,
              height: `${Math.random() * 80 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'radial-gradient(circle, #38bdf8, #818cf8)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Logo central */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8">
        <div className="mb-2">
          <div className="text-5xl font-black tracking-tight text-white mb-1">
            Tu<span className="text-cyan-400">-</span>Turismo
          </div>
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-400/80">
            Jalisco · Kiosco Turístico
          </div>
        </div>

        {/* Card destacado rotativo */}
        <div
          key={activeIdx}
          className={`flex items-center gap-4 bg-gradient-to-r ${hl.color} rounded-3xl px-8 py-5 shadow-2xl animate-in fade-in zoom-in-95 duration-500`}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <div className="text-white font-bold text-xl leading-tight">{hl.label}</div>
            <div className="text-white/80 text-sm font-medium">{hl.sub}</div>
          </div>
        </div>

        {/* Indicadores del carrusel */}
        <div className="flex gap-2">
          {HIGHLIGHTS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === activeIdx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
            <div className="relative text-white text-lg font-bold bg-cyan-500/20 border-2 border-cyan-400/50 backdrop-blur-md rounded-full px-8 py-3">
              ✋ Toca la pantalla para explorar
            </div>
          </div>
          <p className="text-slate-400 text-xs font-medium">
            Descubre los mejores destinos turísticos de Jalisco
          </p>
        </div>
      </div>
    </div>
  );
}
