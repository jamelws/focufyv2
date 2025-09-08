// app/api/song-audio/route.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/lib/auth"  // ajusta según tu ruta real

const prisma = new PrismaClient();

export const config = {
  api: {
    responseLimit: false, // permite enviar binarios grandes
  },
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Falta el ID" }, { status: 400 });
    }

    const song = await prisma.song.findUnique({
      where: { id },
      select: { file: true, extension: true },
    });

    if (!song?.file) {
      return new Response(null, { status: 404 });
    }

    const safeExt = ["mp3", "wav", "ogg"];
    const ext = safeExt.includes(song.extension) ? song.extension : "mpeg";

    return new Response(song.file, {
      status: 200,
      headers: {
        "Content-Type": `audio/${ext}`,
        "Cache-Control": "no-store", // evita cacheo de audios dinámicos
      },
    });
  } catch (err) {
    console.error("Error en song-audio:", err);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  console.log(req);
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
