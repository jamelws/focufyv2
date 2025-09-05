import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

/**
 * Calcula las métricas principales de una canción a partir de sus reproducciones.
 */
const calculatePlayMetrics = (songPlays) => {
    if (!songPlays || songPlays.length === 0) {
        return { overallScore: 0, completionRate: 0 };
    }
    const validScores = songPlays.map(p => p.score).filter(s => s !== null);
    const averageScore = validScores.reduce((acc, score) => acc + score, 0) / (validScores.length || 1);
    const overallScore = parseFloat((averageScore * 2).toFixed(1));
    const completedCount = songPlays.filter(p => p.completed).length;
    const completionRate = Math.round((completedCount / songPlays.length) * 100);
    return { overallScore, completionRate };
};

/**
 * Procesa TODAS las respuestas para generar datos para los gráficos de pay,
 * utilizando las opciones de la pregunta traídas desde la BD.
 */
const processFeedback = (responses) => {
    if (!responses || responses.length === 0) return [];
    
    const feedbackByQuestion = {};
    for (const res of responses) {
        if (res.question && (res.question.type === 'MULTIPLE_CHOICE' || res.question.type === 'SINGLE_CHOICE' || res.question.type === 'SCALE_1_5')) {
            const qId = res.questionId;
            if (!feedbackByQuestion[qId]) {
                feedbackByQuestion[qId] = { 
                    title: res.question.title, 
                    type: res.question.type, 
                    options: res.question.options, // Almacena las opciones de la pregunta
                    responses: [] 
                };
            }
            feedbackByQuestion[qId].responses.push(res.value);
        }
    }

    const chartsData = [];
    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f97316', '#eab308', '#64748b'];
    
    for (const qId in feedbackByQuestion) {
        const questionGroup = feedbackByQuestion[qId];
        
        // Crea un mapa local de value->label para esta pregunta específica
        const localOptionsMap = {};
        if (questionGroup.options) {
            questionGroup.options.forEach(opt => {
                localOptionsMap[opt.value] = opt.label;
            });
        }

        const counts = {};
        questionGroup.responses.forEach(value => {
            if (questionGroup.type === 'MULTIPLE_CHOICE') {
                try {
                    JSON.parse(value).forEach(v => { counts[v] = (counts[v] || 0) + 1; });
                } catch (e) {}
            } else {
                counts[value] = (counts[value] || 0) + 1;
            }
        });

        const totalVotes = Object.values(counts).reduce((sum, count) => sum + count, 0);
        if (totalVotes === 0) continue;

        const chartData = Object.entries(counts).map(([value, count], index) => {
            // Usa el mapa local para obtener el label correcto
            const label = localOptionsMap[value] || value;
            return {
                label: label.charAt(0).toUpperCase() + label.slice(1),
                value: Math.round((count / totalVotes) * 100),
                color: colors[index % colors.length],
            };
        });

        chartsData.push({ questionTitle: questionGroup.title, chartData: chartData });
    }
    return chartsData;
};

/**
 * Analiza los datos demográficos de los usuarios que respondieron.
 */
const calculateDemographics = (responses) => {
    if (!responses || responses.length === 0) {
        return {
            nicheDescription: 'Datos demográficos insuficientes.',
            demographicsChart: { data: [], labels: [] }
        };
    }
    const uniqueUsers = new Map();
    responses.forEach(res => {
        if (res.user && res.user.id) {
            uniqueUsers.set(res.user.id, res.user);
        }
    });
    const users = Array.from(uniqueUsers.values());
    const ageBrackets = {
        'Adolescentes': 0, 'Jóvenes': 0, 'Adultos Jóvenes': 0,
        'Adultos': 0, 
    };
    users.forEach(user => {
        if (user.edad) {
            if (user.edad <= 17) ageBrackets['Adolescentes']++;
            else if (user.edad <= 24) ageBrackets['Jóvenes']++;
            else if (user.edad <= 34) ageBrackets['Adultos Jóvenes']++;
            ageBrackets['Adultos']++;
           ;
        }
    });
    const topAgeBracket = Object.entries(ageBrackets).reduce((a, b) => a[1] > b[1] ? a : b, [null, 0])[0];
    const locationCounts = {};
    users.forEach(user => {
        if (user.ubicacion) {
            locationCounts[user.ubicacion] = (locationCounts[user.ubicacion] || 0) + 1;
        }
    });
    const topLocations = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    let nicheDescription = topAgeBracket ? `Principalmente ${topAgeBracket}` : 'Audiencia con edad no especificada';
    nicheDescription += topLocations.length > 0 ? ` en zonas urbanas como ${topLocations.join(' y ')}.` : '.';
    return {
        nicheDescription,
        demographicsChart: { labels: Object.keys(ageBrackets), data: Object.values(ageBrackets) }
    };
};


