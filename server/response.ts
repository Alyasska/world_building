import { NextResponse } from 'next/server';

type ApiErrorOptions = {
  issues?: unknown;
};

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status: number, options?: ApiErrorOptions) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(options?.issues !== undefined ? { issues: options.issues } : {}),
    },
    { status }
  );
}

export function validationError(message: string, issues: unknown) {
  return errorResponse(message, 400, { issues });
}

export function notFoundError(message = 'Not found') {
  return errorResponse(message, 404);
}

export function conflictError(message: string) {
  return errorResponse(message, 409);
}

export function internalServerError(message = 'Internal server error') {
  return errorResponse(message, 500);
}
