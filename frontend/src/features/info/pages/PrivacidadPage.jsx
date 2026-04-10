import { Shield, Lock, Eye, Database } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Shield,
    title: 'Protección de datos',
    description: 'Tus datos son cifrados y almacenados de forma segura conforme a las normativas vigentes.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    icon: Lock,
    title: 'Privacidad garantizada',
    description: 'Nunca vendemos ni compartimos tu información personal con terceros sin tu consentimiento.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Eye,
    title: 'Control total',
    description: 'Tú decides qué información compartes y puedes eliminar tu cuenta y datos en cualquier momento.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Database,
    title: 'Mínimo necesario',
    description: 'Solo recopilamos los datos estrictamente necesarios para ofrecerte una experiencia personalizada.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
];

const SECTIONS = [
  {
    title: '1. Información que Recopilamos',
    content: [
      'Datos de registro: nombre, apellido, correo electrónico y contraseña (almacenada con hash seguro).',
      'Datos de uso: páginas visitadas, lugares favoritos, interacciones con el mapa.',
      'Datos técnicos: dirección IP, tipo de navegador y sistema operativo para diagnóstico de errores.',
      'Cookies y tecnologías similares para mantener tu sesión activa.',
    ],
  },
  {
    title: '2. Cómo Usamos tu Información',
    content: [
      'Proporcionar y mejorar los servicios de Tu-Turismo.',
      'Personalizar tu experiencia mostrando contenido relevante.',
      'Enviarte notificaciones sobre nuevos lugares, eventos o actualizaciones.',
      'Garantizar la seguridad y prevenir el uso fraudulento.',
      'Generar estadísticas anónimas para mejorar la plataforma.',
    ],
  },
  {
    title: '3. Compartir Información',
    content: [
      'No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales.',
      'Podemos compartir datos con proveedores de servicios técnicos (hosting, analítica) bajo estrictos acuerdos de confidencialidad.',
      'Podemos divulgar información cuando sea requerido por ley o autoridad competente.',
    ],
  },
  {
    title: '4. Tus Derechos',
    content: [
      'Acceso: solicitar una copia de los datos que tenemos sobre ti.',
      'Rectificación: corregir datos incorrectos o incompletos.',
      'Eliminación: solicitar la eliminación de tu cuenta y datos personales.',
      'Portabilidad: recibir tus datos en un formato estructurado.',
      'Oposición: oponerte al procesamiento de tus datos en ciertos casos.',
    ],
  },
  {
    title: '5. Seguridad',
    content: [
      'Utilizamos cifrado SSL/TLS para todas las comunicaciones.',
      'Las contraseñas se almacenan con algoritmos de hash seguros (bcrypt).',
      'Acceso restringido a datos personales solo para personal autorizado.',
      'Revisiones periódicas de seguridad y auditorías.',
    ],
  },
  {
    title: '6. Cookies',
    content: [
      'Utilizamos cookies esenciales para el funcionamiento de la sesión.',
      'Cookies de preferencia para recordar tu configuración (tema, idioma).',
      'No utilizamos cookies de rastreo de terceros para publicidad.',
      'Puedes gestionar las cookies desde la configuración de tu navegador.',
    ],
  },
  {
    title: '7. Cambios a esta Política',
    content: [
      'Podemos actualizar esta política periódicamente.',
      'Te notificaremos por correo electrónico o mediante un aviso en la plataforma ante cambios significativos.',
      'La fecha de última actualización aparece al inicio del documento.',
    ],
  },
];

export function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-emerald-400 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400 mb-4">Transparencia</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Política de Privacidad</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Tu privacidad es nuestra prioridad. Aquí te explicamos cómo cuidamos tu información.
          </p>
          <p className="text-slate-500 text-sm mt-4">Última actualización: abril de 2026</p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14 bg-white dark:bg-slate-800/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.title} className="text-center p-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${h.bg} mb-4`}>
                    <Icon className={`w-7 h-7 ${h.color}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{h.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{h.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl space-y-8">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{s.title}</h2>
              <ul className="space-y-3">
                {s.content.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-center text-sm text-slate-400 pt-4">
            Para ejercer tus derechos o resolver dudas, escríbenos a{' '}
            <a href="mailto:contacto@tu-turismo.com" className="text-cyan-500 hover:underline">
              contacto@tu-turismo.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
