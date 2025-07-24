# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Commands:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm tsx scripts/test-drizzle.ts` - Test database connection

**No formal test suite exists** - only development utilities in `/scripts/`

## Architecture Overview

This is an ASR (Automatic Speech Recognition) Evaluation application built with **Next.js 15 App Router**, **TypeScript**, **Drizzle ORM**, and **Neon PostgreSQL**.

### Core Data Flow
1. **Projects** contain multiple **Samples**
2. **Samples** have optional audio files (stored in Vercel Blob) and evaluation data
3. **AlignmentData** contains reference/hypothesis text pairs with detailed word-level alignment metrics
4. **Comparison feature** allows cross-project sample analysis by matching sample names

### Key Technologies
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Storage**: Vercel Blob for audio files (MP3, WAV, AAC, OGG, WebM, FLAC, M4A)
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm

## Data Models

### Core Entities
```typescript
interface EvaluationProject {
  id: string;        // Format: prj_[nanoid]
  name: string;
  description: string | null;
}

interface EvaluationSample {
  id: string;        // Format: smp_[nanoid]  
  projectId: string;
  name: string | null;     // Used for cross-project matching
  audioUri: string | null; // Vercel Blob URL
  data: AlignmentData | null;
}

interface AlignmentData {
  ref_text: string;
  hyp_text: string;
  alignment: AlignmentResult; // Contains WER, MER, WIL, WIP metrics
}
```

### Database Schema
- **evaluation_projects**: Project containers
- **evaluation_samples**: Individual samples with foreign key to projects
- **Index on sample names** for efficient cross-project queries

## API Structure

### REST Endpoints
```
/api/projects/              # Project CRUD
/api/projects/[id]/         # Individual project operations  
/api/projects/[id]/samples/ # Project samples
/api/samples/               # Sample CRUD
/api/samples/[id]/upload-direct-audio # Audio upload
/api/samples/[id]/data      # Evaluation data upload
/api/samples/by-name/[name] # Cross-project sample search
```

## Key Components

### Data Access Layer (`lib/data.ts`)
- `getSamplesByName()` - Critical for cross-project comparison feature
- All database operations use Drizzle ORM with type safety
- ID generation uses nanoid with prefixes (prj_, smp_)

### React Components
- `alignment-visualization.tsx` - Complex word-level alignment display
- `project-list.tsx` - Supports project selection and comparison
- `compare/page.tsx` - Cross-project comparison with WER-based sorting and highlighting
- `samples-table.tsx` - Sample management interface

### File Upload System
- Direct upload to Vercel Blob storage
- Comprehensive MIME type validation
- Audio format support: MP3, WAV, AAC, OGG, WebM, FLAC, M4A

## Environment Variables

```bash
DB_DATABASE_URL=          # Neon PostgreSQL connection
BLOB_READ_WRITE_TOKEN=    # Vercel Blob storage
UI_EDITABLE=true         # Enable/disable editing (default: false)
```

## Development Setup

1. `pnpm install`
2. Copy `.env.example` to `.env.local` and configure
3. Database migrations run automatically via Drizzle
4. `pnpm dev` to start development

## Important Patterns

### Cross-Project Analysis
The comparison feature matches samples by name across projects using `getSamplesByName()`. Only samples with names that exist in multiple projects are shown.

### Audio Upload Workflow
1. Create sample via `/api/samples/`
2. Upload audio via `/api/samples/[id]/upload-direct-audio`
3. Upload evaluation data via `/api/samples/[id]/data`

### UI Editing Mode
The `UI_EDITABLE` environment variable controls whether users can create/edit/delete content. This enables read-only deployments.

### Word-Level Alignment
The `AlignmentData` structure contains detailed word-level alignment information with metrics (WER, MER, WIL, WIP) for evaluating ASR system performance.