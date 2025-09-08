// pages/api/user-image.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).send('Missing id');

  const user = await prisma.user.findUnique({
    where: { id },
    select: { image: true }
  });

  if (!user || !user.image) {
    return res.status(404).send('No image');
  }

  res.setHeader('Content-Type', 'image/jpeg');
  res.send(Buffer.from(user.image));
}
