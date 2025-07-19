import { jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { type EvaluationProject, type EvaluationSample } from './models';

export const evaluationProjects = pgTable('evaluation_projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description')
});

export const evaluationSamples = pgTable('evaluation_samples', {
  id: varchar('id', { length: 255 }).primaryKey(),
  projectId: varchar('project_id', { length: 255 })
    .notNull()
    .references(() => evaluationProjects.id),
  audioUri: varchar('audio_uri', { length: 255 }),
  referenceTextUri: varchar('reference_text_uri', { length: 255 }),
  hypothesisTextUri: varchar('hypothesis_text_uri', { length: 255 }),
  metadata: jsonb('metadata').$type<Record<string, any> | null>()
});

// Type inference helpers
export type DrizzleProject = typeof evaluationProjects.$inferSelect;
export type DrizzleSample = typeof evaluationSamples.$inferSelect;

// Type conversion functions
export function toEvaluationProject(project: DrizzleProject): EvaluationProject {
  return {
    ...project,
    createdAt: new Date(), // Since we don't have these in DB, use current date
    updatedAt: new Date()
  };
}

export function toEvaluationSample(sample: DrizzleSample): EvaluationSample {
  return {
    ...sample,
    metadata: sample.metadata ?? null,
    createdAt: new Date(), // Since we don't have these in DB, use current date
    updatedAt: new Date()
  };
}
