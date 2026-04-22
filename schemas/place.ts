import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';
import { jsonValueSchema } from './json';

export const placeCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  placeKind: z.string().trim().min(1).optional().nullable(),
  locationText: z.string().trim().min(1).optional().nullable(),
  aliases: jsonValueSchema.optional().nullable(),
});

export const placeUpdateSchema = placeCreateSchema.partial().extend({
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
});

export const placeIdSchema = z.object({ id: uuidSchema });
