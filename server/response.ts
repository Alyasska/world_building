import { NextResponse } from 'next/server';

export function validationError(message: string, issues: unknown) {
  return NextResponse.json({ error: message, issues }, { status: 400 });
}

export function notFoundError(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function conflictError(message: string) {
  return NextResponse.json({ error: message }, { status: 409 });
}
