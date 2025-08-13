import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate file type based on pathname extension
        const allowedExtensions = [
          '.mp3',
          '.wav',
          '.aac',
          '.3gp',
          '.3g2',
          '.ogg',
          '.oga',
          '.wmv',
          '.webm',
          '.weba',
          '.flac',
          '.m4a',
          '.mp4',
          '.opus'
        ];
        const hasValidExtension = allowedExtensions.some(ext => pathname.toLowerCase().endsWith(ext));

        if (!hasValidExtension) {
          console.log('Invalid file type. Please upload an audio file.');
          throw new Error('Invalid file type. Please upload an audio file.');
        }

        return {
          allowedContentTypes: [
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
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 500 * 1024 * 1024, // 500MB for audio files
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work during development (localhost),
        // Unless you use ngrok or a similar service to expose and test your local server
        console.log('blob upload completed', blob, tokenPayload)
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    )
  }
}
