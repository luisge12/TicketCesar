import express from 'express';
import { PORT, HOST, JWT_SECRET } from './config.js';
import { UserConnections } from './UserConnections.js'; 
import { EventConnections } from './EventConnections.js';
import cors from 'cors';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const userconnect = new UserConnections();
const eventconnect = new EventConnections();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Cambia al puerto de tu frontend si es diferente
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  const token = req.cookies['access_token'];
  req.session = { user: null };

  try {
    const data = jwt.verify(token, JWT_SECRET);
    
    req.session.user = {
      email: data.email,
      name: data.name,
      lastname: data.lastname,
      phone: data.phone, //
      role: data.role
    };
    
  } catch (error) {
    if (token) {
      console.log('Token error:', error.message);
    }
  }
  next();
});

app.get('/', (req, res) => {
  //console.log('get /'); // Para debug
  const token = req.cookies['access_token'];
  if (token) {
    try {
      const data = jwt.verify(token, JWT_SECRET);
      res.json({
        isAuthenticated: true,
        user: {
          email: data.email,
          name: data.name,
          lastname: data.lastname,
          phone: data.number || data.phone, // Maneja ambos casos
          role: data.role
        },
        cookieInfo: {
          received: true,
          tokenPreview: token.substring(0, 50) + '...' // Para debug
        }
      });
    } catch (error) {
      res.json({
        isAuthenticated: false,
        error: 'Token inválido',
        cookieInfo: {
          received: true,
          invalid: true
        }
      });
    }
  } else {
    res.json({
      isAuthenticated: false,
      cookieInfo: {
        received: false,
        message: 'No se recibió access_token'
      }
    });
  }
});

app.post('/register', async (req, res) => {
    const user = req.body;
    try {
        // La ejecución espera a que createUser termine
      const newUser = await userconnect.createUser(user); 
      const token = jwt.sign(
      { email: user.email, name:user.name, lastname: user.lastname, phone: user.phone, role: user.role }, 
      JWT_SECRET,
      {expiresIn: '1h'}
      );
      res.cookie('access_token', token,{
        httpOnly: true,
      })
      .send({ user, token })
    } catch (error) {
        // Si createUser lanza un error, la ejecución llega aquí
        console.error('Error creating user:', error);

        // Si el error es una violación de unicidad (correo duplicado)
        if (error.message === 'User with this email already exists.') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const result = await userconnect.loginUser(email, password);

    // Accede a los datos correctamente
    const userData = result.user; 
    
    const token = jwt.sign(
      { 
        email: userData.email,       // ← userData en lugar de user
        name: userData.name,         // ← userData.name
        lastname: userData.lastname, // ← userData.lastname
        phone: userData.phone, // ← userData.phone
        role: userData.role          // ← userData.role
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

app.post('/logout', (req, res) => {
  const token = req.cookies['access_token'];
  if (token) {
    try {
      const data = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.log('Token inválido o expirado');
    }
  } else {
    console.log('No se recibió access_token');
  }

  res.clearCookie('access_token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  });
  res.json({ message: 'Sesión cerrada correctamente' });
});

app.get('/get-events', async (req, res) => {
  try {
    const events = await eventconnect.getEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/create-event', async (req, res) => {
  console.log('POST /create-event body:', req.body); // Para debug
  const eventData = req.body;
  try {
    const newEvent = await eventconnect.insertEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/events/category/:category', async (req, res) => {
  const { category } = req.params;
  //console.log('Category to fetch:', category); // Para debug
  try {
    const events = await eventconnect.getEventsByCategory(category);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/event/:id', async (req, res) => {
  console.log('GET /event/:id called', req.params); // Para debug
  const { id } = req.params;
  try {
    const event = await eventconnect.getEventById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
})