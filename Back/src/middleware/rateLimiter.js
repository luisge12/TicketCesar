import { rateLimit } from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 1500, // Máximo 1500 peticiones por IP (ajustado para polling de 3s)
    message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 15, // Máximo 15 intentos (login, registro, etc)
    message: { error: 'Demasiados intentos de acceso, por favor intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
