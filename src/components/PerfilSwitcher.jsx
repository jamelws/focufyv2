"use client";
import { usePerfil } from "@/context/PerfilContext";

export default function PerfilSwitcher() {
  const { perfilActual, cambiarPerfil } = usePerfil(); // 👈 sacamos del contexto

  const handleSwitch = () => {
    const nextPerfil = perfilActual === "CREADOR" ? "CURADOR" : "CREADOR";
    cambiarPerfil(nextPerfil); // 👈 ya no props, ahora directo del contexto
  };

  const nextPerfil = perfilActual === "CREADOR" ? "CURADOR" : "CREADOR";

  return (
    <button
      onClick={handleSwitch}
      className="flex items-center gap-2 bg-gray-900 text-white rounded-full px-3 py-1 text-xs font-medium cursor-pointer hover:bg-gray-800 transition"
    >
      {/* Icono refresh en SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-7.5M19 5a9 9 0 00-14 7.5"
        />
      </svg>
      <span>Switch to {nextPerfil}</span>
    </button>
  );
}
