import { useEffect, useMemo } from 'react';
import { ImagePlus, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { useImageUpload } from '../../../hooks/useImageUpload';

const imageField = z
  .any()
  .refine((file) => !file || file instanceof File, 'Selecciona una imagen valida.')
  .refine((file) => !file || file.size <= 2 * 1024 * 1024, 'La imagen no debe superar los 2MB.')
  .refine((file) => !file || ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'La imagen debe ser jpg, png o webp.');

const baseSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string().trim().min(1, 'La descripcion es obligatoria.'),
  latitud: z.coerce.number().min(-90).max(90),
  longitud: z.coerce.number().min(-180).max(180),
  rating: z.coerce.number().min(1, 'Selecciona un rating.').max(5, 'El rating maximo es 5.'),
  imagen: imageField.optional().nullable(),
});

const schemas = {
  lugares: baseSchema.extend({
    categoria_id: z.string().trim().min(1, 'Selecciona una categoria.'),
    direccion: z.string().trim().optional().or(z.literal('')),
  }),
  eventos: baseSchema.extend({
    fecha: z.string().min(1, 'La fecha es obligatoria.'),
  }),
  restaurantes: baseSchema.extend({
    direccion: z.string().trim().min(1, 'La direccion es obligatoria.'),
    telefono: z.string().trim().min(1, 'El telefono es obligatorio.'),
    horario: z.string().trim().min(1, 'El horario es obligatorio.'),
    web: z.string().trim().optional().or(z.literal('')),
  }),
};

function getDefaultValues(resourceType, initialData) {
  const coordinates = initialData?.ubicacion?.coordinates || [];

  // Parse fecha properly - handle ISO strings, timestamps, and date objects
  let fechaValue = '';
  if (initialData?.fecha) {
    const fechaStr = String(initialData.fecha);
    // If it's already in YYYY-MM-DD format, use as is
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
      fechaValue = fechaStr.slice(0, 10);
    } else {
      // Try to parse as ISO date and convert to YYYY-MM-DD
      try {
        const date = new Date(fechaStr);
        if (!isNaN(date.getTime())) {
          fechaValue = date.toISOString().slice(0, 10);
        }
      } catch (e) {
        fechaValue = '';
      }
    }
  }

  return {
    nombre: initialData?.nombre || '',
    descripcion: initialData?.descripcion || '',
    categoria_id: initialData?.categoria_id || (initialData?.categoria && typeof initialData.categoria === 'string' && initialData.categoria.length === 24 ? initialData.categoria : '') || '',
    direccion: initialData?.direccion || '',
    telefono: initialData?.telefono || '',
    horario: initialData?.horario || '',
    web: initialData?.web || '',
    fecha: fechaValue,
    latitud: coordinates[1] ?? (initialData?.coordenadas?.lat ?? ''),
    longitud: coordinates[0] ?? (initialData?.coordenadas?.lng ?? ''),
    rating: initialData?.rating ?? initialData?.rating_promedio ?? initialData?.calificacion ?? 5,
    imagen: null,
    resourceType,
  };
}

