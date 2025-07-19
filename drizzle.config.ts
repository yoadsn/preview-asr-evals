import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dialect: 'postgresql',
  strict: true,
} satisfies Config;
