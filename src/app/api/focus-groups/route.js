// /app/api/focus-groups/route.js

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// CORRECCIÓN 1: Importa 'prisma' desde tu archivo centralizado.
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ❌ Se elimina la siguiente línea. NUNCA crees un new PrismaClient() aquí.
// const prisma = new PrismaClient();

// ✅ GET: Lista todos los focus groups del usuario autenticado.
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // CORRECCIÓN 3: La cláusula 'where' debe estar al nivel principal, no dentro de 'include'.
    const focusGroups = await prisma.pull.findMany({
      where: { artistId: session.user.id }, // Se movió 'where' aquí.
      include: {
        // El modelo no tiene relación directa con 'song', se elimina para evitar errores.
        // song: { select: { title: true } },
        _count: {
          select: { PullUsers: true, ShareTokens: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(focusGroups);
  } catch (error) {
    console.error("Error al obtener focus groups:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// ✅ POST: Crear un nuevo focus group.
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { nombre, userIds, emails } = body;

    if (!nombre) {
      return NextResponse.json(
        { message: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // Usamos el modelo 'pull' consistentemente.
    const focusGroup = await prisma.pull.create({
      data: {
        nombre,
        artistId: session.user.id, // Asegúrate que el campo en tu schema sea 'artistId'.
      },
    });

    const pullUsersData = [];

    // Añadir usuarios por ID
    if (userIds && userIds.length > 0) {
      userIds.forEach((uid) => {
        pullUsersData.push({
          pullId: focusGroup.id,
          userId: uid,
        });
      });
    }
    
    // Añadir usuarios por email
    if (emails) {
      emails.split(",").forEach((correo) => {
        const cleanEmail = correo.trim();
        if (cleanEmail) {
          pullUsersData.push({
            pullId: focusGroup.id,
            correo: cleanEmail,
          });
        }
      });
    }
    
    if (pullUsersData.length > 0) {
      await prisma.pullUsers.createMany({
        data: pullUsersData,
        skipDuplicates: true, // Evita errores si un usuario ya fue invitado.
      });
    }

    return NextResponse.json(focusGroup, { status: 201 });
  } catch (error) {
    console.error("Error al crear focus group:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


// ✅ PUT: Actualizar un focus group.
export async function PUT(req) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
      }
  
      const body = await req.json();
      // 'id' y 'nombre' vienen en el body para la actualización.
      const { id, nombre } = body;
  
      if (!id) {
        return NextResponse.json({ message: "El ID del grupo es requerido" }, { status: 400 });
      }
  
      // CORRECCIÓN 4: Se usa 'pull.update' para ser consistente con GET y POST.
      const updatedFocusGroup = await prisma.pull.update({
        where: { 
          id: Number(id),
          // Se añade verificación para asegurar que el usuario es el dueño del grupo.
          artistId: session.user.id, 
        },
        data: {
          nombre,
        },
      });
  
      return NextResponse.json(updatedFocusGroup);
    } catch (error) {
      console.error("Error al actualizar focus group:", error);
      // Prisma tira un error si no encuentra el registro, lo manejamos.
      if (error.code === 'P2025') {
        return NextResponse.json({ message: "Grupo no encontrado o no tienes permiso para editarlo" }, { status: 404 });
      }
      return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
  }
  
  // ✅ DELETE: Eliminar un focus group.
  export async function DELETE(req) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ message: "No autorizado" }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ message: "El ID es requerido en la URL" }, { status: 400 });
      }
      
      // CORRECCIÓN 5: Se usa 'pull.delete' para ser consistente.
      await prisma.pull.delete({
        where: { 
          id: Number(id),
          // Se añade verificación de propiedad para seguridad.
          artistId: session.user.id,
        },
      });
  
      return NextResponse.json({ message: "Focus Group eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar focus group:", error);
      if (error.code === 'P2025') {
        return NextResponse.json({ message: "Grupo no encontrado o no tienes permiso para eliminarlo" }, { status: 404 });
      }
      return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
  }