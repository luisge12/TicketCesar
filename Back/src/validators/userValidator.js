import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastname: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('El formato del correo electrónico es inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().optional(),
  number: z.string().optional(),
  address: z.string().optional(),
}).passthrough();

export const loginSchema = z.object({
  email: z.string().email('El formato del correo electrónico es inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
}).passthrough();
