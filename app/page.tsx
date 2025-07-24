import ProjectList from '@/components/project-list';
import { Toaster } from '@/components/toaster';
import { getProjects } from '@/lib/data';
import { EvaluationProject } from '@/lib/models';
import Link from 'next/link';

export default async function Home() {
  const projects: EvaluationProject[] = await getProjects();
  const isEditable = process.env.UI_EDITABLE === 'true';

  return (
    <main className="min-h-screen p-6">
      <Toaster />

      {/* Top section with consistent layout */}
      <div className="w-full max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          {/* Empty left space for consistency */}
          <div className="w-20"></div>

          {/* Centered title */}
          <h1 className="text-2xl font-semibold text-black">ASR Evaluation</h1>

          {/* Empty right space for consistency */}
          <div className="w-20"></div>
        </div>
      </div>

      {/* Content section */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-black">Projects</h2>
          {isEditable && (
            <Link href="/projects/new" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Create New Project
            </Link>
          )}
        </div>
        <ProjectList initialProjects={projects} isEditable={isEditable} />
      </div>
    </main>
  )
}
