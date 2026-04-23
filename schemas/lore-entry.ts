import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const loreEntryCreateSchema = baseEntityInputSchema.extend({
  title: z.string().trim().min(1),
  entryKind: z.string().trim().min(1).optional().nullable(),
  topic: z.string().trim().min(1).optional().nullable(),
});

export const loreEntryUpdateSchema = loreEntryCreateSchema
  .partial()
  .extend({
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  });

export const loreEntryIdSchema = z.object({ id: uuidSchema });
