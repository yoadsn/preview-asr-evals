'use client';

import { useState, useRef, DragEvent } from 'react';
import { upload } from '@vercel/blob/client';
import { nanoid } from 'nanoid';

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface TranscribeUploaderDirectProps {
    onUploadComplete: (audioUrl: string) => void;
    onUploadError: (error: string) => void;
    disabled?: boolean;
}

export function TranscribeUploaderDirect({ 
    onUploadComplete, 
    onUploadError,
    disabled = false 
}: TranscribeUploaderDirectProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAudioFile = (file: File): boolean => {
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/x-wav',
            'audio/x-pn-wav',
            'audio/wave',
            'audio/aac',
            'audio/x-aac',
            'audio/ogg',
            'audio/webm',
            'audio/flac',
            'audio/m4a',
            'audio/mp4',
            'audio/x-m4a',
        ];
        return allowedTypes.includes(file.type);
    };

    const uploadFile = async (file: File) => {
        if (!isAudioFile(file)) {
            onUploadError('Please select a valid audio file');
            return;
        }

        setIsUploading(true);
        setUploadProgress(null);

        try {
            // Generate unique filename with transcribe prefix
            const filename = `transcribe/${nanoid()}-${file.name}`;

            // Upload directly to Vercel Blob using client upload
            const blob = await upload(filename, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
                multipart: true,
                onUploadProgress: (progress) => {
                    setUploadProgress(progress);
                },
            });

            onUploadComplete(blob.url);
            
        } catch (error) {
            console.error('Upload error:', error);
            onUploadError((error as Error).message);
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled && !isUploading) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled || isUploading) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled || isUploading) return;

        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleClick = () => {
        if (!disabled && !isUploading) {
            fileInputRef.current?.click();
        }
    };

    const getStatusColor = () => {
        if (disabled) return 'border-gray-200 bg-gray-50';
        if (isUploading) return 'border-blue-400 bg-blue-50';
        if (isDragOver) return 'border-green-400 bg-green-50';
        return 'border-gray-300 hover:border-gray-400';
    };

    const getCursorClass = () => {
        if (disabled || isUploading) return 'cursor-not-allowed';
        return 'cursor-pointer';
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${getStatusColor()} ${getCursorClass()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || isUploading}
            />

            <div className="flex flex-col items-center">
                <svg
                    className={`mx-auto h-12 w-12 ${isUploading ? 'text-blue-500' : 'text-gray-400'}`}
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                >
                    {isUploading ? (
                        <circle
                            cx="24"
                            cy="24"
                            r="10"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="animate-spin"
                            fill="none"
                            strokeDasharray="31.416"
                            strokeDashoffset="15.708"
                        />
                    ) : (
                        <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}
                </svg>
                
                <div className="mt-4">
                    {isUploading ? (
                        <div>
                            <p className="text-sm text-blue-600 font-medium">
                                Uploading...
                            </p>
                            {uploadProgress && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${uploadProgress.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {uploadProgress.percentage.toFixed(1)}% • {(uploadProgress.loaded / 1024 / 1024).toFixed(1)} MB of {(uploadProgress.total / 1024 / 1024).toFixed(1)} MB
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-600">
                                <span className={`font-medium ${disabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-500'}`}>
                                    Click to upload
                                </span>{' '}
                                or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                MP3, WAV, AAC, OGG, WebM, FLAC, or M4A files
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}