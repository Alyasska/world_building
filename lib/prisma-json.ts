import { Prisma } from '@prisma/client';

export function toJsonWrite(
  value: Prisma.JsonValue | null,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  return value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}
