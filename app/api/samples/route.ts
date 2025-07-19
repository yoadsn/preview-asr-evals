import { createSample } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { projectId, name } = await request.json();
  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId is required' },
      { status: 400 }
    );
  }
  const sample = await createSample(projectId, name);
  return NextResponse.json(sample, { status: 201 });
}
