import { getProjectById, getSampleById } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getTextFileContent(uri: string | null) {
    if (!uri) return null;
    try {
        const response = await fetch(uri);
        if (!response.ok) return `Error fetching content: ${response.statusText}`;
        return await response.text();
    } catch (error) {
        return `Error fetching content: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
}

export default async function SamplePreviewPage({ params }: { params: { sampleId: string, projectId: string } }) {
    const { sampleId, projectId } = await params;
    const [sample, project] = await Promise.all([
        getSampleById(sampleId),
        getProjectById(projectId)
    ]);

    if (!sample) {
        notFound();
    }

    const [referenceText, hypothesisText] = await Promise.all([
        getTextFileContent(sample.referenceTextUri),
        getTextFileContent(sample.hypothesisTextUri),
    ]);

    return (
        <main className="relative flex min-h-screen flex-col items-center p-24">
            <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
                <h1 className="text-4xl font-bold">Sample Preview: {sample.id}</h1>
                <Link
                    href={`/projects/${projectId}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                    ← Back to Project
                </Link>
            </div>

            <div className="w-full max-w-4xl mb-8 text-sm text-gray-500">
                <p>Created: {new Date(sample.createdAt).toLocaleString()}</p>
                <p>Last Updated: {new Date(sample.updatedAt).toLocaleString()}</p>
                {sample.metadata && (
                    <div className="mt-2">
                        <h3 className="font-semibold">Metadata:</h3>
                        <pre className="bg-gray-50 p-2 rounded-md mt-1">
                            {JSON.stringify(sample.metadata, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
            <div className="w-full max-w-6xl">
                <div className="mb-8 border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-purple-600">Audio Sample</h2>
                    {sample.audioUri ? (
                        <div className="bg-gray-50 p-4 rounded-md border">
                            <audio
                                controls
                                src={sample.audioUri}
                                className="w-full"
                                preload="metadata"
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-md border text-gray-500">
                            No audio available
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-8">
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Reference Text</h2>
                        <pre className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap min-h-[200px] border">{referenceText || 'Not available'}</pre>
                    </div>
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-green-600">Hypothesis Text</h2>
                        <pre className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap min-h-[200px] border">{hypothesisText || 'Not available'}</pre>
                    </div>
                </div>
            </div>
        </main>
    );
}
