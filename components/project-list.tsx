'use client';

import { EvaluationProject } from '@/lib/models';
import { useState } from 'react';
import Project from './project';

interface ProjectListProps {
    initialProjects: EvaluationProject[];
    isEditable: boolean;
}

export default function ProjectList({ initialProjects, isEditable }: ProjectListProps) {
    const [projects, setProjects] = useState(initialProjects);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

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

    return (
        <>
            {projects.map((project) => (
                <div key={project.id} className={deletingIds.has(project.id) ? 'opacity-50 pointer-events-none' : ''}>
                    <Project
                        project={project}
                        isEditable={isEditable}
                        onDelete={handleDeleteProject}
                    />
                </div>
            ))}
        </>
    );
}