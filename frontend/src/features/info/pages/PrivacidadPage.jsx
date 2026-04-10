import { Shield, Lock, Eye, Database } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Shield,
    title: 'Protección con la LFPDPPP',
    description: 'Implementamos nuestra plataforma conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    icon: Lock,
    title: 'Seguridad multicapa',
    description: 'Cifrado de datos en tránsito, almacenamiento seguro de contraseñas y uso de servidores seguros con monitoreo constante.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Eye,
    title: 'Derechos ARCO',
    description: 'Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición sobre tus datos personales.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Database,
    title: 'Mínimo necesario',
    description: 'Solo recolectamos la información personal y sensible estrictamente necesaria con fines específicos.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
];

const SECTIONS = [
  {
    title: '1. Datos Personales y Sensibles Tratados',
    content: [
      'Datos personales tratados: Nombre completo, correo electrónico, número telefónico, RFC y datos de facturación, y preferencias de aplicación de viajes.',
      'Los datos bancarios son procesados mediante una pasarela de pagos y no son almacenados en Tu-Turismo.',
      'Datos personales sensibles: Se evitan recabar siempre que sea posible. Solo se tratan bajo consentimiento explícito para fines específicos, como información relacionada con salud o condiciones alimentarias si se requieren servicios turísticos específicos o datos financieros completos solo cuando sean estrictamente necesarios para pagos.',
      'El sistema recaba datos de Usuarios/Clientes (personas físicas que contratan servicios turísticos) y Proveedores/Prestadores de servicios turísticos.',
    ],
  },
  {
    title: '2. Finalidades del Tratamiento',
    content: [
      'El tratamiento de los datos es necesario para ofrecer servicios turísticos personalizados y cumplir con obligaciones legales y contractuales.',
      'Procesar reservaciones y emitir comprobantes fiscales.',
      'Contactar a usuarios para confirmaciones.',
      'Enviar promociones (previo consentimiento).',
    ],
  },
  {
    title: '3. Transferencias de Datos Personales',
    content: [
      'Tu-Turismo solo transfiere datos a Prestadores de servicios turísticos (hoteles, agencias de transporte, guías) con la finalidad de cumplir la reserva solicitada por el usuario, conforme al Artículo 37 de la LFPDPPP.',
      'Los datos transferidos incluyen nombre, correo electrónico, teléfono y detalles de reservación.',
    ],
  },
  {
    title: '4. Medios de Seguridad para la Información',
    content: [
      'Cifrado de datos en tránsito (TLS/SSL) y almacenamiento cifrado de contraseñas.',
      'Control de acceso restringido a empleados autorizados.',
      'Uso de servidores seguros y monitoreo constante de posibles vulneraciones.',
      'Implementación de copias de seguridad periódicas.',
      'Contratos con proveedores que contienen cláusulas de confidencialidad y cumplen estrictamente con normas de protección.',
    ],
  },
  {
    title: '5. Uso de Cookies',
    content: [
      'Tu-Turismo utiliza cookies para mejorar la experiencia, clasificándolas en: estrictamente necesarias, de funcionalidad, de análisis (sin identificar personalmente al usuario) y de marketing (solo con consentimiento explícito).',
      'El uso de cookies y el tratamiento de datos sensibles se realiza únicamente con el consentimiento explícito del usuario, el cual puede ser revocado en cualquier momento.',
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
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Aviso de Privacidad y Confidencialidad</h1>
          <p className="text-slate-300 text-lg max-w-3xl mx-auto leading-relaxed">
            El proyecto "Tu-Turismo", plataforma digital para reservación y gestión de experiencias turísticas, se implementa conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), su Reglamento y los Lineamientos del Aviso de Privacidad emitidos por el INAI.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-14 bg-white dark:bg-slate-800/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Objetivos del Aviso</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Recolectar y procesar únicamente la información personal necesaria, garantizar la seguridad técnica y administrativa en el tratamiento de los datos personales, y facilitar el ejercicio de los derechos ARCO a los titulares.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
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
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
