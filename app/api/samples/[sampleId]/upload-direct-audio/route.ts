import { uploadFile } from '@/lib/blob';
import { updateSampleAudio } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sampleId: string }> }
): Promise<NextResponse> {
  const { sampleId } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const allowedTypes = [
    // MP3 formats
    'audio/mpeg',
    'audio/mp3',

    // WAV formats (multiple MIME types for compatibility)
    'audio/wav',
    'audio/x-wav',
    'audio/x-pn-wav',
    'audio/wave',

    // AAC formats
    'audio/aac',
    'audio/x-aac',

    // OGG formats
    'audio/ogg',
    'audio/ogg; codecs=vorbis',

    // WebM Audio
    'audio/webm',

    // FLAC
    'audio/flac',

    // M4A
    'audio/m4a',
    'audio/mp4',
    'audio/x-m4a',

    // Additional formats for broad compatibility
    'audio/3gpp',
    'audio/3gpp2'
  ];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Please upload one of: ${allowedTypes.join(', ')}` }, { status: 400 });
  }

  try {
    const url = await uploadFile(file, 'audio');
    await updateSampleAudio(sampleId, url);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
