import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  try {
    // Ajusta a tu modelo/campos reales:
    const rows = await prisma.pais.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(rows);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error al listar países" }, { status: 500 });
  }
}
