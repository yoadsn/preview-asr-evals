'use client';

import { useState } from 'react';

interface Segment {
    start: number;
    end: number;
    text: string;
    extra_data: {
        avg_logprob: number;
    };
}

interface TranscribeResultsProps {
    result: {
        delayTime?: number;
        executionTime?: number;
        id: string;
        output?: Segment[];
        status: string;
        error?: any;
    };
    segments: any[];
}

type ViewMode = 'text' | 'vtt';// | 'json';

export function TranscribeResults({ result, segments }: TranscribeResultsProps) {
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('text');

    const getContentToCopy = () => {
        if (!segments || !Array.isArray(segments)) {
            return JSON.stringify(result, null, 2);
        }

        switch (viewMode) {
            case 'text':
                return segments.map(segment => segment.text).join('\n');
            case 'vtt':
                return generateVTT(segments);
            default:
                return JSON.stringify(result, null, 2);
        }
    };

    const handleCopy = async () => {
        try {
            const textToCopy = getContentToCopy();
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const hoursStr = hours.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        const secsStr = secs.toFixed(3).padStart(6, '0');

        return `${hoursStr}:${minutesStr}:${secsStr}`;
    };

    const generateVTT = (segments: Segment[]): string => {
        let vtt = 'WEBVTT\n\n';
        segments.forEach((segment, index) => {
            const startTime = formatTime(segment.start);
            const endTime = formatTime(segment.end);
            vtt += `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n\n`;
        });
        return vtt;
    };

    const getConfidenceColor = (confidenceProb: number): string => {
        // Interpolate between green (good) and red (bad)
        const red = Math.round(255 * (1 - confidenceProb));
        const green = Math.round(255 * confidenceProb);

        return `rgba(${red}, ${green}, 0, 0.2)`;
    };

    const getConfidenceLogProbColor = (avgLogprob: number): string => {
        // Map avg_logprob from 0 (green) to -10 (red)
        // Clamp the value between -10 and 0
        const confidenceProb = Math.exp(avgLogprob);

        return getConfidenceColor(confidenceProb);
    }

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const isCompleted = result.status === 'COMPLETED';

    return (
        <div className="space-y-6">
            {/* Performance Metrics */}
            {isCompleted && (result.delayTime !== undefined || result.executionTime !== undefined) && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                    {result.delayTime !== undefined && (
                        <div>
                            <span className="text-sm text-gray-500">Queue Time:</span>
                            <p className="font-medium text-gray-700">{formatDuration(result.delayTime)}</p>
                        </div>
                    )}
                    {result.executionTime !== undefined && (
                        <div>
                            <span className="text-sm text-gray-500">Processing Time:</span>
                            <p className="font-medium text-gray-700">{formatDuration(result.executionTime)}</p>
                        </div>
                    )}
                </div>
            )}

            {/* View Mode Selector */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                        Transcription Output
                    </label>
                    <div className="flex items-center space-x-2">
                        <div className="flex rounded-md shadow-sm">
                            <button
                                onClick={() => setViewMode('text')}
                                className={`px-3 py-1 text-xs font-medium rounded-l-md border ${viewMode === 'text'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                Text
                            </button>
                            <button
                                onClick={() => setViewMode('vtt')}
                                className={`px-3 py-1 text-xs font-medium border-t border-b ${viewMode === 'vtt'
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                VTT
                            </button>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            {copied ? (
                                <>
                                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Render based on view mode */}
                {segments && Array.isArray(segments) ? (
                    <>
                        {viewMode === 'text' && (
                            <div className="space-y-1 p-4 border border-gray-300 rounded-md bg-white max-h-96 overflow-y-auto divide-solid divide-black divide-x-2" dir="rtl">
                                {segments.map((segment, index) => (
                                    <span
                                        key={index}
                                        className="rounded text-sm px-0.5"
                                        style={{
                                            backgroundColor: getConfidenceLogProbColor(segment.extra_data.avg_logprob),
                                        }}
                                    >
                                        {segment.text}
                                    </span>
                                ))}
                            </div>
                        )}

                        {viewMode === 'vtt' && (
                            <div className="space-y-2 p-4 border border-gray-300 rounded-md bg-white max-h-96 overflow-y-auto" dir="rtl">
                                <div className="text-xs font-medium text-gray-500 mb-2">WEBVTT</div>
                                {segments.map((segment, index) => (
                                    <div key={index} className="mb-4">
                                        <div className="text-xs text-gray-600 font-mono">
                                            {index + 1}
                                        </div>
                                        <div className="text-xs text-gray-600 font-mono">
                                            {formatTime(segment.start)} --{'>'}  {formatTime(segment.end)}
                                        </div>
                                        <div
                                            className="text-sm p-2 rounded mt-1"
                                            style={{
                                                backgroundColor: getConfidenceLogProbColor(segment.extra_data.avg_logprob),
                                            }}
                                        >
                                            {segment.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <textarea
                        value={result.output ? JSON.stringify(result.output, null, 2) : ''}
                        readOnly
                        className="w-full h-96 p-4 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                        placeholder="Transcription results will appear here..."
                    />
                )}
            </div>

            {/* Confidence Legend */}
            {isCompleted && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Confidence Level</h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: getConfidenceColor(1) }}
                            />
                            <span>High (1.0)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: getConfidenceColor(0.5) }}
                            />
                            <span>Medium (0.5)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: getConfidenceColor(0) }}
                            />
                            <span>Low (0.0)</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
