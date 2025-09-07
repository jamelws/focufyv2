"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const FormSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"], // Indica qué campo mostrará el error
});

export default function ResetPasswordForm({ token }) {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const router = useRouter();
  const [status, setStatus] = useState({ message: '', error: false });

  async function onSubmit(values) {
    try {
      const res = await fetch('/api/auth/password-reset/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'El enlace de reseteo es inválido o ha expirado.');
      }
      
      setStatus({ message: '¡Contraseña actualizada con éxito! Redirigiendo al login...', error: false });
      
      setTimeout(() => {
          router.push('/sign-in');
      }, 3000);

    } catch (error) {
      setStatus({ message: error.message, error: true });
    }
  }

  if (status.message && !status.error) {
      return <p className="text-green-500 text-center">{status.message}</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {status.message && status.error && <p className="text-red-500 text-sm">{status.message}</p>}
        <Button className="w-full mt-6" type="submit">
          Actualizar Contraseña
        </Button>
      </form>
    </Form>
  );
}
