import { Users, Package, Database, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

export function QuickAccessButtons({ onUsersCRUD, onResourcesCRUD, onBackup, onGeoAnalitica }) {
  const actions = [
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administra cuentas, roles y permisos',
      icon: Users,
      color: 'bg-cyan-100 dark:bg-cyan-900/30',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      onClick: onUsersCRUD,
    },
    {
      id: 'recursos',
      title: 'Gestión de Recursos',
      description: 'Maneja lugares, eventos y restaurantes',
      icon: Package,
      color: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
      onClick: onResourcesCRUD,
    },
    {
      id: 'geoanalitica',
      title: 'Geo-Analítica Territorial',
      description: 'Mapa de calor y concentración por municipio',
      icon: MapPin,
      color: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      onClick: onGeoAnalitica,
    },
    {
      id: 'backup',
      title: 'Copias de Seguridad',
      description: 'Realiza backups completos o selectivos',
      icon: Database,
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      onClick: onBackup,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Card
            key={action.id}
            className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-slate-800"
          >
            <div className={`flex items-center justify-center py-6 ${action.color}`}>
              <Icon className={`h-12 w-12 ${action.iconColor}`} />
            </div>
            <CardContent className="flex flex-col justify-between p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{action.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
              </div>
              <Button
                onClick={action.onClick}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
              >
                Acceder
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
