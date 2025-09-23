'use client';

import { useEffect, useState } from 'react';

interface TranscribeProgressProps {
    jobId: string;
    trackingProgress: boolean;
    onStatusUpdateAction: (status: any) => void;
    onErrorAction: (error: string) => void;
}

export function TranscribeProgress({ jobId, trackingProgress, onStatusUpdateAction, onErrorAction }: TranscribeProgressProps) {
    const [currentStatus, setCurrentStatus] = useState<string>('IN_QUEUE');
    const [delayTime, setDelayTime] = useState<number | null>(null);
    const [executionTime, setExecutionTime] = useState<number | null>(null);
    const [reconnectCount, setReconnectCount] = useState<number>(0);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    const setupEventSource = () => {
        // Close existing EventSource if it exists
        if (eventSource) {
            console.log('Closing existing EventSource before creating new one');
            eventSource.close();
        }

        console.log(`Setting up EventSource (reconnect count: ${reconnectCount})`);
        const newEventSource = new EventSource(`/api/transcribe/stream/${jobId}`);

        newEventSource.onopen = () => {
            console.log('EventSource opened');
        }

        newEventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('SSE message:', data);
            } catch (error) {
                console.error('Failed to parse SSE message:', error);
            }
        };

        newEventSource.addEventListener('status', (event) => {
            try {
                const statusData = JSON.parse(event.data);

                // Check if this is a reconnect signal
                if (statusData.reconnect) {
                    console.log('Received reconnect signal in status event, triggering reconnection');
                    // Increment reconnect count to trigger new EventSource setup
                    setReconnectCount(prev => prev + 1);
                    // Don't update status - just trigger reconnection
                    return;
                }

                setCurrentStatus(statusData.status);
                setDelayTime(statusData.delayTime || null);
                setExecutionTime(statusData.executionTime || null);
                onStatusUpdateAction(statusData);
            } catch (error) {
                console.error('Failed to parse status data:', error);
                onErrorAction('Failed to parse status update');
            }
        });

        newEventSource.addEventListener('error', (event: MessageEvent) => {
            try {
                const errorData = JSON.parse(event.data);
                onErrorAction(errorData.error || 'Unknown error occurred');
            } catch (error) {
                onErrorAction('Failed to process error message');
            }
        });

        newEventSource.addEventListener('complete', (event) => {
            console.log('Received complete event, closing EventSource');
            newEventSource.close();
        });

        newEventSource.onerror = (event) => {
            console.error('SSE connection error:', event);
            onErrorAction('Connection to server lost');
            newEventSource.close();
        };

        setEventSource(newEventSource);

        return newEventSource;
    };

    useEffect(() => {
        if (!trackingProgress) {
            // Close EventSource when tracking stops
            if (eventSource) {
                console.log('Tracking stopped, closing EventSource');
                eventSource.close();
                setEventSource(null);
            }
            return;
        }

        const newEventSource = setupEventSource();

        return () => {
            console.log('useEffect cleanup, closing EventSource');
            newEventSource.close();
        };
    }, [jobId, trackingProgress, reconnectCount, onStatusUpdateAction, onErrorAction]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_QUEUE':
                return 'text-yellow-600';
            case 'RUNNING':
                return 'text-blue-600';
            case 'COMPLETED':
                return 'text-green-600';
            case 'FAILED':
                return 'text-red-600';
            case 'CANCELLED':
                return 'text-gray-600';
            case 'TIMED_OUT':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_QUEUE':
                return (
                    <svg className="animate-spin h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case 'RUNNING':
                return (
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case 'COMPLETED':
                return (
                    <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'FAILED':
            case 'TIMED_OUT':
                return (
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const formatTime = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-3">
                {getStatusIcon(currentStatus)}
                <span className={`font-medium ${getStatusColor(currentStatus)}`}>
                    {currentStatus.replace('_', ' ')}
                </span>
            </div>

            <div className="bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${currentStatus === 'COMPLETED'
                        ? 'bg-green-600 w-full'
                        : currentStatus === 'RUNNING'
                            ? 'bg-blue-600 w-3/4'
                            : currentStatus === 'IN_QUEUE'
                                ? 'bg-yellow-600 w-1/4'
                                : currentStatus === 'FAILED' || currentStatus === 'TIMED_OUT'
                                    ? 'bg-red-600 w-full'
                                    : 'bg-gray-400 w-1/4'
                        }`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Job ID:</span>
                    <p className="font-mono text-xs text-gray-700 break-all">{jobId}</p>
                </div>
                {reconnectCount > 0 && (
                    <div>
                        <span className="text-gray-500">Reconnections:</span>
                        <p className="font-medium text-gray-700">{reconnectCount}</p>
                    </div>
                )}
                {delayTime !== null && (
                    <div>
                        <span className="text-gray-500">Queue Time:</span>
                        <p className="font-medium text-gray-700">{formatTime(delayTime)}</p>
                    </div>
                )}
                {executionTime !== null && (
                    <div>
                        <span className="text-gray-500">Execution Time:</span>
                        <p className="font-medium text-gray-700">{formatTime(executionTime)}</p>
                    </div>
                )}
            </div>

            {currentStatus === 'IN_QUEUE' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                        Your transcription job is waiting in the queue. This may take a few moments depending on server load.
                    </p>
                </div>
            )}

            {currentStatus === 'RUNNING' && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                        Your audio file is being transcribed. Please wait...
                    </p>
                </div>
            )}
        </div>
    );
}
