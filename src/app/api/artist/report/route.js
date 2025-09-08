import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const artistId = session.user.id;

    const musicSets = await prisma.musicSet.findMany({
      where: {
        artistId: artistId,
        // Filtramos para incluir solo sets que han sido compartidos
        tokens: {
          some: {}, // 'some: {}' significa que debe tener al menos un registro relacionado
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(musicSets);
  } catch (error) {
    console.error("API Error (List):", error);
    return NextResponse.json(
      { error: "Failed to fetch music sets" },
      { status: 500 }
    );
  }
}
