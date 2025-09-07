// No necesita "use client"
import Providers from "@/components/Providers"; 

import "./globals.css";

export const metadata = {
  title: "Focufy",
  description: "Tu Laboratorio de Lanzamientos Musicales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="/styles/globals.css" />
        <link rel="stylesheet" href="/styles/landing.css" />
        <link rel="stylesheet" href="/styles/quiz.css" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

