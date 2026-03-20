import { z } from 'zod';

export const productSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional().or(z.literal('')),
  precio: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => !isNaN(val) && val >= 0, "Precio inválido"),
  cantidad: z.union([z.number(), z.string()]).transform(val => parseInt(val, 10)).refine(val => !isNaN(val) && val >= 0, "Cantidad inválida").optional().default(0),
  imagenes: z.array(z.string().url("Al menos una URL de imagen no es válida")).optional()
}).passthrough();
