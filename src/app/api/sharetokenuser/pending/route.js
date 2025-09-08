import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.shareTokenUser.count({
      where: { aprovado: false },
    });

    return new Response(JSON.stringify({ count }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error al obtener pendientes" }), { status: 500 });
  }
}
