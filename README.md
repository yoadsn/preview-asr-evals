# ASR Evaluation Preview

A web application for viewing and managing ASR (Automatic Speech Recognition) evaluation results. This platform enables users to create evaluation projects, upload audio samples with associated evaluation data, and visualize alignment results between reference and hypothesis transcriptions.

## Purpose

This application serves as a comprehensive tool for ASR evaluation workflows, allowing researchers and developers to:

- **Organize Evaluations**: Create and manage evaluation projects with descriptive metadata
- **Upload Audio Samples**: Store audio files with associated evaluation data including reference texts, hypothesis texts, and alignment results
- **Visualize Results**: View detailed alignment visualizations showing word-level differences between reference and hypothesis transcriptions
- **Access via API**: Programmatically interact with the system through REST APIs for automated evaluation workflows

The platform supports detailed alignment analysis including word error rates (WER), match error rates (MER), and visual representations of insertions, deletions, and substitutions in transcription results.

## Technology Stack

### Core Framework
- **Next.js 15**: React-based web framework with App Router
- **React 18**: Frontend UI library
- **TypeScript**: Type-safe JavaScript development

### Database & Storage
- **Neon Serverless PostgreSQL**: Primary database for storing projects and samples
- **Drizzle ORM**: Type-safe database ORM with schema management
- **Vercel Blob**: Cloud storage for audio files

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **React Hot Toast**: Toast notifications for user feedback

### Development & Deployment
- **Vercel**: Hosting and deployment platform
- **pnpm**: Package manager
- **Turbopack**: Fast bundler for development
- **ESLint**: Code linting and formatting

### Utilities
- **nanoid**: Unique ID generation with prefixes
- **dotenv**: Environment variable management

## Project Structure

The application follows Next.js 15 App Router conventions with a clear separation of concerns:

### Frontend Pages (`app/`)
- **Project Management**: Create, list, and view evaluation projects
- **Sample Management**: Upload audio files, manage evaluation samples, and view detailed results
- **Sample Visualization**: Advanced alignment visualization with word-level highlighting

### API Layer (`app/api/`)
- **REST Endpoints**: Complete CRUD operations for projects and samples
- **File Upload**: Direct audio upload with Vercel Blob integration
- **Data Management**: JSON-based evaluation data storage and retrieval

### Components (`components/`)
- **Reusable UI Components**: Project cards, upload interfaces, progress indicators
- **Alignment Visualization**: Sophisticated component for displaying word-level alignment results
- **Form Components**: Sample creation and editing interfaces

### Data Layer (`lib/`)
- **Database Schema**: Drizzle ORM schema definitions for projects and samples
- **Data Access**: Type-safe database operations and queries
- **Models**: TypeScript interfaces for evaluation data structures
- **Blob Storage**: Vercel Blob integration for audio file management

### Database Migrations (`drizzle/`)
- **Schema Evolution**: Database migration files and metadata
- **Version Control**: Tracked schema changes and rollback capabilities

### Scripts (`scripts/`)
- **Database Setup**: Table creation and development utilities
- **Testing Tools**: Database connection and ORM testing scripts

## Important Documentation

- **[API_USAGE.md](./API_USAGE.md)**: Comprehensive guide for REST API usage including complete workflow examples, Python client code, and data structure references
- **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**: UI/UX guidelines and design patterns used throughout the application

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm 9.13.0
- PostgreSQL database (Neon recommended)
- Vercel account for Blob storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yoadsn/preview-asr-evals.git
cd preview-asr-evals
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure the following variables in `.env.local`:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token

4. Set up the database:
```bash
pnpm tsx scripts/create-tables.ts
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Deployment

Deploy to Vercel with automatic environment variable injection:

```bash
vercel --prod
```

Ensure your Vercel project has the required environment variables configured in the dashboard.

## Data Model

### Evaluation Projects
- Organizational containers for related evaluation samples
- Include name, description, and timestamps
- Support hierarchical sample management

### Evaluation Samples  
- Individual ASR evaluation instances
- Store audio files in Vercel Blob storage
- Contain JSON evaluation data including:
  - Reference and hypothesis transcriptions
  - Word-level alignment results
  - Error metrics (WER, MER, WIL, WIP)
  - Detailed alignment operations (insertions, deletions, substitutions)

The flexible JSON data structure allows for extensible evaluation metadata while maintaining type safety through TypeScript interfaces.
