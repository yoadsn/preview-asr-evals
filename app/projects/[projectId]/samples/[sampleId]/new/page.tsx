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
    const [jsonData, setJsonData] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSample = async () => {
            const response = await fetch(`/api/samples/${sampleId}`);
            if (response.ok) {
                const fetchedSample = await response.json();
                setSample(fetchedSample);
                if (fetchedSample.data) {
                    setJsonData(JSON.stringify(fetchedSample.data, null, 2));
                }
            } else {
                alert('Failed to fetch sample');
            }
        };
        fetchSample();
    }, [sampleId]);

    const handleDataUpload = async () => {
        setIsUploading(true);
        try {
            const data = JSON.parse(jsonData);
            const response = await fetch(`/api/samples/${sampleId}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data }),
            });
            if (!response.ok) {
                throw new Error('Failed to upload data');
            }
            alert('Data uploaded successfully!');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
            <Toaster />
            <h1 className="text-4xl font-bold mb-8">Create New Sample</h1>
            <p className="text-lg mb-4">For project: {projectId}</p>
            {sample && (
                <div className="w-full max-w-4xl mt-8">
                    <h2 className="text-2xl font-semibold mb-4">Upload Files for Sample: {sample.id}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border p-4 rounded-lg">
                            <h5 className="font-semibold mb-2">1. Upload Audio</h5>
                            <Uploader sampleId={sample.id} fileType="audio" />
                        </div>
                        <div className="border p-4 rounded-lg">
                            <h5 className="font-semibold mb-2">2. Upload Data</h5>
                            <p className="text-sm text-gray-500 mb-2">Paste the JSON data for this sample below.</p>
                            <textarea
                                className="w-full p-2 border rounded-md font-mono"
                                rows={10}
                                placeholder='{ "reference": "...", "hypothesis": "..." }'
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                disabled={isUploading}
                            />
                            <button
                                onClick={handleDataUpload}
                                disabled={isUploading || !jsonData}
                                className="mt-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                {isUploading ? 'Uploading...' : 'Upload Data'}
                            </button>
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
