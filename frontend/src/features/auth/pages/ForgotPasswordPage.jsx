// la página completa del wizard de recuperación. muestra el formulario correcto según el paso.
import { Link } from '@tanstack/react-router';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useRecoveryStore } from '../store/useRecoveryStore';
import { RequestCodeForm } from '../components/recovery/RequestCodeForm';
import { VerifyCodeForm } from '../components/recovery/VerifyCodeForm';
import { ResetPasswordForm } from '../components/recovery/ResetPasswordForm';
import tutuLogo from '../../../assets/tutu-logo.png';

const STEPS = [
  { label: 'Correo', number: 1 },
  { label: 'Código', number: 2 },
  { label: 'Contraseña', number: 3 },
];

const STEP_META = {
  1: { title: '¿Olvidaste tu contraseña?', subtitle: 'Ingresa tu correo para recibir el código de recuperación.' },
  2: { title: 'Verifica tu identidad', subtitle: 'Ingresa el código de 6 dígitos que llegó a tu correo.' },
  3: { title: 'Nueva contraseña', subtitle: 'Crea una contraseña segura para tu cuenta.' },
};

export const ForgotPasswordPage = () => {
  const step = useRecoveryStore((s) => s.step);
  const { title, subtitle } = STEP_META[step];

  return (
    <div className="flex-1 flex items-center justify-center p-4 my-8">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Panel izquierdo */}
          <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-8 min-h-[400px]">
            <div className="text-center">
              <img
                src={tutuLogo}
                alt="Tu-Turismo Logo"
                className="w-48 h-48 object-contain mb-6 drop-shadow-lg"
              />
              <h1 className="text-3xl font-bold text-white mb-4">Tu-Turismo</h1>


              {/* Indicador de pasos */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {STEPS.map((s, i) => (
                  <div key={s.number} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${step >= s.number
                        ? 'bg-white text-slate-800'
                        : 'bg-white/20 text-white/60'
                      }`}>
                      {s.number}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-px w-8 transition-colors ${step > s.number ? 'bg-white/70' : 'bg-white/20'}`} />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs mt-2">
                Paso {step} de 3 — {STEPS[step - 1].label}
              </p>
            </div>
          </div>

          {/* Panel derecho: formulario */}
          <div className="flex flex-col">
            <div className="p-8">
              <div className="mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4"
                >
                  <ArrowLeft size={16} />
                  Volver al inicio de sesión
                </Link>

                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700">
                    <KeyRound size={20} className="text-slate-600 dark:text-slate-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{subtitle}</p>
              </div>

              {/* Progreso mobile */}
              <div className="flex items-center gap-1.5 mb-6 lg:hidden">
                {STEPS.map((s) => (
                  <div
                    key={s.number}
                    className={`h-1 flex-1 rounded-full transition-colors ${step >= s.number ? 'bg-slate-800 dark:bg-slate-300' : 'bg-slate-200 dark:bg-slate-700'}`}
                  />
                ))}
              </div>

              {step === 1 && <RequestCodeForm />}
              {step === 2 && <VerifyCodeForm />}
              {step === 3 && <ResetPasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
