"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PerfilSwitcher from "@/components/PerfilSwitcher";
import { usePerfil } from "@/context/PerfilContext";

// El Navbar recibe 'isScrolled' (para la landing) y 'onToggleSidebar' (para el dashboard)
export default function Navbar({ isScrolled, onToggleSidebar }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Para el menú hamburguesa del landing
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { perfilActual, updatePerfil } = usePerfil();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navBackgroundClass = session ? 'bg-primary shadow-md' : (isScrolled ? 'bg-gray-900' : 'bg-transparent');

  if (!isMounted) return null; // Previene errores de hidratación

  return (
    <nav id="navegador" className={`fixed top-0 left-0 w-full z-40 text-white transition-colors duration-300 ${navBackgroundClass}`}>
      <div className="container mx-auto flex items-center justify-between px-4 h-16">

        {/* --- SECCIÓN IZQUIERDA --- */}
        <div className="flex items-center space-x-2">
          {session && (
            // Hamburguesa para el Sidebar (solo con sesión y en móvil)
            <button onClick={onToggleSidebar} className="p-2 md:hidden" aria-label="Toggle Sidebar">
               <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          )}
          <a href={session ? "/dashboard" : "/"}>
            <Image src="/focu_whitw_02.png" alt="Focufy Logo" width={120} height={40} priority />
          </a>
        </div>

        {/* --- SECCIÓN CENTRAL (MENÚ) --- */}
        <div className="hidden md:flex flex-1 justify-center">
          {!session && (
            // Menú de landing para Desktop
            <div className="flex items-center space-x-6">
              <a href="#about" className="hover:text-gray-300">{t("navbar.about")}</a>
              <a href="#somos" className="hover:text-gray-300">{t("navbar.perfila")}</a>
              <a href="#pricing" className="hover:text-gray-300">{t("navbar.pricing")}</a>
              <a href="#ready" className="hover:text-gray-300">{t("navbar.start")}</a>
            </div>
          )}
        </div>

        {/* --- SECCIÓN DERECHA --- */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {session ? (
            // --- VISTA CON SESIÓN ---
            <>
              {/* Perfil Switcher (Centrado en móvil, a la derecha en PC) */}
              <div className="absolute left-1/2 -translate-x-1/2 md:static md:left-auto md:translate-x-0">
                  <PerfilSwitcher perfilActual={perfilActual} onChangePerfil={updatePerfil} />
              </div>
              <LanguageSwitcher />
            </>
          ) : (
            // --- VISTA SIN SESIÓN ---
            <>
              {/* Controles Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <LanguageSwitcher />
                <button onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })} className="cta-button" style={{color: 'black', marginTop: 0, padding: '8px 24px'}}>
                  {t("navbar.login")}
                </button>
              </div>
              {/* Hamburguesa Landing para Móvil */}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={!isMenuOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} /></svg>
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Menú Desplegable para Landing Page en Móvil */}
      {!session && isMenuOpen && (
        <div className={`md:hidden ${isScrolled ? 'bg-gray-900' : 'bg-primary'} absolute w-full left-0`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">{t("navbar.about")}</a>
            <a href="#somos" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">{t("navbar.perfila")}</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">{t("navbar.pricing")}</a>
            <a href="#ready" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">{t("navbar.start")}</a>
             <div className="pt-4 px-3">
               <button onClick={() => { signIn(undefined, { callbackUrl: "/dashboard" }); setIsMenuOpen(false); }} className="w-full text-center cta-button" style={{color: 'black'}}>
                {t("navbar.login")}
              </button>
             </div>
          </div>
        </div>
      )}
    </nav>
  );
}

