'use client';

import Header from "@/components/header";
import SyncedTranscriptViewer from "@/components/synced-transcript-viewer";
import { useEffect, useState, useRef, useCallback, use } from 'react';
import { TranscriptSegment, TransientWordInfo } from "@/lib/transcript-utils";

export default function SampleViewer({ params }: { params: Promise<{ datasetId: string; sampleId: string }> }) {
    const [transcript, setTranscript] = useState<{ segments: TranscriptSegment[] } | null>(null);
    const [transcriptError, setTranscriptError] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const { datasetId, sampleId } = use(params);

    useEffect(() => {
        // Load transcript as JSON
        fetch(`/api/datasets/${datasetId}/samples/${sampleId}/transcript`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.error) {
                    setTranscriptError(data.error);
                } else if (data.segments) {
                    setTranscript(data);
                } else {
                    setTranscriptError('Invalid transcript format');
                }
            })
            .catch(err => {
                setTranscriptError('Failed to load transcript');
                console.error('Error loading transcript:', err);
            });

        // Set audio URL
        setAudioUrl(`/api/datasets/${datasetId}/samples/${sampleId}/audio`);
    }, [datasetId, sampleId]);

    const handleTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, []);

    const handlePlayPause = useCallback(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    }, [isPlaying]);

    const handleSeek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const handleAudioPlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handleAudioPause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleWordClick = useCallback((wordInfo: TransientWordInfo) => {
        if (wordInfo.word) {
            handleSeek(wordInfo.word.start);
        }
    }, [handleSeek]);

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
                                ref={audioRef}
                                controls
                                className="w-full"
                                preload="none"
                                onTimeUpdate={handleTimeUpdate}
                                onPlay={handleAudioPlay}
                                onPause={handleAudioPause}
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
                                {transcript && (
                                    <span className="text-sm text-gray-500 ml-2">
                                        · {transcript.segments.length} segments
                                    </span>
                                )}
                            </h2>

                            {transcriptError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">
                                        Error loading transcript: {transcriptError}
                                    </p>
                                </div>
                            )}

                            {!transcript && !transcriptError && (
                                <div className="flex items-center justify-center h-96 text-gray-500">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        Loading transcript...
                                    </div>
                                </div>
                            )}

                            {transcript && (
                                <SyncedTranscriptViewer
                                    transcript={transcript}
                                    audioRef={audioRef}
                                    onWordClick={handleWordClick}
                                    className="max-h-96 overflow-y-auto"
                                />
                            )}

                            <div className="mt-4 text-xs text-gray-500 border-t pt-4">
                                💡 Tip: Click any word to jump to that timestamp, or right-click to seek instantly
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
