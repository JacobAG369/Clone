import { MapPin, Users, Star, Globe } from 'lucide-react';
import evelynImg from '../../../assets/team/evelyn.jpeg';
import fabianImg from '../../../assets/team/fabian.jpeg';
import jesusImg from '../../../assets/team/jesus.jpeg';
import jimmyImg from '../../../assets/team/jimmy.png';
import oscarImg from '../../../assets/team/oscar.png';
import samuelImg from '../../../assets/team/samuel.png';

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

const team = [
  {
    name: 'Evelyn Estrada Medina',
    role: 'Front-End Developer',
    img: evelynImg,
  },
  {
    name: 'Jimmy Aviña Gómez',
    role: 'Data Scientist',
    img: jimmyImg,
  },
  {
    name: 'Jesús Aviña Alcalá',
    role: 'Backend Developer',
    img: jesusImg,
  },
  {
    name: 'Samuel Osuna Medina',
    role: 'Project Manager, Backend Developer',
    img: samuelImg,
  },
  {
    name: 'Oscar Alberto Serna Morán',
    role: 'UX/UI Design Lead',
    img: oscarImg,
  },
  {
    name: 'José Fabián López Castillo',
    role: 'Documentation Leader',
    img: fabianImg,
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
            Somos una plataforma digital desarrollada como proyecto académico por estudiantes de la Universidad Tecnológica de la Zona Metropolitana de Guadalajara (UTZMG).
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white dark:bg-slate-800/40">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Nuestra Misión</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              Tu-Turismo nace como una iniciativa estudiantil bajo el equipo de desarrollo
              <strong> AdaptiCode</strong>, con el propósito de acercar a los viajeros con la riqueza cultural, 
              gastronómica y natural de Jalisco. Creemos que la innovación tecnológica puede potenciar
              el descubrimiento turístico con un enfoque moderno.
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
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Equipo de Desarrollo - <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-500">AdaptiCode</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Somos un equipo multidisciplinario de la Universidad Tecnológica de la Zona Metropolitana de Guadalajara (UTZMG), comprometidos con el desarrollo tecnológico de excelencia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {team.map((member) => (
              <div key={member.name} className="flex flex-col items-center text-center group">
                <div className="w-40 h-40 mb-6 rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-4 border-slate-50 dark:border-slate-800 shadow-xl transition-transform duration-300 group-hover:-translate-y-2">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">{member.role}</p>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">
              <MapPin className="w-5 h-5 text-cyan-500" />
              Carretera Santa Cruz-San Isidro Km. 4.5, 45644 Santa Cruz de las Flores, Jal.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
