import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const ruleSystemCreateSchema = baseEntityInputSchema.extend({
  title: z.string().trim().min(1),
  systemKind: z.string().trim().min(1).optional().nullable(),
  versionLabel: z.string().trim().min(1).optional().nullable(),
  appliesTo: z.string().trim().min(1).optional().nullable(),
});

export const ruleSystemUpdateSchema = ruleSystemCreateSchema
  .partial()
  .extend({
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  });

export const ruleSystemIdSchema = z.object({ id: uuidSchema });
