import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

export function ResourceTable({ title, items, resourceType, onEdit, onDelete, isDeleting }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Imagen</TableHead>
              <TableHead className="w-[180px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? items.map((item) => {
              const itemId = item.id || item._id;
              const rawImg = item.imagen_url || item.imagen || (Array.isArray(item.imagenes) ? item.imagenes[0] : item.imagenes) || null;
              const imageUrl = typeof rawImg === 'string' && rawImg ? rawImg.replace(/[[\]"]/g, '') : null;
              const ratingValue = item.rating ?? item.rating_promedio ?? '-';

              return (
                <TableRow key={itemId}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900 dark:text-white">{item.nombre}</p>
                      <p className="text-xs capitalize text-slate-500 dark:text-slate-400">{resourceType.slice(0, -1)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{ratingValue}</TableCell>
                  <TableCell>
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.nombre} className="h-12 w-16 rounded-lg object-cover" />
                    ) : (
                      <span className="text-xs text-slate-400">Sin imagen</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                        <Pencil size={14} className="mr-2" />
                        Editar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => onDelete(item)} disabled={isDeleting} className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                        <Trash2 size={14} className="mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 dark:text-slate-400">
                  No hay recursos registrados todavia.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
