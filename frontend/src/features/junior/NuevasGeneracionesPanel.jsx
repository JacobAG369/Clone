/**
 * NuevasGeneracionesPanel — Modal visual, breve y atractivo con fondo claro
 * que avisa al usuario que está por sumergirse en el menú exclusivo (10 a 16 años).
 * Sin emojis.
 */
import React from 'react';
import {
  X,
  Compass,
  Sparkles,
  UtensilsCrossed,
  Award,
  ArrowRight,
  ArrowLeftRight,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import catedralImg from '../../assets/catedral.jpg';

export default function NuevasGeneracionesPanel({ onClose }) {
  const { isJuniorMode, setJuniorMode, setActiveJuniorCategory } = useGeneracionesStore();
  const navigate = useNavigate();

  const handleImmerse = () => {
    setJuniorMode(true);
    setActiveJuniorCategory(null);
    onClose();
    navigate({ to: '/' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitToStandard = () => {
    setJuniorMode(false);
    setActiveJuniorCategory(null);
    onClose();
    navigate({ to: '/' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-white text-slate-900 shadow-2xl border-2 border-amber-300/80 flex flex-col">
        {/* Franja superior colores Tu-Turismo + Jalisco */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-400 via-amber-500 to-rose-500" />

        {/* Imagen de portada atractiva */}
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={catedralImg}
            alt="Aventura Joven Jalisco"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-indigo-950/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-transparent to-amber-500/35" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-transform active:scale-95 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>

          <div className="absolute top-3.5 left-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Sparkles size={12} className="stroke-[2.5]" />
              <span>10 a 16 años · Jalisco</span>
            </span>
          </div>

          <div className="absolute bottom-3.5 left-5 right-5">
            <h2 className="text-2xl font-black text-white leading-tight drop-shadow">
              ¡Prepárate para otra experiencia!
            </h2>
          </div>
        </div>

        {/* Contenido corto, visual y directo sobre fondo claro */}
        <div className="p-5 space-y-4 bg-gradient-to-b from-amber-50/40 via-white to-cyan-50/30">
          <p className="text-sm font-semibold text-slate-700 text-center leading-snug">
            Estás a punto de entrar a un <span className="text-cyan-600 font-black">menú principal exclusivo</span> diseñado para tu edad.
          </p>

          {/* 3 Chips visuales rápidos */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm">
                <Compass size={18} />
              </div>
              <span className="text-xs font-black text-slate-800 leading-tight">4 Mundos</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-xs font-black text-slate-800 leading-tight">Antojos</span>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col items-center gap-1.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
                <Award size={18} />
              </div>
              <span className="text-xs font-black text-slate-800 leading-tight">Insignias</span>
            </div>
          </div>

          {/* Botón Táctil Kiosco Principal */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleImmerse}
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-amber-500 hover:from-cyan-600 hover:to-amber-600 text-white font-black text-base shadow-lg shadow-cyan-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isJuniorMode ? 'Ir al Menú Joven' : '¡Sumergirme ahora!'}</span>
              <ArrowRight size={18} className="stroke-[2.5]" />
            </button>

            {isJuniorMode ? (
              <button
                type="button"
                onClick={handleExitToStandard}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight size={14} className="text-amber-600" />
                <span>Volver al menú estándar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Ahora no
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
