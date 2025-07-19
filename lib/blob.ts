import { put } from '@vercel/blob';
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
