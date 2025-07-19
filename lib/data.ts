import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from './db';
import type { EvaluationProject, EvaluationSample } from './models';
import { evaluationProjects, evaluationSamples, toEvaluationProject, toEvaluationSample } from './schema';

export async function createProject(name: string, description: string): Promise<EvaluationProject> {
    const id = `prj_${nanoid()}`;
    await db.insert(evaluationProjects).values({
        id,
        name,
        description
    });
    
    const [project] = await db.select().from(evaluationProjects).where(eq(evaluationProjects.id, id));
    return toEvaluationProject(project);
}

export async function getProjectById(id: string): Promise<EvaluationProject | undefined> {
    const [project] = await db.select().from(evaluationProjects).where(eq(evaluationProjects.id, id));
    return project ? toEvaluationProject(project) : undefined;
}

export async function getProjects(): Promise<EvaluationProject[]> {
    const projects = await db.select().from(evaluationProjects);
    return projects.map(toEvaluationProject);
}

export async function createSample(projectId: string): Promise<EvaluationSample> {
    const id = `smp_${nanoid()}`;
    await db.insert(evaluationSamples).values({
        id,
        projectId
    });
    
    const [sample] = await db.select().from(evaluationSamples).where(eq(evaluationSamples.id, id));
    return toEvaluationSample(sample);
}

export async function getSamplesByProjectId(projectId: string): Promise<EvaluationSample[]> {
    const samples = await db.select()
        .from(evaluationSamples)
        .where(eq(evaluationSamples.projectId, projectId));
    return samples.map(toEvaluationSample);
}

export async function getSampleById(sampleId: string): Promise<EvaluationSample | undefined> {
    const [sample] = await db.select()
        .from(evaluationSamples)
        .where(eq(evaluationSamples.id, sampleId));
    return sample ? toEvaluationSample(sample) : undefined;
}

export async function updateSampleAudio(sampleId: string, audioUri: string) {
    await db.update(evaluationSamples)
        .set({ audioUri })
        .where(eq(evaluationSamples.id, sampleId));
}

export async function updateSampleReferenceText(sampleId: string, referenceTextUri: string) {
    await db.update(evaluationSamples)
        .set({ referenceTextUri })
        .where(eq(evaluationSamples.id, sampleId));
}

export async function updateSampleHypothesisText(sampleId: string, hypothesisTextUri: string) {
    await db.update(evaluationSamples)
        .set({ hypothesisTextUri })
        .where(eq(evaluationSamples.id, sampleId));
}
