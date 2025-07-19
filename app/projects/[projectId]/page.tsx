import { getProjectById, getSamplesByProjectId } from '@/lib/data';
import { EvaluationProject, EvaluationSample } from '@/lib/models';
import Link from 'next/link';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const { projectId } = await params;
    const project: EvaluationProject | undefined = await getProjectById(projectId);

    if (!project) {
        return (
            <main className="min-h-screen p-6">
                {/* Top section with consistent layout */}
                <div className="w-full max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between mb-6">
                        {/* Back button on left */}
                        <Link
                            href="/"
                            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                        >
                            ← Back to Projects
                        </Link>

                        {/* Centered title */}
                        <h1 className="text-2xl font-semibold text-black">Project not found</h1>

                        {/* Empty right space for consistency */}
                        <div className="w-20"></div>
                    </div>
                </div>
            </main>
        );
    }

    const samples: EvaluationSample[] = await getSamplesByProjectId(projectId);

    return (
        <main className="min-h-screen p-6">
            {/* Top section with consistent layout */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    {/* Back button on left */}
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Projects
                    </Link>

                    {/* Centered title */}
                    <h1 className="text-2xl font-semibold text-black">{project.name}</h1>

                    {/* Empty right space for consistency */}
                    <div className="w-20"></div>
                </div>

                {/* Project description */}
                {project.description && (
                    <p className="text-center text-gray-600 mb-4">{project.description}</p>
                )}
            </div>

            {/* Content section */}
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-medium text-black">Samples</h2>
                    <Link href={`/projects/${project.id}/samples/new`} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add New Sample
                    </Link>
                </div>
                <div className="space-y-4">
                    {samples.map((sample) => (
                        <div key={sample.id} className="p-4 border rounded-lg flex justify-between items-center">
                            <span className="font-medium text-black">{sample.id}</span>
                            <div className="flex space-x-2">
                                <Link href={`/projects/${project.id}/samples/${sample.id}/edit`} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                                    Edit
                                </Link>
                                <Link href={`/projects/${project.id}/samples/${sample.id}`} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
