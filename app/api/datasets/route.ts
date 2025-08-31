import { NextResponse } from 'next/server';
import { DataProviderFactory } from '@/lib/data-providers';
import { getDatasets } from '@/lib/dataset-config';

export async function GET() {
    try {
        // For now, just expose id and name as requested
        const datasets = getDatasets().map(dataset => ({
            id: dataset.id,
            name: dataset.name
        }));

        return NextResponse.json(datasets);
    } catch (error) {
        console.error('Error listing datasets:', error);
        return NextResponse.json(
            { error: 'Failed to list datasets' },
            { status: 500 }
        );
    }
}
