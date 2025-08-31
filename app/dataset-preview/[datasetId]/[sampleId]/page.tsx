'use client';

import Header from "@/components/header";
import { useEffect, useState, use } from 'react';

export default function SampleViewer({ params }: { params: Promise<{ datasetId: string; sampleId: string }> }) {
    const [transcript, setTranscript] = useState<string>('Loading transcript...');
    const [transcriptError, setTranscriptError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');

    const { datasetId, sampleId } = use(params);

    useEffect(() => {
        // Load transcript
        fetch(`/api/datasets/${datasetId}/samples/${sampleId}/transcript`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setTranscriptError(data.error);
                    setTranscript('Failed to load transcript');
                } else {
                    // Format the JSON response nicely
                    setTranscript(JSON.stringify(data, null, 2));
                }
            })
            .catch(err => {
                setTranscriptError('Failed to load transcript');
                setTranscript('Error: Failed to load transcript');
                console.error('Error loading transcript:', err);
            });

        // Set audio URL
        setAudioUrl(`/api/datasets/${datasetId}/samples/${sampleId}/audio`);
    }, [datasetId, sampleId]);

    const goBack = () => {
        window.history.back();
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <button
                                onClick={goBack}
                                className="mb-4 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                ← Back to Samples
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Sample: {sampleId}
                            </h1>
                            <p className="text-gray-600">
                                Dataset: {datasetId}
                            </p>
                        </div>

                        {/* Audio Player Section */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Audio Playback
                            </h2>

                            {audioUrl && <audio
                                controls
                                className="w-full"
                                preload="none"
                                style={{ maxWidth: '100%' }}
                            >
                                <source src={audioUrl} />
                                Your browser does not support the audio element.
                            </audio>}

                            <p className="text-sm text-gray-600 mt-2">
                                Audio file from dataset {datasetId}, sample {sampleId}
                            </p>
                        </div>

                        {/* Transcript Section */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Transcript
                            </h2>

                            {transcriptError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">
                                        Error loading transcript: {transcriptError}
                                    </p>
                                </div>
                            )}

                            <textarea
                                value={transcript}
                                readOnly
                                className="w-full h-96 p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm resize-none"
                                style={{ minHeight: '384px' }}
                                placeholder="Transcript will be loaded here..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
