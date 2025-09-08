// app/api/artist/my-songs/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


const toPlain = (obj) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
   
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 🔑 Usuario autenticado
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!me) {
      return NextResponse.json({ musicSets: [], users: [], focusGroups: [] }, { status: 200 });
    }

    // 🔹 MusicSets
    const musicSetsRaw = await prisma.musicSet.findMany({
      where: { userId: me.id },
      include: {
        songs: {
          select: { id: true, title: true, extension: true, lyrics: true },
        },
        tokens: {
          include: {
            shareTokenUsers: {
              where: { aprovado: false },
              select: {
                id: true,
                userId: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const musicSets = musicSetsRaw.map((set) => ({
      ...set,
      pendingRequests: set.tokens.reduce(
        (acc, token) => acc + (token.shareTokenUsers?.length || 0),
        0
      ),
      songs: set.songs.map((s) => ({
        id: s.id,
        title: s.title,
        extension: s.extension,
        hasLyrics: !!(s.lyrics && s.lyrics.trim() !== ""),
      })),
    }));

    // 🔹 Usuarios
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });

    // 🔹 FocusGroups
    let focusGroups = [];
    try {
      focusGroups = await prisma.pull.findMany({
        select: { id: true, nombre: true },
        orderBy: { id: "desc" },
      });
    } catch (_) {}

    return NextResponse.json(toPlain({ musicSets, users, focusGroups }));
  } catch (e) {
    console.error("❌ Error en GET /api/artist/my-songs:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
