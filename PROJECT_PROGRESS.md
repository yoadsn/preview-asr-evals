# Project Progress

## Completed Tasks

### Task 1: Add name field to Sample entity ✅
- [x] Extend database schema to include `name` field for samples
- [x] Create and run database migration
- [x] Update TypeScript interfaces and models
- [x] Update API endpoints to handle name field
- [x] Update UI components to display and edit sample names

### Task 2: Enhance alignment visualization with metrics ✅
- [x] Extract WER, Subs/Dels/Inserts from alignment data
- [x] Display metrics above alignment visualization
- [x] Update Sample details page to show these metrics

### Task 3: Fix project description formatting ✅
- [x] Update project description display to respect newlines
- [x] Ensure proper HTML formatting for multi-line descriptions

### Task 4: Improve alignment visualization wrapping ✅
- [x] Set max width to 70vw for alignment visualization
- [x] Implement word-aware wrapping (no mid-word breaks)
- [x] Test responsive behavior

## Notes

- Using Next.js v15 with async dynamic APIs
- Database: Neon Serverless PostgreSQL with Drizzle ORM
- Package manager: pnpm
- Deployment: Vercel
