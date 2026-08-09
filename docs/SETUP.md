# MindPost - Setup & Development Guide

## 1. Prerequisites

- **Node.js**: `v20+` (tested on Node v24.14.0)
- **pnpm**: `v9+` or `v11+` (`corepack enable && corepack use pnpm@11.18.0`)
- **PostgreSQL Database**: Local or hosted (e.g. Supabase, Neon, Docker)
- **OpenAI API Key**: For insight extraction & LinkedIn post generation

## 2. Quickstart

### Step 1: Clone and Install Dependencies

```bash
pnpm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Populate the required keys:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-your-actual-api-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mindpost_dev?schema=public
```

### Step 3: Initialize Database Schema

```bash
pnpm run db:generate
```

To sync the database schema to your local PostgreSQL instance:
```bash
pnpm --filter @mindpost/database run db:push
```

### Step 4: Run Development Services

You can start all applications simultaneously:
```bash
pnpm run dev
```

Or run individual apps:
- **API Server** (Port 3001): `pnpm --filter @mindpost/api run dev`
- **Web Dashboard** (Port 3000): `pnpm --filter @mindpost/web run dev`
- **Browser Extension** (WXT Hot-Reload): `pnpm --filter @mindpost/extension run dev`

### Step 5: Load Browser Extension

1. Run `pnpm --filter @mindpost/extension run dev` (or `build`).
2. Open Chrome/Brave and navigate to `chrome://extensions`.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select `apps/extension/.output/chrome-mv3`.
