'use client';

import Link from 'next/link';
import Header from "@/components/header";
import { useEffect, useState, useMemo, use } from 'react';

interface Sample {
    id: string;
    name: string;
    metadata?: Record<string, any>;
}

export default function DatasetSamples({ params }: { params: Promise<{ datasetId: string }> }) {
    const [samples, setSamples] = useState<Sample[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

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

    // Filter samples based on search term
    const filteredSamples = useMemo(() => {
        if (!searchTerm.trim()) return samples;
        return samples.filter(sample =>
            (sample.name || sample.id).toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [samples, searchTerm]);

    // Pagination logic
    const samplesPerPage = 20;
    const totalPages = Math.ceil(filteredSamples.length / samplesPerPage);

    const paginatedSamples = useMemo(() => {
        const startIndex = (currentPage - 1) * samplesPerPage;
        return filteredSamples.slice(startIndex, startIndex + samplesPerPage);
    }, [filteredSamples, currentPage]);

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

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
                            <div>
                                {/* Search and pagination info */}
                                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex-1 max-w-md">
                                                <input
                                                    type="text"
                                                    placeholder="Search samples by name..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => setSearchTerm('')}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        title="Clear search"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-4">
                                        <span>
                                            {filteredSamples.length} sample{filteredSamples.length !== 1 ? 's' : ''} total
                                        </span>
                                        {totalPages > 1 && (
                                            <span>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Samples grid */}
                                <div className="grid gap-4 mb-6">
                                    {samples.length === 0 ? (
                                        <p className="text-center text-gray-600">
                                            No samples available
                                        </p>
                                    ) : paginatedSamples.length === 0 ? (
                                        <p className="text-center text-gray-600">
                                            No samples found matching "{searchTerm}"
                                        </p>
                                    ) : (
                                        paginatedSamples.map(sample => (
                                            <Link
                                                key={sample.id}
                                                href={`/dataset-preview/${datasetId}/${sample.id}`}
                                                className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 border-green-500"
                                            >
                                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {sample.name || sample.id}
                                                </h2>

                                                {/* Display manifest metadata */}
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                    {sample.metadata?.quality_score !== undefined && sample.metadata.quality_score !== null && (
                                                        <span>Quality: {sample.metadata.quality_score}%</span>
                                                    )}
                                                    {sample.metadata?.duration !== undefined && sample.metadata.duration !== null && (
                                                        <span>Duration: {sample.metadata.duration}s</span>
                                                    )}
                                                    {sample.metadata?.avg_words_per_minute !== undefined && sample.metadata.avg_words_per_minute !== null && (
                                                        <span>WPM: {sample.metadata.avg_words_per_minute}</span>
                                                    )}
                                                    {sample.metadata?.word_count !== undefined && sample.metadata.word_count !== null && (
                                                        <span>Words: {sample.metadata.word_count}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-end mt-2">
                                                    <span className="text-gray-400 text-xl">→</span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>

                                {/* Pagination controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                First
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(totalPages)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Last
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
