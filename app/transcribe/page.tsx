'use client';

import { useState, useRef, useCallback } from 'react';
import { TranscribeUploaderDirect } from '@/components/transcribe-uploader-direct';
import { TranscribeProgress } from '@/components/transcribe-progress';
import { TranscribeResults } from '@/components/transcribe-results';
import Header from '@/components/header';

interface TranscriptionJob {
    jobId: string;
    status: string;
    audioUrl: string;
}

interface TranscriptionStreamResult {
    output: any;
}

interface TranscriptionResult {
    delayTime?: number;
    executionTime?: number;
    id: string;
    output?: any;
    stream?: TranscriptionStreamResult[];
    status: string;
    error?: any;
}

export default function TranscribePage() {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [job, setJob] = useState<TranscriptionJob | null>(null);
    const [result, setResult] = useState<TranscriptionResult | null>(null);
    const [segments, setSegments] = useState<Array<any>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUploadComplete = (url: string) => {
        setAudioUrl(url);
        setJob(null);
        setResult(null);
        setError(null);
    };

    const handleUploadError = (errorMessage: string) => {
        setError(errorMessage);
        setAudioUrl(null);
    };

    const handleTranscribe = async () => {
        if (!audioUrl) return;

        setSegments([]);
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/transcribe/submit-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioUrl }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit transcription job');
            }

            const jobData = await response.json();
            setJob(jobData);

        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = useCallback((statusData: TranscriptionResult) => {
        setResult(statusData);
        setSegments(currSegments => [...currSegments, ...statusData.stream!.map(result => result.output)]);
    }, []);

    const handleError = useCallback((errorMessage: string) => {
        setError(errorMessage);
        setSegments([]);
    }, []);

    const handleReset = () => {
        setAudioUrl(null);
        setJob(null);
        setResult(null);
        setError(null);
    };

    const trackingProgress = result?.status !== 'COMPLETED' && result?.status !== 'FAILED';

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">
                            Audio Transcription
                        </h1>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File Upload Section */}
                        {!job && (
                            <div className="bg-white shadow rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Upload Audio File
                                </h2>
                                <TranscribeUploaderDirect
                                    onUploadComplete={handleUploadComplete}
                                    onUploadError={handleUploadError}
                                    disabled={isSubmitting}
                                />

                                {audioUrl && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                        <p className="text-sm text-gray-600">
                                            ✅ <span className="font-medium">File uploaded successfully</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Ready for transcription
                                        </p>

                                        <button
                                            onClick={handleTranscribe}
                                            disabled={isSubmitting}
                                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Starting transcription...
                                                </>
                                            ) : (
                                                'Start Transcription'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Progress Section */}
                        {job && (
                            <div className="bg-white shadow rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Transcription Progress
                                    </h2>
                                    <button
                                        onClick={handleReset}
                                        className="text-sm text-gray-500 hover:text-gray-700"
                                    >
                                        Start New Transcription
                                    </button>
                                </div>
                                <TranscribeProgress
                                    jobId={job.jobId}
                                    trackingProgress={trackingProgress}
                                    onStatusUpdateAction={handleStatusUpdate}
                                    onErrorAction={handleError}
                                />
                            </div>
                        )}

                        {/* Results Section */}
                        {result && ['COMPLETED', 'IN_PROGRESS', 'FAILED'].includes(result.status) && segments && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    Transcription Results
                                </h2>
                                <TranscribeResults result={result} segments={segments} />
                            </div>
                        )}

                        {/* Failed Result */}
                        {result && result.status === 'FAILED' && (
                            <div className="bg-white shadow rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-red-900 mb-4">
                                    Transcription Failed
                                </h2>
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-800">
                                        The transcription job failed. Please try again with a different audio file.
                                    </p>
                                    {result.error && (
                                        <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                                            {JSON.stringify(result.error, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
