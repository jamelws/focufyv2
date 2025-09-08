"use client";

import React, { useState, useEffect } from 'react';
// SUGERENCIA 1: Se han eliminado los imports no utilizados (Box, Paper, useRef, etc.)
// y se ha mantenido solo lo que se usa en el JSX.
import { Container } from '@mui/material';
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function ReportClient() {
    const [musicSets, setMusicSets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { t } = useTranslation();

    // SUGERENCIA 2: Se ha eliminado el estado 'isMounted'.
    // El estado 'isLoading' ya se encarga de gestionar el renderizado inicial.

    // SUGERENCIA 3: La lógica de fetch se ha movido a su propia función
    // para poder ser llamada tanto al montar el componente como al reintentar.
    const fetchMusicSets = async () => {
        setIsLoading(true); // Mostrar 'cargando' al reintentar
        setError(null);     // Limpiar errores previos
        try {
            const response = await fetch("/api/artist/report", { cache: "no-store" });

            if (!response.ok) throw new Error(t("err_load_projects") || "Error al cargar los proyectos.");
            const data = await response.json();
            setMusicSets(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMusicSets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Se ejecuta solo una vez al montar el componente.

    if (isLoading) {
        return <p className="p-8 text-center">{t("loading")}</p>;
    }

    if (error) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                {/* SUGERENCIA 3: Se añade un botón para reintentar la carga de datos. */}
                <button
                    onClick={fetchMusicSets}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t("retry") || "Reintentar"}
                </button>
            </div>
        );
    }
    
    return (
        <Container>
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8">
                        <h1 className="text-4xl font-bold">{t("selectrep")}</h1>
                        <p className="text-gray-500">{t("repdesc")}</p>
                    </header>

                    <div className="space-y-4">
                        {musicSets.length > 0 ? (
                            musicSets.map((set) => (
                                <Link
                                    href={`/artist/report/${set.id}`}
                                    key={set.id}
                                    className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow"
                                >
                                    <h2 className="font-bold text-xl text-blue-600">{set.name}</h2>
                                </Link>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">{t("notokensforrep")}</p>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}
