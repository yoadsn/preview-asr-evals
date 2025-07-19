import { updateSampleData } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { sampleId: string } }
) {
  const { sampleId } = params;
  try {
    const { data } = await request.json();
    if (!data) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }
    await updateSampleData(sampleId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
