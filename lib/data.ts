import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { db } from './db';
import type {
    AlignmentData,
    EvaluationProject,
    EvaluationSample
} from './models';
import {
    evaluationProjects,
    evaluationSamples,
    toEvaluationProject,
    toEvaluationSample
} from './schema';

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

export async function createSample(projectId: string, name?: string): Promise<EvaluationSample> {
    const id = `smp_${nanoid()}`;
    await db.insert(evaluationSamples).values({
        id,
        projectId,
        name: name || null
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

export async function updateSampleData(sampleId: string, data: AlignmentData) {
    await db
        .update(evaluationSamples)
        .set({ data })
        .where(eq(evaluationSamples.id, sampleId));
}

export async function updateSampleName(sampleId: string, name: string) {
    await db
        .update(evaluationSamples)
        .set({ name })
        .where(eq(evaluationSamples.id, sampleId));
}

export async function getSamplesByName(sampleName: string, excludeProjectId?: string): Promise<Array<{ sample: EvaluationSample; project: EvaluationProject }>> {
    const query = db
        .select({
            sample: evaluationSamples,
            project: evaluationProjects
        })
        .from(evaluationSamples)
        .innerJoin(evaluationProjects, eq(evaluationSamples.projectId, evaluationProjects.id))
        .where(eq(evaluationSamples.name, sampleName));

    const results = await query;

    // Filter out the current project if excludeProjectId is provided
    const filteredResults = excludeProjectId
        ? results.filter(result => result.project.id !== excludeProjectId)
        : results;

    return filteredResults.map(result => ({
        sample: toEvaluationSample(result.sample),
        project: toEvaluationProject(result.project)
    }));
}

export async function deleteProject(id: string): Promise<void> {
    // First delete all samples associated with this project
    await db.delete(evaluationSamples).where(eq(evaluationSamples.projectId, id));
    
    // Then delete the project itself
    await db.delete(evaluationProjects).where(eq(evaluationProjects.id, id));
}
