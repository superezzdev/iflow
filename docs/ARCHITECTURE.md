# MindPost - System Architecture

MindPost is an AI-powered browser extension and content platform that converts valuable AI problem-solving sessions into high-engagement social media posts.

## 1. High-Level Monorepo Overview

The codebase is organized as a strict pnpm workspace monorepo:

```
mindpost/
├── apps/
│   ├── extension/       # WXT + React + TypeScript + Tailwind CSS Browser Extension
│   ├── web/             # Next.js Web Dashboard for reviewing & managing saved posts
│   └── api/             # Next.js API Service (Route Handlers for AI, DB & Extension)
├── packages/
│   ├── shared/          # Canonical types, parser contracts, API interfaces, constants
│   ├── ai/              # AI Provider abstraction layer (OpenAI active, Gemini/Claude stubs)
│   ├── database/        # PostgreSQL Prisma schema, client singleton, repositories
│   └── config/          # Shared tsconfig bases, Tailwind presets
├── docs/                # Architecture, setup, and specification documentation
├── .env.example         # Documented environment variables
├── README.md
└── package.json
```

## 2. Phase 1 Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Ext as Extension (WXT/React)
    participant DOM as ChatGPT DOM (Content Script)
    participant API as MindPost API (Next.js)
    participant AI as AI Engine (packages/ai)
    participant DB as PostgreSQL (Prisma)

    User->>Ext: Click "Capture & Generate"
    Ext->>DOM: Send PARSE_CONVERSATION message
    DOM->>DOM: Execute isolated ChatGPTParser with selector fallbacks
    DOM-->>Ext: Return normalized CapturedConversation
    Ext->>API: POST /api/generate { conversation, options }
    API->>AI: Extract Insights (AIProvider.extractInsights)
    AI-->>API: Return ExtractedInsight
    API->>AI: Generate Post (AIProvider.generatePost)
    AI-->>API: Return formatted LinkedIn SocialPost
    API->>DB: Save conversation, insight, and draft post
    API-->>Ext: Return generated post & insights
    User->>Ext: Review, edit hook/body
    User->>Ext: Click "Approve & Save"
    Ext->>API: POST /api/posts (status: "approved")
    API->>DB: Persist approved post state
    API-->>Ext: Confirmation
```

## 3. Core Isolation Principles

1. **DOM Parser Decoupling (Rule 9 & 10)**:
   - ChatGPT's DOM structure is completely isolated inside `apps/extension/src/parsers/chatgpt.parser.ts`.
   - The parser implements the generic `IChatParser` interface from `@mindpost/shared`.
   - No DOM classes, query selectors, or browser-specific structures leak into the AI layer, API layer, or database.

2. **AI Provider Isolation (Rule 7 & 11)**:
   - All AI interactions are abstracted behind the `IAIProvider` interface in `@mindpost/shared` and implemented in `packages/ai`.
   - In Phase 1, only the `OpenAIProvider` is active.
   - Provider instantiation is handled via `AIProviderFactory`, allowing seamless zero-churn addition of Gemini and Claude in Phase 2.

3. **Database Isolation (Rule 8)**:
   - All database access is encapsulated inside `packages/database`.
   - Repositories (`PostRepository`, `ConversationRepository`) expose domain-friendly methods and map raw Prisma entities to `@mindpost/shared` domain types.
