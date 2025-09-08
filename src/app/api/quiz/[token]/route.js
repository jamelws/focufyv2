import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Asumiendo que usas next-auth, así se obtiene la sesión en el App Router
import { getServerSession } from 'next-auth/next'; 
import { authOptions } from "@/lib/auth"; // Ajusta la ruta a tu config de auth

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // Si no hay sesión, devuelve un error 401
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { token } = params;

  try {
    const share = await prisma.shareToken.findUnique({
      where: { token },
      select: {
        id: true,
        song: {
          select: {
            id: true,
            nombre: true,
            url: true, // URL del audio
            user: { select: { nombre: true } },
          },
        },
      },
    });

    if (!share) {
      return NextResponse.json({ error: 'Token no encontrado' }, { status: 404 });
    }

    return NextResponse.json(share);
  } catch (error) {
    console.error("Error al buscar el token:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}