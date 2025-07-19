#!/usr/bin/env ts-node
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as path from 'path';
import * as schema from '../lib/schema';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    const dbUrl = process.env.DB_DATABASE_URL;
    if (!dbUrl) {
        throw new Error("DB_DATABASE_URL is not set");
    }
    
    const sql = neon(dbUrl);
    const db = drizzle(sql, { schema });

    // Create tables using drizzle
    console.log('Creating tables...');
    
    await sql`
        CREATE TABLE IF NOT EXISTS evaluation_projects (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT
        );
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS evaluation_samples (
            id VARCHAR(255) PRIMARY KEY,
            project_id VARCHAR(255) NOT NULL,
            audio_uri VARCHAR(255),
            reference_text_uri VARCHAR(255),
            hypothesis_text_uri VARCHAR(255),
            metadata JSONB,
            FOREIGN KEY (project_id) REFERENCES evaluation_projects(id)
        );
    `;

    console.log('Tables created successfully');
    
    // Verify tables
    const projects = await db.select().from(schema.evaluationProjects);
    console.log('Projects table exists with', projects.length, 'rows');
    
    const samples = await db.select().from(schema.evaluationSamples);
    console.log('Samples table exists with', samples.length, 'rows');
}

main().catch(console.error);
