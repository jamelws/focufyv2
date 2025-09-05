"use client";
import { createContext, useContext, useState, useEffect } from "react";

const PerfilContext = createContext();

export function PerfilProvider({ children }) {
  const [perfilActual, setPerfilActual] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedPerfil = localStorage.getItem("perfilActual");
      if (storedPerfil) {
        setPerfilActual(storedPerfil);
      }
    }
  }, []);

  const cambiarPerfil = (nuevo) => {
    setPerfilActual(nuevo);
    if (typeof window !== "undefined") {
      localStorage.setItem("perfilActual", nuevo);
    }
  };

  return (
    <PerfilContext.Provider value={{ perfilActual, cambiarPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}

export const usePerfil = () => useContext(PerfilContext);
