import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// === GET (todas las opciones o por questionId) ===
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    const options = await prisma.questionOption.findMany({
      where: questionId ? { questionId: parseInt(questionId) } : {},
      orderBy: { order: "asc" },
    });

    return NextResponse.json(options, { status: 200 });
  } catch (error) {
    console.error("Error al obtener opciones:", error);
    return NextResponse.json({ error: "Error al obtener opciones" }, { status: 500 });
  }
}

// === POST (crear opción) ===
export async function POST(req) {
  try {
    const body = await req.json();
    const { questionId, value, label, labelEn, labelFr, order } = body;

    if (!questionId || !value || !label) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const newOption = await prisma.questionOption.create({
      data: {
        questionId: parseInt(questionId),
        value,
        label,
        labelEn,
        labelFr,
        order: order ? parseInt(order) : null,
      },
    });

    return NextResponse.json(newOption, { status: 201 });
  } catch (error) {
    console.error("Error al crear opción:", error);
    return NextResponse.json({ error: "Error al crear opción" }, { status: 500 });
  }
}

// === PUT (actualizar opción) ===
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, value, label,labelEn,labelFr, order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de opción requerido" }, { status: 400 });
    }

    const updatedOption = await prisma.questionOption.update({
      where: { id: parseInt(id) },
      data: {
        value,
        label,
        labelEn,
        labelFr,
        order: order ? parseInt(order) : null,
      },
    });

    return NextResponse.json(updatedOption, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar opción:", error);
    return NextResponse.json({ error: "Error al actualizar opción" }, { status: 500 });
  }
}

// === DELETE (eliminar opción) ===
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de opción requerido" }, { status: 400 });
    }

    await prisma.questionOption.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Opción eliminada correctamente" }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar opción:", error);
    return NextResponse.json({ error: "Error al eliminar opción" }, { status: 500 });
  }
}
