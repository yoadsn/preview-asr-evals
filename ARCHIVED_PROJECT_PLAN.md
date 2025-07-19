## Past Task Groups and Tasks

### Task Group 1: Infrastructure Setup and Database Integration

*   **Goal**: Establish database connection and define ORM/schema for entities.
*   **Tasks**:
    *   **1.1 Configure PostgreSQL Connection**:
        *   Add `DB_DATABASE_URL` to `.env.local` (if not already present).
        *   Install a PostgreSQL client library/ORM (e.g., Prisma, Drizzle ORM, or a simple `pg` client).
        *   Configure the Next.js application to connect to the PostgreSQL database.
    *   **1.2 Define Database Schema**:
        *   Create schema definitions for `Evaluation Project` and `Evaluation Sample` entities.
        *   Include fields for IDs, names, descriptions, and URIs as specified in "Entities and Data Architecture".
    *   **1.3 Implement Basic Database Accessors**:
        *   Create functions/methods to perform basic CRUD operations for `Evaluation Project` and `Evaluation Sample` (e.g., `createProject`, `getProjectById`, `createSample`, `getSamplesByProjectId`).

### Task Group 2: Define Entities and Resource Accessors

*   **Goal**: Formalize entity structures and create utilities for Vercel Blob interactions.
*   **Tasks**:
    *   **2.1 Refine Entity Models**:
        *   Create TypeScript interfaces or classes for `Evaluation Project` and `Evaluation Sample` based on the defined schema.
    *   **2.2 Implement Vercel Blob Resource Accessors**:
        *   Create helper functions to interact with Vercel Blob for:
            *   Uploading files (audio, ref, hyp).
            *   Generating secure upload tokens (leveraging existing `app/api/upload/route.ts` or adapting it).
            *   Retrieving file URIs.
            *   (Optional) Deleting files.

### Task Group 3: Implement API Layer

*   **Goal**: Develop REST API endpoints to support project and sample management.
*   **Tasks**:
    *   **3.1 Project API Endpoints**:
        *   `POST /api/projects`: Create a new evaluation project.
            *   Input: `name`, `description`.
            *   Output: Created `Evaluation Project` object.
        *   `GET /api/projects`: List all evaluation projects.
        *   `GET /api/projects/{projectId}`: Get details of a specific project.
    *   **3.2 Sample API Endpoints**:
        *   `POST /api/samples`: Create a new evaluation sample (initial entry, without file URIs).
            *   Input: `projectId`.
            *   Output: Created `Evaluation Sample` object.
        *   `GET /api/projects/{projectId}/samples`: List samples for a given project.
        *   `POST /api/samples/{sampleId}/upload-token`: Generate a secure upload token for a specific file type (audio, ref, hyp) for a given sample. This will be used by the frontend to directly upload to Vercel Blob.
        *   `POST /api/samples/{sampleId}/audio-uploaded`: Update `audioUri` for a sample after successful audio upload to Vercel Blob.
        *   `POST /api/samples/{sampleId}/reference-uploaded`: Update `referenceTextUri` for a sample after successful reference text upload.
        *   `POST /api/samples/{sampleId}/hypothesis-uploaded`: Update `hypothesisTextUri` for a sample after successful hypothesis text upload.
        *   (Optional) `GET /api/samples/{sampleId}`: Get details of a specific sample.

### Task Group 4: Implement Super Simple UI for Web App

*   **Goal**: Create a minimal user interface to interact with the ASR evaluation data.
*   **Tasks**:
    *   **4.1 Project Listing Page (`/`)**:
        *   Display a list of existing `Evaluation Projects`.
        *   Provide a link/button to create a new project.
        *   Link to view samples for each project.
    *   **4.2 Create Project Page (`/projects/new`)**:
        *   Form for entering project name and description.
        *   Call `POST /api/projects` on submission.
    *   **4.3 Project Details / Sample List Page (`/projects/{projectId}`)**:
        *   Display project name and description.
        *   List `Evaluation Samples` associated with the project.
        *   Provide a link/button to add a new sample to this project.
        *   For each sample, display basic info and a link to its detail page.
    *   **4.4 Create Sample Page (`/projects/{projectId}/samples/new`)**:
        *   Form for uploading audio, reference, and hypothesis files.
        *   Utilize the existing `components/uploader.tsx` or adapt it for multiple file types.
        *   Integrate with the new API endpoints for token generation and URI updates.
    *   **4.5 Sample Preview Page (`/samples/{sampleId}`)**:
        *   Display audio player for `audioUri`.
        *   Display content of `referenceTextUri` and `hypothesisTextUri` (fetch content from Vercel Blob URIs).
        *   (Optional) Display metadata.


### Task Group 5: Sample Details Page Revamp

*   **Goal**: Refactor the sample details page to improve its usability and functionality.
*   **Tasks**:
    *   **5.1 Sample Details Page (`/projects/{projectId}/samples/{sampleId}`)**:
        *   Display basic information about the sample, including its ID, project ID, and creation date.
        *   Display the audio player for the sample's audio file.
        *   Display the content of the sample's reference and hypothesis text files Side By Side.
        *   Provide a "Back to Project" button to return to the project page.