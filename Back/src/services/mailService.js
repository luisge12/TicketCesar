import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (to, token) => {
    const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verifica tu correo electrónico - Ticket César',
        html: `
      <h1>¡Bienvenido a Ticket César!</h1>
      <p>Gracias por registrarte. Para completar tu registro y poder iniciar sesión, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
      <a href="${verificationUrl}" style="display:inline-block;padding:10px 20px;background-color:#000;color:#ddc092;text-decoration:none;border-radius:5px;">Verificar mi correo</a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${verificationUrl}</p>
      <p>Si no solicitaste este registro, puedes ignorar este correo.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${to}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Error al enviar el correo de verificación');
    }
};

export const sendPasswordResetEmail = async (to, token) => {
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Recuperación de contraseña - Ticket César',
        html: `
      <h1>Recuperación de contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#000;color:#ddc092;text-decoration:none;border-radius:5px;">Restablecer contraseña</a>
      <p>O copia y pega este enlace en tu navegador:</p>
      <p>${resetUrl}</p>
      <p>Si no solicitaste restablecer tu contraseña, por favor ignora este correo. Este enlace expirará en 1 hora.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${to}`);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Error al enviar el correo de recuperación');
    }
};
