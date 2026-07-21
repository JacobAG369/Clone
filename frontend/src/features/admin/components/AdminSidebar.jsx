import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Database, 
  Globe, 
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export function AdminSidebar({ activeTab, onSelectTab }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      description: 'Resumen e Indicadores KPI',
      icon: LayoutDashboard,
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'recursos',
      label: 'Gestión de Contenido',
      description: 'Lugares, Eventos y Restaurantes',
      icon: MapPin,
      gradient: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'usuarios',
      label: 'Control de Usuarios',
      description: 'Roles, permisos y actividad',
      icon: Users,
      gradient: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'geoanalitica',
      label: 'GeoAnalítica Jalisco',
      description: 'Turismo espacial e IA',
      icon: Globe,
      gradient: 'from-purple-600 to-pink-600',
    },
    {
      id: 'backup',
      label: 'Respaldos y Restore',
      description: 'Seguridad de base de datos',
      icon: Database,
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl p-5 flex flex-col justify-between h-fit lg:sticky lg:top-24 transition-all">
      <div>
        {/* Encabezado del Sidebar */}
        <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base flex items-center gap-1.5">
              <span>Admin Center</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                PRO
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tu-Turismo Jalisco</p>
          </div>
        </div>

        {/* Lista de Navegación Lateral */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 text-left relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                    : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <div
                    className={`p-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-white/20 text-white backdrop-blur-md shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:scale-110'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {item.label}
                    </p>
                    <p className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className={`relative z-10 transition-transform duration-300 ${
                    isActive ? 'text-white translate-x-1 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del sidebar con distintivo IA */}
      <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/20 dark:border-cyan-500/10 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500 text-white shrink-0 shadow-md shadow-cyan-500/20 animate-pulse">
            <Sparkles size={16} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-slate-800 dark:text-slate-200">Motor IA Activo</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Random Forest & K-Means listos</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
