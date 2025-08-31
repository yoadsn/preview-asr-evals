import { NextResponse } from 'next/server';
import { DataProviderFactory } from '@/lib/data-providers';
import { getDatasetById } from '@/lib/dataset-config';

export async function GET(request: Request, { params }: { params: Promise<{ datasetId: string; sampleId: string }> }) {
    try {
        const { datasetId, sampleId } = await params; // Must await params in next.js 15!

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

        // Get URLs for audio and transcription data
        const [audioUrl, transcriptionUrl] = await Promise.all([
            provider.getSampleAudioUrl(dataset.source, sampleId),
            provider.getSampleTranscriptionUrl(dataset.source, sampleId)
        ]);

        // Return sample information with URLs
        const sample = {
            id: sampleId,
            audioUrl,
            transcriptionUrl
        };

        return NextResponse.json(sample);
    } catch (error) {
        console.error('Error getting sample data:', error);
        return NextResponse.json(
            { error: 'Failed to get sample data' },
            { status: 500 }
        );
    }
}
