// En el archivo /api/listener/save-responses/route.js

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // 1. Recibe las respuestas Y el token del cuerpo de la petición
    const { responses, token } = await req.json();
    console.log(responses);
    console.log(token);
    if (!token) {
      return NextResponse.json({ error: "Token de acceso no proporcionado." }, { status: 400 });
    }

    // 2. Usa el token para buscar el registro ShareToken y obtener su ID de base de datos
    const shareTokenRecord = await prisma.shareToken.findUnique({
      where: { token: token },
    });

    // Si el token no es válido o no se encuentra, detiene la operación
    if (!shareTokenRecord) {
      return NextResponse.json({ error: "Token inválido o no encontrado." }, { status: 404 });
    }
    const shareTokenDbId = shareTokenRecord.id; // ✅ ¡Este es el ID correcto!

    // ... (El resto de la validación de 'responses' se mantiene igual)
    const validResponses = responses.filter(res => res.songId && res.questionId && res.value !== undefined);
    if (validResponses.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron respuestas válidas." }, { status: 400 });
    }

    const transactions = validResponses.map(res => 
      prisma.response.upsert({
        where: {
          songId_questionId_userId_shareTokenId: {
            songId: res.songId,
            questionId: res.questionId,
            userId: userId,
            // 3. Usa el ID de la base de datos, no el token público
            shareTokenId: shareTokenDbId, 
          }
        },
        update: { value: res.value },
        create: {
          songId: res.songId,
          questionId: res.questionId,
          value: res.value,
          userId: userId,
          // 3. Usa el ID de la base de datos también aquí
          shareTokenId: shareTokenDbId,
        },
      })
    );

    await prisma.$transaction(transactions);

    return NextResponse.json({ message: `Se procesaron ${validResponses.length} respuestas.` }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en API /api/listener/save-responses:", error);
    // Devuelve un error más específico si es posible
    if (error.code === 'P2003') {
        return NextResponse.json({ error: "Error de clave foránea. Uno de los IDs proporcionados no es válido." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}