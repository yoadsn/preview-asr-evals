import { NextResponse } from 'next/server';
import { cleanupTranscriptionFiles } from '@/lib/blob';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ jobId: string }> }
): Promise<NextResponse> {
    try {
        const { jobId } = await params;

        const runpodApiKey = process.env.RUNPOD_API_KEY;
        const runpodEndpointId = process.env.RUNPOD_ENDPOINT_ID;

        if (!runpodApiKey || !runpodEndpointId) {
            return NextResponse.json({
                error: 'RunPod configuration missing'
            }, { status: 500 });
        }

        // Create a readable stream for SSE
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                let pollTimeout: NodeJS.Timeout | null = null;

                const sendEvent = (data: any, event = 'message') => {
                    // Check if controller is closed directly rather than relying on flag
                    try {
                        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
                        controller.enqueue(encoder.encode(message));
                    } catch (error) {
                        // Controller is closed or stream is broken
                        console.warn('Failed to send SSE event:', error);
                    }
                };

                const cleanup = () => {
                    if (pollTimeout) {
                        clearTimeout(pollTimeout);
                        pollTimeout = null;
                    }
                    // try {
                    //     controller.close();
                    // } catch (error) {
                    //     // Controller already closed, ignore
                    // }
                };

                const pollStatus = async () => {
                    try {
                        const runpodResponse = await fetch(`https://api.runpod.ai/v2/${runpodEndpointId}/stream/${jobId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${runpodApiKey}`,
                            },
                        });

                        if (!runpodResponse.ok) {
                            const errorText = await runpodResponse.text();
                            sendEvent({
                                error: `Failed to check job status: ${runpodResponse.status} ${runpodResponse.statusText}`,
                                details: errorText
                            }, 'error');
                            return;
                        }

                        const statusData = await runpodResponse.json();

                        // Send status update
                        sendEvent(statusData, 'status');

                        // Stop polling if job is completed, failed, cancelled, or timed out
                        if (['COMPLETED', 'FAILED', 'CANCELLED', 'TIMED_OUT'].includes(statusData.status)) {
                            // Send completion event before cleanup
                            sendEvent({ message: 'Polling complete' }, 'complete');

                            // Clean up temporary audio blob asynchronously (don't block)
                            cleanupTranscriptionFiles(jobId);

                            return;
                        }

                        // Continue polling after 3 seconds, but only if stream hasn't been closed

                        pollTimeout = setTimeout(() => {
                            // Double-check before actually calling pollStatus
                            pollStatus();

                        }, 3000);


                    } catch (error) {
                        sendEvent({
                            error: 'Failed to poll job status',
                            details: (error as Error).message
                        }, 'error');
                        cleanup();
                    }
                };

                // Start polling immediately
                await pollStatus();
            },
            cancel() {
                // Handle client disconnection
                console.log('cancel(), Client Disconnected')
            }
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('Stream setup error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
