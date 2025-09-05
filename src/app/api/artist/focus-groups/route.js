// app/api/pulls/route.js (o donde tengas esta ruta)
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Helper: obtiene el id del usuario autenticado o 401
async function requireUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }
  return String(session.user.id);
}

// GET: listado o detalle (SOLO pulls del dueño)
export async function GET(request) {
  try {
    const meId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Detalle: asegúrate de que el pull es mío
      const detail = await prisma.pull.findFirst({
        where: { id: Number(id), userId: meId }, // <- dueñx
        select: {
          id: true,
          nombre: true,
          createdAt: true,
          PullUsers: {
            select: {
              id: true,
              correo: true,
              user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { id: "asc" },
          },
          _count: { select: { ShareTokens: true, PullUsers: true } }, // opcional para UI
        },
      });
      if (!detail) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      return NextResponse.json(detail);
    }

    // Listado: SOLO los míos
    const pulls = await prisma.pull.findMany({
      where: { userId: meId }, // <- dueñx
      orderBy: { id: "desc" },
      select: {
        id: true,
        nombre: true,
        createdAt: true,
        PullUsers: {
          select: {
            id: true,
            correo: true,
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { id: "asc" },
        },
        _count: {
          select: { ShareTokens: true, PullUsers: true },
        },
      },
    });

    return NextResponse.json(pulls);
  } catch (e) {
    if (e instanceof Response) return e; // 401 de requireUserId
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST: crear (SIEMPRE a mi nombre)
export async function POST(request) {
  try {
    const meId = await requireUserId();
    const body = await request.json();
    const { nombre, userIds, emails } = body;

    if (!nombre?.trim()) {
      return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });
    }

    // crea el pull con el dueño = yo
    const pull = await prisma.pull.create({
      data: { nombre: nombre.trim(), userId: meId }, // <- dueñx
      select: { id: true },
    });

    // asigna usuarios por id
    if (Array.isArray(userIds) && userIds.length > 0) {
      await prisma.pullUsers.createMany({
        data: userIds
          .map((uid) => (typeof uid === "string" ? uid.trim() : String(uid || "")))
          .filter(Boolean)
          .map((uid) => ({ pullId: pull.id, userId: uid })),
        skipDuplicates: true,
      });
    }

    // asigna correos sueltos
    const list =
      typeof emails === "string"
        ? emails.split(",").map((e) => e.trim()).filter(Boolean)
        : Array.isArray(emails)
        ? emails
        : [];
    if (list.length > 0) {
      await prisma.pullUsers.createMany({
        data: list.map((correo) => ({ pullId: pull.id, correo })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({ message: "FocusGroup creado", id: pull.id });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return NextResponse.json({ error: "Error al crear el FocusGroup" }, { status: 500 });
  }
}

// PUT: actualizar (SOLO si soy el dueño)
export async function PUT(request) {
  try {
    const meId = await requireUserId();
    const body = await request.json();
    const { id, nombre, userIds, emails } = body;

    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
    const name = (nombre || "").trim();
    if (!name) return NextResponse.json({ error: "Falta el nombre" }, { status: 400 });

    // Verifica propiedad
    const owned = await prisma.pull.findFirst({
      where: { id: Number(id), userId: meId },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // Normaliza entradas
    const userRows = (Array.isArray(userIds) ? userIds : [])
      .map((u) => (typeof u === "string" ? u.trim() : String(u || "")))
      .filter(Boolean)
      .map((uid) => ({ pullId: Number(id), userId: uid }));

    const emailRows = (typeof emails === "string" ? emails.split(",") : Array.isArray(emails) ? emails : [])
      .map((e) => (typeof e === "string" ? e.trim() : ""))
      .filter(Boolean)
      .map((correo) => ({ pullId: Number(id), correo }));

    await prisma.$transaction([
      prisma.pull.update({ where: { id: Number(id) }, data: { nombre: name } }),
      prisma.pullUsers.deleteMany({ where: { pullId: Number(id) } }),
      ...(userRows.length ? [prisma.pullUsers.createMany({ data: userRows, skipDuplicates: true })] : []),
      ...(emailRows.length ? [prisma.pullUsers.createMany({ data: emailRows, skipDuplicates: true })] : []),
    ]);

    return NextResponse.json({ message: "Actualizado" });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return NextResponse.json({ error: e?.message || "Error interno" }, { status: 500 });
  }
}

// DELETE: eliminar (SOLO si soy el dueño)
export async function DELETE(request) {
  try {
    const meId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

    // Verifica propiedad
    const owned = await prisma.pull.findFirst({
      where: { id: Number(id), userId: meId },
      select: { id: true },
    });
    if (!owned) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    // Borra dependencias del pull (no nos interesa si tienen ShareTokens para permisos)
    await prisma.$transaction([
      prisma.pullUsers.deleteMany({ where: { pullId: Number(id) } }),
      prisma.shareToken.deleteMany({ where: { pullId: Number(id) } }),
      prisma.pull.delete({ where: { id: Number(id) } }),
    ]);

    return NextResponse.json({ message: "Eliminado" });
  } catch (e) {
    if (e instanceof Response) return e;
    console.error(e);
    return NextResponse.json({ error: e?.message || "Error interno" }, { status: 500 });
  }
}
