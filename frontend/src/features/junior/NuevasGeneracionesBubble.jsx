/**
 * NuevasGeneracionesBubble — burbuja flotante para activar/desactivar
 * el modo "Tu-Turismo Nuevas Generaciones" (UX gamificada para 10-16 años).
 * Solo visible para usuarios turistas o no autenticados.
 */
import { useState } from 'react';
import { X, Sparkles, Trophy, Star } from 'lucide-react';
import { useGeneracionesStore } from '../../store/useGeneracionesStore';
import { useAuthStore } from '../../store/useAuthStore';
import NuevasGeneracionesPanel from './NuevasGeneracionesPanel';

export default function NuevasGeneracionesBubble() {
  const { isJuniorMode, badges } = useGeneracionesStore();
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);

  // Solo visible para turistas o usuarios no autenticados
  if (user && user.rol === 'admin') return null;

  const badgeCount = badges.length;

  return (
    <>
      {/* Burbuja flotante */}
      <div className="fixed bottom-24 md:bottom-8 left-4 z-40 flex flex-col items-start gap-2">
        <button
          onClick={() => setShowPanel(true)}
          className={`group relative flex items-center gap-2 rounded-full shadow-2xl transition-all duration-500 active:scale-95 hover:scale-105 ${
            isJuniorMode
              ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 text-white px-4 py-3 pr-5'
              : 'bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-800 text-slate-700 dark:text-white px-3 py-3'
          }`}
          aria-label="Abrir modo Nuevas Generaciones"
          style={{
            animation: isJuniorMode
              ? 'juniorPulse 2s ease-in-out infinite'
              : 'juniorFloat 3s ease-in-out infinite',
          }}
        >
          {/* Glow effect */}
          {isJuniorMode && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 blur-lg opacity-50 animate-pulse pointer-events-none" />
          )}

          <div className="relative flex items-center gap-2">
            <span className="text-xl leading-none">
              {isJuniorMode ? '🎮' : '🎈'}
            </span>
            {isJuniorMode && (
              <span className="font-bold text-sm tracking-tight leading-none">
                Modo Joven
              </span>
            )}
            {badgeCount > 0 && (
              <span className="flex items-center gap-0.5 bg-amber-400 text-slate-900 text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
                <Trophy className="w-3 h-3" />
                {badgeCount}
              </span>
            )}
          </div>
        </button>

        {/* Tooltip pequeño */}
        {!isJuniorMode && (
          <div className="ml-1 text-xs text-slate-400 dark:text-slate-500 font-medium">
            Modo Joven ✨
          </div>
        )}
      </div>

      {/* Panel principal */}
      {showPanel && <NuevasGeneracionesPanel onClose={() => setShowPanel(false)} />}

      {/* CSS Animations */}
      <style>{`
        @keyframes juniorFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes juniorPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(167, 139, 250, 0); }
        }
      `}</style>
    </>
  );
}
