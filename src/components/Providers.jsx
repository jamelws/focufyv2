"use client";
import { SessionProvider } from "next-auth/react";
import { PerfilProvider } from "@/context/PerfilContext";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n"; // Asegúrate de que la ruta a tu config de i18n es correcta

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <I18nextProvider i18n={i18n}>
        <PerfilProvider>
          {children}
        </PerfilProvider>
      </I18nextProvider>
    </SessionProvider>
  );
}

