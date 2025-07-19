We use pnpm for package management
We use vercel for deployments
We use Next.js v15 for the web app
We use neon serverless for postgresql
Env vars will be injected by next.js/vercel according to deployed env - no need to load them using dotenv
Check for existing dependencies before assuming we need to install them - many are already installed

Project plan is stored in the PROJECT_PLAN.md file
Project progress is stored in the PROJECT_PROGRESS.md file