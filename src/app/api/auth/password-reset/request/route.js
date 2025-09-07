import { NextResponse } from 'next/server';

import { sendPasswordResetEmail } from '@/lib/mail';
import crypto from 'crypto';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(req) {
  try {
    const { email } = await req.json();
    
    const user = await prisma.user.findUnique({ where: { email } });

    // Para evitar la enumeración de usuarios, siempre devolvemos una respuesta exitosa,
    // pero solo enviamos el correo si el usuario existe.
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const oneHour = 3600000; // 1 hora en milisegundos
      const expiresAt = new Date(Date.now() + oneHour);

      // Usamos el modelo VerificationToken que ya existe en tu schema.prisma
      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      await sendPasswordResetEmail(email, token);
    }
    
    return NextResponse.json({ message: 'Si tu correo está registrado, recibirás un enlace para resetear tu contraseña.' }, { status: 200 });

  } catch (error) {
    console.error("Password Reset Request Error:", error);
    return NextResponse.json({ message: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}
