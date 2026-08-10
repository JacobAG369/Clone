import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Lock, Mail, Phone, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { useRegisterMutation } from '../hooks/useRegisterMutation';
import { useState } from 'react';

const registerSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.').min(2, 'El nombre debe tener al menos 2 caracteres.'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio.').min(2, 'El apellido debe tener al menos 2 caracteres.'),
  email: z.string().trim().min(1, 'El correo es obligatorio.').email('Ingresa un correo válido.'),
  telefono: z.string().trim().min(1, 'El teléfono es obligatorio.').min(7, 'El teléfono debe ser válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.').min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  password_confirmation: z.string().min(1, 'La confirmación es obligatoria.'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden.',
  path: ['password_confirmation'],
});

export function RegisterForm({ onSuccess }) {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      password_confirmation: '',
    },
  });

  const handleSubmit = async (values) => {
    const data = await registerMutation.mutateAsync(values);

    if (onSuccess) {
      onSuccess(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        {registerMutation.isError && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-4 text-red-600 dark:text-red-400">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm">{registerMutation.error?.response?.data?.detail || registerMutation.error?.response?.data?.error || registerMutation.error?.response?.data?.message || 'No se pudo completar el registro.'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           {/* Nombre */}
           <FormField
             control={form.control}
             name="nombre"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-nombre">Nombre</FormLabel>
                 <div className="relative">
                   <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-nombre"
                       name="nombre"
                       type="text"
                       className="pl-10"
                     />
                   </FormControl>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />

           {/* Apellido */}
           <FormField
             control={form.control}
             name="apellido"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-apellido">Apellido</FormLabel>
                 <div className="relative">
                   <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-apellido"
                       name="apellido"
                       type="text"
                       className="pl-10"
                     />
                   </FormControl>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />

           {/* Email */}
           <FormField
             control={form.control}
             name="email"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-email">Correo electrónico</FormLabel>
                 <div className="relative">
                   <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-email"
                       name="email"
                       type="email"
                       autoComplete="email"
                       className="pl-10"
                     />
                   </FormControl>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />

           {/* Teléfono */}
           <FormField
             control={form.control}
             name="telefono"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-telefono">Número de Teléfono</FormLabel>
                 <div className="relative">
                   <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-telefono"
                       name="telefono"
                       type="tel"
                       className="pl-10"
                     />
                   </FormControl>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />

           {/* Password */}
           <FormField
             control={form.control}
             name="password"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-password">Contraseña</FormLabel>
                 <div className="relative">
                   <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-password"
                       name="password"
                       type={showPassword ? "text" : "password"}
                       autoComplete="new-password"
                       className="pl-10 pr-10"
                     />
                   </FormControl>
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                   >
                     {showPassword ? (
                       <EyeOff size={20} />
                     ) : (
                       <Eye size={20} />
                     )}
                   </button>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />

           {/* Confirm Password */}
           <FormField
             control={form.control}
             name="password_confirmation"
             render={({ field }) => (
               <FormItem>
                 <FormLabel htmlFor="register-password-confirm">Confirmar Contraseña</FormLabel>
                 <div className="relative">
                   <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                   <FormControl>
                     <Input
                       {...field}
                       id="register-password-confirm"
                       name="password_confirmation"
                       type={showPasswordConfirm ? "text" : "password"}
                       autoComplete="new-password"
                       className="pl-10 pr-10"
                     />
                   </FormControl>
                   <button
                     type="button"
                     onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                   >
                     {showPasswordConfirm ? (
                       <EyeOff size={20} />
                     ) : (
                       <Eye size={20} />
                     )}
                   </button>
                 </div>
                 <FormMessage />
               </FormItem>
             )}
           />
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-slate-800 dark:bg-slate-700 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-900 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {registerMutation.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <UserPlus size={20} />
              Crear Cuenta
            </>
          )}
        </button>
      </form>
    </Form>
  );
}
