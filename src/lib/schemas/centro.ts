import { z } from 'zod';

const estadoCentroSchema = z.enum(['ACTIVO', 'INACTIVO', 'SATURADO', 'CERRADO']);

export const crearCentroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200, 'Máximo 200 caracteres'),
  direccion: z.string().trim().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  region: z.string().trim().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  comuna: z.string().trim().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  capacidad: z
    .number()
    .int('Debe ser un entero')
    .positive('Debe ser mayor a 0')
    .optional(),
  horario: z.string().trim().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
  estado: estadoCentroSchema.optional(),
  latitud: z.number().min(-90).max(90),
  longitud: z.number().min(-180).max(180),
});

export type CrearCentroFormData = z.infer<typeof crearCentroSchema>;

export const editarCentroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(200).optional(),
  direccion: z.string().trim().max(500).optional().or(z.literal('')),
  region: z.string().trim().max(100).optional().or(z.literal('')),
  comuna: z.string().trim().max(100).optional().or(z.literal('')),
  capacidad: z.number().int().positive().optional(),
  horario: z.string().trim().max(200).optional().or(z.literal('')),
  estado: estadoCentroSchema.optional(),
});

export type EditarCentroFormData = z.infer<typeof editarCentroSchema>;
