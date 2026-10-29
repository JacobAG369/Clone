/**
 * NuevasGeneracionesBubble — Tarjeta/burbuja flotante con imagen de portada
 * para avisar y dar acceso a "Tu-Turismo Nuevas Generaciones" (público de 10 a 16 años).
 * Identidad visual: fusión de colores Tu-Turismo (Cyan, Indigo) con paleta Jalisco
 * (Agave Teal, Oro Mariachi/Ámbar y Terracota Rosa). Sin emojis.
 */
import { useState } from 'react';
import { Compass, Sparkles, ArrowUpRight, Award } from 'lucide-react';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import catedralImg from '../../assets/catedral.jpg';
import NuevasGeneracionesPanel from './NuevasGeneracionesPanel';

export default function NuevasGeneracionesBubble() {
  const { isJuniorMode, badges, collectedSpots } = useGeneracionesStore();
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);

  // Solo visible para turistas o visitantes (oculto para rol admin)
  if (user && user.rol === 'admin') return null;

  const badgeCount = badges.length;

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 left-3 sm:left-5 z-40">
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          aria-label="Abrir portal Nuevas Generaciones"
          className={`group relative overflow-hidden rounded-2xl text-left transition-all duration-300 active:scale-95 hover:-translate-y-1 cursor-pointer shadow-2xl ${
            isJuniorMode
              ? 'w-56 sm:w-64 ring-2 ring-amber-400/90 shadow-amber-500/25'
              : 'w-60 sm:w-68 ring-1 ring-cyan-400/50 hover:ring-2 hover:ring-amber-400 shadow-cyan-950/40'
          }`}
        >
          {/* Imagen de portada con arte superpuesto */}
          <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-950">
            <img
              src={catedralImg}
              alt="Portal Nuevas Generaciones Jalisco"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradiente fusión Tu-Turismo (Cyan/Indigo) + Jalisco (Ámbar/Terracota) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/75 to-amber-500/45" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

            {/* Gráfico vectorial decorativo de Agave / Sol de Jalisco (Sin emojis) */}
            <svg
              viewBox="0 0 120 120"
              aria-hidden="true"
              className="absolute -right-5 -top-5 w-24 h-24 text-amber-400/25 transition-transform duration-500 group-hover:rotate-12"
              fill="none"
            >
              <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="3" strokeDasharray="6 6" />
              <path
                d="M60 12L68 44L96 28L76 54L108 60L76 66L96 92L68 76L60 108L52 76L24 92L44 66L12 60L44 54L24 28L52 44Z"
                fill="currentColor"
              />
            </svg>

            {/* Etiqueta superior de edad con colores de Jalisco */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-md">
                <Sparkles size={10} className="stroke-[2.5]" />
                <span>10 a 16 años</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                  isJuniorMode
                    ? 'bg-teal-500/90 text-white border-teal-300/60'
                    : 'bg-slate-900/75 text-cyan-300 border-cyan-400/40'
                }`}
              >
                <Compass size={10} />
                <span>{isJuniorMode ? 'Activo' : 'Jalisco Joven'}</span>
              </span>
            </div>

            {/* Título sobre la portada */}
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 leading-none mb-0.5">
                  Tu-Turismo
                </p>
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight leading-none drop-shadow">
                  Nuevas Generaciones
                </h3>
              </div>

              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:from-amber-400 group-hover:to-rose-500">
                <ArrowUpRight size={15} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Barra inferior interactiva */}
          <div className="bg-slate-950/95 px-3 py-2 flex items-center justify-between border-t border-slate-800/90">
            <span className="text-[11px] font-semibold text-slate-300 truncate">
              {isJuniorMode
                ? `${collectedSpots.length} lugares descubiertos`
                : 'Descubre tu menú exclusivo'}
            </span>

            {badgeCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 shrink-0">
                <Award size={11} />
                <span>{badgeCount}</span>
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 group-hover:text-amber-400 transition-colors shrink-0">
                {isJuniorMode ? 'Opciones' : 'Entrar'}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Modal de aviso de inmersión */}
      {showPanel && <NuevasGeneracionesPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}
