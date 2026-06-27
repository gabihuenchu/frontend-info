import { z } from 'zod';

const uuidSchema = z.string().uuid('Debe ser un UUID válido');

export const movimientoInventarioSchema = z.object({
  itemCatalogoId: uuidSchema,
  tipoMovimiento: z.enum(['INGRESO', 'EGRESO']),
  cantidad: z
    .number()
    .int('La cantidad debe ser un entero')
    .min(1, 'La cantidad mínima es 1'),
});

export type MovimientoInventarioFormData = z.infer<typeof movimientoInventarioSchema>;

export const umbralesInventarioSchema = z
  .object({
    itemCatalogoId: uuidSchema,
    umbralMinimo: z.number().int('Debe ser un entero').min(0, 'No puede ser negativo'),
    umbralOptimo: z.number().int('Debe ser un entero').min(0, 'No puede ser negativo'),
    umbralMaximo: z.number().int('Debe ser un entero').min(0, 'No puede ser negativo'),
  })
  .refine((d) => d.umbralMinimo <= d.umbralOptimo, {
    message: 'El umbral mínimo no puede superar al óptimo',
    path: ['umbralMinimo'],
  })
  .refine((d) => d.umbralOptimo <= d.umbralMaximo, {
    message: 'El umbral óptimo no puede superar al máximo',
    path: ['umbralOptimo'],
  });

export type UmbralesInventarioFormData = z.infer<typeof umbralesInventarioSchema>;
