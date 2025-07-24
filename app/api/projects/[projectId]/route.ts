import { getProjectById, getSamplesByProjectId, deleteProject } from '@/lib/data';
import { del } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  return NextResponse.json(project);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  // Check if project exists first
  const project = await getProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  
  // Get all samples to retrieve audio URIs for blob cleanup
  const samples = await getSamplesByProjectId(projectId);
  const audioUris = samples
    .map(sample => sample.audioUri)
    .filter((uri): uri is string => uri !== null);
  
  // Delete the project and its samples from the database
  await deleteProject(projectId);
  
  // Clean up audio blobs from storage
  if (audioUris.length > 0) {
    try {
      await Promise.all(audioUris.map(uri => del(uri)));
    } catch (error) {
      console.error('Failed to delete some audio blobs:', error);
      // Note: We don't fail the entire operation if blob cleanup fails
    }
  }
  
  return NextResponse.json({ message: 'Project deleted successfully' });
}
