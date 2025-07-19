# ASR Evaluation Preview Project Plan

## Overview

This document outlines the plan to transform the existing Next.js Vercel Blob starter template into an "ASR Evaluation Preview" site. The primary goal is to enable users to view and manage ASR (Automatic Speech Recognition) evaluation results, including audio, reference text, and hypothesis text. The project will leverage Vercel Blob for file storage and PostgreSQL for entity management.

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
  - `referenceTextUri`: URI for the reference text file stored in Vercel Blob
  - `hypothesisTextUri`: URI for the hypothesis text file stored in Vercel Blob
  - `metadata`: (Optional) Additional metadata for the sample

### Storage:
- **Vercel Blob**: Used for storing audio, reference text, and hypothesis text files.
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
        *   View the reference text.
        *   View the hypothesis text.
3.  **Upload Project Samples**:
    *   **UI-based Upload**: A "new sample" screen allows users to upload:
        *   Audio File
        *   Reference Text File
        *   Hypothesis Text File
    *   **REST API for Sample Creation**:
        *   `POST /api/samples`: Create a new `Evaluation Sample` entity.
        *   `POST /api/samples/{sampleId}/audio`: Upload audio data for a sample.
        *   `POST /api/samples/{sampleId}/reference`: Upload reference text data for a sample.
        *   `POST /api/samples/{sampleId}/hypothesis`: Upload hypothesis text data for a sample.

## Task Groups and Tasks



*   **Goal**: Refactor the sample details page to improve its usability and functionality.
*   **Tasks**:
    *   **5.1 Sample Details Page (`/projects/{projectId}/samples/{sampleId}`)**:
        *   Display basic information about the sample, including its ID, project ID, and creation date.
        *   Display the audio player for the sample's audio file.
        *   Display the content of the sample's reference and hypothesis text files Side By Side.
        *   Provide a "Back to Project" button to return to the project page.