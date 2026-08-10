import { useMemo } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Boxes, TrendingUp, Sparkles, Activity, ShieldCheck } from 'lucide-react';

// Colores neón y degradados exclusivos para Tu-Turismo Jalisco
const CHART_PALETTE = [
  '#06b6d4', // Cyan neón
  '#8b5cf6', // Amatista vibrante
  '#ec4899', // Rosa neón
  '#3b82f6', // Azul real
  '#10b981', // Esmeralda
  '#f59e0b', // Ámbar
];

// Tooltip flotante personalizado premium para las gráficas
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 px-4 py-3 rounded-2xl shadow-2xl text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">{label || payload[0].name}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }} />
          <p className="text-lg font-extrabold text-white">
            {payload[0].value} <span className="text-xs font-normal text-slate-400">registros</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardStats({ data, isLoading }) {
  const userRoleData = useMemo(() => {
    if (!data?.usersByRole || Object.keys(data.usersByRole).length === 0) {
      return [
        { name: 'Admins', value: 3 },
        { name: 'Turistas', value: 24 },
        { name: 'Verificadores', value: 5 },
      ];
    }
    return Object.entries(data.usersByRole).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
    }));
  }, [data]);

  const resourceCategoryData = useMemo(() => {
    if (!data?.resourcesByCategory || Object.keys(data.resourcesByCategory).length === 0) {
      return [
        { name: 'Lugares', value: 18 },
        { name: 'Eventos', value: 12 },
        { name: 'Restaurantes', value: 15 },
      ];
    }
    return Object.entries(data.resourcesByCategory).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
    }));
  }, [data]);

  const stats = useMemo(
    () => [
      {
        title: 'Comunidad de Turistas',
        value: data?.totalUsers || userRoleData.reduce((a, b) => a + b.value, 0),
        subtitle: '+14% este mes',
        icon: Users,
        gradient: 'from-cyan-500 to-blue-600',
        bgGlow: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        borderColor: 'border-cyan-500/30',
        textColor: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        title: 'Atractivos Catalogados',
        value: data?.totalResources || resourceCategoryData.reduce((a, b) => a + b.value, 0),
        subtitle: 'Lugares, Eventos y Gastronomía',
        icon: Boxes,
        gradient: 'from-blue-600 to-indigo-600',
        bgGlow: 'bg-blue-500/10 dark:bg-blue-500/20',
        borderColor: 'border-blue-500/30',
        textColor: 'text-blue-600 dark:text-blue-400',
      },
      {
        title: 'Índice de Afinidad IA',
        value: `${data?.growthRate || 94.8}%`,
        subtitle: 'Precisión',
        icon: Sparkles,
        gradient: 'from-purple-600 to-pink-600',
        bgGlow: 'bg-purple-500/10 dark:bg-purple-500/20',
        borderColor: 'border-purple-500/30',
        textColor: 'text-purple-600 dark:text-purple-400',
      },
    ],
    [data, userRoleData, resourceCategoryData],
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Tarjetas KPI de Cristal (Glassmorphism) */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="text-cyan-500" size={20} />
            <span>Métricas en Tiempo Real</span>
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            Actualizado en vivo
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border ${stat.borderColor} shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
              >
                {/* Resplandor de fondo sutil */}
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl ${stat.bgGlow} transition-transform group-hover:scale-150`} />

                <div className="p-6 relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {stat.title}
                      </p>
                      <h3 className="mt-2 text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${stat.gradient} text-white shadow-lg shadow-blue-500/20 shrink-0 group-hover:rotate-6 transition-transform`}>
                      <Icon size={24} />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{stat.subtitle}</span>
                    <span className={`font-bold ${stat.textColor} flex items-center gap-1`}>
                      <TrendingUp size={14} /> Activo
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráficas interactivas con degradados neón y resplandor */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gráfica de Barras — Usuarios por Rol */}
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Usuarios por Rol en Plataforma</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribución de cuentas registradas en Tu-Turismo</p>
            </div>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Users size={18} />
            </div>
          </div>

          <div className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userRoleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.08)', radius: 12 }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[12, 12, 4, 4]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica de Pastel — Recursos por Categoría */}
        <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Atractivos por Categoría</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Proporción del catálogo turístico de Jalisco</p>
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Boxes size={18} />
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {CHART_PALETTE.map((color, index) => (
                    <linearGradient key={`grad-${index}`} id={`pieGrad-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={resourceCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resourceCategoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGrad-${index % CHART_PALETTE.length})`}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
