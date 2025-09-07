// components/auth/SignInForm.jsx
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
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// MUI
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const FormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have more than 8 characters"),
});

export default function SignInForm() {
  const { t } = useTranslation();
  const router = useRouter();

  // Estados
  const [openDialog, setOpenDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login normal
  async function onSubmit(values) {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (res.error) {
      console.error("Login error:", res.error);
      form.setError("email", { message: t("invalidCreds") || "Credenciales incorrectas" });
    } else {
      router.push("/dashboard");
    }
  }

  // Reset password request
  async function handleResetRequest(e) {
    e.preventDefault();
    console.log("📨 Correo para reset:", resetEmail);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("errorSendingMail"));

      setSnack({ open: true, msg: t("resetLinkSent"), sev: "success" });
      setOpenDialog(false);
      setResetEmail(""); // limpiar input
    } catch (err) {
      setSnack({ open: true, msg: err.message, sev: "error" });
    }
  }

  if (!mounted) return null;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="space-y-2">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input placeholder="mail@example.com" {...field} />
                  </FormControl>
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
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={t("enterPassword")} {...field} />
                  </FormControl>
                  <FormMessage />

                  {/* Botón "Olvidaste tu contraseña?" */}
                  <div className="text-right mt-2">
                    <Button
                      variant="link"
                      type="button"
                      onClick={() => setOpenDialog(true)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {t("forgotPassword")}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button className="w-full mt-6" type="submit">
            {t("signin")}
          </Button>
        </form>

        <div className="mx-auto my-4 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-stone-400 after:ml-4 after:block after:h-px after:flex-grow after:bg-stone-400">
          {t("or")}
        </div>

        <p className="text-center text-sm text-gray-600 mt-2">
          {t("noAccount")} &nbsp;
          <Link className="text-blue-500 hover:underline" href="/sign-up">
            {t("signup")}
          </Link>
        </p>
      </Form>

      {/* Dialog de Olvidaste tu contraseña */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {t("resetPassword")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleResetRequest}>
          <DialogContent>
            <Input
              type="email"
              name="email"
              placeholder="mail@example.com"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full"
            />
          </DialogContent>
          <DialogActions>
            <Button type="submit">{t("sendLink")}</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
