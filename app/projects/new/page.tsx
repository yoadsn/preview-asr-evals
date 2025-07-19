'use client'

import { Toaster } from '@/components/toaster';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, description }),
        });

        if (response.ok) {
            router.push('/');
        } else {
            alert('Failed to create project');
        }
    };

    return (
        <main className="min-h-screen p-6">
            <Toaster />

            {/* Top section with consistent layout */}
            <div className="w-full max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    {/* Back button on left */}
                    <button
                        onClick={() => router.push('/')}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        ← Back to Projects
                    </button>

                    {/* Centered title */}
                    <h1 className="text-2xl font-semibold text-black">Create New Project</h1>

                    {/* Empty right space for consistency */}
                    <div className="w-20"></div>
                </div>
            </div>

            {/* Content section */}
            <div className="w-full max-w-md mx-auto">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-black">Project Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-black">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            rows={3}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Project
                    </button>
                </form>
            </div>
        </main>
    );
}
