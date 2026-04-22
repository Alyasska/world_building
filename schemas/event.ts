import { z } from 'zod';
import { eventDatePrecisionValues } from '@/lib/event-date-precision';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

const dateInputSchema = z.union([z.string().trim().min(1), z.date()]);

export const eventDatePrecisionSchema = z.enum(eventDatePrecisionValues);

export const eventCreateSchema = baseEntityInputSchema.extend({
  title: z.string().trim().min(1),
  storyId: uuidSchema.optional().nullable(),
  placeId: uuidSchema.optional().nullable(),
  eventDateText: z.string().trim().min(1).optional().nullable(),
  startAt: dateInputSchema.optional().nullable(),
  endAt: dateInputSchema.optional().nullable(),
  datePrecision: eventDatePrecisionSchema.optional().nullable(),
});

export const eventUpdateSchema = eventCreateSchema.partial().extend({
  status: entityStatusSchema.optional(),
  canonState: canonStateSchema.optional(),
});

export const eventIdSchema = z.object({ id: uuidSchema });