export function ResourceFormDialog({ open, onOpenChange, resourceType, categories = [], initialData, onSubmit, isPending, formErrors = {} }) {
  const schema = useMemo(() => schemas[resourceType], [resourceType]);
  const { validateAndSetFile, previewUrl, clearPreview } = useImageUpload();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(resourceType, initialData),
  });

  useEffect(() => {
    const defaults = getDefaultValues(resourceType, initialData);
    if (resourceType === 'lugares' && !defaults.categoria_id && initialData?.categoria && Array.isArray(categories)) {
      const match = categories.find(c => c.nombre?.toLowerCase() === initialData.categoria?.toLowerCase() || c.id === initialData.categoria || c._id === initialData.categoria);
      if (match) {
        defaults.categoria_id = match.id || match._id;
      }
    }
    form.reset(defaults);
    clearPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, resourceType, categories]);

  // Fallback al preview de datos iniciales si no hay archivo nuevo
  const displayUrl = previewUrl || (initialData?.imagenes?.[0] || initialData?.imagen || null)?.replace(/[[\]"]/g, '');

  const handleSubmit = (values) => {
    const payload = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        return;
      }

      if (key === 'imagen') {
        if (value instanceof File) {
          payload.append('imagen', value);
        }
        return;
      }

      if (key === 'categoria_id') {
        payload.append('categoria_id', value);
        const selectedCat = (Array.isArray(categories) ? categories : []).find(c => (c.id || c._id) === value);
        if (selectedCat && selectedCat.nombre) {
          payload.append('categoria', selectedCat.nombre);
        } else if (initialData?.categoria) {
          payload.append('categoria', initialData.categoria);
        }
        return;
      }

      payload.append(key, value);
    });

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar recurso' : 'Crear recurso'}</DialogTitle>
          <DialogDescription>Completa la informacion oficial y carga una imagen representativa.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-6 px-1">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="admin-resource-name">Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} id="admin-resource-name" name="nombre" placeholder="Nombre oficial" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="admin-resource-rating">Rating oficial</FormLabel>
                      <FormControl>
                        <Select {...field} id="admin-resource-rating" name="rating">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>{value}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {resourceType === 'lugares' ? (
                  <FormField
                    control={form.control}
                    name="categoria_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="admin-resource-category">Categoria</FormLabel>
                        <FormControl>
                          <Select {...field} id="admin-resource-category" name="categoria_id">
                            <option value="">Selecciona una categoria</option>
                            {categories.map((category) => (
                              <option key={category.id || category._id} value={category.id || category._id}>{category.nombre}</option>
                            ))}
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {resourceType === 'eventos' ? (
                  <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="admin-resource-date">Fecha</FormLabel>
                        <FormControl>
                          <Input {...field} id="admin-resource-date" name="fecha" type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {resourceType !== 'eventos' ? (
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="admin-resource-address">Direccion</FormLabel>
                        <FormControl>
                          <Input {...field} id="admin-resource-address" name="direccion" placeholder="Direccion o referencia" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                {resourceType === 'restaurantes' ? (
                  <>
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="admin-resource-phone">Telefono</FormLabel>
                          <FormControl>
                            <Input {...field} id="admin-resource-phone" name="telefono" placeholder="3331234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="horario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="admin-resource-schedule">Horario</FormLabel>
                          <FormControl>
                            <Input {...field} id="admin-resource-schedule" name="horario" placeholder="09:00 - 18:00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="web"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="admin-resource-web">Sitio web</FormLabel>
                          <FormControl>
                            <Input {...field} id="admin-resource-web" name="web" placeholder="https://ejemplo.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : null}

                <FormField
                  control={form.control}
                  name="latitud"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="admin-resource-lat">Latitud</FormLabel>
                      <FormControl>
                        <Input {...field} id="admin-resource-lat" name="latitud" type="number" step="any" placeholder="20.6767" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longitud"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="admin-resource-lng">Longitud</FormLabel>
                      <FormControl>
                        <Input {...field} id="admin-resource-lng" name="longitud" type="number" step="any" placeholder="-103.3475" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="admin-resource-description">Descripcion</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        id="admin-resource-description"
                        name="descripcion"
                        rows={4}
                        className="flex w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        placeholder="Describe el recurso con detalle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="admin-resource-image">Imagen</FormLabel>
                    <FormControl>
                      <Input
                        id="admin-resource-image"
                        name="imagen"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        ref={field.ref}
                        onBlur={field.onBlur}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file && validateAndSetFile(file)) {
                            field.onChange(file);
                          } else {
                            // Si la validación falla, limpiar el campo
                            field.onChange(null);
                            event.target.value = '';
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    {formErrors?.imagen && (
                      <p className="mt-1 text-sm font-medium text-red-500">
                        {formErrors.imagen[0]}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                {displayUrl ? (
                  <img src={displayUrl} alt="Vista previa" className="h-56 w-full object-cover" />
                ) : (
                  <div className="flex h-56 flex-col items-center justify-center gap-3 text-slate-400">
                    <ImagePlus size={28} />
                    <span className="text-sm">La vista previa aparecera aqui</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 mt-6 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <LoaderCircle className="mr-2 animate-spin" size={16} /> : null}
                {initialData ? 'Guardar cambios' : 'Crear recurso'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
