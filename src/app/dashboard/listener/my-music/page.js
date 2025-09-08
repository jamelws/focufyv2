// app/dashboard/listener/my-music/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import MyMusicClient from "./MyMusicClient";

const prisma = new PrismaClient();

const toPlain = (obj) =>
  JSON.parse(JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v)));

export default async function MyMusicPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <div>Debes iniciar sesión.</div>;
  }

  const me = await prisma.user.findFirst({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  const pulls = await prisma.pullUsers.findMany({
    where: { OR: [{ userId: me.id }, { correo: me.email }] },
    select: { pullId: true },
  });
  const pullIds = pulls.map((p) => p.pullId);

  const pullsWithSets = await prisma.pull.findMany({
    where: { id: { in: pullIds } },
    select: {
      ShareTokens: {
        where: {
          active: true,
          expiresAt: { gte: new Date() },
          musicSetId: { not: null },
        },
        select: {
          token: true,
          owner: { select: { id: true, name: true, email: true, image: true } },
          musicSet: {
            select: {
              id: true,
              name: true,
              startsAt: true,
              endsAt: true,
              songs: {
                select: {
                  id: true,
                  title: true,
                  extension: true,
                  lyrics: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return <MyMusicClient pullsWithSets={toPlain(pullsWithSets)} />;
}
