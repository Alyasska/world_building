import { z } from 'zod';
import { uuidSchema } from './shared';

export const eventParticipantIdSchema = z.object({ id: uuidSchema });

// participantType is an open enum that will grow as new entity types (e.g. 'faction') are supported.
// Currently only 'character' is wired in the service layer.
export const eventParticipantTypeSchema = z.enum(['character']);

export const eventParticipantCreateSchema = z.object({
  participantId: uuidSchema,
  participantType: eventParticipantTypeSchema.default('character'),
  role: z.string().trim().min(1).optional().nullable(),
  sequence: z.number().int().positive().optional().nullable(),
});

export const eventParticipantUpdateSchema = z.object({
  role: z.string().trim().min(1).optional().nullable(),
  sequence: z.number().int().positive().optional().nullable(),
});