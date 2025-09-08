//app/artist/report/[MusicSetId]/page.js
"use client";

import React, { useState, useEffect } from 'react';
// El hook 'useParams' se usa correctamente para leer la URL en el App Router
import { useParams } from 'next/navigation';
import ReportDashboard from '@/components/ReportDashboard';
import { useTranslation } from "react-i18next";

export default function ReportDetailPage() {
  const { t, i18n } = useTranslation();
  // Llama al hook para obtener los parámetros de la URL
  const params = useParams();
  const musicSetId = params.musicSetId; // Asume que tu ruta es /report/[musicSetId]

  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
  if (!musicSetId) return;

  const lang = i18n?.language || "es"; // fallback
  const fetchReportData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/artist/report/${encodeURIComponent(musicSetId)}?lang=${encodeURIComponent(lang)}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Error al cargar el reporte.");

      const data = await response.json();
      setProjectData(data);
    } catch (err) {
      setError(err.message || "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  fetchReportData();
}, [musicSetId, i18n?.language]);

  if (isLoading) return <p className="tw-text-center tw-p-8" suppressHydrationWarning={true}>{t("loading")}...</p>;
  if (error) return <p className="tw-text-center tw-text-red-500 tw-p-8">{error}</p>;

  return projectData ? <ReportDashboard initialData={projectData} t={t}/> : null;
}