//app/api/question
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth" // ajusta ruta si es necesario

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const questions = await prisma.question.findMany({
      where: { userId: session.user.id }, // 👈 filtra por usuario
      include: {
        options: {
          select: { id: true, value: true, label: true, labelEn:true, labelFr:true, order: true }
        }
      },
      orderBy: { id: 'asc' },
    });
    //console.log("preguntas",questions);
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    return NextResponse.json({ error: 'Error al obtener preguntas' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { key, title, titleEn, titleFr, type } = body;

    if (!key || !title || !type) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const newQuestion = await prisma.question.create({
      data: {
        key,
        title,
        titleEn,
        titleFr,
        type,
        userId: session.user.id, // 👈 se guarda el dueño
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error al crear pregunta:', error);
    return NextResponse.json({ error: 'Error al crear pregunta' }, { status: 500 });
  }
}
