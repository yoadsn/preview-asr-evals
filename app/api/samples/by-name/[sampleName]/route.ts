import { getSamplesByName } from '@/lib/data';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sampleName: string }> }
) {
    try {
        const { sampleName } = await params;
        const { searchParams } = new URL(request.url);
        const excludeProjectId = searchParams.get('excludeProjectId');

        const results = await getSamplesByName(
            decodeURIComponent(sampleName),
            excludeProjectId || undefined
        );

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching samples by name:', error);
        return NextResponse.json(
            { error: 'Failed to fetch samples' },
            { status: 500 }
        );
    }
}
