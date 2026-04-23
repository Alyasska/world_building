import { z } from 'zod';
import { uuidSchema } from './shared';

export const storyEntityCreateSchema = z.object({
  storyId: uuidSchema,
  entityType: z.enum(['character', 'place', 'faction']),
  entityId: uuidSchema,
  entityRole: z.string().trim().min(1),
  sequence: z.number().int().positive().optional().nullable(),
  note: z.string().trim().min(1).optional().nullable(),
});

export const storyEntityIdSchema = z.object({ id: uuidSchema });
