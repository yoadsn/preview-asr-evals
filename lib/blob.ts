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

export async function cleanupOrphanedTranscriptionFiles(): Promise<{ deletedCount: number; errors: string[] }> {
  const errors: string[] = [];
  let deletedCount = 0;
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  try {
    console.log('Starting cleanup of orphaned transcription files older than', threeHoursAgo.toISOString());

    // Get all transcribe audio files
    const { blobs: audioBlobs } = await list({
      prefix: 'transcribe/',
      limit: 1000 // Adjust if needed
    });

    // Get all cleanup tracking files
    const { blobs: cleanupBlobs } = await list({
      prefix: 'transcribe-cleanup/',
      limit: 1000 // Adjust if needed
    });

    // Filter files older than 3 hours
    const oldAudioFiles = audioBlobs.filter(blob => new Date(blob.uploadedAt) < threeHoursAgo);
    const oldCleanupFiles = cleanupBlobs.filter(blob => new Date(blob.uploadedAt) < threeHoursAgo);

    console.log(`Found ${oldAudioFiles.length} old audio files and ${oldCleanupFiles.length} old cleanup files`);

    // Prepare arrays of pathnames for batch deletion
    const audioPathnames = oldAudioFiles.map(blob => blob.pathname);
    const cleanupPathnames = oldCleanupFiles.map(blob => blob.pathname);
    const allPathnames = [...audioPathnames, ...cleanupPathnames];

    if (allPathnames.length === 0) {
      console.log('No orphaned files found to clean up');
      return { deletedCount: 0, errors: [] };
    }

    // Delete files in batches (Vercel Blob supports batch deletion)
    try {
      await del(allPathnames);
      deletedCount = allPathnames.length;
      console.log(`Successfully deleted ${deletedCount} orphaned files`);
    } catch (deleteError) {
      const errorMsg = `Failed to delete batch of ${allPathnames.length} files: ${(deleteError as Error).message}`;
      errors.push(errorMsg);
      console.error(errorMsg);

      // Try individual deletions as fallback
      for (const pathname of allPathnames) {
        try {
          await del(pathname);
          deletedCount++;
        } catch (individualError) {
          const individualErrorMsg = `Failed to delete ${pathname}: ${(individualError as Error).message}`;
          errors.push(individualErrorMsg);
          console.warn(individualErrorMsg);
        }
      }
    }

  } catch (error) {
    const listErrorMsg = `Failed to list orphaned files: ${(error as Error).message}`;
    errors.push(listErrorMsg);
    console.error(listErrorMsg);
  }

  return { deletedCount, errors };
}
