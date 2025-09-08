import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req) {
  const { id } = await req.json();
  await prisma.shareTokenUser.update({
    where: { id },
    data: { aprovado: true },
  });
  return Response.json({ message: "Solicitud aprobada" });
}