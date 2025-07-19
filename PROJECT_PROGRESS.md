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

## Task Group 7: Refactor Sample Data Model
- **Completed**: Refactored the `EvaluationSample` entity to use a single JSON `data` field instead of separate URIs for reference and hypothesis texts.
- **Completed**: Updated the database schema and migrated the database to the new structure.
- **Completed**: Refactored the API layer, removing obsolete endpoints and adding a new endpoint for JSON data uploads.
- **Completed**: Updated the sample creation and details pages to align with the new data model, ensuring the UI remains functional.

## Task Group 8: Define and Display Sample `data`
- **Completed**: Defined a TypeScript schema for the `data` field in `lib/models.ts`.
- **Completed**: Updated the database schema and data access layer to use the new `AlignmentData` type.
- **Completed**: Enhanced the sample details page to parse and display `ref_text`, `hyp_text`, and the raw `alignment` data from the `data` field.

## Task Group 9: Alignment Visualization
- **Completed**: Implemented a detailed, two-row alignment visualization component using Flexbox.
- **Completed**: The component now processes alignment data on a word-by-word basis, ensuring each word is styled individually.
- **Completed**: Finalized styling to precisely match user-provided images, including background colors that hug the text and proper handling of insertions/deletions without asterisks.
- **Completed**: Added RTL text direction to all relevant text fields on the sample details page.

# Project Open Issues And Future Work To Consider

Don't work on this before getting team admin approval!

## Authenticate Users Including Uploads
Need to design an approach - try to leverage vercel provided auth if possible.
For script API use - consider hard-coded APU tokens for now.

## Define and Validate Sample `data` Schema
- Define a TypeScript or Zod schema for the `data` field in `EvaluationSample`.
- Implement validation on the API endpoint to ensure data integrity.
- Enhance the sample details page to parse and display the `data` field in a more user-friendly format.
