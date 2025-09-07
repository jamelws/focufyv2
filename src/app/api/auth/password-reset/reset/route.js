import { NextResponse } from 'next/server';

import { sendPasswordResetConfirmationEmail } from '@/lib/mail';
import bcrypt from 'bcryptjs';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
        return NextResponse.json({ message: 'Datos incompletos.' }, { status: 400 });
    }
    
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return NextResponse.json({ message: 'El enlace de reseteo es inválido o ha expirado.' }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { password: hashedPassword },
    });

    // Una vez usado, eliminamos el token para que no se pueda volver a usar
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    
    // Enviamos correo de confirmación
    await sendPasswordResetConfirmationEmail(updatedUser.email);

    return NextResponse.json({ message: 'Contraseña actualizada con éxito.' }, { status: 200 });

  } catch (error) {
    console.error("Password Reset Error:", error);
    return NextResponse.json({ message: 'Ocurrió un error en el servidor.' }, { status: 500 });
  }
}
