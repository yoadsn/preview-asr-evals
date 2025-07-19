
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  strict: true,
  dbCredentials: {
    url: process.env.DB_DATABASE_URL!,
  },
});
