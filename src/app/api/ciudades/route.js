
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const paisId = Number(searchParams.get("pais") || 0);
    if (!paisId) return NextResponse.json([], { status: 200 });

    // Ajusta a tu modelo/campos reales:
    const rows = await prisma.ciudad.findMany({
      where: { idPais: paisId },
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error al listar ciudades" }, { status: 500 });
  }
}
