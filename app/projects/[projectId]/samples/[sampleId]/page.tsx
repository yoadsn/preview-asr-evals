import AlignmentVisualization from '@/components/alignment-visualization';
import SubstitutionsList from '@/components/substitutions-list';
import { getProjectById, getSampleById, getSamplesByName } from '@/lib/data';
import Link from 'next/link';
import { notFound } from 'next/navigation';


export default async function SamplePreviewPage({ params }: { params: Promise<{ sampleId: string, projectId: string }> }) {
    const { sampleId, projectId } = await params;
    const [sample, project] = await Promise.all([
        getSampleById(sampleId),
        getProjectById(projectId)
    ]);

    if (!sample) {
        notFound();
    }

    // Get samples with the same name from other projects
    const otherProjectSamples = sample.name
        ? await getSamplesByName(sample.name, projectId)
        : [];

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
                    <h1 className="text-2xl font-semibold text-black">
                        Sample: {sample.name || sample.id}
                    </h1>

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

                <div dir="rtl" className="border rounded-lg p-6 bg-white shadow-sm mb-8">
                    <h2 className="text-xl font-medium mb-4 text-black">Alignment Visualization</h2>
                    {sample.data?.alignment ? (
                        <div>
                            {/* Metrics Section */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-md border">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {(sample.data.alignment.wer * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">WER</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {sample.data.alignment.substitutions}
                                    </div>
                                    <div className="text-sm text-gray-600">Substitutions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {sample.data.alignment.deletions}
                                    </div>
                                    <div className="text-sm text-gray-600">Deletions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {sample.data.alignment.insertions}
                                    </div>
                                    <div className="text-sm text-gray-600">Insertions</div>
                                </div>
                            </div>

                            {/* Alignment Visualization */}
                            <AlignmentVisualization alignment={sample.data.alignment} />
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-md border text-gray-500">
                            Not available
                        </div>
                    )}
                </div>

                {/* Substitutions List Section */}
                {sample.data?.alignment && (
                    <SubstitutionsList alignment={sample.data.alignment} />
                )}

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

                {/* See On Other Projects Section */}
                {otherProjectSamples.length > 0 && (
                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-xl font-medium mb-4 text-black">See On Other Projects</h2>
                        <div className="space-y-4">
                            {otherProjectSamples.map(({ sample: otherSample, project: otherProject }) => (
                                <div key={`${otherProject.id}-${otherSample.id}`} className="border rounded-md p-4 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-black">{otherProject.name}</h3>
                                            {otherProject.description && (
                                                <p className="text-sm text-gray-600 mt-1">{otherProject.description}</p>
                                            )}
                                        </div>
                                        <Link
                                            href={`/projects/${otherProject.id}/samples/${otherSample.id}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            View Sample
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
