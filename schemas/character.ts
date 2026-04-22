import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';
import { jsonValueSchema } from './json';

export const characterCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  aliases: jsonValueSchema.optional().nullable(),
  pronouns: z.string().trim().min(1).optional().nullable(),
  epithet: z.string().trim().min(1).optional().nullable(),
  birthDateText: z.string().trim().min(1).optional().nullable(),
  deathDateText: z.string().trim().min(1).optional().nullable(),
});

export const characterUpdateSchema = characterCreateSchema
  .partial()
  .extend({
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  });

export const characterIdSchema = z.object({ id: uuidSchema });
