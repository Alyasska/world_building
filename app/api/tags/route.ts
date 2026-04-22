import { NextRequest, NextResponse } from 'next/server';
import { createTag, listTags } from '@/server/tag-service';
import { validationError } from '@/server/response';
import { ZodError } from 'zod';

export async function GET() {
  const tags = await listTags();
  return NextResponse.json({ data: tags });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  try {
    const tag = await createTag(body);
    return NextResponse.json({ data: tag }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError('Invalid tag payload', error);
    }

    throw error;
  }
}
