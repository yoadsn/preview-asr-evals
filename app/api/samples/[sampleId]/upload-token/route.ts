import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { sampleId: string } }
): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const { sampleId } = await params;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['audio/mpeg', 'audio/wav', 'text/plain'],
          tokenPayload: JSON.stringify({
            sampleId: sampleId,
          }),
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
