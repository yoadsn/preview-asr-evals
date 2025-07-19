import AlignmentVisualization from '@/components/alignment-visualization';
import { getProjectById, getSampleById } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';


export default async function SamplePreviewPage({ params }: { params: { sampleId: string, projectId: string } }) {
    const { sampleId, projectId } = await params;
    const [sample, project] = await Promise.all([
        getSampleById(sampleId),
        getProjectById(projectId)
    ]);

    if (!sample) {
        notFound();
    }

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-blue-600">Reference Text</h2>
                        <p dir="rtl" className="text-gray-800 bg-gray-50 p-4 rounded-md border min-h-[100px]">
                            {sample.data?.ref_text ?? 'Not available'}
                        </p>
                    </div>
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4 text-green-600">Hypothesis Text</h2>
                        <p dir="rtl" className="text-gray-800 bg-gray-50 p-4 rounded-md border min-h-[100px]">
                            {sample.data?.hyp_text ?? 'Not available'}
                        </p>
                    </div>
                </div>

                <div dir="rtl" className="border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-600">Alignment Visualization</h2>
                    {sample.data?.alignment ? (
                        <AlignmentVisualization alignment={sample.data.alignment} />
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-md border text-gray-500">
                            Not available
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
