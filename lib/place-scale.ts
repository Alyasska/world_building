export const placeScaleValues = [
  'world',
  'continent',
  'region',
  'country',
  'province',
  'state',
  'city',
  'town',
  'village',
  'district',
  'landmark',
  'building',
  'room',
  'site',
  'other',
] as const;

export type PlaceScale = (typeof placeScaleValues)[number];
