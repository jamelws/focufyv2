"use client";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { CiGlobe } from "react-icons/ci";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState("es");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLang(i18n.language || "es");
  }, [i18n.language]);

  const changeLang = (v) => {
    i18n.changeLanguage(v);
    localStorage.setItem("lang", v);
    setLang(v);
    setOpen(false);
  };

  return (
    <>
      {/* Botón en el navbar */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-2 p-2 text-white" // Asegúrate que este color contraste con tu navbar
      >
        <CiGlobe size={24} /> {/* Usar 'size' es más estándar para react-icons */}
      </button>

      {/* Modal fullscreen */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white text-center">
          {/* Botón cerrar */}
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
            onClick={() => setOpen(false)}
          >
            &times; {/* Usamos un HTML entity para una 'X' más estilizada */}
          </button>

          {/* Contenido */}
          <div>
            {/* --- CORRECCIÓN APLICADA AQUÍ --- */}
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Selecciona idioma</h2>
            <button
              onClick={() => changeLang("es")}
              className={`block w-full text-lg py-2 text-gray-900 ${
                lang === "es" ? "font-bold text-purple-700" : "hover:underline"
              }`}
            >
              Español
            </button>
            <button
              onClick={() => changeLang("en")}
              className={`block w-full text-lg py-2 text-gray-900 ${
                lang === "en" ? "font-bold text-purple-700" : "hover:underline"
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeLang("fr")}
              className={`block w-full text-lg py-2 text-gray-900 ${
                lang === "fr" ? "font-bold text-purple-700" : "hover:underline"
              }`}
            >
              Français
            </button>
          </div>
        </div>
      )}
    </>
  );
}
