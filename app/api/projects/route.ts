import { createProject, getProjects } from '@/lib/data';
import { NextResponse } from 'next/server';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const { name, description } = await request.json();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  const project = await createProject(name, description);
  return NextResponse.json(project, { status: 201 });
}
