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
        const provider = await DataProviderFactory.getProvider(dataset);

        // Get the transcript file info - this will handle cached files or URL generation
        const fileInfo = await provider.getSampleTranscriptionFile(dataset.source, sampleId);

        // Handle different file access modes
        if (fileInfo.downloadUrl) {
            // Redirect to the URL (e.g., S3 signed URL)
            return NextResponse.redirect(fileInfo.downloadUrl);
        } else if (fileInfo.streamUrl) {
            // Stream the file content
            const { streamUrl } = fileInfo;
            const content = await fs.readFile(streamUrl, 'utf-8');

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
        } else {
            // Neither downloadUrl nor streamUrl provided
            throw new Error('No valid file access method provided by provider');
        }
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
