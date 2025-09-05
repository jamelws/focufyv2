"use client";

import React, { useState, useMemo ,useEffect} from 'react';
import AIReport from '@/components/AIReport'; 
import { Snackbar, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
// --- INICIO: Componentes de UI y Gráficos ---

const SvgLineChart = ({ data = [], timestamps = [], color = '#8257e5' }) => {
    const width = 500; const height = 200; const padding = 20;
    if (data.length < 2) return <div className="flex items-center justify-center h-full"><p>No hay suficientes datos para el gráfico.</p></div>;
    const points = data.map((point, i) => `${(i / (data.length - 1)) * (width - padding * 2) + padding},${height - (point / 100) * (height - padding * 2) - padding}`).join(' ');
    const areaPoints = `${points} ${width - padding},${height - padding} ${padding},${height - padding}`;
    return (<svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full"><defs><linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} /><stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} /></linearGradient></defs><polyline fill="url(#gradient)" points={areaPoints} /><polyline fill="none" stroke={color} strokeWidth="2" points={points} />{timestamps.map((ts, i) => <text key={i} x={(i / (data.length - 1)) * (width - padding * 2) + padding} y={height - 5} fontSize="10" fill="currentColor" textAnchor="middle">{ts}</text>)}</svg>);
};

const SvgVerticalBarChart = ({ data = [], labels = [], color = '#3b82f6' }) => {
    const width = 300; const height = 250; const padding = 20; const barPadding = 5;
    if (data.length === 0) return <div className="flex items-center justify-center h-full"><p>Sin datos demográficos.</p></div>;
    const maxValue = Math.max(...data, 1); const barHeight = (height - padding * 2) / data.length;
    return (<svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">{data.map((value, i) => { const barWidth = (value / maxValue) * (width - padding - 50); const y = i * barHeight + padding; return (<g key={i}><rect x={50} y={y} width={barWidth} height={barHeight - barPadding} fill={color} rx="2" /><text x={45} y={y + barHeight / 2} fontSize="10" fill="currentColor" textAnchor="end" alignmentBaseline="middle">{labels[i]}</text><text x={55 + barWidth} y={y + barHeight / 2} fontSize="10" fill="currentColor" alignmentBaseline="middle">{value}</text></g>);})}</svg>);
};

const SvgPieChart = ({ data = [] }) => {
    if (!data || data.length === 0) return <div className="flex items-center justify-center h-full"><p>Sin datos de feedback.</p></div>;
    const size = 200; const radius = size / 2; let cumulativePercent = 0;
    const getCoordinatesForPercent = (p) => [Math.cos(2*Math.PI*p)*radius, Math.sin(2*Math.PI*p)*radius];
    return (<div className="flex items-center justify-center"><svg height={size} width={size} viewBox={`-${radius} -${radius} ${size} ${size}`}>{data.map(({ value, color }) => { const [startX, startY] = getCoordinatesForPercent(cumulativePercent); cumulativePercent += value / 100; const [endX, endY] = getCoordinatesForPercent(cumulativePercent); const largeArcFlag = value > 50 ? 1 : 0; const pathData = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`; return <path key={color} d={pathData} fill={color} />;})}</svg><div className="ml-4 text-sm">{data.map(({ label, value, color }) => (<div key={label} className="flex items-center mb-1"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span><span>{label}: {value}%</span></div>))}</div></div>);
};

const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c.401-.42.767-.864 1.126-1.317.36-.452.758-.901 1.135-1.348m11.218 0c.377.447.775.896 1.135 1.348.359.453.725.897 1.126 1.317a7.5 7.5 0 0 1-7.5 0m-3.75 2.311a12.06 12.06 0 0 1-4.5 0" /></svg>;
const Card = ({ children, className = '' }) => <div className={`bg-white dark:bg-zinc-800/50 rounded-xl shadow-md overflow-hidden ${className}`}>{children}</div>;
const CardHeader = ({ children }) => <div className="p-4 border-b border-zinc-200 dark:border-zinc-700"><h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{children}</h3></div>;
const CardBody = ({ children, className = '' }) => <div className={`p-4 ${className}`}>{children}</div>;

const SongDetailView = ({ song, onBack }) => (
    <div className="animate-fade-in">
        <button onClick={onBack} className="mb-4 px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-blue-600 transition-colors">&larr; Volver al Resumen</button>
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <CardHeader><div className="flex items-center"><LightbulbIcon /><span>SONUS LLM: Resumen Ejecutivo para {song.title}</span></div></CardHeader>
                <CardBody>
                    <p className="text-lg mb-3"><strong>Recomendación:</strong> {song.summary?.recommendation || 'Análisis pendiente.'}</p>
                    <p className="mb-4 text-blue-100"><strong>Nicho Principal Identificado:</strong> {song.summary?.nicheDescription || 'No definido.'}</p>
                    <div>
                        <strong className="text-sm">Palabras Clave:</strong>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {(song.summary?.keywords || []).map(k => <div key={k} className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{k}</div>)}
                        </div>
                    </div>
                </CardBody>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>Retención de Oyentes</CardHeader>
                        <CardBody><div className="w-full h-72"><SvgLineChart data={song.retentionData?.retention} timestamps={song.retentionData?.timestamps} /></div></CardBody>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>Perfil Demográfico</CardHeader>
                        <CardBody><div className="w-full h-64"><SvgVerticalBarChart data={song.demographics?.data} labels={song.demographics?.labels} /></div></CardBody>
                    </Card>
                </div>
            </div>
            
            {/* --- SECCIÓN DE FEEDBACK DINÁMICA --- */}
            <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 pt-4">Feedback Cualitativo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(song.feedback || []).map((feedbackItem) => (
                    <Card key={feedbackItem.questionTitle}>
                        <CardHeader>{feedbackItem.questionTitle}</CardHeader>
                        <CardBody>
                            <div className="w-full h-64 flex items-center justify-center">
                                <SvgPieChart data={feedbackItem.chartData} />
                            </div>
                        </CardBody>
                    </Card>
                ))}
                {(!song.feedback || song.feedback.length === 0) && (
                    <p className="text-zinc-500 md:col-span-2">No hay feedback cualitativo para mostrar para esta canción.</p>
                )}
            </div>
        </div>
    </div>
);

// --- FIN: Componentes de UI ---


export default function ReportDashboard({ initialData, t}) {
  const [selectedSong, setSelectedSong] = useState(null);
  const [modalContent, setModalContent] = useState('');
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const { i18n } = useTranslation();
  const [lang, setLang] = useState("es");
    
  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const [notice, setNotice] = useState({
    open: false,
    sev: "info",
    msg: "",
  });
  // `initialData` ahora contiene `aiAnalysis`
  const { projectName, artistName, songs, aiAnalysis } = initialData;

  const topSongs = useMemo(() => {
    if (!initialData || !initialData.songs) return [];
    return [...initialData.songs]
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);
  }, [initialData]);

  if (!initialData) {
    return <p className="p-8">{t("nodatarep")}</p>;
  }

  if (selectedSong) {
    return (
        <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8 text-black dark:text-white">
            <div className="max-w-7xl mx-auto">
                <SongDetailView song={selectedSong} onBack={() => setSelectedSong(null)} />
            </div>
        </div>
    );
  }
  const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-blue-500"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" /></svg>;
  const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-purple-500"><path strokeLinecap="round" strokeLinejoin="round" d="m16.023 9.348-4.992 0a.75.75 0 0 1 0-1.5h4.992a.75.75 0 0 1 0 1.5Zm-4.992 1.5a.75.75 0 0 0 0 1.5h4.992a.75.75 0 0 0 0-1.5h-4.992Zm-4.992-1.5a.75.75 0 0 1 0-1.5h4.992a.75.75 0 0 1 0 1.5H6.039Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
  const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-2 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
  const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c.401-.42.767-.864 1.126-1.317.36-.452.758-.901 1.135-1.348m11.218 0c.377.447.775.896 1.135 1.348.359.453.725.897 1.126 1.317a7.5 7.5 0 0 1-7.5 0m-3.75 2.311a12.06 12.06 0 0 1-4.5 0" /></svg>;

  const MetricCard = ({ title, value, icon }) => (
    <Card>
        <CardBody className="flex flex-col items-center justify-center text-center h-full">
            {icon}
            <p className="text-3xl font-bold text-zinc-800 dark:text-white">{value}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
        </CardBody>
    </Card>
);

  const KeyMetrics = ({ metrics }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{marginBottom:"20px"}}>
      <MetricCard title={t("repstitle")} value={metrics.playCount} icon={<PlayIcon />} />
      <MetricCard title={t("compratetitle")} value={`${metrics.completionRate}%`} icon={<CheckCircleIcon />} />
      <MetricCard title={t("repeatratetitle")} value={`${metrics.replayRatio}%`} icon={<RepeatIcon />} />
      <MetricCard title={t("overallscoretitle")} value={metrics.overallScore} icon={<StarIcon />} />
    </div>
  );

  
  const handleSuggestFix = (song) => {
    const title = (song?.title || "").trim() || "tu canción";
    // Mensaje mejor redactado:
    const msg = `Próximamente habilitaremos el análisis con IA para «${title}».`;

    setNotice({ open: true, sev: "info", msg });
  };
  const Modal = ({ title, content, onClose }) => (<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50" onClick={onClose}><div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 w-full max-w-lg animate-fade-in-up" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold mb-4">{title}</h3><div className="text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{content}</div><button onClick={onClose} className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg">Cerrar</button></div></div>);

  return (
    <>
    <div className="bg-zinc-50 dark:bg-zinc-900 min-h-screen p-4 sm:p-6 lg:p-8 text-black dark:text-white">
      { (isLoadingModal || modalContent) && <Modal title="Sugerencias de Arreglos con IA" content={isLoadingModal ? 'Analizando...' : modalContent} onClose={() => setModalContent('')} /> }
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">{initialData.projectName}</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {t("artistlbl")}: <span className="font-semibold">{initialData.artistName}</span>
          </p>
        </header>
        {/* Muestra el reporte de IA aquí, justo después del encabezado */}
        <AIReport analysisText={aiAnalysis} t={t}/>
        <div className="mb-10 p-6 bg-gray-100 dark:bg-zinc-800/50 rounded-xl">
            <h2 className="text-xl font-bold mb-2">{t("resumetitle")}</h2>
            <p className="text-zinc-600 dark:text-zinc-300 mb-4">
                {t("delas")} <strong>{initialData.songs.length} {t("songsd")}</strong> {t("topdesc")}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topSongs.map((song, index) => (
                    <div key={song.id} className="p-4 bg-white dark:bg-zinc-700 rounded-lg shadow">
                        <p className="font-bold text-blue-500">#{index + 1} {song.title}</p>
                        <p className="text-sm">{t("overallscoretitle")}: <span className="font-semibold">{song.overallScore}</span></p>
                    </div>
                ))}
            </div>
        </div>
        <KeyMetrics metrics={initialData.metrics} />

        <div className="space-y-3">
          {initialData.songs.map((song) => (
            <div key={song.id} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow grid grid-cols-3 items-center">
              <p className="font-bold col-span-1">{song.title}</p>
              <div style={{width:200, textAlign: "center", float:'right', display:'block'}}>
                <span className={`text-xl font-bold ${song.overallScore > 8.5 ? 'text-green-500' : song.overallScore > 7 ? 'text-blue-500' : 'text-zinc-500'}`}>{song.overallScore}</span>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${song.overallScore * 10}%` }}></div>
                </div>
              </div>
              <div className="col-span-1 text-right">
                <button onClick={() => handleSuggestFix(song)} className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors" style={{marginRight:10}}>✨ Sugerir Arreglos</button>
                {song.isAnalyzable ? (
                  <button
                    onClick={() => setSelectedSong(song)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    {t("seeanalisis")}
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">{t("incompletedata")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Snackbar
      open={notice.open}
      autoHideDuration={3000}
      onClose={() => setNotice((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={() => setNotice((s) => ({ ...s, open: false }))}
        severity={notice.sev}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {notice.msg}
      </Alert>
    </Snackbar>
    </>
  );
}
