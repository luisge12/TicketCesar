import { z } from 'zod';

export const equipoSchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio y debe tener mínimo 2 caracteres'),
  apellido: z.string().min(2, 'El apellido es obligatorio y debe tener mínimo 2 caracteres'),
  rol: z.string().min(2, 'El rol es obligatorio y debe tener mínimo 2 caracteres'),
  descripcion: z.string().optional().or(z.literal('')),
  foto: z.string().url('La URL de la fotografía no es válida').optional().or(z.literal('')),
  orden: z.union([z.string(), z.number()]).optional(),
}).passthrough();
