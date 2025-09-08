// app/api/sharetokenuser/request/route.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { tokenId, userId } = body;

    // 1. Buscar el ShareToken usando el campo "token"
    const shareToken = await prisma.shareToken.findUnique({
      where: { token: tokenId },
    });

    if (!shareToken) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400 }
      );
    }

    // 2. Insertar en ShareTokenUser usando el "id" real
    const result = await prisma.shareTokenUser.create({
      data: {
        shareTokenId: shareToken.id, // ⚡ Aquí usamos el PK real
        userId,                      // asegúrate que el usuario exista en User
        aprovado: false,
      },
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error creando registro" }),
      { status: 500 }
    );
  }
}
