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
        <main className="min-h-screen p-6">
            {/* Top section with consistent layout */}
            <div className="w-full max-w-6xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    {/* Back button on left */}
                    <Link
                        href={`/projects/${projectId}`}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Project
                    </Link>

                    {/* Centered title */}
                    <h1 className="text-2xl font-semibold text-black">Sample: {sample.id}</h1>

                    {/* Empty right space for consistency */}
                    <div className="w-20"></div>
                </div>
            </div>

            {/* Content section */}
            <div className="w-full max-w-6xl mx-auto">
                <div className="mb-8 border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-xl font-medium mb-4 text-black">Audio Sample</h2>
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
                        <h2 className="text-xl font-medium mb-4 text-black">Reference Text</h2>
                        <p dir="rtl" className="text-gray-800 bg-gray-50 p-4 rounded-md border min-h-[100px]">
                            {sample.data?.ref_text ?? 'Not available'}
                        </p>
                    </div>
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-xl font-medium mb-4 text-black">Hypothesis Text</h2>
                        <p dir="rtl" className="text-gray-800 bg-gray-50 p-4 rounded-md border min-h-[100px]">
                            {sample.data?.hyp_text ?? 'Not available'}
                        </p>
                    </div>
                </div>

                <div dir="rtl" className="border rounded-lg p-6 bg-white shadow-sm">
                    <h2 className="text-xl font-medium mb-4 text-black">Alignment Visualization</h2>
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
