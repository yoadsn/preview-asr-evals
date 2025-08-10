import { put, del, list } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function uploadFile(
  file: File,
  prefix: string = 'file'
): Promise<string> {
  const pathname = `${prefix}/${nanoid()}-${file.name}`;
  const blob = await put(pathname, file, {
    access: 'public',
  });
  return blob.url;
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.warn('Failed to delete blob:', url, error);
    // Don't throw - cleanup failures shouldn't break the main flow
  }
}

export async function getCleanupInfo(jobId: string): Promise<string | null> {
  try {
    // Use the list API to find the cleanup file
    const { blobs } = await list({
      prefix: `transcribe-cleanup/${jobId}.txt`,
      limit: 1,
    });

    if (blobs.length === 0) {
      return null;
    }

    // Fetch the content of the cleanup file
    const response = await fetch(blobs[0].url);
    if (!response.ok) {
      return null;
    }
    return await response.text();
  } catch (error) {
    console.warn('Failed to get cleanup info for job:', jobId, error);
    return null;
  }
}

export async function cleanupTranscriptionFiles(jobId: string): Promise<void> {
  try {
    // Get the audio file pathname from cleanup info
    const audioPathname = await getCleanupInfo(jobId);

    if (audioPathname) {
      // Delete both the audio file and cleanup file using pathnames
      await del([audioPathname, `transcribe-cleanup/${jobId}.txt`]);
      console.log('Cleaned up temporary files for job:', jobId);
    } else {
      console.warn('No cleanup info found for job:', jobId);
      // Still try to delete the cleanup file in case it exists but couldn't be read
      await del(`transcribe-cleanup/${jobId}.txt`);
    }
  } catch (error) {
    console.warn('Failed to cleanup temporary files for job:', jobId, error);
  }
}
