import { useState, useEffect } from 'react';
import { Download, Loader, Plus, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../hooks/useToast';
import { adminApi } from '../../../api/admin';

const BACKUP_TYPES = [
  { id: 'full', label: 'Backup Completo', description: 'Incluye todas las colecciones' },
  { id: 'lugares', label: 'Solo Lugares', description: 'Backup de lugares turísticos' },
  { id: 'eventos', label: 'Solo Eventos', description: 'Backup de eventos' },
  { id: 'restaurantes', label: 'Solo Restaurantes', description: 'Backup de restaurantes' },
  { id: 'usuarios', label: 'Solo Usuarios', description: 'Backup de usuarios registrados' },
];

export function BackupManager() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backups, setBackups] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const data = await adminApi.listBackups();
        // data.timestamp is the timestamp in milliseconds
        // Convert numbers back to Date objects for the UI
        const withDates = data.map(b => ({
          ...b,
          timestamp: new Date(b.timestamp)
        }));
        setBackups(withDates);
      } catch (error) {
        console.error('Error fetching backups:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBackups();
  }, []);

  const handleCreateBackup = async (type) => {
    setIsBackingUp(true);
    try {
      const blob = await adminApi.createBackup(type);

      // Crear un enlace temporal y disparar descarga
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup_${type}_${timestamp}.zip`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Backup descargado',
        description: `Backup ${type === 'full' ? 'completo' : 'de ' + type} descargado exitosamente.`,
      });
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear el backup. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = async (backup) => {
    try {
      toast({
        title: 'Descarga iniciada',
        description: 'El backup se está descargando.',
      });

      if (backup.url) {
        window.open(backup.url, '_blank');
        return;
      }

      const blob = await adminApi.downloadBackup(backup.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.id; 
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el backup.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Backup Section */}
      <Card className="dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Crear Nueva Copia de Seguridad</CardTitle>
          <CardDescription>Selecciona qué datos deseas respaldar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {BACKUP_TYPES.map((type) => (
              <div
                key={type.id}
                onClick={() => handleCreateBackup(type.id)}
                className={`flex w-full items-center justify-between rounded-lg border border-slate-200 p-4 transition-all hover:border-primary hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700 cursor-pointer ${isBackingUp ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="text-left">
                  <p className="font-medium text-slate-900 dark:text-white">{type.label}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{type.description}</p>
                </div>
                <Button
                  disabled={isBackingUp}
                  className="flex items-center gap-2"
                >
                  {isBackingUp ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-900/20">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-300">Recomendación de Seguridad</p>
              <p className="mt-1 text-amber-800 dark:text-amber-200">
                Realiza backups completos semanalmente y mantén múltiples copias en ubicaciones diferentes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup History */}
      {backups.length > 0 && (
        <Card className="dark:bg-slate-800">
          <CardHeader>
            <CardTitle>Historial de Backups</CardTitle>
            <CardDescription>Últimas copias de seguridad creadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Backup {backup.type === 'full' ? 'Completo' : 'de ' + backup.type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {backup.timestamp.toLocaleString('es-ES')} • {backup.size.toFixed(1)} MB
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {backup.status === 'completado' ? '✓ Completado' : 'En proceso'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadBackup(backup)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
