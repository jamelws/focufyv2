// No necesita "use client"
import Providers from "@/components/Providers"; 

import "./globals.css";
import "../../public/styles/globals.css";
import "../../public/styles/landing.css";
import "../../public/styles/quiz.css";

export const metadata = {
  title: "Focufy",
  description: "Tu Laboratorio de Lanzamientos Musicales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">      
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

