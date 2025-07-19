#!/usr/bin/env ts-node
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Then import modules that use environment variables
import { db } from '../lib/db';
import { evaluationProjects, evaluationSamples, toEvaluationProject, toEvaluationSample } from '../lib/schema';

async function main() {
    console.log('Testing Drizzle connection...\n');
    
    // Test projects
    console.log('Testing projects table:');
    const projects = await db.select().from(evaluationProjects);
    const typedProjects = projects.map(toEvaluationProject);
    console.log('Projects:', JSON.stringify(typedProjects, null, 2));
    
    // Test samples
    console.log('\nTesting samples table:');
    if (projects.length > 0) {
        const firstProjectId = projects[0].id;
        const samples = await db.select()
            .from(evaluationSamples)
            .where(eq(evaluationSamples.projectId, firstProjectId));
        const typedSamples = samples.map(toEvaluationSample);
        console.log(`Samples for project ${firstProjectId}:`, JSON.stringify(typedSamples, null, 2));
    } else {
        console.log('No projects found to test samples');
    }
}

main().catch(console.error);
