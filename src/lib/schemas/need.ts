import { z } from 'zod';

const uuidSchema = z.string().uuid('Debe ser un UUID válido');

export const createNeedSchema = z.object({
  centroId: uuidSchema,
  itemId: uuidSchema,
  emergenciaId: uuidSchema.nullable().optional(),
  cantidadNecesaria: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1'),
  prioridad: z.enum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']),
});

export type CreateNeedFormData = z.infer<typeof createNeedSchema>;
