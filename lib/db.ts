import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as path from 'path';
import * as schema from './schema';

// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

if (!process.env.DB_DATABASE_URL) {
    throw new Error('DB_DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DB_DATABASE_URL);
export const db = drizzle(sql, { schema });

export async function getDbVersion() {
    const [result] = await sql`select version()`;
    return result;
}
