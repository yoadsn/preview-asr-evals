'use client';

import Link from 'next/link';
import Header from "@/components/header";
import { useEffect, useState, use } from 'react';

interface Sample {
    id: string;
    name: string;
    metadata?: Record<string, any>;
}

export default function DatasetSamples({ params }: { params: Promise<{ datasetId: string }> }) {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { datasetId } = use(params);

    useEffect(() => {
        fetch(`/api/datasets/${datasetId}/samples`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setSamples(data);
                }
            })
            .catch(err => {
                setError('Failed to load samples');
                console.error('Error loading samples:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [datasetId]);

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
                                ← Back to Datasets
                            </button>

                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Dataset: {datasetId}
                            </h1>
                            <p className="text-gray-600">
                                Browse audio samples and transcripts
                            </p>
                        </div>

                        {error && (
                            <div className="text-center">
                                <p className="text-red-600 bg-red-50 p-4 rounded-lg">
                                    Error: {error}
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center">
                                <p className="text-gray-600">Loading samples...</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="grid gap-4">
                                {samples.length === 0 ? (
                                    <p className="text-center text-gray-600">
                                        No samples available
                                    </p>
                                ) : (
                                    samples.map(sample => (
                                        <Link
                                            key={sample.id}
                                            href={`/dataset-preview/${datasetId}/${sample.id}`}
                                            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500"
                                        >
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                {sample.name || sample.id}
                                            </h2>
                                            <p className="text-sm text-green-600 mt-1">
                                                Click to listen and view transcript →
                                            </p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
