import { getProjectById, getSamplesByProjectId } from '@/lib/data';
import { EvaluationProject, EvaluationSample } from '@/lib/models';
import Link from 'next/link';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
    const { projectId } = await params;
    const project: EvaluationProject | undefined = await getProjectById(projectId);

    if (!project) {
        return (
            <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
                <h1 className="text-4xl font-bold">Project not found</h1>
            </main>
        );
    }

    const samples: EvaluationSample[] = await getSamplesByProjectId(projectId);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">{project.name}</h1>
            <p className="text-lg mb-4">{project.description}</p>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Samples</h2>
                    <Link href={`/projects/${project.id}/samples/new`} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Add New Sample
                    </Link>
                </div>
                {samples.map((sample) => (
                    <div key={sample.id} className="mt-4 p-4 border rounded-lg flex justify-between items-center">
                        <span className="font-semibold">{sample.id}</span>
                        <Link href={`/projects/${project.id}/samples/${sample.id}`} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
