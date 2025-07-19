import { getSampleById } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ sampleId: string }> }) {
    const { sampleId } = await params;
    const sample = await getSampleById(sampleId);
    if (!sample) {
        return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }
    return NextResponse.json(sample);
}
