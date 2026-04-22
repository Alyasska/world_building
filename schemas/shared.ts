import { z } from 'zod';
import { jsonValueSchema, metadataSchema } from './json';

export const entityStatusSchema = z.enum(['draft', 'active', 'archived']);
export const canonStateSchema = z.enum(['canonical', 'alternate', 'uncertain', 'noncanonical']);

export const baseEntityInputSchema = z.object({
  slug: z.string().min(1).optional(),
  summary: z.string().trim().min(1).optional().nullable(),
  content: jsonValueSchema.optional().nullable(),
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
  metadata: metadataSchema,
});

export const uuidSchema = z.string().uuid();
