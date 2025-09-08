// app/api/song-play/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth" // ajusta según tu ruta real

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { songId, completed, stoppedAtSec } = await req.json();
    const userId = session.user.id;

    // Buscar registro previo
    const existing = await prisma.songPlay.findUnique({
      where: { userId_songId: { userId, songId } },
    });

    if (existing) {
      await prisma.songPlay.update({
        where: { userId_songId: { userId, songId } },
        data: {
          replayCount: completed
            ? existing.replayCount + 1
            : existing.replayCount,
          stoppedAtSec: completed ? null : stoppedAtSec,
          completed,
        },
      });
    } else {
      await prisma.songPlay.create({
        data: {
          songId,
          userId,
          replayCount: completed ? 1 : 0,
          stoppedAtSec: completed ? null : stoppedAtSec,
          completed,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error en /api/song-play:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
