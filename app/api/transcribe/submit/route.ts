import { uploadFile } from '@/lib/blob';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        // Validate audio file types
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/x-pn-wav',
            'audio/wave',
            'audio/aac',
            'audio/x-aac',
            'audio/ogg',
            'audio/webm',
            'audio/flac',
            'audio/m4a',
            'audio/mp4',
            'audio/x-m4a',
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: `Invalid file type. Please upload an audio file. Supported formats: ${allowedTypes.join(', ')}`
            }, { status: 400 });
        }

        // Upload file to Vercel Blob with 30-minute expiry
        const audioUrl = await uploadFile(file, 'transcribe');

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
                    model: "yoad/yi-whisper-large-v3-ct2",
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
                const url = new URL(audioUrl);
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
        console.error('Transcription submit error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
