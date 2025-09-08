import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    // 1. Obtener focus group y canción
    const focusGroup = await prisma.focusGroup.findUnique({
      where: { id: String(id) },
      include: {
        song: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!focusGroup) return res.status(404).json({ error: "Focus group no encontrado" });

    const responses = focusGroup.responses;

    // 2. Stats de scores
    const scores = responses.map(r => r.score).filter(s => typeof s === "number");
    const totalResponses = scores.length;
    const average = totalResponses > 0 ? scores.reduce((a, b) => a + b, 0) / totalResponses : 0;
    const min = totalResponses > 0 ? Math.min(...scores) : null;
    const max = totalResponses > 0 ? Math.max(...scores) : null;
    const metrics= { playCount: 1053, completionRate: 78, replayRatio: 22, overallScore: 8.5 };
    const hasMajorDrop = Math.random() > 0.6;
    const retentionDrop = hasMajorDrop ? { at: '1:45', drop: Math.floor(Math.random() * 20 + 25) } : null;
    // 3. Comentarios
    const comments = responses
      .filter(r => r.comments && r.comments.trim() !== "")
      .map(r => ({
        user: r.user,
        comment: r.comments,
      }));

    // 4. Conteo de moods
    const moodsCount = {};
    responses.forEach(r => {
      (r.moods || []).forEach(mood => {
        moodsCount[mood] = (moodsCount[mood] || 0) + 1;
      });
    });

    // 5. Datos de retención (puedes consolidar o devolver array crudo)
    const retentionData = responses.map(r => r.retentionData);

    return res.status(200).json({
      song: focusGroup.song,
      artist: focusGroup.song.artist,
      scoreStats: { average, min, max, totalResponses },
      comments,
      moodsCount,
      retentionData,
      metrics: metrics,
      retentionDrop:retentionDrop
    });
  } catch (error) {
    console.error("Error en GET /api/reports/[id]", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

