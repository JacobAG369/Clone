const SECTIONS = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los Términos',
    content: `El uso de Tu‑Turismo implica la aceptación plena de estos Términos y Condiciones. Si no está de acuerdo con ellos, le solicitamos no utilizar la plataforma ni sus servicios asociados.`,
  },
  {
    id: 'definiciones',
    title: '2. Definiciones',
    content: `• Usuario: Persona física que utiliza la plataforma para consultar información turística, reservar servicios o adquirir experiencias.\n• Proveedor: Prestador de servicios turísticos registrado en la plataforma (hoteles, agencias, guías, transportistas, etc.).\n• Kiosco Tu‑Turismo: Dispositivo físico instalado por entidades gubernamentales o privadas para consulta pública de información turística.\n• AdaptiCode S.A. de C.V.: Empresa desarrolladora y propietaria del software Tu‑Turismo.`,
  },
  {
    id: 'uso',
    title: '3. Uso de la Plataforma',
    content: `El usuario se compromete a: utilizar la plataforma únicamente para fines lícitos, proporcionar información veraz y actualizada, no interferir con la operación del sistema, sus servidores o redes, y no intentar acceder sin autorización a módulos administrativos o funciones restringidas.\n\nQueda estrictamente prohibido: replicar, modificar, descompilar o extraer código del sistema, y realizar ataques informáticos o actividades que comprometan la confidencialidad, integridad o disponibilidad del servicio.`,
  },
  {
    id: 'registro',
    title: '4. Registro y Credenciales de Acceso',
    content: `Para acceder a ciertas funciones (historial, promociones), el usuario deberá crear una cuenta. El usuario es responsable de mantener confidenciales sus credenciales y de notificar de inmediato cualquier acceso no autorizado. Tu‑Turismo implementa hashing seguro (bcrypt/Argon2) y cifrado TLS para proteger las credenciales.`,
  },
  {
    id: 'pagos',
    title: '5. Reservaciones y Pagos',
    content: `Las reservaciones realizadas mediante Tu‑Turismo se sujetan a la disponibilidad y políticas del Proveedor correspondiente.\n\nPagos: Los pagos se procesan mediante pasarelas externas certificadas. Tu‑Turismo no almacena datos completos de tarjetas bancarias. Las cancelaciones o reembolsos se rigen por las políticas del proveedor del servicio turístico.`,
  },
  {
    id: 'responsabilidad-adapticode',
    title: '6. Responsabilidad de AdaptiCode S.A. de C.V.',
    content: `AdaptiCode es responsable del correcto funcionamiento del software entregado, salvo los casos establecidos en este documento.\n\nDeslinde de responsabilidad: Una vez entregado e instalado el kiosco o la plataforma, el uso, mantenimiento, cuidado físico y operación del equipo es responsabilidad de la entidad propietaria (ej. Secretaría de Turismo). AdaptiCode no se hace responsable por daños, fallas, manipulaciones no autorizadas, interrupciones eléctricas o modificaciones realizadas por terceros. El soporte técnico solo se brindará bajo acuerdos previamente establecidos.`,
  },
  {
    id: 'responsabilidad-proveedores',
    title: '7. Responsabilidad de Proveedores Turísticos',
    content: `Tu‑Turismo actúa como intermediario tecnológico. Los proveedores son únicos responsables de: la calidad de los servicios turísticos, información publicada (precios, descripciones, restricciones) y el cumplimiento de normativas locales y federales. Tu‑Turismo no garantiza la precisión de la información proporcionada por terceros.`,
  },
  {
    id: 'proteccion-datos',
    title: '8. Protección de Datos Personales',
    content: `El tratamiento de datos se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).\n\nDatos recabados: Nombre, correo, teléfono, preferencias turísticas e información de facturación. Datos sensibles solo bajo consentimiento explícito.\n\nSeguridad: Tu‑Turismo implementa múltiples capas de protección como cifrado TLS/HTTPS para datos en tránsito, AES‑256 para información en reposo, hashing bcrypt/Argon2 para contraseñas, gestión de sesiones con JWT y auditoría basada en Blockchain para accesos y acciones críticas. El usuario puede ejercer sus derechos ARCO mediante los canales establecidos en el Aviso de Privacidad.`,
  },
  {
    id: 'cookies',
    title: '9. Cookies y Tecnologías de Seguimiento',
    content: `Tu‑Turismo utiliza cookies para mejorar la experiencia. Tipos de cookies utilizadas: estrictamente necesarias, funcionales, de análisis (no identifican personalmente) y de marketing (solo con consentimiento explícito). El usuario puede deshabilitarlas en cualquier momento.`,
  },
  {
    id: 'propiedad',
    title: '10. Propiedad Intelectual',
    content: `Todo el contenido, interfaz, código, diseño, logotipos y elementos visuales de Tu‑Turismo son propiedad de AdaptiCode S.A. de C.V. Se prohíbe su copia, distribución o uso sin autorización expresa.`,
  },
  {
    id: 'limitacion',
    title: '11. Limitación de Responsabilidad',
    content: `Tu‑Turismo no garantiza que el servicio estará libre de errores o interrupciones, ni que la información publicada por proveedores sea exacta. En ningún caso Tu‑Turismo o AdaptiCode serán responsables por pérdida de datos por causas externas, fallas ocasionadas por terceros, equipos externos o redes ajenas, ni daños indirectos, incidentales o consecuenciales.`,
  },
  {
    id: 'actualizaciones',
    title: '12. Actualizaciones del Servicio',
    content: `AdaptiCode se reserva el derecho de modificar funciones, implementar mejoras y actualizar componentes de seguridad sin necesidad de previo aviso cuando las actualizaciones sean necesarias para proteger al usuario o mejorar el rendimiento.`,
  },
  {
    id: 'terminacion',
    title: '13. Terminación de Cuenta',
    content: `La plataforma podrá suspender o cancelar cuentas cuando haya indicios de uso indebido, se detecten actividades maliciosas o se incumplan estos Términos y Condiciones.`,
  },
  {
    id: 'jurisdiccion',
    title: '14. Legislación Aplicable y Jurisdicción',
    content: `Este documento se rige bajo las leyes de los Estados Unidos Mexicanos. Cualquier controversia se resolverá ante tribunales de Guadalajara, Jalisco, salvo acuerdo distinto entre las partes.`,
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Términos y Condiciones de Uso</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Bienvenido(a) a Tu‑Turismo, una plataforma digital desarrollada por AdaptiCode S.A. de C.V. para la gestión, reservación y consulta de experiencias turísticas mediante su sitio web y kioscos interactivos.
          </p>
          <p className="text-slate-500 text-sm mt-6">Última actualización: 18 de noviembre de 2025</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Index */}
            <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contenido</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </div>

            {/* Sections */}
            <div className="p-8 space-y-10">
              {SECTIONS.map((s, idx) => (
                <div key={s.id} id={s.id}>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{s.content}</p>
                  {idx < SECTIONS.length - 1 && (
                    <hr className="mt-10 border-slate-200 dark:border-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-8">
             Al acceder, navegar o utilizar cualquiera de nuestros servicios, usted acepta cumplir los presentes Términos y Condiciones, así como el Aviso de Privacidad correspondiente.
          </p>
        </div>
      </section>
    </div>
  );
}
