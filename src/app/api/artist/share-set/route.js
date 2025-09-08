// app/api/share/route.js
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { musicSetId, startAt, endAt, target, focusGroupId, userIds, emails } = body;
    // 🔹 Obtener sesión
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }
    
    const me = await prisma.user.findFirst({
      where: { email: session.user.email },
      select: { id: true }
    });
    if (!me) {
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), { status: 400 });
    }

    
    // 🔹 Actualizar fechas de validez en MusicSet
    await prisma.musicSet.update({
      where: { id: musicSetId },
      data: {
        startsAt: new Date(`${startAt}T00:00:00`),
        endsAt: new Date(`${endAt}T23:59:59`)
      }
    });

    const links = [];

    // 🔹 Compartir a un FocusGroup
    if (target === 'focusgroup' && focusGroupId) {
      const members = await prisma.pullUsers.findMany({
        where: { pullId: parseInt(focusGroupId) },
        select: { userId: true, correo: true }
      });

      for (const m of members) {
        const token = crypto.randomUUID();
        const newToken = await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            pullId: focusGroupId,
            expiresAt: new Date(`${endAt}T23:59:59`),
            active: true
          }
        });
        await prisma.shareTokenUser.create({
          data:{
            shareTokenId: newToken.id,
            userId: me.id,
            aprovado: true
          }
        });
        links.push({ recipient: m.correo || m.userId, url: `/dashboard/listener/evaluate/${token}` });

      }
    }

    // 🔹 Compartir a usuarios registrados
    if (target === 'users' && Array.isArray(userIds)) {
      for (const uid of userIds) {
        const token = crypto.randomUUID();
        const newToken = await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            expiresAt: new Date(`${endAt}T23:59:59`),
            active: true
          }
        });
        await prisma.shareTokenUser.create({
          data:{
            shareTokenId: newToken.id,
            userId: me.id,
            aprovado: true
          }
        });
        links.push({ recipient: uid, url: `/dashboard/listener/evaluate/${token}` });
      }
    }

    // 🔹 Compartir por correos
    if (target === 'emails' && emails) {
      const list = emails.split(',').map(e => e.trim()).filter(Boolean);
      for (const email of list) {
        const token = crypto.randomUUID();
        await prisma.shareToken.create({
          data: {
            token,
            ownerId: me.id,
            musicSetId,
            expiresAt: new Date(`${endAt}T23:59:59`),
            active: true
          }
        });
        links.push({ recipient: email, url: `/dashboard/listener/evaluate/${token}` });
      }
    }

    // 🔹 Compartir por enlace público
    if (target === 'enlace') {
      const token = crypto.randomUUID();
      await prisma.shareToken.create({
        data: {
          token,
          ownerId: me.id,
          musicSetId,
          expiresAt: new Date(`${endAt}T23:59:59`),
          active: true,
          // opcional: isPublic: true
        }
      });
      links.push({ recipient: 'public', url: `/dashboard/listener/evaluate/${token}` });
    }

    return new Response(JSON.stringify({ message: 'Set compartido con éxito', links }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error al compartir el set' }), { status: 500 });
  }
}
