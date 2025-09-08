import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// ✅ GET
export async function GET(req, { params }) {  
  const { id } = await params;
  try {
    console.log(id);
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      id: user.id, // 👈 asegúrate de incluir el id
      image: user.image ? Buffer.from(user.image).toString("base64") : null,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}

// ✅ PUT
export async function PUT(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        website: body.website,
        idPais: body.idPais,
        idCiudad: body.idCiudad,
        phone: body.phone,
        contactEmail: body.contactEmail,
        recordLabel: body.recordLabel,
        platform: body.platform,
        platformLink: body.platformLink,
        availableForCollab: body.availableForCollab,
        notificationsEmail: body.notificationsEmail,
        notificationsWhatsapp: body.notificationsWhatsapp,
        color: body.color,
        banner: body.banner,
        // 👇 imagen binaria si viene en base64
        image: body.image ? Buffer.from(body.image, "base64") : undefined,
      },
    });

    return NextResponse.json({
      ...updated,
      id: updated.id,
      image: updated.image ? Buffer.from(updated.image).toString("base64") : null,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}
