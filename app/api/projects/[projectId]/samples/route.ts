import { getSamplesByProjectId } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const samples = await getSamplesByProjectId(projectId);
  return NextResponse.json(samples);
}
