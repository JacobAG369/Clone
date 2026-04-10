import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_CATEGORIES = [
  {
    category: 'General',
    questions: [
      {
        q: '¿Qué es Tu-Turismo?',
        a: 'Tu-Turismo es una plataforma digital que te ayuda a descubrir los mejores destinos turísticos, eventos culturales, restaurantes y tours en Jalisco, México. Cuenta con un mapa interactivo, sistema de favoritos y reseñas verificadas.',
      },
      {
        q: '¿Es gratis usar Tu-Turismo?',
        a: 'Sí, Tu-Turismo es completamente gratuito para los usuarios. Puedes explorar el mapa, buscar lugares y ver información sin ningún costo. Algunas funcionalidades, como guardar favoritos y recibir notificaciones, requieren crear una cuenta gratuita.',
      },
      {
        q: '¿En qué ciudades está disponible Tu-Turismo?',
        a: 'Actualmente Tu-Turismo se enfoca en el estado de Jalisco, México, con especial énfasis en la zona metropolitana de Guadalajara. Tenemos planes de expansión a otros estados del país.',
      },
    ],
  },
  {
    category: 'Cuenta y Registro',
    questions: [
      {
        q: '¿Cómo creo una cuenta?',
        a: 'Puedes crear una cuenta haciendo clic en el ícono de usuario en la barra de navegación y seleccionando "Registrarte aquí". Solo necesitas tu nombre, correo electrónico y una contraseña segura.',
      },
      {
        q: '¿Olvidé mi contraseña, ¿qué hago?',
        a: 'Haz clic en "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión. Te enviaremos un código de recuperación a tu correo electrónico. Introduce el código y establece una nueva contraseña.',
      },
      {
        q: '¿Puedo cambiar mi información de perfil?',
        a: 'Sí. Desde tu perfil puedes actualizar tu nombre, apellido, correo electrónico y foto de perfil en cualquier momento.',
      },
      {
        q: '¿Cómo elimino mi cuenta?',
        a: 'Para eliminar tu cuenta, dirígete a Configuración en tu perfil y selecciona la opción "Eliminar cuenta". Esta acción es irreversible y eliminará todos tus datos de nuestra plataforma.',
      },
    ],
  },
  {
    category: 'Mapa y Lugares',
    questions: [
      {
        q: '¿Cómo filtro lugares en el mapa?',
        a: 'En la parte superior del mapa encontrarás filtros de categoría: Lugares, Eventos, Restaurantes y Hoteles. Haz clic en cualquiera para mostrar solo ese tipo de punto de interés.',
      },
      {
        q: '¿Cómo guardo un lugar como favorito?',
        a: 'Al hacer clic en cualquier marcador del mapa, aparecerá una tarjeta con la información del lugar. Haz clic en el ícono de corazón para añadirlo a tus favoritos. Necesitas estar registrado para usar esta función.',
      },
      {
        q: '¿La información de los lugares está actualizada?',
        a: 'Tu-Turismo cuenta con un equipo administrativo que verifica y actualiza el contenido regularmente. Sin embargo, te recomendamos confirmar horarios y precios directamente con los establecimientos antes de tu visita.',
      },
    ],
  },
  {
    category: 'Notificaciones',
    questions: [
      {
        q: '¿Qué tipo de notificaciones recibiré?',
        a: 'Recibirás notificaciones sobre nuevos eventos en tu área, actualizaciones de tus lugares favoritos, respuestas a tus reseñas y anuncios importantes de la plataforma.',
      },
      {
        q: '¿Puedo desactivar las notificaciones?',
        a: 'Sí. Puedes gestionar tus preferencias de notificación desde la sección de Configuración en tu perfil de usuario.',
      },
    ],
  },
  {
    category: 'Negocios y Establecimientos',
    questions: [
      {
        q: '¿Cómo puedo registrar mi negocio en Tu-Turismo?',
        a: 'Actualmente el registro de nuevos establecimientos es gestionado por nuestro equipo administrativo. Contáctanos en contacto@tu-turismo.com con la información de tu negocio y lo evaluaremos para su inclusión.',
      },
      {
        q: '¿Cómo reporto información incorrecta sobre un lugar?',
        a: 'Puedes enviarnos un reporte a contacto@tu-turismo.com con el nombre del lugar y la información incorrecta. Nuestro equipo revisará y corregirá los datos a la brevedad posible.',
      },
    ],
  },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
      >
        <span className="font-medium text-slate-900 dark:text-white pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white dark:bg-slate-800">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-400 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-400 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-400 mb-4">Soporte</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Preguntas Frecuentes</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Encuentra respuestas rápidas a las dudas más comunes sobre Tu-Turismo.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-3xl space-y-12">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-3">
                <span className="inline-block w-2 h-6 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500" />
                {cat.category}
              </h2>
              <div className="space-y-3">
                {cat.questions.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}

          {/* Contact CTA */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">¿No encontraste lo que buscabas?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Nuestro equipo está disponible para resolver cualquier duda que tengas.
            </p>
            <a
              href="mailto:contacto@tu-turismo.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
