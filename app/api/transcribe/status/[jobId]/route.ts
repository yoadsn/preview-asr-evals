import { NextResponse } from 'next/server';

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

        const runpodResponse = await fetch(`https://api.runpod.ai/v2/${runpodEndpointId}/status/${jobId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${runpodApiKey}`,
            },
        });

        if (!runpodResponse.ok) {
            const errorText = await runpodResponse.text();
            console.error('RunPod status check error:', errorText);
            return NextResponse.json({
                error: `Failed to check job status: ${runpodResponse.status} ${runpodResponse.statusText}`
            }, { status: 500 });
        }

        const statusData = await runpodResponse.json();

        return NextResponse.json(statusData);

    } catch (error) {
        console.error('Status check error:', error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}
