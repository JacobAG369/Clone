import { useState } from 'react';
import { AlertTriangle, Lock, Trash2, Loader2, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { deleteAccount } from '../../../api/user';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToast } from '../../../hooks/useToast';

export function DeleteAccountModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const clearSession = useAuthStore((s) => s.clearSession);

  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isConfirmed = confirmText === 'ELIMINAR';
  const canSubmit = isConfirmed && password.trim().length > 0;

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      clearSession();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta y datos asociados se eliminaron correctamente.',
        variant: 'destructive',
      });
      onClose();
      navigate({ to: '/' });
    },
    onError: (err) => {
      const data = err?.response?.data;
      const detail = data?.detail || data?.error || 'No se pudo eliminar la cuenta. Verifica tu contraseña.';
      setErrorMessage(detail);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit || mutation.isPending) return;
    setErrorMessage('');
    mutation.mutate({ password, confirmacion: confirmText });
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    setPassword('');
    setConfirmText('');
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/50 p-6 sm:p-7 overflow-hidden"
        role="dialog"
        aria-labelledby="delete-account-title"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={mutation.isPending}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* Encabezado de Advertencia */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 id="delete-account-title" className="text-xl font-black text-slate-900 dark:text-white">
              Eliminar cuenta
            </h2>
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
              Esta acción es irreversible y permanente
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
          Se borrarán definitivamente tu perfil, tus lugares favoritos guardados y tus notificaciones.
          Para evitar eliminaciones accidentales por error de dedo, completa los siguientes campos:
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Validación 1: Escribir ELIMINAR */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Escribe <span className="font-mono text-red-600 dark:text-red-400">ELIMINAR</span> en mayúsculas:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="ELIMINAR"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {confirmText && !isConfirmed && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Debe coincidir exactamente con "ELIMINAR"
              </span>
            )}
          </div>

          {/* Validación 2: Contraseña actual */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Ingresa tu contraseña actual:
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Tu contraseña"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!canSubmit || mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar mi cuenta definitivamente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
