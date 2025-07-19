'use client'

import { upload } from '@vercel/blob/client'
import { useState, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import ProgressBar from './progress-bar'

interface UploaderProps {
  sampleId: string;
  fileType: 'audio' | 'reference' | 'hypothesis';
}

export default function Uploader({ sampleId, fileType }: UploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  function reset() {
    setIsUploading(false)
    setFile(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)

    if (file) {
      try {
        const sample_folder_based_filename = `${sampleId}/${file.name}`;
        const blob = await upload(sample_folder_based_filename, file, {
          access: 'public',
          handleUploadUrl: `/api/samples/${sampleId}/upload-token`,
          onUploadProgress: (progressEvent) => {
            setProgress(progressEvent.percentage)
          },
        });

        const response = await fetch(`/api/samples/${sampleId}/${fileType}-uploaded`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: blob.url }),
        });

        if (!response.ok) {
          throw new Error('Failed to notify server of upload completion');
        }

        toast.success('File uploaded successfully!');
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          throw error
        }
      }

      reset()
    }
  }

  function handleFileChange(file: File) {
    toast.dismiss()

    const acceptedTypes = {
      audio: ['audio/mpeg', 'audio/wav'],
      reference: ['text/plain'],
      hypothesis: ['text/plain'],
    };

    if (!acceptedTypes[fileType].includes(file.type)) {
      toast.error(`Invalid file type. Please upload one of: ${acceptedTypes[fileType].join(', ')}`);
      return;
    }

    if (file.size / 1024 / 1024 > 50) {
      toast.error('File size too big (max 50MB)')
      return
    }

    setFile(file)
  }

  return (
    <form className="grid gap-6" onSubmit={handleSubmit}>
      <div>
        <div className="space-y-1 mb-4">
          <h2 className="text-xl font-semibold">Upload {fileType}</h2>
        </div>
        <label
          htmlFor={`${fileType}-upload`}
          className="group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
        >
          <div
            className="absolute z-[5] h-full w-full rounded-md"
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(false)
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(false)

              const file = e.dataTransfer?.files?.[0]
              if (file) {
                handleFileChange(file)
              }
            }}
          />
          <div
            className={`${dragActive ? 'border-2 border-black' : ''
              } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all bg-white opacity-100 hover:bg-gray-50`}
          >
            <svg
              className={`${dragActive ? 'scale-110' : 'scale-100'
                } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Upload icon</title>
              <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
              <path d="M12 12v9" />
              <path d="m16 16-4-4-4 4" />
            </svg>
            <p className="mt-2 text-center text-sm text-gray-500">
              Drag and drop or click to upload.
            </p>
            <p className="mt-2 text-center text-sm text-gray-500">
              Max file size: 50MB
            </p>
            <span className="sr-only">{fileType} upload</span>
          </div>
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            id={`${fileType}-upload`}
            name={fileType}
            type="file"
            accept={fileType === 'audio' ? 'audio/*' : 'text/plain'}
            className="sr-only"
            onChange={(event) => {
              const file = event.currentTarget?.files?.[0]
              if (file) {
                handleFileChange(file)
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {isUploading && <ProgressBar value={progress} />}

        <button
          type="submit"
          disabled={isUploading || !file}
          className="border-black bg-black text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
        >
          <p className="text-sm">Upload</p>
        </button>

        <button
          type="reset"
          onClick={reset}
          disabled={isUploading || !file}
          className="border-gray-200 bg-gray-100 text-gray-700 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
