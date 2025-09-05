
import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1) Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // 2) Validar contraseña
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // 3) Retornar usuario (sin password)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "Login correcto",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json(
      { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}
