import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const tagCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  color: z.string().trim().min(1).optional().nullable(),
  namespace: z.string().trim().min(1).optional(),
});

export const tagUpdateSchema = tagCreateSchema.partial().extend({
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
});

export const tagIdSchema = z.object({ id: uuidSchema });
