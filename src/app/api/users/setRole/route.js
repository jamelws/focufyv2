// app/api/users/setRole/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { role } = await req.json(); // 👈 aquí extraemos "role" del body
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // ejemplo: actualizar rol en la BD
    // const userId = ... // obtén el id de la sesión
    // await prisma.user.update({ where: { id: userId }, data: { role } });

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error("Error en setRole:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
