import { NextRequest, NextResponse } from 'next/server';
import { DataProviderFactory } from '@/lib/data-providers';
import { getDatasetById } from '@/lib/dataset-config';
import { promises as fs } from 'fs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ datasetId: string; sampleId: string }> }) {
    try {
        const { datasetId, sampleId } = await params;

        // Find the dataset configuration
        const dataset = getDatasetById(datasetId);
        if (!dataset) {
            return NextResponse.json(
                { error: 'Dataset not found' },
                { status: 404 }
            );
        }

        // Get the provider for this dataset type
        const provider = await DataProviderFactory.getProvider(dataset.type);

        // Get the transcript file path
        const transcriptFilePath = await provider.getSampleTranscriptionFile(dataset.source, sampleId);

        // Read the file content and serve it
        const content = await fs.readFile(transcriptFilePath, 'utf-8');

        return new NextResponse(content, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                // Browser filename hint for the transcript file
                'Content-Disposition': 'inline; filename="transcript.aligned.json"',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        console.error('Error getting sample transcript file:', error);

        let errorMessage = 'Failed to get sample transcript file';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            if (error.message.includes('not found') || error.message.includes('Dataset not found')) {
                statusCode = 404;
            } else if (error.message.includes('invalid') || error.message.includes('expired')) {
                statusCode = 401;
            } else if (error.message.includes('Access denied')) {
                statusCode = 403;
            } else if (error.message.includes('Rate limited')) {
                statusCode = 429;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}
