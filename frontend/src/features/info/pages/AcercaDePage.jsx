import { MapPin, Users, Star, Globe } from 'lucide-react';

const values = [
  {
    icon: MapPin,
    title: 'Descubre lo local',
    description: 'Conectamos a los viajeros con los lugares más auténticos y escondidos de cada destino.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
  },
  {
    icon: Users,
    title: 'Comunidad primero',
    description: 'Construimos una plataforma colaborativa donde cada usuario enriquece la experiencia de los demás.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Star,
    title: 'Calidad verificada',
    description: 'Todo el contenido de Tu-Turismo pasa por un proceso de verificación para garantizar información precisa.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Globe,
    title: 'Turismo sostenible',
    description: 'Promovemos el turismo responsable que respeta la cultura, el medio ambiente y las comunidades locales.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
];

export function AcercaDePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-400 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400 mb-4">Nuestra historia</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
            Acerca de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Tu-Turismo</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Somos una plataforma digital nacida en Jalisco con la misión de transformar la manera en que las personas descubren y disfrutan los destinos turísticos de México.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white dark:bg-slate-800/40">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nuestra Misión</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              Tu-Turismo nació con el propósito de acercar a los viajeros con la riqueza cultural, gastronómica y natural de Jalisco. Creemos que cada rincón merece ser descubierto, y cada historia merece ser contada.
            </p>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mt-4">
              Desde monumentos históricos hasta restaurantes familiares, desde eventos culturales hasta tours especializados, nuestra plataforma centraliza toda la información que necesitas para vivir una experiencia turística completa e inolvidable.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nuestros Valores</h2>
            <p className="text-slate-500 dark:text-slate-400">Los principios que guían cada decisión que tomamos.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${v.bg} mb-5`}>
                    <Icon className={`w-8 h-8 ${v.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{v.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white dark:bg-slate-800/40">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Nuestro Equipo</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4">
            Somos un equipo apasionado de desarrolladores, diseñadores y entusiastas del turismo, comprometidos con ofrecer la mejor experiencia posible a nuestros usuarios.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Trabajamos desde Jalisco, México, y tenemos la visión de expandir Tu-Turismo a todos los rincones del país.
          </p>
          <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold shadow-lg shadow-cyan-500/20">
            <MapPin className="w-5 h-5" />
            Casa Samy en Banús, Jalisco, México
          </div>
        </div>
      </section>
    </div>
  );
}
