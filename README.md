# MindPost

> **Turn high-value AI problem-solving conversations into impactful social media content.**

MindPost is an AI-powered browser extension and workspace that captures ChatGPT problem-solving sessions, extracts structured insights, and generates high-retention LinkedIn posts ready for review and publishing.

---

## 🎯 Phase 1 Workflow

```
ChatGPT conversation 
  → capture conversation 
  → extract useful insights 
  → generate LinkedIn post 
  → review/edit 
  → save approved post
```

---

## 🧱 Repository Structure

```
mindpost/
├── apps/
│   ├── extension/          # WXT + React + TypeScript + Tailwind CSS Browser Extension
│   ├── web/                # Next.js Web Dashboard for saved posts
│   └── api/                # Next.js API Service (AI & DB orchestration)
├── packages/
│   ├── shared/             # Shared TypeScript types, API contracts, interfaces
│   ├── ai/                 # AI Provider abstraction (OpenAI active, Gemini/Claude stubs)
│   ├── database/           # Prisma ORM, PostgreSQL schema & repositories
│   └── config/             # Shared TypeScript configs & Tailwind presets
├── docs/                   # System documentation
│   ├── ARCHITECTURE.md     # Architecture & data flow diagrams
│   ├── PHASE1_SCOPE.md     # Phase 1 specifications & boundaries
│   ├── PARSER_DESIGN.md    # Isolated ChatGPT DOM parser design
│   └── SETUP.md            # Local development & extension loading guide
├── .env.example            # Documented environment variables
├── package.json
└── pnpm-workspace.yaml
```

---

## 🛠️ Tech Stack

| Area | Technologies |
| :--- | :--- |
| **Browser Extension** | TypeScript, React, [WXT](https://wxt.dev/), Tailwind CSS |
| **Web Dashboard** | Next.js (App Router), TypeScript, React, Tailwind CSS |
| **Backend & API** | Next.js API Route Handlers, TypeScript |
| **Database** | PostgreSQL, Prisma ORM |
| **AI Provider Layer** | Isolated Provider Architecture (`OpenAIProvider` active in Phase 1) |
| **Monorepo Tooling** | `pnpm` workspaces |

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Generate Database Client

```bash
pnpm run db:generate
```

### 4. Run Development Servers

```bash
pnpm run dev
```

See [docs/SETUP.md](docs/SETUP.md) for full instructions and extension installation steps.

---

## 📐 Engineering Principles

1. **Modular Architecture**: Clean boundaries between extension DOM parsing, API routing, AI providers, and database repositories.
2. **Strict TypeScript**: Strict type checks enabled across all packages without loose typing.
3. **Decoupled DOM Extraction**: ChatGPT DOM parsing is isolated in the extension and adheres to the `IChatParser` interface from `@mindpost/shared`.
4. **AI Provider Abstraction**: Extensible `IAIProvider` interface designed to support OpenAI, Gemini, and Claude.

---

## 📜 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Phase 1 Scope & Technical Boundaries](docs/PHASE1_SCOPE.md)
- [ChatGPT DOM Parser Design](docs/PARSER_DESIGN.md)
- [Setup & Development Guide](docs/SETUP.md)
