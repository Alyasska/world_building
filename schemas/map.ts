import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const mapCreateSchema = baseEntityInputSchema.extend({
  name: z.string().trim().min(1),
  mapKind: z.string().trim().min(1).optional().nullable(),
  defaultLayerKey: z.string().trim().min(1).optional(),
});

export const mapUpdateSchema = mapCreateSchema.partial().extend({
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
});

export const mapIdSchema = z.object({ id: uuidSchema });
