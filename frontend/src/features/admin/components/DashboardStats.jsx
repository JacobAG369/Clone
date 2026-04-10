import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, Boxes, TrendingUp } from 'lucide-react';

// Tu-Turismo color palette
const COLORS = {
  primary: '#0891b2',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  slate: '#64748b',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.slate,
];

export function DashboardStats({ data, isLoading }) {
  const userRoleData = useMemo(() => {
    if (!data?.usersByRole || Object.keys(data.usersByRole).length === 0) {
      // Return mock data if no real data available
      return [
        { name: 'Admin', value: 0 },
        { name: 'Usuario', value: 0 },
      ];
    }
    return Object.entries(data.usersByRole).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
    }));
  }, [data]);

  const resourceCategoryData = useMemo(() => {
    if (!data?.resourcesByCategory || Object.keys(data.resourcesByCategory).length === 0) {
      // Return mock data if no real data available
      return [
        { name: 'Lugares', value: 0 },
        { name: 'Eventos', value: 0 },
        { name: 'Restaurantes', value: 0 },
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
        title: 'Total de Usuarios',
        value: data?.totalUsers || 0,
        icon: Users,
        color: 'bg-cyan-100 dark:bg-cyan-900/30',
        textColor: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        title: 'Total de Recursos',
        value: data?.totalResources || 0,
        icon: Boxes,
        color: 'bg-violet-100 dark:bg-violet-900/30',
        textColor: 'text-violet-600 dark:text-violet-400',
      },
      {
        title: 'Tasa de Crecimiento',
        value: `${data?.growthRate || 0}%`,
        icon: TrendingUp,
        color: 'bg-emerald-100 dark:bg-emerald-900/30',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      },
    ],
    [data],
  );

  if (isLoading) {
    return (
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Métricas Clave</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="dark:bg-slate-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${stat.color}`}>
                      <Icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
            <CardDescription>Distribución de usuarios en la plataforma</CardDescription>
          </CardHeader>
           <CardContent>
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={userRoleData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="name" stroke="#94a3b8" />
                 <YAxis stroke="#94a3b8" />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: '#1e293b',
                     border: `1px solid ${COLORS.primary}`,
                     borderRadius: '8px',
                   }}
                   labelStyle={{ color: '#fff' }}
                 />
                 <Legend />
                 <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>

        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Recursos por Categoría</CardTitle>
            <CardDescription>Desglose de contenido catalogado</CardDescription>
          </CardHeader>
           <CardContent>
             <ResponsiveContainer width="100%" height={300}>
               <PieChart>
                 <Pie
                   data={resourceCategoryData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={2}
                   dataKey="value"
                 >
                   {resourceCategoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip
                   contentStyle={{
                     backgroundColor: '#1e293b',
                     border: `1px solid ${COLORS.primary}`,
                     borderRadius: '8px',
                   }}
                   labelStyle={{ color: '#fff' }}
                 />
                 <Legend />
               </PieChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
