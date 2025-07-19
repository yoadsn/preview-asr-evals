import Project from '@/components/project';
import { Toaster } from '@/components/toaster';
import { getProjects } from '@/lib/data';
import { EvaluationProject } from '@/lib/models';
import Link from 'next/link';

export default async function Home() {
  const projects: EvaluationProject[] = await getProjects();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
      <Toaster />
      <h1 className="text-4xl font-bold mb-8">ASR Evaluation</h1>
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <Link href="/projects/new" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create New Project
          </Link>
        </div>
        {projects.map((project) => (
          <Project key={project.id} project={project} />
        ))}
      </div>
    </main>
  )
}
