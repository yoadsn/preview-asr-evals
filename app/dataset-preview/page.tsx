'use client';

import Link from 'next/link';
import Header from "@/components/header";
import { useEffect, useState } from 'react';

interface Dataset {
    id: string;
    name: string;
}

export default function DatasetPreview() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/datasets')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setDatasets(data);
                }
            })
            .catch(err => {
                setError('Failed to load datasets');
                console.error('Error loading datasets:', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Dataset Preview
                            </h1>
                            <p className="text-gray-600">
                                Browse Hugging Face datasets with audio playback and transcripts
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
                                <p className="text-gray-600">Loading datasets...</p>
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="grid gap-4">
                                {datasets.length === 0 ? (
                                    <p className="text-center text-gray-600">
                                        No datasets available
                                    </p>
                                ) : (
                                    datasets.map(dataset => (
                                        <Link
                                            key={dataset.id}
                                            href={`/dataset-preview/${dataset.id}`}
                                            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-blue-500"
                                        >
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                {dataset.name}
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                Dataset ID: {dataset.id}
                                            </p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                Click to browse samples →
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
