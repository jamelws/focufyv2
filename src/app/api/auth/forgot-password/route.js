import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import sendMail from "@/lib/mail"; // tu utilidad existente

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email } = await req.json();

    console.log("📩 Backend recibió:", email);

    return new Response(
      JSON.stringify({ ok: true, msg: "Recibido en el backend", email }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("❌ Error en forgot-password:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
