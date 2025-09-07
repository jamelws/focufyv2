import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAILERSEND_HOST,
    port: parseInt(process.env.MAILERSEND_PORT, 10),
    secure: process.env.MAILERSEND_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.MAILERSEND_USER,
        pass: process.env.MAILERSEND_PASS,
    },
    // Si usas un certificado autofirmado en desarrollo
    tls: {
        rejectUnauthorized: process.env.MAIL_ALLOW_SELF_SIGNED !== '1'
    }
});

export async function sendPasswordResetEmail(email, token) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password/${token}`;

  await transporter.sendMail({
    from: `Focufy <${process.env.MAILERSEND_FROM}>`,
    to: email,
    subject: 'Resetea tu contraseña de Focufy',
    html: `
        <p>Hola,</p>
        <p>Recibimos una solicitud para resetear tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetLink}">Resetear mi contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>El enlace expirará en 1 hora.</p>
    `,
  });
}

export async function sendPasswordResetConfirmationEmail(email) {
    await transporter.sendMail({
      from: `Focufy <${process.env.MAILERSEND_FROM}>`,
      to: email,
      subject: 'Tu contraseña de Focufy ha sido actualizada',
      html: `
          <p>Hola,</p>
          <p>Este es un correo de confirmación para informarte que la contraseña de tu cuenta ha sido actualizada exitosamente.</p>
          <p>Si no realizaste este cambio, por favor contacta a nuestro soporte inmediatamente.</p>
      `,
    });
  }
export default sendPasswordResetEmail;