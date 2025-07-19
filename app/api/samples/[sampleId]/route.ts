import { getSampleById, updateSampleName } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ sampleId: string }> }) {
    const { sampleId } = await params;
    const sample = await getSampleById(sampleId);
    if (!sample) {
        return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }
    return NextResponse.json(sample);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ sampleId: string }> }) {
    const { sampleId } = await params;
    const { name } = await request.json();

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const sample = await getSampleById(sampleId);
    if (!sample) {
        return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
    }

    await updateSampleName(sampleId, name);
    const updatedSample = await getSampleById(sampleId);
    return NextResponse.json(updatedSample);
}
