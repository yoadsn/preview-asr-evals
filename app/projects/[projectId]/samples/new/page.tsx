import { createSample } from '@/lib/data';
import { redirect } from 'next/navigation';

export default async function NewSamplePage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    const sample = await createSample(projectId);
    redirect(`/projects/${projectId}/samples/${sample.id}/new`);
}
