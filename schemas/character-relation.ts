import { z } from 'zod';
import { uuidSchema } from './shared';

export const characterRelationCreateSchema = z.object({
  fromCharacterId: uuidSchema,
  toCharacterId: uuidSchema,
  relationType: z.string().trim().min(1),
});

export const characterRelationIdSchema = z.object({ id: uuidSchema });
