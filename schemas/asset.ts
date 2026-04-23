import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

const assetKindSchema = z.enum(['image', 'document', 'audio', 'video', 'archive', 'other']);

export const assetCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  assetKind: assetKindSchema.optional(),
  storageKey: z.string().trim().min(1),
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  altText: z.string().trim().min(1).optional().nullable(),
  sourceUri: z.string().trim().min(1).optional().nullable(),
});

export const assetUpdateSchema = assetCreateSchema
  .partial()
  .extend({
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  });

export const assetIdSchema = z.object({ id: uuidSchema });
