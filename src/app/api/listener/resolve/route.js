// app/api/listener/resolve/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toPlain = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
  );

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return Response.json({ error: "Falta token" }, { status: 400 });
    }

    const st = await prisma.shareToken.findUnique({
      where: { token },
      select: { musicSetId: true },
    });

    if (!st) {
      return Response.json({ error: "Invitación no encontrada" }, { status: 404 });
    }

    const ms = await prisma.musicSet.findUnique({
      where: { id: st.musicSetId },
      select: {
        id: true,
        name: true,
        startsAt: true,
        endsAt: true,
        songs: { select: { id: true, title: true, extension: true } },
      },
    });

    if (!ms) {
      return Response.json({ error: "Set no encontrado" }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(ms.startsAt)) {
      return Response.json({ error: "Invitación aún no activa" }, { status: 423 });
    }
    if (now > new Date(ms.endsAt)) {
      return Response.json({ error: "Invitación expirada" }, { status: 410 });
    }

    return Response.json({ set: toPlain(ms) }, { status: 200 });
  } catch (err) {
    console.error("Error en resolve:", err);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
