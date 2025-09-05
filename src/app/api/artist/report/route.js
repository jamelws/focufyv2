import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    const musicSets = await prisma.musicSet.findMany({
      where: {
        tokens: {
          some: {}, // al menos un token
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
