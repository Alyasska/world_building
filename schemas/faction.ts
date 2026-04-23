import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const factionCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  factionKind: z.string().trim().min(1).optional().nullable(),
});

export const factionUpdateSchema = factionCreateSchema
  .partial()
  .extend({
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  });

export const factionIdSchema = z.object({ id: uuidSchema });
