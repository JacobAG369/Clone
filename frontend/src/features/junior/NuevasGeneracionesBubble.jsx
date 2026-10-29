/**
 * NuevasGeneracionesBubble — Burbuja flotante compacta con miniatura de portada
 * y fondo claro para dar acceso a "Tu-Turismo Nuevas Generaciones" (10 a 16 años).
 * Sin emojis.
 */
import { useState } from 'react';
import { Sparkles, ChevronRight, Award } from 'lucide-react';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import catedralImg from '../../assets/catedral.jpg';
import NuevasGeneracionesPanel from './NuevasGeneracionesPanel';

export default function NuevasGeneracionesBubble() {
  const { isJuniorMode, badges } = useGeneracionesStore();
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);

  if (user && user.rol === 'admin') return null;

  const badgeCount = badges.length;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-5 left-3 sm:left-4 z-40">
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          aria-label="Abrir Nuevas Generaciones"
          className={`group flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-white/95 text-slate-900 shadow-lg hover:shadow-xl backdrop-blur-md transition-all duration-300 active:scale-95 hover:-translate-y-0.5 cursor-pointer border-2 ${
            isJuniorMode
              ? 'border-amber-400 shadow-amber-500/20'
              : 'border-cyan-400/80 hover:border-amber-400 shadow-cyan-500/15'
          }`}
        >
          {/* Miniatura de imagen de portada */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-amber-400/80 shadow-sm">
            <img
              src={catedralImg}
              alt="Portada Nuevas Generaciones"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/35 via-transparent to-amber-500/35" />
          </div>

          {/* Texto compacto */}
          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black tracking-tight text-slate-900">
                Nuevas Generaciones
              </span>
              <Sparkles size={11} className="text-amber-500 shrink-0 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-teal-600">
              {isJuniorMode ? 'Modo Joven Activo' : 'Explora · 10 a 16 años'}
            </span>
          </div>

          {badgeCount > 0 ? (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
              <Award size={11} className="text-amber-600" />
              <span>{badgeCount}</span>
            </span>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-amber-500 text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
              <ChevronRight size={14} className="stroke-[2.5]" />
            </div>
          )}
        </button>
      </div>

      {showPanel && <NuevasGeneracionesPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}
