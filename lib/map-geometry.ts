import { z } from 'zod';

export const mapGeometryTypeValues = ['point', 'rect', 'polygon'] as const;
export type MapGeometryType = (typeof mapGeometryTypeValues)[number];

export const pointGeometrySchema = z.object({
  x: z.number(),
  y: z.number(),
});
export type PointGeometry = z.infer<typeof pointGeometrySchema>;

export const rectGeometrySchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});
export type RectGeometry = z.infer<typeof rectGeometrySchema>;

export const polygonGeometrySchema = z.object({
  points: z.array(z.object({ x: z.number(), y: z.number() })).min(3),
});
export type PolygonGeometry = z.infer<typeof polygonGeometrySchema>;

export type MapGeometry = PointGeometry | RectGeometry | PolygonGeometry;

export function geometrySchemaForType(type: MapGeometryType) {
  switch (type) {
    case 'point':   return pointGeometrySchema;
    case 'rect':    return rectGeometrySchema;
    case 'polygon': return polygonGeometrySchema;
  }
}
