import express from 'express';

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
      const newUser = await userconnect.createUser(user);
      const token = jwt.sign(
        { email: user.email, name: user.name, lastname: user.lastname, phone: user.phone, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('access_token', token, { httpOnly: true }).send({ user, token });
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
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: false });
    res.json({ message: 'Sesión cerrada correctamente' });
  });

  return router;
}
