'use client'

import { Toaster } from '@/components/toaster';
import Uploader from '@/components/uploader';
import { EvaluationSample } from '@/lib/models';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

export default function NewSampleFileUploadPage(props: any) {
    const params: { projectId: string, sampleId: string } = use(props.params);
    const { projectId, sampleId } = params;
    const [sample, setSample] = useState<EvaluationSample | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchSample = async () => {
            const response = await fetch(`/api/samples/${sampleId}`);
            if (response.ok) {
                const fetchedSample = await response.json();
                setSample(fetchedSample);
            } else {
                alert('Failed to fetch sample');
            }
        };
        fetchSample();
    }, [sampleId]);

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
            <Toaster />
            <h1 className="text-4xl font-bold mb-8">Create New Sample</h1>
            <p className="text-lg mb-4">For project: {projectId}</p>
            {sample && (
                <div className="w-full max-w-4xl mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Upload Files for Sample: {sample.id}</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <h5 className="font-semibold">Audio</h5>
                            <Uploader sampleId={sample.id} fileType="audio" />
                        </div>
                        <div>
                            <h5 className="font-semibold">Reference Text</h5>
                            <Uploader sampleId={sample.id} fileType="reference" />
                        </div>
                        <div>
                            <h5 className="font-semibold">Hypothesis Text</h5>
                            <Uploader sampleId={sample.id} fileType="hypothesis" />
                        </div>
                    </div>
                    <button
                        onClick={() => router.push(`/projects/${projectId}`)}
                        className="mt-8 w-full max-w-md flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Done
                    </button>
                </div>
            )}
        </main>
    );
}
