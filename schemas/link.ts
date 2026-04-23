import { z } from 'zod';
import { canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const entityTypeSchema = z.enum(['character', 'place']);

export const entityLinkCreateSchema = z.object({
  sourceEntityType: entityTypeSchema,
  sourceEntityId: uuidSchema,
  targetEntityType: entityTypeSchema,
  targetEntityId: uuidSchema,
  relationType: z.string().trim().min(1),
  isBidirectional: z.boolean().optional(),
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const entityLinkDeleteSchema = z.object({ id: uuidSchema });

export const entityTagCreateSchema = z.object({
  entityType: entityTypeSchema,
  entityId: uuidSchema,
  tagId: uuidSchema,
  context: z.string().trim().min(1).optional().nullable(),
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const entityTagDeleteSchema = z.object({ id: uuidSchema });
