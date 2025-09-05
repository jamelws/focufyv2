// components/auth/SignUpForm.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Combobox } from "@headlessui/react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Router } from "lucide-react";

const currentYear = new Date().getFullYear();

const FormSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  birthYear: z.coerce.number().int()
    .min(1900, "Año inválido")
    .max(currentYear - 18, "Debes tener al menos 18 años"),
  idPais: z.coerce.number().min(1, "Selecciona un país"),
  idCiudad: z.coerce.number().min(1, "Selecciona una ciudad"),
  availableForCollab: z.enum(["si", "no"]),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden",
});

export default function SignUpForm() {
  const [paises, setPaises] = useState([]);           // [{id, nombre}]
  const [ciudades, setCiudades] = useState([]);       // [{id, nombre}]
  const [qPais, setQPais] = useState("");
  const [qCiudad, setQCiudad] = useState("");
  const [loadingPaises, setLoadingPaises] = useState(false);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      birthYear: "",
      idPais: 0,
      idCiudad: 0,
      availableForCollab: "no",
      password: "",
      confirmPassword: "",
    },
  });
  const birthYear = form.watch("birthYear");
  // Edad calculada
  const edad = useMemo(() => {
    const by = Number(birthYear);
    return by ? currentYear - by : "";
  }, [birthYear]);

  // Cargar países
  useEffect(() => {
    (async () => {
      try {
        setLoadingPaises(true);
        const res = await fetch("/api/paises");
        const data = await res.json();
        setPaises(Array.isArray(data) ? data : data.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPaises(false);
      }
    })();
  }, []);

  // Cargar ciudades al cambiar país
  useEffect(() => {
    const paisId = Number(form.watch("idPais"));
    if (!paisId) {
      setCiudades([]);
      form.setValue("idCiudad", 0);
      return;
    }
    (async () => {
      try {
        setLoadingCiudades(true);
        const res = await fetch(`/api/ciudades?pais=${paisId}`);
        const data = await res.json();
        setCiudades(Array.isArray(data) ? data : data.items || []);
        form.setValue("idCiudad", 0); // resetea selección de ciudad
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCiudades(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("idPais")]);

  // Filtrado de opciones
  const filteredPaises = useMemo(() => {
    const q = qPais.trim().toLowerCase();
    if (!q) return paises;
    return paises.filter((p) => p.nombre?.toLowerCase().includes(q));
  }, [paises, qPais]);

  const filteredCiudades = useMemo(() => {
    const q = qCiudad.trim().toLowerCase();
    if (!q) return ciudades;
    return ciudades.filter((c) => c.nombre?.toLowerCase().includes(q));
  }, [ciudades, qCiudad]);

  async function onSubmit(values) {
    setServerMsg("");
    setSubmitting(true);
    try {
      const edad = currentYear - Number(values.birthYear);
      const payload = {
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        edad,
        idPais: Number(values.idPais),
        idCiudad: Number(values.idCiudad),
        availableForCollab: values.availableForCollab === "si",
      };

      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        form.setError("email", { message: "Correo ya registrado" });
        setServerMsg("Ese correo ya está registrado.");
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Error en el registro");
      }

      setServerMsg("¡Usuario creado! Revisa tu correo para confirmar.");
      form.reset();
      setQPais("");
      setQCiudad("");
      router.push('/sign-in');
    } catch (err) {
      console.error(err);
      setServerMsg(err?.message || "Error en el servidor");
    } finally {
      setSubmitting(false);
    }
  }

  // Helpers para mostrar el label seleccionado por id
  const paisById = (id) => paises.find((p) => p.id === Number(id));
  const ciudadById = (id) => ciudades.find((c) => c.id === Number(id));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl mx-auto space-y-6">
        {/* Nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Tu nombre" {...field} />
              </FormControl>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="mail@ejemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Año de nacimiento + Edad */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año de nacimiento</FormLabel>
                <FormControl>
                  <Input type="number" min={1900} max={currentYear - 18} placeholder="1995" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-7 text-sm text-gray-600">
            {edad ? `Edad calculada: ${edad}` : "Introduce tu año de nacimiento"}
          </div>
        </div>

        {/* País (Combobox) */}
        <FormField
          control={form.control}
          name="idPais"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    disabled={loadingPaises}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        displayValue={(val) => (paisById(val)?.nombre || "")}
                        onChange={(e) => setQPais(e.target.value)}
                        placeholder="Selecciona un país…"
                      />
                      {/* Lista */}
                      {filteredPaises.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
                          {filteredPaises.map((p) => (
                            <Combobox.Option
                              key={p.id}
                              value={p.id}
                              className={({ active }) =>
                                `cursor-pointer select-none rounded px-3 py-2 text-sm ${
                                  active ? "bg-primary/10 text-gray-900" : "text-gray-700"
                                }`
                              }
                            >
                              {p.nombre}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                      {/* Vacío */}
                      {qPais && filteredPaises.length === 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-white p-2 text-sm text-gray-500">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  </Combobox>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ciudad (Combobox dependiente) */}
        <FormField
          control={form.control}
          name="idCiudad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <div className="relative">
                  <Combobox
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    disabled={loadingCiudades || !form.watch("idPais")}
                  >
                    <div className="relative">
                      <Combobox.Input
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
                        displayValue={(val) => (ciudadById(val)?.nombre || "")}
                        onChange={(e) => setQCiudad(e.target.value)}
                        placeholder={
                          form.watch("idPais") ? "Selecciona una ciudad…" : "Primero elige un país"
                        }
                        disabled={!form.watch("idPais")}
                      />
                      {filteredCiudades.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg">
                          {filteredCiudades.map((c) => (
                            <Combobox.Option
                              key={c.id}
                              value={c.id}
                              className={({ active }) =>
                                `cursor-pointer select-none rounded px-3 py-2 text-sm ${
                                  active ? "bg-primary/10 text-gray-900" : "text-gray-700"
                                }`
                              }
                            >
                              {c.nombre}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                      {qCiudad && filteredCiudades.length === 0 && (
                        <div className="absolute mt-1 w-full rounded-md border bg-white p-2 text-sm text-gray-500">
                          Sin resultados
                        </div>
                      )}
                    </div>
                  </Combobox>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Disponible para colaborar (Sí/No) */}
        <FormField
          control={form.control}
          name="availableForCollab"
          render={({ field }) => (
            <FormItem>
              <FormLabel>¿Disponible para colaborar?</FormLabel>
              <FormControl>
                <div className="flex gap-4">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="si"
                      checked={field.value === "si"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    Sí
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      value="no"
                      checked={field.value === "no"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    No
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password + Confirm */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
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
                <FormLabel>Confirmar contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Repite tu contraseña" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mensaje del servidor / Submit */}
        {serverMsg && <div className="text-sm text-gray-700">{serverMsg}</div>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Enviando..." : "Crear cuenta"}
        </Button>
      </form>
    </Form>
  );
}
