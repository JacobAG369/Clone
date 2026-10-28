/**
 * NuevasGeneracionesPanel — panel completo del modo gamificado para jóvenes.
 * Muestra categorías de aventura, estadísticas y control del modo.
 */
import { X, Trophy, Star, Sparkles, Zap, MapPin } from 'lucide-react';
import { useGeneracionesStore, JUNIOR_CATEGORIES } from '../../store/useGeneracionesStore';
import { useNavigate } from '@tanstack/react-router';

const BADGES_INFO = {
  explorador_bronce: { label: '🥉 Explorador Bronce', desc: 'Visitaste 3 lugares' },
  explorador_plata: { label: '🥈 Explorador Plata', desc: 'Visitaste 10 lugares' },
  explorador_oro: { label: '🥇 Explorador Oro', desc: 'Visitaste 25 lugares' },
};

export default function NuevasGeneracionesPanel({ onClose }) {
  const { isJuniorMode, toggleJuniorMode, badges, collectedSpots } = useGeneracionesStore();
  const navigate = useNavigate();

  const handleActivate = () => {
    if (!isJuniorMode) toggleJuniorMode();
    onClose();
    navigate({ to: '/map' });
  };

  const handleDeactivate = () => {
    if (isJuniorMode) toggleJuniorMode();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 fade-in duration-400"
        style={{ border: '2px solid rgba(167, 139, 250, 0.3)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 px-6 pt-6 pb-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {['🌟', '⚡', '🎮', '🏆', '✨'].map((emoji, i) => (
              <span
                key={i}
                className="absolute text-2xl opacity-20"
                style={{
                  left: `${15 + i * 18}%`,
                  top: `${Math.random() * 60 + 10}%`,
                  animation: `juniorFloat ${2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.3}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative z-10">
            <div className="text-3xl mb-2">🎈</div>
            <h2 className="text-white font-black text-2xl leading-tight">
              Tu-Turismo
              <br />
              <span className="text-yellow-300">Nuevas Generaciones</span>
            </h2>
            <p className="text-white/80 text-sm mt-1 font-medium">
              ¡Explora Jalisco a tu estilo! Para viajeros de 10 a 16 años 🚀
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 flex justify-around">
            <div className="text-center">
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400">
                {collectedSpots.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Lugares</div>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-amber-500">
                {badges.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Medallas</div>
            </div>
            <div className="w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-500">
                {JUNIOR_CATEGORIES.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">Categorías</div>
            </div>
          </div>
        </div>

        {/* Categorías */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            ¿Qué quieres explorar hoy?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {JUNIOR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`bg-gradient-to-br ${cat.color} rounded-2xl p-4 text-left shadow-md hover:shadow-lg hover:scale-105 transition-all active:scale-95 text-white`}
                onClick={() => {
                  handleActivate();
                }}
              >
                <div className="text-xl mb-1">{cat.label.split(' ')[0]}</div>
                <div className="font-bold text-sm leading-tight">{cat.label.split(' ').slice(1).join(' ')}</div>
                <div className="text-white/75 text-xs mt-1 leading-tight">{cat.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Medallas */}
        {badges.length > 0 && (
          <div className="px-6 pb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Tus Medallas
            </p>
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400"
                >
                  {BADGES_INFO[b]?.label || b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="p-6 pt-4 flex flex-col gap-3">
          {!isJuniorMode ? (
            <button
              onClick={handleActivate}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-98"
            >
              ⚡ ¡Activar Modo Aventura!
            </button>
          ) : (
            <button
              onClick={handleDeactivate}
              className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Volver al modo clásico
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>

      <style>{`
        @keyframes juniorFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
