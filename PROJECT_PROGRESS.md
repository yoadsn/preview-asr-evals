# Project Progress

## Task Group 1: Infrastructure Setup and Database Integration
- Historical: Completed PostgreSQL connection setup, database schema definition, and implemented basic CRUD operations for projects and samples.

## Task Group 2: Define Entities and Resource Accessors
- Historical: Created entity models and implemented Vercel Blob resource accessors.

## Task Group 3: Implement API Layer
- Historical: Implemented REST API endpoints for project and sample management, including both web UI (client-side) and script-friendly (server-side) upload functionality.

## Task Group 4: Implement Super Simple UI for Web App
- Historical: Created project listing, creation, details pages and sample management UI. Fixed duplicate sample IDs issue and implemented sample preview functionality.

## Task Group 5: Sample Details Page Revamp
- Historical: Enhanced sample details page with improved UI, metadata display, and responsive layout.

## Task Group 6: Migrating to Drizzle ORM
- Historical: Successfully migrated to Drizzle ORM, fixing casing mismatches and implementing proper type safety.

# Project Open Issues And Future Work To Consider

Don't work on this before getting team admin approval!

## Authenticate Users Including Uploads
Need to design an approach - try to leverage vercel provided auth if possible.
For script API use - consider hard-coded APU tokens for now.

## Consider storing ref/hyp texts in the database directly
So we can save the file read from blob stages and reduce server load.
