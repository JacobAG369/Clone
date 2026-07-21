import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../hooks/useToast';
import { parseImageUploadError } from '../../../lib/imageErrorHandler';
import { ResourceFormDialog } from '../components/ResourceFormDialog';
import { ResourceTable } from '../components/ResourceTable';
import { UserTable } from '../components/UserTable';
import { DashboardStats } from '../components/DashboardStats';
import { AdminSidebar } from '../components/AdminSidebar';
import { BackupManager } from '../components/BackupManager';
import { AdminSpatialMap } from '../components/AdminSpatialMap';

const RESOURCE_OPTIONS = [
  { id: 'lugares', label: 'Lugares', description: 'Gestiona atractivos turisticos, monumentos y puntos de interes.' },
  { id: 'eventos', label: 'Eventos', description: 'Administra la agenda oficial de eventos y festivales.' },
  { id: 'restaurantes', label: 'Restaurantes', description: 'Mantiene actualizada la oferta gastronomica verificada.' },
];

export function AdminDashboardPage() {
  const [resourceType, setResourceType] = useState('lugares');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formErrors, setFormErrors] = useState({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Queries
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
  });

  const resourcesQuery = useQuery({
    queryKey: ['admin-resources', resourceType],
    queryFn: () => adminApi.getResources(resourceType),
  });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: adminApi.getCategories,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => adminApi.createResource({ resourceType, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources', resourceType] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Recurso creado', description: 'El contenido se guardo correctamente.' });
      setFormErrors({});
      setDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      const { fieldErrors, message } = parseImageUploadError(error);
      
      // Si hay errores de validación (422), mostrarlos en el formulario
      if (error?.response?.status === 422 && fieldErrors) {
        setFormErrors(fieldErrors);
        // Mostrar solo el primer error en toast
        const firstError = Object.values(fieldErrors)[0]?.[0] || message;
        toast({ 
          title: 'Validación fallida', 
          description: firstError,
          variant: 'destructive' 
        });
      } else {
        // Error genérico
        toast({ 
          title: 'No se pudo crear', 
          description: message || 'Ocurrio un error al guardar.',
          variant: 'destructive' 
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => adminApi.updateResource({ resourceType, resourceId: editingItem.id || editingItem._id, formData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources', resourceType] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Recurso actualizado', description: 'Los cambios se aplicaron correctamente.' });
      setFormErrors({});
      setDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error) => {
      const { fieldErrors, message } = parseImageUploadError(error);
      
      // Si hay errores de validación (422), mostrarlos en el formulario
      if (error?.response?.status === 422 && fieldErrors) {
        setFormErrors(fieldErrors);
        const firstError = Object.values(fieldErrors)[0]?.[0] || message;
        toast({ 
          title: 'Validación fallida', 
          description: firstError,
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'No se pudo actualizar', 
          description: message || 'Ocurrio un error al actualizar.',
          variant: 'destructive' 
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ resourceId }) => adminApi.deleteResource({ resourceType, resourceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources', resourceType] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({ title: 'Recurso eliminado', description: 'El elemento fue eliminado del catalogo.' });
    },
    onError: (error) => {
      toast({ title: 'No se pudo eliminar', description: error.response?.data?.message || 'Ocurrio un error al eliminar.', variant: 'destructive' });
    },
  });

  const activeResource = useMemo(
    () => RESOURCE_OPTIONS.find((option) => option.id === resourceType) || RESOURCE_OPTIONS[0],
    [resourceType],
  );

  const openCreateDialog = () => {
    setFormErrors({});
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setFormErrors({});
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleQuickAccessUsers = () => {
    setActiveTab('usuarios');
  };

  const handleQuickAccessResources = () => {
    setActiveTab('recursos');
  };

  const handleQuickAccessBackup = () => {
    setActiveTab('backup');
  };

  const handleQuickAccessGeoAnalitica = () => {
    setActiveTab('geoanalitica');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-left border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 flex items-center gap-1.5">
                <span>⚡ Tu-Turismo Suite</span>
              </p>
              <h1 className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Panel de Control & Gestión
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Administra recursos turísticos, monitorea métricas de inteligencia artificial, gestiona usuarios y ejecuta copias de seguridad de forma segura.
            </p>
          </div>
        </div>

        {/* Layout Principal: Sidebar Izquierdo + Contenido Principal */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Barra Lateral con Accesos y Navegación */}
          <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Área Principal de Contenido */}
          <main className="flex-1 min-w-0 w-full">
            {/* Tab: Dashboard / KPIs */}
            {activeTab === 'dashboard' && (
              <DashboardStats data={statsQuery.data} isLoading={statsQuery.isLoading} />
            )}

            {/* Tab: Recursos */}
            {activeTab === 'recursos' && (
              <div className="space-y-8 animate-in fade-in-50 duration-300">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Gestión de Contenido</h2>
                    <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                      Crea, edita y elimina recursos oficiales con imagen, ubicación y rating institucional.
                    </p>
                  </div>
                  <Button type="button" onClick={openCreateDialog} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                    <Plus size={18} className="mr-2" />
                    Nuevo {activeResource.label.slice(0, -1)}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {RESOURCE_OPTIONS.map((option) => {
                    const isActive = option.id === resourceType;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setResourceType(option.id)}
                        className={[
                          'rounded-3xl border p-5 text-left transition-all relative overflow-hidden group',
                          isActive
                            ? 'border-blue-500 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 scale-[1.02]'
                            : 'border-slate-200/80 bg-white/90 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700/80',
                        ].join(' ')}
                      >
                        <p className={`text-lg font-extrabold tracking-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                          {option.label}
                        </p>
                        <p className={`mt-1 text-xs leading-relaxed ${isActive ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'}`}>
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white rounded-3xl border border-blue-400/40 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/20 blur-2xl pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <span>{activeResource.label}</span>
                      <span className="text-xs px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold shadow-sm">Catálogo Activo</span>
                    </CardTitle>
                    <CardDescription className="text-white/90 text-sm font-medium mt-1">
                      Administra el contenido visible para los turistas y mantenlo actualizado en la plataforma web y móvil.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-white">
                      <span className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">📦 Total cargado: {resourcesQuery.data?.length || 0}</span>
                      <span className="px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-sm">🏷️ Categorías disponibles: {categoriesQuery.data?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {resourcesQuery.isLoading ? (
                  <div className="grid gap-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : (
                  <ResourceTable
                    title={`Listado de ${activeResource.label.toLowerCase()}`}
                    items={resourcesQuery.data || []}
                    resourceType={resourceType}
                    onEdit={openEditDialog}
                    onDelete={(item) => deleteMutation.mutate({ resourceId: item.id || item._id })}
                    isDeleting={deleteMutation.isPending}
                  />
                )}

                <ResourceFormDialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                      setEditingItem(null);
                      setFormErrors({});
                    }
                  }}
                  resourceType={resourceType}
                  categories={categoriesQuery.data || []}
                  initialData={editingItem}
                  formErrors={formErrors}
                  onSubmit={(formData) => {
                    if (editingItem) {
                      updateMutation.mutate(formData);
                      return;
                    }
                    createMutation.mutate(formData);
                  }}
                  isPending={createMutation.isPending || updateMutation.isPending}
                />
              </div>
            )}

            {/* Tab: Usuarios */}
            {activeTab === 'usuarios' && (
              <div className="space-y-8 animate-in fade-in-50 duration-300">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Control de Usuarios</h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Administra cuentas, asigna roles jerárquicos y supervisa la actividad de usuarios y verificadores.
                  </p>
                </div>
                <UserTable />
              </div>
            )}

            {/* Tab: Backups */}
            {activeTab === 'backup' && (
              <div className="space-y-8 animate-in fade-in-50 duration-300">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Copias de Seguridad y Respaldo</h2>
                  <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                    Genera snapshots completos de MongoDB, exporta colecciones e importa respaldos para disaster recovery.
                  </p>
                </div>
                <BackupManager />
              </div>
            )}

            {/* Tab: GeoAnalítica */}
            {activeTab === 'geoanalitica' && (
              <div className="animate-in fade-in-50 duration-300">
                <AdminSpatialMap />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
