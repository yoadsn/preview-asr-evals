import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DB_DATABASE_URL) {
    throw new Error('DB_DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DB_DATABASE_URL);
export const db = drizzle(sql, { schema });

export async function getDbVersion() {
    const [result] = await sql`select version()`;
    return result;
}
