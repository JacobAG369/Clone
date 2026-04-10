const SECTIONS = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los Términos',
    content: `Al acceder y utilizar la plataforma Tu-Turismo, el usuario acepta de manera íntegra y sin reservas los presentes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, le pedimos que no utilice nuestros servicios. El uso continuado de la plataforma después de cualquier modificación a estos términos constituye su aceptación de los mismos.`,
  },
  {
    id: 'servicios',
    title: '2. Descripción de los Servicios',
    content: `Tu-Turismo es una plataforma digital que conecta a los usuarios con información turística verificada sobre lugares, eventos, restaurantes y tours en Jalisco, México. Los servicios incluyen: exploración de destinos a través de mapa interactivo, gestión de favoritos, sistema de notificaciones personalizadas y acceso a reseñas y valoraciones.`,
  },
  {
    id: 'cuenta',
    title: '3. Registro y Cuenta de Usuario',
    content: `Para acceder a ciertas funcionalidades es necesario crear una cuenta. El usuario es responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta. Debe notificarnos inmediatamente ante cualquier uso no autorizado. Tu-Turismo no será responsable por pérdidas derivadas del uso no autorizado de su cuenta.`,
  },
  {
    id: 'conducta',
    title: '4. Conducta del Usuario',
    content: `El usuario se compromete a utilizar la plataforma de manera lícita y responsable. Está prohibido: publicar contenido falso o engañoso, acosar o amenazar a otros usuarios, intentar acceder sin autorización a sistemas de la plataforma, usar la plataforma para actividades comerciales no autorizadas, y violar derechos de propiedad intelectual de terceros.`,
  },
  {
    id: 'propiedad',
    title: '5. Propiedad Intelectual',
    content: `Todo el contenido presente en Tu-Turismo, incluyendo textos, imágenes, logotipos, diseños y software, está protegido por derechos de autor y otras leyes de propiedad intelectual. El usuario no podrá reproducir, distribuir, modificar o crear obras derivadas sin autorización expresa y por escrito de Tu-Turismo.`,
  },
  {
    id: 'limitacion',
    title: '6. Limitación de Responsabilidad',
    content: `Tu-Turismo no garantiza la exactitud, integridad o actualidad de la información proporcionada por los establecimientos. La plataforma no se hace responsable de daños directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de los servicios. Las calificaciones y reseñas reflejan opiniones individuales de los usuarios.`,
  },
  {
    id: 'modificaciones',
    title: '7. Modificaciones',
    content: `Tu-Turismo se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor a los 15 días de su publicación en la plataforma. Si continúa utilizando el servicio después de dicha fecha, se considerará que ha aceptado los nuevos términos.`,
  },
  {
    id: 'jurisdiccion',
    title: '8. Jurisdicción Aplicable',
    content: `Estos Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa que surja en relación con estos términos será sometida a la jurisdicción de los tribunales competentes del estado de Jalisco, México.`,
  },
];

export function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-violet-400 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400 mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Términos y Condiciones</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Por favor lee estos términos detenidamente antes de utilizar Tu-Turismo.
          </p>
          <p className="text-slate-500 text-sm mt-4">Última actualización: abril de 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Index */}
            <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contenido</h2>
              <ul className="space-y-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sections */}
            <div className="p-8 space-y-10">
              {SECTIONS.map((s, idx) => (
                <div key={s.id} id={s.id}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{s.content}</p>
                  {idx < SECTIONS.length - 1 && (
                    <hr className="mt-10 border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
            Si tienes preguntas, contáctanos en{' '}
            <a href="mailto:contacto@tu-turismo.com" className="text-cyan-500 hover:underline">
              contacto@tu-turismo.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
