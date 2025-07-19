import { EvaluationProject } from '@/lib/models';
import Link from 'next/link';

export default function Project({ project }: { project: EvaluationProject }) {
    return (
        <div className="mb-8 p-4 border rounded-lg">
            <Link href={`/projects/${project.id}`}>
                <h3 className="text-xl font-bold hover:underline">{project.name}</h3>
            </Link>
            <p>{project.description}</p>
        </div>
    )
}
