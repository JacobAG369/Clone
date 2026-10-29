/**
 * NuevasGeneracionesPanel — Modal de aviso de inmersión para el público de 10 a 16 años.
 * Informa al usuario que está a punto de emerger en una experiencia personalizada
 * para su edad y redirige al menú principal exclusivo de Nuevas Generaciones.
 * Sin emojis. Estilo fusión Tu-Turismo (Cyan/Indigo) + Jalisco (Agave Teal, Ámbar, Terracota).
 */
import React from 'react';
import {
  X,
  Compass,
  Sparkles,
  Flame,
  ShieldCheck,
  ArrowRight,
  ArrowLeftRight,
  Layers,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-slate-950 text-white shadow-[0_25px_70px_-15px_rgba(6,182,212,0.35)] border border-cyan-500/30 flex flex-col max-h-[92vh]">
        {/* Barra cromática superior con identidad Tu-Turismo + Jalisco */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-teal-400 via-amber-500 to-rose-500" />

        {/* Portada Visual con Arte de Jalisco */}
        <div className="relative h-48 sm:h-56 w-full overflow-hidden shrink-0">
          <img
            src={catedralImg}
            alt="Experiencia Nuevas Generaciones Jalisco"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-indigo-950/70 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-600/35 via-transparent to-amber-500/35" />

          {/* Ilustración geométrica vectorial estilo Agave y Sol Tapatío */}
          <svg
            viewBox="0 0 200 200"
            aria-hidden="true"
            className="absolute -right-10 -bottom-10 w-48 h-48 text-amber-400/20 pointer-events-none"
            fill="none"
          >
            <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 8" />
            <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M100 15L114 72L165 40L128 86L185 100L128 114L165 160L114 128L100 185L86 128L35 160L72 114L15 100L72 86L35 40L86 72Z"
              fill="currentColor"
            />
          </svg>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Cerrar aviso"
          >
            <X size={18} />
          </button>

          {/* Distintivo de Edad e Identidad */}
          <div className="absolute top-4 left-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg">
              <Sparkles size={12} className="stroke-[2.5]" />
              <span>Público 10 a 16 años</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-950/70 text-cyan-300 border border-cyan-400/40 backdrop-blur-md">
              <span>Edición Jalisco</span>
            </span>
          </div>

          {/* Título Principal sobre la portada */}
          <div className="absolute bottom-4 left-6 right-6">
            <p className="text-xs font-extrabold uppercase tracking-widest text-amber-300 mb-1">
              Aviso de cambio de experiencia
            </p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Estás por emerger en Nuevas Generaciones
            </h2>
          </div>
        </div>

        {/* Cuerpo del Aviso */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 border border-cyan-500/25">
            <p className="text-sm text-slate-200 leading-relaxed">
              Estás a punto de entrar a una <strong className="text-cyan-300 font-bold">experiencia personalizada para jóvenes de 10 a 16 años</strong>. Al continuar, serás redirigido a un <strong className="text-amber-300 font-bold">menú principal exclusivo</strong> con un diseño diferente, creado especialmente para descubrir Jalisco a tu manera.
            </p>
          </div>

          {/* Pilares visuales de lo que cambia (Sin emojis, solo iconos vectoriales) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-teal-500/25 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Layers size={16} />
              </div>
              <div className="text-xs font-extrabold text-white">Menú Exclusivo</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Interfaz propia con mundos de aventura, ciencia, miradores y antojos tapatíos.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/25 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Flame size={16} />
              </div>
              <div className="text-xs font-extrabold text-white">Retos e Insignias</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Misiones interactivas por Guadalajara y Jalisco para subir tu nivel de explorador.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-rose-500/25 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-300">
                <ShieldCheck size={16} />
              </div>
              <div className="text-xs font-extrabold text-white">100% Adaptado</div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Contenido seleccionado para tu edad; puedes volver al menú clásico cuando quieras.
              </p>
            </div>
          </div>
        </div>

        {/* Footer de confirmación y redirección */}
        <div className="p-6 pt-3 bg-slate-900/90 border-t border-slate-800/90 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleImmerse}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-amber-500 hover:from-cyan-400 hover:via-indigo-500 hover:to-amber-400 text-white font-black text-sm shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Compass size={18} className="stroke-[2.5]" />
            <span>
              {isJuniorMode
                ? 'Ir al Menú Principal Nuevas Generaciones'
                : 'Sumergirme e ir al Menú Exclusivo'}
            </span>
            <ArrowRight size={17} className="stroke-[2.5]" />
          </button>

          {isJuniorMode ? (
            <button
              type="button"
              onClick={handleExitToStandard}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeftRight size={14} className="text-amber-400" />
              <span>Salir y volver al menú principal estándar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Continuar en el menú estándar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
