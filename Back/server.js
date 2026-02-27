import express from 'express';
import { PORT, HOST, JWT_SECRET } from './config.js';
import { UserConnections } from './UserConnections.js';
import { EventConnections } from './EventConnections.js';
import { BlogConnections } from './BlogConnections.js';
import createUserRouter from './routes/users.js';
import createEventsRouter from './routes/events.js';
import createBlogRouter from './routes/blog.js';
import cors from 'cors';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const userconnect = new UserConnections();
const eventconnect = new EventConnections();
const blogconnect = new BlogConnections();

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
app.use('/', createUserRouter({ userconnect, jwt, JWT_SECRET }));
app.use('/', createEventsRouter({ eventconnect }));
app.use('/', createBlogRouter({ blogconnect }));

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando' });
});

// Event and blog routes moved to `routes/events.js` and `routes/blog.js`

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST} ${PORT} `);
});