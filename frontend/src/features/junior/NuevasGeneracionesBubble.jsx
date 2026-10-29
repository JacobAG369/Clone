/**
 * NuevasGeneracionesBubble — burbuja flotante para activar/desactivar
 * el modo "Tu-Turismo Nuevas Generaciones" (experiencia adaptada para 10-16 años).
 * Visible para usuarios turistas o visitantes.
 */
import { useState } from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import NuevasGeneracionesPanel from './NuevasGeneracionesPanel';

export default function NuevasGeneracionesBubble() {
  const { isJuniorMode, badges } = useGeneracionesStore();
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);

  // Solo visible para turistas o usuarios no autenticados (no para admins)
  if (user && user.rol === 'admin') return null;

  const badgeCount = badges.length;

  return (
    <>
      {/* Botón Flotante Nuevas Generaciones */}
      <div className="fixed bottom-20 md:bottom-6 left-4 z-40 flex flex-col items-start gap-1">
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-lg backdrop-blur-xl transition-all duration-300 active:scale-95 hover:scale-105 border ${
            isJuniorMode
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500'
          }`}
          aria-label="Abrir panel Nuevas Generaciones"
        >
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full transition-transform duration-300 group-hover:scale-110 ${
              isJuniorMode
                ? 'bg-white/20 text-white'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <Sparkles size={15} />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight leading-tight">
              {isJuniorMode ? 'Nuevas Gen' : 'Nuevas Generaciones'}
            </span>
            <span
              className={`text-[10px] leading-tight font-medium ${
                isJuniorMode ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {isJuniorMode ? 'Modo Activo' : '10 a 16 años'}
            </span>
          </div>

          {badgeCount > 0 && (
            <span
              className={`flex items-center gap-1 text-[11px] font-extrabold rounded-full px-2 py-0.5 leading-none ${
                isJuniorMode
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
              }`}
            >
              <Trophy size={11} />
              {badgeCount}
            </span>
          )}
        </button>
      </div>

      {/* Modal / Panel descriptivo */}
      {showPanel && <NuevasGeneracionesPanel onClose={() => setShowPanel(false)} />}
    </>
  );
}
