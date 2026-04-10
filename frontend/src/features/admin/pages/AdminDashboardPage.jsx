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
import { QuickAccessButtons } from '../components/QuickAccessButtons';
import { BackupManager } from '../components/BackupManager';

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Panel administrativo</p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Gestiona tu contenido, usuarios y copia de seguridad de Tu-Turismo en un único lugar.
          </p>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Stats Section */}
            <DashboardStats data={statsQuery.data} isLoading={statsQuery.isLoading} />

            {/* Quick Access Buttons */}
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white text-center">Accesos Rápidos</h2>
              <QuickAccessButtons
                onUsersCRUD={handleQuickAccessUsers}
                onResourcesCRUD={handleQuickAccessResources}
                onBackup={handleQuickAccessBackup}
              />
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'recursos' && (
          <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestion de Contenido</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Crea, edita y elimina recursos oficiales con imagen, ubicacion y rating institucional.
                </p>
              </div>
              <Button type="button" onClick={openCreateDialog}>
                <Plus size={16} className="mr-2" />
                Nuevo {activeResource.label.slice(0, -1)}
              </Button>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              {RESOURCE_OPTIONS.map((option) => {
                const isActive = option.id === resourceType;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setResourceType(option.id)}
                    className={[
                      'rounded-3xl border p-5 text-left transition-all',
                      isActive
                        ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900',
                    ].join(' ')}
                  >
                    <p className={`text-lg font-semibold ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {option.label}
                    </p>
                    <p className={`mt-2 text-sm ${isActive ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'}`}>
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <Card className="mb-8 bg-gradient-to-br from-slate-900 to-slate-700 text-white dark:from-slate-950 dark:to-slate-900">
              <CardHeader>
                <CardTitle>{activeResource.label}</CardTitle>
                <CardDescription className="text-slate-300">
                  Administra el contenido visible para los usuarios finales y mantenlo actualizado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6 text-sm text-slate-200">
                  <span>Total cargado: {resourcesQuery.data?.length || 0}</span>
                  <span>Categorias disponibles: {categoriesQuery.data?.length || 0}</span>
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

        {/* Users Tab */}
        {activeTab === 'usuarios' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Administra cuentas, roles y permisos de usuarios en la plataforma.
              </p>
            </div>
            <UserTable />
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Copias de Seguridad</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Respalda tus datos de manera segura y descárgalos cuando sea necesario.
              </p>
            </div>
            <BackupManager />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-10 flex gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('recursos')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'recursos'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Recursos
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'usuarios'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'backup'
                ? 'border-b-2 border-primary text-primary'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Backups
          </button>
        </div>
      </div>
    </div>
  );
}
