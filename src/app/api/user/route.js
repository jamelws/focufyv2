//src/app/api/user/route.js
import { NextResponse } from "next/server";
import { hash } from "bcrypt";           // Si usas runtime Edge, cambia a: import { hash } from "bcryptjs"
import nodemailer from "nodemailer";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Opcional (si quieres forzar Node runtime)
// export const runtime = "nodejs";

function getTransport() {
  const port = Number(process.env.MAILERSEND_PORT || 587);
  const secure = port === 465; // SSL solo si es 465
  const allowSelfSigned = process.env.MAIL_ALLOW_SELF_SIGNED === "1";

  return nodemailer.createTransport({
    host: process.env.MAILERSEND_HOST,
    port,
    secure,
    auth: {
      user: process.env.MAILERSEND_USER,
      pass: process.env.MAILERSEND_PASS,
    },
    tls: allowSelfSigned
      ? {
          rejectUnauthorized: false, // ⚠️ aceptar autofirmados
        }
      : undefined,
  });
}


export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, edad, idPais, idCiudad, availableForCollab } = body;

    // 1) Validar email duplicado
    const existUserbyEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existUserbyEmail) {
      return NextResponse.json(
        { user: null, message: "Correo registrado" },
        { status: 409 }
      );
    }

    // 2) Crear usuario
    const hashedPassword = await hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        emailVerified: null,
        platform: "local",
        contactEmail: email,
        edad,
        idCiudad,
        availableForCollab,
        idPais,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // 2b) Semillas de preguntas base
    const baseQuestions = [
      {
        key: "fav_element",
        title: "¿Qué elemento de la canción te gustó más?",
        titleEn: "Which element of the song did you like the most?",
        titleFr: "Quel élément de la chanson as-tu le plus aimé ?",
        type: "MULTIPLE_CHOICE",
        options: [
          { value: "melodia", label: "Melodía", labelEn: "Melody", labelFr: "Mélodie", order: 1 },
          { value: "letra", label: "Letra", labelEn: "Lyrics", labelFr: "Paroles", order: 2 },
          { value: "voz", label: "Voz", labelEn: "Voice", labelFr: "Voix", order: 3 },
          { value: "ritmo", label: "Ritmo", labelEn: "Rhythm", labelFr: "Rythme", order: 4 },
          { value: "produccion", label: "Producción / mezcla", labelEn: "Production / Mix", labelFr: "Production / Mixage", order: 5 },
        ],
      },
      {
        key: "mix_quality",
        title: "¿Cómo calificarías la calidad de la mezcla y el sonido?",
        titleEn: "How would you rate the quality of the mix and sound?",
        titleFr: "Comment évaluerais-tu la qualité du mixage et du son ?",
        type: "SCALE_1_5",
      },
      {
        key: "originalidad",
        title: "¿Qué tan original percibes esta canción en comparación con otras del mismo género?",
        titleEn: "How original do you find this song compared to others in the same genre?",
        titleFr: "À quel point trouves-tu cette chanson originale par rapport aux autres du même genre ?",
        type: "SCALE_1_5",
      },
      {
        key: "playlist",
        title: "¿Agregarías esta canción a alguna de tus playlists?",
        titleEn: "Would you add this song to any of your playlists?",
        titleFr: "Ajouterais-tu cette chanson à l'une de tes playlists ?",
        type: "MULTIPLE_CHOICE",
        options: [
          { value: "gym", label: "Para entrenar", labelEn: "For working out", labelFr: "Pour m'entraîner", order: 1 },
          { value: "relax", label: "Para relajarme", labelEn: "For relaxing", labelFr: "Pour me détendre", order: 2 },
          { value: "work", label: "Para trabajar / estudiar", labelEn: "For working / studying", labelFr: "Pour travailler / étudier", order: 3 },
          { value: "party", label: "Para fiesta", labelEn: "For partying", labelFr: "Pour faire la fête", order: 4 },
          { value: "no", label: "No la incluiría", labelEn: "I would not include it", labelFr: "Je ne l'inclurais pas", order: 5 },
        ],
      },
      {
        key: "calificacion",
        title: "¿Qué calificación le das a la canción en general?",
        titleEn: "What rating would you give the song overall?",
        titleFr: "Quelle note donnerais-tu à la chanson en général ?",
        type: "SCALE_1_5",
      },
      {
        key: "comentario",
        title: "Comentario libre",
        titleEn: "Free comment",
        titleFr: "Commentaire libre",
        type: "TEXT",
      },
    ];

    for (const [i, q] of baseQuestions.entries()) {
      await prisma.question.create({
        data: {
          key: q.key,
          title: q.title,
          titleEn: q.titleEn,
          titleFr: q.titleFr,
          type: q.type,
          order: i + 1,
          userId: newUser.id,
          options: q.options
            ? {
                createMany: {
                  data: q.options.map((opt) => ({
                    value: opt.value,
                    label: opt.label,
                    labelEn: opt.labelEn,
                    labelFr: opt.labelFr,
                    order: opt.order,
                  })),
                },
              }
            : undefined,
        },
      });
    }

    // 3) Token de verificación + correo
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

    await prisma.verificationToken.create({
      data: { token, userId: newUser.id, expiresAt },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${encodeURIComponent(
      token
    )}`;

    const transporter = getTransport();
    await transporter.sendMail({
      from: process.env.MAILERSEND_FROM || process.env.MAILERSEND_USER,
      to: newUser.email,
      subject: "Confirma tu correo | Focufy",
      html: `
      <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif">
        <h2>¡Bienvenido a Focufy!</h2>
        <p>Para activar tu cuenta, confirma tu correo haciendo clic en el siguiente botón:</p>
        <p><a href="${verifyUrl}" style="background:#6d28d9;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Confirmar correo</a></p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color:#64748b;font-size:12px">Este enlace expira en 24 horas.</p>
      </div>`,
    });

    return NextResponse.json(
      { user: newUser, message: "Usuario creado correctamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api register error:", err);
    return NextResponse.json(
      { user: null, message: "Error en el servidor" },
      { status: 500 }
    );
  }
}