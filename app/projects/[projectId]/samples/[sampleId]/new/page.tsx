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
    const [sampleName, setSampleName] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchSample = async () => {
            const response = await fetch(`/api/samples/${sampleId}`);
            if (response.ok) {
                const fetchedSample = await response.json();
                setSample(fetchedSample);
                setSampleName(fetchedSample.name || '');
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

    const handleNameUpdate = async () => {
        if (!sampleName.trim()) {
            alert('Please enter a name for the sample');
            return;
        }

        try {
            const response = await fetch(`/api/samples/${sampleId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: sampleName.trim() }),
            });
            if (!response.ok) {
                throw new Error('Failed to update sample name');
            }
            alert('Sample name updated successfully!');
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'An unknown error occurred.');
        }
    };

    return (
        <main className="min-h-screen p-6 bg-gradient-to-b from-gray-50 to-white">
            <Toaster />

            {/* Top section with consistent layout */}
            <div className="w-full max-w-4xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    {/* Back button on left */}
                    <button
                        onClick={() => router.push(`/projects/${projectId}`)}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Project
                    </button>

                    {/* Centered title */}
                    <h1 className="text-2xl font-semibold text-black">Create New Sample</h1>

                    {/* Empty right space for consistency */}
                    <div className="w-20"></div>
                </div>
            </div>

            {/* Content section */}
            {sample && (
                <div className="w-full max-w-4xl mx-auto">
                    <h2 className="text-xl font-medium mb-4 text-black">Upload Files for Sample: {sample.id}</h2>

                    {/* Sample Name Section */}
                    <div className="border p-4 rounded-lg mb-6">
                        <h5 className="font-medium mb-2 text-black">Sample Name</h5>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 p-2 border rounded-md"
                                placeholder="Enter sample name..."
                                value={sampleName}
                                onChange={(e) => setSampleName(e.target.value)}
                            />
                            <button
                                onClick={handleNameUpdate}
                                disabled={!sampleName.trim()}
                                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                            >
                                Save Name
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border p-4 rounded-lg">
                            <h5 className="font-medium mb-2 text-black">1. Upload Audio</h5>
                            <Uploader sampleId={sample.id} fileType="audio" />
                        </div>
                        <div className="border p-4 rounded-lg">
                            <h5 className="font-medium mb-2 text-black">2. Upload Data</h5>
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
