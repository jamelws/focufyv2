"use client";

import Image from "next/image";
import { useRef, useState,useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSession, signIn, signOut } from "next-auth/react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PerfilSwitcher from "@/components/PerfilSwitcher";
import { usePerfil } from "@/context/PerfilContext";

export default function Navbar() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { perfilActual, updatePerfil } = usePerfil();
  const navRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 👇 evita errores de hidratación
  if (!mounted) return null;
  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 ${
        session ? "bg-primary text-white" : "bg-transparent"
      }`}
      id="navegador"
    >
      <div className="container mx-auto flex items-center justify-between px-4 py-1">
        {/* Logo */}
        {/* Menú cuando NO hay sesión */}
        {!session ? (
          <>
        <a href="/" className="flex items-center space-x-2">
          <Image src="/focu_whitw_02.png" alt="Focufy" width={120} height={40} priority />
        </a>

          <ul className="hidden md:flex flex-1 justify-center items-center space-x-6">
            <li><a href="#hero">{t("navbar.home")}</a></li>
            <li><a href="#about">{t("navbar.about")}</a></li>
            <li><a href="#somos">{t("navbar.perfila")}</a></li>
            <li><a href="#pricing">{t("navbar.pricing")}</a></li>
            <li><a href="#ready">{t("navbar.start")}</a></li>
          </ul></>
        ) : (<><a href="/dashboard" className="flex items-center space-x-2">
          <Image src="/focu_whitw_02.png" alt="Focufy" width={120} height={40} />
        </a></>)}

        {/* Controles lado derecho */}
        <div className="hidden md:flex items-center space-x-4">
          {session && (
            <PerfilSwitcher
              perfilActual={perfilActual}
              onChangePerfil={updatePerfil}
            />
          )}

          <LanguageSwitcher />

          {!session ? (
            <button
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => signIn(undefined, { callbackUrl: "/" })}
            >
              Login
            </button>
          ) : (
            <></>
          )}
        </div>
      </div>
    </nav>
  );
}
