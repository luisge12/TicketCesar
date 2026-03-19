import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  excerpt: z.string().max(240, 'El extracto debe tener máximo 240 caracteres').optional().or(z.literal('')),
  date_start: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha de inicio inválida'),
  hour: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Hora de inicio inválida'),
  category: z.string().min(1, 'La categoría es requerida'),
  ticket_price: z.union([z.string(), z.number()]).optional(),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  is_active: z.union([z.boolean(), z.string(), z.number()]).optional(),
  attendance: z.union([z.string(), z.number()]).optional(),
  date_end: z.string().optional().or(z.literal('')),
  tickets_sold: z.union([z.string(), z.number()]).optional(),
  id: z.union([z.string(), z.number()]).optional()
}).passthrough();

export const programacionSimpleSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  categoria: z.string().min(1, 'La categoría es requerida'),
  compania: z.string().optional().or(z.literal('')),
  fecha: z.string().refine(val => !isNaN(Date.parse(val)), 'Fecha inválida'),
  hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Hora inválida')
}).passthrough();
