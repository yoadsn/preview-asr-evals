import { EvaluationProject } from '@/lib/models';
import Link from 'next/link';

interface ProjectProps {
    project: EvaluationProject;
    isEditable?: boolean;
    onDelete?: (project: EvaluationProject) => void;
}

export default function Project({ project, isEditable = false, onDelete }: ProjectProps) {
    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete the project "${project.name}"? This will also delete all associated samples and cannot be undone.`)) {
            return;
        }
        onDelete?.(project);
    };

    return (
        <div className="mb-8 p-4 border rounded-lg">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <Link href={`/projects/${project.id}`}>
                        <h3 className="text-xl font-bold hover:underline">{project.name}</h3>
                    </Link>
                    <p className="whitespace-pre-wrap">{project.description}</p>
                </div>
                {isEditable && onDelete && (
                    <button
                        onClick={handleDelete}
                        className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}
