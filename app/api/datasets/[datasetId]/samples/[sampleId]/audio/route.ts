import { NextRequest, NextResponse } from 'next/server';
import { DataProviderFactory } from '@/lib/data-providers';
import { getDatasetById } from '@/lib/dataset-config';
import { promises as fs } from 'fs';
import path from 'path';

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

        // Get the audio file info - this will handle downloading, caching, or URL generation
        const fileInfo = await provider.getSampleAudioFile(dataset.source, sampleId);

        // Handle different file access modes
        if (fileInfo.downloadUrl) {
            // Redirect to the URL (e.g., S3 signed URL)
            return NextResponse.redirect(fileInfo.downloadUrl);
        } else if (fileInfo.streamUrl) {
            // Stream the file content
            const { streamUrl, filename } = fileInfo;
            const fileBuffer = await fs.readFile(streamUrl);
            const fileSize = fileBuffer.length;

            // Determine content type based on file extension
            const extension = path.extname(filename).toLowerCase();
            const contentType = getContentType(extension);

            // Return buffer as Response for HTML audio element compatibility
            return new Response(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': fileSize.toString(),
                    'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
                    'Accept-Ranges': 'bytes',
                    // Browser filename hint
                    'Content-Disposition': `inline; filename="${filename}"`,
                    // Additional headers for audio player compatibility
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
        console.error('Error getting sample audio file:', error);

        let errorMessage = 'Failed to get sample audio file';
        let statusCode = 500;

        if (error instanceof Error) {
            errorMessage = error.message;
            if (error.message.includes('not found') || error.message.includes('Dataset not found')) {
                statusCode = 404;
            } else if (error.message.includes('invalid') || error.message.includes('expired')) {
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

// Helper function to determine content type based on file extension
function getContentType(extension: string): string {
    switch (extension) {
        case '.wav':
            return 'audio/wav';
        case '.mp3':
            return 'audio/mpeg';
        case '.opus':
            return 'audio/opus';
        case '.mka':
            return 'audio/x-matroska';
        case '.flac':
            return 'audio/flac';
        case '.m4a':
            return 'audio/m4a';
        case '.aac':
            return 'audio/aac';
        default:
            return 'application/octet-stream';
    }
}
