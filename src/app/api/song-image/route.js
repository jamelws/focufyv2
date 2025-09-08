import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export const config = {
  api: {
    responseLimit: false,
  },
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID" }, { status: 400 });
    }

    const song = await prisma.song.findUnique({
      where: { id },
      select: { image: true },
    });

    if (!song?.image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
    }

    // 🔹 Devolver la imagen como buffer
    return new Response(Buffer.from(song.image), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err) {
    console.error("Error al obtener la imagen:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
