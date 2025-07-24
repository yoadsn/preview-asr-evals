'use client';

import { EvaluationProject } from '@/lib/models';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Project from './project';

interface ProjectListProps {
    initialProjects: EvaluationProject[];
    isEditable: boolean;
}

export default function ProjectList({ initialProjects, isEditable }: ProjectListProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
    const router = useRouter();

    const handleDeleteProject = async (project: EvaluationProject) => {
        setDeletingIds(prev => new Set(prev).add(project.id));
        
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            // Remove the project from the list
            setProjects(prev => prev.filter(p => p.id !== project.id));
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(project.id);
                return newSet;
            });
        }
    };

    const handleProjectSelection = (projectId: string, selected: boolean) => {
        setSelectedProjects(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(projectId);
            } else {
                newSet.delete(projectId);
            }
            return newSet;
        });
    };

    const handleCompare = () => {
        const projectIds = Array.from(selectedProjects).join(',');
        router.push(`/compare?projects=${projectIds}`);
    };

    return (
        <>
            {selectedProjects.size >= 2 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">
                            {selectedProjects.size} projects selected for comparison
                        </span>
                        <div className="space-x-2">
                            <button
                                onClick={() => setSelectedProjects(new Set())}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500"
                            >
                                Clear Selection
                            </button>
                            <button
                                onClick={handleCompare}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                            >
                                Compare Projects
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {projects.map((project) => (
                <div key={project.id} className={deletingIds.has(project.id) ? 'opacity-50 pointer-events-none' : ''}>
                    <div className="mb-8 p-4 border rounded-lg">
                        <div className="flex items-start">
                            <div className="flex items-center mr-4">
                                <input
                                    type="checkbox"
                                    id={`select-${project.id}`}
                                    checked={selectedProjects.has(project.id)}
                                    onChange={(e) => handleProjectSelection(project.id, e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            </div>
                            <div className="flex-1">
                                <Project
                                    project={project}
                                    isEditable={isEditable}
                                    onDelete={handleDeleteProject}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}