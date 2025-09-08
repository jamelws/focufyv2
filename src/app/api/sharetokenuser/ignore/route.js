import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  const { id } = await req.json();
  await prisma.shareTokenUser.delete({ where: { id } });
  return Response.json({ message: "Solicitud ignorada" });
}
