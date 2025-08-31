import { NextResponse } from 'next/server';
import { DataProviderFactory } from '@/lib/data-providers';
import { getDatasetById } from '@/lib/dataset-config';


export async function GET(request: Request, { params }: { params: Promise<{ datasetId: string }> }) {
    try {
        const { datasetId } = await params; // Must await params in next.js 15!

        // Find the dataset configuration
        const dataset = getDatasetById(datasetId);
        if (!dataset) {
            return NextResponse.json(
                { error: 'Dataset not found' },
                { status: 404 }
            );
        }

        // Get the provider for this dataset type
        const provider = await DataProviderFactory.getProvider(dataset);

        // List samples using the provider
        const samples = await provider.listSamples(dataset.source);

        return NextResponse.json(samples);
    } catch (error) {
        console.error('Error listing dataset samples:', error);

        // Improve error response with more specific error messages
        let errorMessage = 'Failed to list dataset samples';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;

            // Determine appropriate status code based on error type
            if (error.message.includes('not found') || error.message.includes('Dataset not found')) {
                statusCode = 404;
            } else if (error.message.includes('Unauthenticated') || error.message.includes('invalid') || error.message.includes('expired')) {
                statusCode = 401;
            } else if (error.message.includes('Access denied') || error.message.includes('Forbidden')) {
                statusCode = 403;
            } else if (error.message.includes('Rate limited') || error.message.includes('Too Many Requests')) {
                statusCode = 429;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
