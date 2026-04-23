import { z } from 'zod';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const storyCreateSchema = baseEntityInputSchema.extend({
  title: z.string().trim().min(1),
  storyKind: z.string().trim().min(1).optional().nullable(),
  primaryPlaceId: uuidSchema.optional().nullable(),
  startDateText: z.string().trim().min(1).optional().nullable(),
  endDateText: z.string().trim().min(1).optional().nullable(),
});

export const storyUpdateSchema = storyCreateSchema.partial().extend({
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
});

export const storyIdSchema = z.object({ id: uuidSchema });
