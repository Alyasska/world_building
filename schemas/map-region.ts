import { z } from 'zod';
import { geometrySchemaForType, mapGeometryTypeValues, pointGeometrySchema } from '@/lib/map-geometry';
import { baseEntityInputSchema, canonStateSchema, entityStatusSchema, uuidSchema } from './shared';

export const mapGeometryTypeSchema = z.enum(mapGeometryTypeValues);

export const mapRegionCreateSchema = baseEntityInputSchema
  .extend({
    name: z.string().trim().min(1),
    placeId: uuidSchema.optional().nullable(),
    layerKey: z.string().trim().min(1).optional(),
    geometryType: mapGeometryTypeSchema,
    geometry: z.record(z.unknown()),
    labelPoint: pointGeometrySchema.optional().nullable(),
    displayOrder: z.number().int().optional(),
  })
  .superRefine((data, ctx) => {
    const result = geometrySchemaForType(data.geometryType).safeParse(data.geometry);
    if (!result.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['geometry'],
        message: `geometry must match the "${data.geometryType}" shape`,
      });
    }
  });

// geometryType + geometry cross-field validation when both are present.
// When only geometry is sent (no geometryType change), the service validates
// against the existing record's type after fetching it.
export const mapRegionUpdateSchema = baseEntityInputSchema
  .partial()
  .extend({
    name: z.string().trim().min(1).optional(),
    placeId: uuidSchema.optional().nullable(),
    layerKey: z.string().trim().min(1).optional(),
    geometryType: mapGeometryTypeSchema.optional(),
    geometry: z.record(z.unknown()).optional(),
    labelPoint: pointGeometrySchema.optional().nullable(),
    displayOrder: z.number().int().optional(),
    status: entityStatusSchema.optional(),
    canonState: canonStateSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.geometryType !== undefined && data.geometry !== undefined) {
      const result = geometrySchemaForType(data.geometryType).safeParse(data.geometry);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['geometry'],
          message: `geometry must match the "${data.geometryType}" shape`,
        });
      }
    }
  });

export const mapRegionIdSchema = z.object({ id: uuidSchema });

export const mapRegionPlaceBindSchema = z.object({ placeId: uuidSchema });
