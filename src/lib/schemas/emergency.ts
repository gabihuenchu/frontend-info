import { z } from 'zod';
import { TipoEmergencia, NivelSeveridad, EstadoEmergencia } from '@/types/emergency';

/**
 * Schema de validación para crear una emergencia
 * Incluyendo validación geoespacial básica para Chile
 */
export const crearEmergenciaSchema = z.object({
  titulo: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),

  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  tipo: z
    .enum(['TERREMOTO', 'TSUNAMI', 'INCENDIO', 'INUNDACION', 'ERUPCION_VOLCANICA', 'ALUVION', 'OTRO'] as const)
    .refine((val) => val in ['TERREMOTO', 'TSUNAMI', 'INCENDIO', 'INUNDACION', 'ERUPCION_VOLCANICA', 'ALUVION', 'OTRO'], {
      message: 'Tipo de emergencia inválido',
    }),

  severidad: z
    .enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as const)
    .refine((val) => val in ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'], {
      message: 'Nivel de severidad inválido',
    }),

  region: z
    .string()
    .min(1, 'La región es obligatoria'),

  comuna: z
    .string()
    .min(1, 'La comuna es obligatoria'),

  latitud: z
    .number()
    .min(-56, 'Latitud fuera de rango de Chile')
    .max(-17, 'Latitud fuera de rango de Chile'),

  longitud: z
    .number()
    .min(-82, 'Longitud fuera de rango de Chile')
    .max(-66, 'Longitud fuera de rango de Chile'),

  afectados: z
    .number()
    .min(0, 'El número de afectados no puede ser negativo')
    .max(10000000, 'Número de afectados inválido')
    .optional(),
});

export const actualizarEstadoSchema = z.object({
  estado: z
    .enum(['ACTIVA', 'CONTROLADA', 'FINALIZADA'] as const)
    .refine((val) => val in ['ACTIVA', 'CONTROLADA', 'FINALIZADA'], {
      message: 'Estado de emergencia inválido',
    }),
});

export type CrearEmergenciaFormData = z.infer<typeof crearEmergenciaSchema>;
export type ActualizarEstadoFormData = z.infer<typeof actualizarEstadoSchema>;
