# ASR Evaluation Preview Project Plan

## Overview

This document outlines the plan to transform the existing Next.js Vercel Blob starter template into an "ASR Evaluation Preview" site. The primary goal is to enable users to view and manage ASR (Automatic Speech Recognition) evaluation results, including audio and associated data. The project will leverage Vercel Blob for file storage and PostgreSQL for entity management.

## Entities and Data Architecture

### Core Entities:
- **Evaluation Project**: Represents a collection of ASR evaluation samples.
  - `id`: Unique ID (e.g., `prj_nanoid`)
  - `name`: Project name
  - `description`: Project description
- **Evaluation Sample**: Represents a single ASR evaluation instance.
  - `id`: Unique ID (e.g., `smp_nanoid`)
  - `projectId`: Foreign key linking to an Evaluation Project
  - `audioUri`: URI for the audio file stored in Vercel Blob
  - `data`: A JSON field to store evaluation data (like reference and hypothesis texts, and other metadata). No predefined schema for now.

### Storage:
- **Vercel Blob**: Used for storing audio files.
- **PostgreSQL**: Used for storing `Evaluation Project` and `Evaluation Sample` entity data. Connection URI will be provided via `DB_DATABASE_URL` environment variable.

### ID Generation:
- `nanoid` will be used to generate unique IDs with prefixes (e.g., `prj_` for projects, `smp_` for samples).

## Project Core Use Cases

1.  **Create Project**:
    *   User provides a name and description for a new evaluation project.
    *   A new `Evaluation Project` entity is created in the PostgreSQL database with a unique ID.
2.  **Preview Project**:
    *   User views a list of `Evaluation Samples` associated with a project.
    *   User can select a sample to:
        *   Listen to the audio file.
        *   View the data associated with the sample.
3.  **Upload Project Samples**:
    *   **UI-based Upload**: A "new sample" screen allows users to upload an Audio File.
    *   **REST API for Sample Creation and Data Upload**:
        *   `POST /api/samples`: Create a new `Evaluation Sample` entity.
        *   `POST /api/samples/{sampleId}/audio`: Upload audio data for a sample.
        *   `POST /api/samples/{sampleId}/data`: Upload JSON data for a sample.
        *   `GET /api/samples/{sampleId}`: Retrieve sample details, including the `data` field.

## Task Groups and Tasks

### Task Group 1: Database and Schema Update
*   **Goal**: Modify the database schema to reflect the new data model for `Evaluation Sample`.
*   **Tasks**:
    *   **1.1 Update `schema.ts`**:
        *   Modify the `evaluationSamples` table definition.
        *   Remove `referenceTextUri` and `hypothesisTextUri` columns.
        *   Add a `data` column of type `json`.
    *   **1.2 Update Database**:
        *   Generate and apply a new migration to update the database schema.

### Task Group 2: API Layer Refactoring
*   **Goal**: Update the API endpoints to handle the new sample structure.
*   **Tasks**:
    *   **2.1 Remove Obsolete Endpoints**:
        *   Delete the route handlers for `reference-uploaded` and `hypothesis-uploaded`.
        *   Delete any other related file upload endpoints that are not for audio.
    *   **2.2 Create Data Upload Endpoint**:
        *   Implement `POST /api/samples/{sampleId}/data` to receive a JSON payload and update the `data` field for the specified sample.
    *   **2.3 Update Sample Retrieval**:
        *   Modify `GET /api/samples/{sampleId}` to return the `data` field along with other sample details.
    *   **2.4 Update Sample Creation**:
        *   Ensure `POST /api/samples` correctly creates a sample without reference/hypothesis URIs.

### Task Group 3: UI Adjustments
*   **Goal**: Adapt the user interface to the new data model and prevent crashes.
*   **Tasks**:
    *   **3.1 Patch Sample Details Page (`/projects/{projectId}/samples/{sampleId}/page.tsx`)**:
        *   Remove code that attempts to fetch and display reference and hypothesis text from URIs.
        *   Temporarily display the raw JSON from the `data` field to ensure the page doesn't crash.
    *   **3.2 Update Sample Creation Page (`/projects/{projectId}/samples/new/page.tsx`)**:
        *   Modify the form to only handle audio file uploads.
        *   Remove UI elements related to reference and hypothesis file uploads.

### Task Group 5: Define and Display Sample `data`
*   **Goal**: Define a schema for the `data` field and update the UI to display its contents.
*   **Tasks**:
    *   **5.1 Define `data` Schema**:
        *   Create a TypeScript interface in `lib/models.ts` that describes the structure of the JSON data, including `ref_text`, `hyp_text`, and `alignment`.
    *   **5.2 Update Sample Details Page**:
        *   Modify `app/projects/[projectId]/samples/[sampleId]/page.tsx`.
        *   Parse the `data` field from the fetched sample.
        *   Display `ref_text` and `hyp_text` prominently.
        *   Add a text area to show the raw `alignment` JSON data.

### Task Group 6: Future Enhancements (Post-MVP)
*   **Goal**: Plan for future improvements.
*   **Tasks**:
    *   **6.1 Validate `data` Schema**:
        *   Create a `zod` or `yup` schema to validate the structure of the `data` JSON payload on upload.
    *   **6.2 Visualize Alignment Data**:
        *   Create a new React component `AlignmentVisualization` that accepts an `AlignmentResult` object.
        *   This component will render the alignment data in an HTML format, highlighting insertions, deletions, and substitutions.
        *   Update the sample details page (`app/projects/[projectId]/samples/[sampleId]/page.tsx`) to use this new component instead of displaying raw JSON in a textarea.
