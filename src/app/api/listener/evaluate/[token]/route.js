// app/api/listener/evaluate/[token]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { error } from "console";

const prisma = new PrismaClient();

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    const { token } = await context.params;

    // Traemos el token con info necesaria
    const tokenData = await prisma.shareToken.findUnique({
      where: { token },
      include: {
        musicSet: {
          include: {
            songs: {
              select: {
                id: true,
                title: true,
                lyrics: true,
                durationSec: true,
                extension: true,
                songQuestions: {
                  include: {
                    question: { include: { options: true } }
                  }
                }
              }
            },
            user: true
          }
        },
        responses: true,
        shareTokenUsers: true // 👈 para validar invitaciones/aprobaciones
      }
    });

    if (!tokenData) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }

    const now = new Date();
    if (now < tokenData.musicSet.startsAt || now > tokenData.musicSet.endsAt) {
      return NextResponse.json({data: tokenData ,error: "Token fuera de vigencia" }, { status: 403 });
    }

    // 🚨 Aquí debes obtener el ID del usuario logueado
    const userId = session?.user?.id; // ejemplo, depende de tu auth
    if (!userId) {
      return NextResponse.json({data: tokenData ,error: "Usuario no autenticado" }, { status: 401 });
    }

    // Verificamos si ya existe en ShareTokenUser
    let relation = await prisma.shareTokenUser.findFirst({
      where: { shareTokenId: tokenData.id, userId }
    });

    if (!relation) {
      // No está invitado
      return NextResponse.json({data: tokenData ,error: "Solicitar acceso al artista", needRequest: true });
    }

    if (!relation.aprovado) {
      return NextResponse.json({data: tokenData ,error: "Aprobación pendiente", pending: true });
    }

    // Si ya tiene responses → no devolver preguntas
    if (tokenData.responses.some(r => r.userId === userId)) {
      return NextResponse.json({
        ...tokenData,
        musicSet: {
          ...tokenData.musicSet,
          songs: tokenData.musicSet.songs.map(s => ({
            id: s.id,
            title: s.title,
            lyrics: s.lyrics,
            durationSec: s.durationSec,
            extension: s.extension
          }))
        }
      });
    }

    return NextResponse.json({data:tokenData,error:null},{status: 200});
  } catch (error) {
    console.error("Error en GET /api/listener/evaluate/[token]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
