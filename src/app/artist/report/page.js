"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function SelectReportPage() {
  const [musicSets, setMusicSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchMusicSets = async () => {
      try {
        const response = await fetch("/api/artist/report");
        if (!response.ok) throw new Error("Error al cargar los proyectos.");
        const data = await response.json();
        setMusicSets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMusicSets();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;
  if (isLoading) return <p>{t("loading")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
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
  );
}
