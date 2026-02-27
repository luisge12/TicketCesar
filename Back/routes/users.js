import express from 'express';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../mailService.js';

export default function createUserRouter({ userconnect, jwt, JWT_SECRET }) {
  const router = express.Router();

  // Devuelve el estado de sesión basado en la cookie `access_token`
  router.get('/session', (req, res) => {
    const token = req.cookies && req.cookies['access_token'];
    if (!token) return res.json({ isAuthenticated: false, cookieInfo: { received: false } });

    try {
      const data = jwt.verify(token, JWT_SECRET);
      return res.json({
        isAuthenticated: true,
        user: {
          email: data.email,
          name: data.name,
          lastname: data.lastname,
          phone: data.number || data.phone,
          role: data.role
        },
        cookieInfo: { received: true }
      });
    } catch (err) {
      return res.json({ isAuthenticated: false, cookieInfo: { received: true, invalid: true } });
    }
  });

  router.post('/register', async (req, res) => {
    const user = req.body;
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const newUser = await userconnect.createUser(user, verificationToken);

      try {
        await sendVerificationEmail(user.email, verificationToken);
      } catch (emailError) {
        console.error('Error enviando correo de verificación:', emailError);
        // We log the error but still return success for registration.
      }

      res.status(201).json({
        message: 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico para poder iniciar sesión.'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.message === 'User with this email already exists.') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await userconnect.loginUser(email, password);
      const userData = result.user;
      const token = jwt.sign(
        {
          email: userData.email,
          name: userData.name,
          lastname: userData.lastname,
          phone: userData.phone,
          role: userData.role
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      res
        .cookie('access_token', token, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 1000
        })
        .json({
          user: {
            email: userData.email,
            name: userData.name,
            lastname: userData.lastname,
            phone: userData.phone,
            role: userData.role
          },
          message: 'Login exitoso'
        });
    } catch (error) {
      console.error('Error:', error);
      res.status(401).json({ error: error.message || 'Internal Server Error' });
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  });

  router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token requerido' });

    try {
      const user = await userconnect.verifyUserToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Token inválido o cuenta ya verificada' });
      }
      res.json({ message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      res.status(500).json({ error: 'Error del servidor al verificar correo' });
    }
  });

  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const token = crypto.randomBytes(32).toString('hex');
      // Format local timestamp correctly for PostgreSQL TIMESTAMP type
      const date = new Date(Date.now() + 3600000); // 1 hour from now
      const expires = date.toISOString().replace('T', ' ').substring(0, 19);

      await userconnect.savePasswordResetToken(email, token, expires);

      try {
        await sendPasswordResetEmail(email, token);
      } catch (mailErr) {
        console.error('Error enviando correo de recuperación:', mailErr);
      }

      res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña.' });
    } catch (error) {
      if (error.message === 'User not found') {
        // Por seguridad, no revelamos qué correos existen o no. Respondemos igual.
        res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace para recuperar tu contraseña.' });
      } else {
        res.status(500).json({ error: 'Error al procesar la solicitud' });
      }
    }
  });

  router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Faltan parámetros' });

    try {
      await userconnect.resetPassword(token, newPassword);
      res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
    } catch (error) {
      if (error.message === 'invalid_token') {
        res.status(400).json({ error: 'El enlace de recuperación es inválido o ha expirado.' });
      } else {
        res.status(500).json({ error: 'Error al restablecer contraseña' });
      }
    }
  });

  return router;
}
