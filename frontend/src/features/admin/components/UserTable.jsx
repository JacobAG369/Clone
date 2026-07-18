import { useMemo, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { useToast } from '../../../hooks/useToast';
import { UserFormDialog } from './UserFormDialog';

export function UserTable() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.getUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuario creado', description: 'La tabla se actualizo correctamente.' });
      setDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast({ title: 'No se pudo crear el usuario', description: error.response?.data?.message || 'Ocurrio un error al guardar.', variant: 'destructive' });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }) => adminApi.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuario actualizado', description: 'Los cambios se aplicaron correctamente.' });
      setDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast({ title: 'No se pudo actualizar el usuario', description: error.response?.data?.message || 'Ocurrio un error al actualizar.', variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Usuario eliminado', description: 'El usuario fue eliminado correctamente.' });
    },
    onError: (error) => {
      toast({ title: 'No se pudo eliminar el usuario', description: error.response?.data?.message || 'Ocurrio un error al eliminar.', variant: 'destructive' });
    },
  });

  const filteredUsers = useMemo(() => {
    const items = usersQuery.data || [];

    if (roleFilter === 'all') {
      return items;
    }

    return items.filter((user) => user.rol === roleFilter);
  }, [roleFilter, usersQuery.data]);

  const openCreateDialog = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleSubmit = (values) => {
    const payload = { ...values };
    if (!payload.password) {
      delete payload.password;
    }

    if (editingUser) {
      updateUserMutation.mutate({ 
        userId: editingUser.id || editingUser._id, 
        payload
      });
    } else {
      createUserMutation.mutate(payload);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Usuarios</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">Administra cuentas y filtra rapidamente por rol.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="min-w-40">
              <option value="all">Todos los roles</option>
              <option value="admin">Admin</option>
              <option value="turista">Turista</option>
            </Select>
            <Button type="button" onClick={openCreateDialog}>
              <Plus size={16} className="mr-2" />
              Nuevo usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nombre</TableHead>
                 <TableHead>Email</TableHead>
                 <TableHead>Rol</TableHead>
                 <TableHead>Acciones</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {usersQuery.isLoading ? (
                 Array.from({ length: 4 }).map((_, index) => (
                   <TableRow key={index}>
                     <TableCell colSpan={4}>
                       <div className="h-6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                     </TableCell>
                   </TableRow>
                 ))
               ) : filteredUsers.length > 0 ? (
                 filteredUsers.map((user) => (
                   <TableRow key={user.id || user._id}>
                     <TableCell className="font-medium text-slate-900 dark:text-white">{`${user.nombre} ${user.apellido ?? ''}`.trim()}</TableCell>
                     <TableCell>{user.email}</TableCell>
                     <TableCell>
                       <span className={[
                         'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                         user.rol === 'admin'
                           ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                           : 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
                       ].join(' ')}>
                         {user.rol}
                       </span>
                     </TableCell>
                     <TableCell className="flex gap-2">
                       <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                         <Edit2 className="w-4 h-4" />
                       </Button>
                       <Button type="button" variant="ghost" size="sm" onClick={() => deleteUserMutation.mutate(user.id || user._id)} disabled={deleteUserMutation.isPending} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))
               ) : (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                     No hay usuarios para el filtro seleccionado.
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
          </Table>
        </CardContent>
      </Card>

       <UserFormDialog
         open={dialogOpen}
         onOpenChange={(open) => {
           setDialogOpen(open);
           if (!open) {
             setEditingUser(null);
           }
         }}
         initialData={editingUser}
         onSubmit={handleSubmit}
         isPending={createUserMutation.isPending || updateUserMutation.isPending}
       />
    </>
  );
}
