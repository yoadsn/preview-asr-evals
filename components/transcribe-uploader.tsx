'use client';

import { useState, useRef, DragEvent } from 'react';

interface TranscribeUploaderProps {
    onFileSelect: (file: File) => void;
}

export function TranscribeUploader({ onFileSelect }: TranscribeUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const file = files[0];
            if (isAudioFile(file)) {
                onFileSelect(file);
            } else {
                alert('Please select an audio file');
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const file = files[0];
            if (isAudioFile(file)) {
                onFileSelect(file);
            } else {
                alert('Please select an audio file');
            }
        }
    };

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

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
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
            />

            <div className="flex flex-col items-center">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                >
                    <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <div className="mt-4">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload
                        </span>{' '}
                        or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        MP3, WAV, AAC, OGG, WebM, FLAC, or M4A files
                    </p>
                </div>
            </div>
        </div>
    );
}
