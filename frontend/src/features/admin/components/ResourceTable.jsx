import { Pencil, Trash2, Star, ImageOff } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';

function normalizeImageUrl(item) {
  const rawImg =
    item?.imagen_url ||
    item?.imagen ||
    (Array.isArray(item?.imagenes) ? item.imagenes[0] : item?.imagenes) ||
    null;

  if (!rawImg || typeof rawImg !== 'string') return null;
  const trimmed = rawImg.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:image/')) return trimmed;
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed[0]) return String(parsed[0]).trim();
    } catch {
      return trimmed.replace(/^[[\]"\s]+|[[\]"\s]+$/g, '');
    }
  }
  return trimmed;
}

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
            {items.length > 0 ? (
              items.map((item) => {
                const itemId = item.id || item._id;
                const imageUrl = normalizeImageUrl(item);
                const rawRating = item.rating ?? item.rating_promedio ?? item.calificacion;
                const numericRating =
                  rawRating !== null && rawRating !== undefined && rawRating !== '' && !isNaN(Number(rawRating))
                    ? Number(rawRating)
                    : null;

                return (
                  <TableRow key={itemId}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-white">{item.nombre}</p>
                        <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                          {item.municipio ? `${resourceType.slice(0, -1)} · ${item.municipio}` : resourceType.slice(0, -1)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {numericRating !== null && numericRating > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <Star size={13} className="fill-amber-400 text-amber-500" />
                          <span>{numericRating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Sin calificar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.nombre}
                          className="h-12 w-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700 bg-slate-100"
                          loading="lazy"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <ImageOff size={13} />
                          <span>Sin imagen</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                          <Pencil size={14} className="mr-2" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item)}
                          disabled={isDeleting}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={14} className="mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
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
