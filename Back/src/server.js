import express from 'express';
import { PORT, HOST, JWT_SECRET } from './config/index.js';
import { UserConnections } from './models/User.js';
import { EventConnections } from './models/Event.js';
import { BlogConnections } from './models/Blog.js';
import { ReservationsConnections } from './models/Reservation.js';
import { EquipoConnections } from './models/Equipo.js';
import createUserRouter from './routes/users.js';
import createEventsRouter from './routes/events.js';
import createBlogRouter from './routes/blog.js';
import createReservationsRouter from './routes/reservations.js';
import createEquipoRouter from './routes/equipo.js';
import { requireAuth, requireAdmin } from './middleware/auth.js';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

const userconnect = new UserConnections();
const eventconnect = new EventConnections();
const blogconnect = new BlogConnections();
const reservationsConnect = new ReservationsConnections();
const equipoconnect = new EquipoConnections();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ticketcesar.onrender.com',
  ],
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

// Routers (grouped by request type) -- registered after app and middleware
app.use('/api', createUserRouter({ userconnect, jwt, JWT_SECRET }));
app.use('/api', createEventsRouter({ eventconnect, requireAdmin }));
app.use('/api', createBlogRouter({ blogconnect, requireAdmin }));
app.use('/api', createReservationsRouter({ reservationsConnect, requireAuth }));
app.use('/api', createEquipoRouter({ equipoconnect, requireAdmin }));

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando' });
});

// Global Error Handler must be the last middleware
app.use(errorHandler);

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST} ${PORT} `);
});
