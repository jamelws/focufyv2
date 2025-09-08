// src/app/api/pulls/[id]/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    const pull = await prisma.pull.findUnique({
      where: { id: parseInt(id) },
      include: {
        PullUsers: {      // 👈 nombre exacto del schema
          include: {
            user: true,
          },
        },
      },
    });

    if (!pull) {
      return NextResponse.json(
        { message: "Pull no encontrado" },
        { status: 404 }
      );
    }

    // Convertir usuarios en un string de correos separados por coma
    const correos = pull.PullUsers
      .map((pu) => pu.user?.email || pu.correo) // si hay correo suelto
      .filter(Boolean)
      .join(",");

    return NextResponse.json({
      ...pull,
      correos,
    });
  } catch (err) {
    console.error("Error GET /api/pulls/[id]:", err);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}



// ✅ Actualizar un Pull
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();

    const updated = await prisma.pull.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error PUT /api/pulls/[id]:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}

// ✅ Eliminar un Pull
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await prisma.pull.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Pull eliminado" }, { status: 200 });
  } catch (error) {
    console.error("Error DELETE /api/pulls/[id]:", error);
    return NextResponse.json({ message: "Error en el servidor" }, { status: 500 });
  }
}
