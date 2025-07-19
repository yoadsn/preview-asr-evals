import { uploadFile } from '@/lib/blob';
import { updateSampleReferenceText } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { sampleId: string } }
): Promise<NextResponse> {
  const { sampleId } = await params;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const allowedTypes = ['text/plain'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: `Invalid file type. Please upload one of: ${allowedTypes.join(', ')}` }, { status: 400 });
  }

  try {
    const url = await uploadFile(file, 'reference');
    await updateSampleReferenceText(sampleId, url);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