export async function GET(request, context) {
    const prisma = new PrismaClient();
    const { musicSetId } = await context.params;
    const lang = new URL(request.url).searchParams.get("lang") || "es";
    if (!musicSetId) {
        return NextResponse.json({ error: 'MusicSet ID es requerido' }, { status: 400 });
    }

  try {
    const musicSet = await prisma.musicSet.findUnique({
      // ... tu consulta de Prisma (sin cambios)
      where: { id: String(musicSetId) },
      include: {
        user: true,
        songs: {
          include: {
            responses: { 
                include: { 
                    user: true,
                    question: {
                        include: {
                            options: true
                        }
                    }
                } 
            },
            songPlays: true
          }
        }
      }
    });

    if (!musicSet) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
    }

    const transformedSongs = musicSet.songs.map(song => {
        const { overallScore, completionRate } = calculatePlayMetrics(song.songPlays);
        const feedbackCharts = processFeedback(song.responses);
        const { nicheDescription, demographicsChart } = calculateDemographics(song.responses);

        return {
            id: song.id, title: song.title, overallScore, completionRate,
            isAnalyzable: song.responses.length > 0,
            summary: {
                recommendation: `Potencial ${overallScore > 8.5 ? 'muy alto' : 'bueno'}.`,
                nicheDescription: nicheDescription,
                keywords: ["Indie Pop", overallScore > 8 ? "Hit Potencial" : "Album Track"]
            },
            demographics: demographicsChart,
            feedback: feedbackCharts,
            retentionData: { /* ... */ },
            affinity: { /* ... */ }
        };
    });

    // --- PUNTO 3 REINCORPORADO AQUÍ ---
    // Define tus métricas globales para el proyecto.
    // A futuro, podrías calcular estos valores dinámicamente a partir de todas las canciones.
    const metrics = { 
        playCount: 1053, 
        completionRate: 78, 
        replayRatio: 22, 
        overallScore: 8.5 
    };

    const responseData = {
        projectName: musicSet.name,
        artistName: musicSet.user.name,
        songs: transformedSongs,
        metrics: metrics // Tu objeto de métricas se añade aquí a la respuesta final.
    };
    const aiAnalysis = await getAiAnalysis(responseData, lang);

    // Agrega el análisis al objeto de respuesta
    responseData.aiAnalysis = aiAnalysis;

    return NextResponse.json(responseData);

  } catch (error) {
    console.error("API Error (Detail):", error);
    return NextResponse.json({ error: 'Fallo al obtener los datos del proyecto' }, { status: 500 });
  }
}
// Agrega esta función en route.js, antes de tu función GET
async function getAiAnalysis(reportData, lang) {
  const apiKey = process.env.GEMINI_API_KEY; // Tu clave de API de Gemini
  if (!apiKey) {
    console.error("GEMINI_API_KEY no está configurada.");
    return "El análisis de IA no está disponible en este momento.";
  }
  let idioma="Ingles";
  console.log(lang);
  if(lang=="es")
    idioma="Español";
  if(lang=="fr")
    idioma="Frances";
  // Construye un prompt detallado para la IA
  const prompt = `
    Actúa como un experto A&R y analista de datos musicales. A continuación, se presentan los datos de un focus group para un conjunto de canciones.
    
    Proyecto: "${reportData.projectName}" por ${reportData.artistName}.
    Canciones analizadas: ${reportData.songs.length}.

    Datos destacados de las canciones:
    ${reportData.songs.map(song => `
      - "${song.title}":
        - Puntaje General: ${song.overallScore}/10
        - Tasa de Finalización: ${song.completionRate}%
        - Perfil Demográfico Principal: ${song.summary.nicheDescription}
    `).join('')}

    Basado EXCLUSIVAMENTE en estos datos, genera un resumen ejecutivo que incluya:
    1.  Un párrafo inicial con la conclusión general del proyecto.
    2.  Una lista (bullet points) con las 2 canciones con mayor potencial, explicando brevemente por qué.
    3.  Una recomendación estratégica final sobre el siguiente paso a seguir (ej. qué canción lanzar como single, a qué audiencia dirigirse).
    Contesta en ${idioma}
  `;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error en la llamada a la API de Gemini:", response.status, errorBody);
      throw new Error(`La llamada a la API falló con estado: ${response.status}`);
    }

    const result = await response.json();
    return result.candidates[0]?.content?.parts[0]?.text || "No se pudo obtener una respuesta de la IA.";
  } catch (error) {
    console.error("Error al contactar la IA de Gemini:", error);
    return "Error al generar el análisis de IA. Revisa la consola del servidor.";
  }
}
