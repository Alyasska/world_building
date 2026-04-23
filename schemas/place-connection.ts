import { z } from 'zod';
import { uuidSchema } from './shared';

export const placeConnectionCreateSchema = z.object({
  fromPlaceId: uuidSchema,
  toPlaceId: uuidSchema,
  connectionType: z.string().trim().min(1),
  isBidirectional: z.boolean().optional(),
  travelTimeText: z.string().trim().min(1).optional().nullable(),
});

export const placeConnectionIdSchema = z.object({ id: uuidSchema });
