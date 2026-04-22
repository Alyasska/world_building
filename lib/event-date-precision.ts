export const eventDatePrecisionValues = [
  'exact',
  'day',
  'month',
  'year',
  'range',
  'circa',
  'unknown',
] as const;

export type EventDatePrecision = (typeof eventDatePrecisionValues)[number];
