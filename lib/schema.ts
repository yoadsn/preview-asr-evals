import { index, jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import {
  type AlignmentData,
  type EvaluationProject,
  type EvaluationSample
} from './models';

export const evaluationProjects = pgTable('evaluation_projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const evaluationSamples = pgTable('evaluation_samples', {
  id: varchar('id', { length: 255 }).primaryKey(),
  projectId: varchar('project_id', { length: 255 })
    .notNull()
    .references(() => evaluationProjects.id),
  name: varchar('name', { length: 255 }),
  audioUri: varchar('audio_uri', { length: 255 }),
  data: jsonb('data').$type<AlignmentData | null>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => [
  index("idx_evaluation_samples_name").on(table.name),
]);

// Type inference helpers
export type DrizzleProject = typeof evaluationProjects.$inferSelect;
export type DrizzleSample = typeof evaluationSamples.$inferSelect;

// Type conversion functions
export function toEvaluationProject(project: DrizzleProject): EvaluationProject {
  return {
    ...project,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export function toEvaluationSample(sample: DrizzleSample): EvaluationSample {
  return {
    ...sample,
    data: sample.data ?? null,
    createdAt: sample.createdAt,
    updatedAt: sample.updatedAt
  };
}
