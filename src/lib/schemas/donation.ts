import { z } from 'zod';

const uuidSchema = z
  .string()
  .uuid('Debe ser un UUID válido');

export const donationItemSchema = z.object({
  itemId: uuidSchema,
  cantidad: z
    .number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad mínima es 1'),
});

export const createDonationSchema = z.object({
  centroId: uuidSchema,
  items: z
    .array(donationItemSchema)
    .min(1, 'Debe incluir al menos un ítem'),
});

export type CreateDonationFormData = z.infer<typeof createDonationSchema>;
