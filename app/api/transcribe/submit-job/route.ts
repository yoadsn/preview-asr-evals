import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

import { SupportedModels } from '@/lib/transcribe-models';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { audioUrl, model = SupportedModels[0] } = await request.json();

        if (!model || !SupportedModels.includes(model)) {
            return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
        }

        if (!audioUrl || typeof audioUrl !== 'string') {
            return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
        }

        // Validate that this is a valid blob URL from our domain
        const url = new URL(audioUrl);
        if (!url.hostname.endsWith('.blob.vercel-storage.com')) {
            return NextResponse.json({ error: 'Invalid audio URL' }, { status: 400 });
        }

        // Submit job to RunPod
        const runpodApiKey = process.env.RUNPOD_API_KEY;
        const runpodEndpointId = process.env.RUNPOD_ENDPOINT_ID;

        if (!runpodApiKey || !runpodEndpointId) {
            return NextResponse.json({
                error: 'RunPod configuration missing. Please check RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID environment variables.'
            }, { status: 500 });
        }

        const runpodResponse = await fetch(`https://api.runpod.ai/v2/${runpodEndpointId}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${runpodApiKey}`,
            },
            body: JSON.stringify({
                input: {
                    type: "url",
                    model,
                    streaming: true,
                    transcribe_args: {
                        language: "yi",
                        diarize: false,
                        verbose: false,
                        url: audioUrl
                    }
                }
            }),
        });

        if (!runpodResponse.ok) {
            const errorText = await runpodResponse.text();
            console.error('RunPod API error:', errorText);
            return NextResponse.json({
                error: `Failed to submit transcription job: ${runpodResponse.status} ${runpodResponse.statusText}`
            }, { status: 500 });
        }

        const runpodData = await runpodResponse.json();

        // Store cleanup info - map job ID to the uploaded blob pathname for later deletion
        const jobId = runpodData.id;
        if (jobId) {
            try {
                // Extract pathname from audioUrl for cleanup
                const audioPathname = url.pathname.substring(1); // Remove leading slash
                await put(`transcribe-cleanup/${jobId}.txt`, audioPathname, {
                    access: 'public',
                });
            } catch (cleanupError) {
                console.warn('Failed to store cleanup info:', cleanupError);
                // Don't fail the request if cleanup storage fails
            }
        }

        return NextResponse.json({
            jobId: jobId,
            status: runpodData.status,
            audioUrl,
        });

    } catch (error) {
        console.error('Job submission error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}