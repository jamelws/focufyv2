// pages/api/song-lyrics.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Falta el ID de la canción' });

  const song = await prisma.song.findUnique({
    where: { id: id }, // aquí id queda como string
    select: { lyrics: true },
  });

  if (!song) return res.status(404).json({ error: 'Canción no encontrada' });

  res.status(200).json({ lyrics: song.lyrics || '' });
}
