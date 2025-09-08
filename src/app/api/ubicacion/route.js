import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = await prisma.pais.findMany({
      include: { ciudades: true },
      orderBy: { nombre: "asc" }
    });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error cargando países/ciudades", err);
    return NextResponse.json({ error: "Error cargando ubicaciones" }, { status: 500 });
  }
}
