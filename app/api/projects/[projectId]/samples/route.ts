import { getSamplesByProjectId } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const samples = await getSamplesByProjectId(params.projectId);
  return NextResponse.json(samples);
}
