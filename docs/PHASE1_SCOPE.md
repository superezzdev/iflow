# MindPost - Phase 1 Scope & Technical Boundaries

## 1. Phase 1 Objective

Establish an end-to-end, production-grade foundation for capturing ChatGPT conversations, extracting actionable insights, generating structured LinkedIn posts, and enabling user review and persistence.

## 2. In-Scope for Phase 1

- **Capture Source**: ChatGPT (`chatgpt.com`, `chat.openai.com`) conversations.
- **AI Processing**:
  - Two-stage processing:
    1. Insight extraction (core idea, key takeaways, practical applications, suggested hooks).
    2. LinkedIn post generation (hook, body, call-to-action, hashtags, formatting).
  - Single active AI provider: `OpenAI` (`gpt-4o` or configured model).
- **Target Social Platform**: `LinkedIn` only.
- **Client Interfaces**:
  - WXT + React Browser Extension Popup.
  - Next.js Web Dashboard for viewing saved/approved posts.
- **Backend & Storage**:
  - Next.js API route handlers with CORS support for extension access.
  - PostgreSQL database with Prisma ORM.
  - Post review and approval workflow (`draft` -> `approved`).

## 3. Explicitly Out-of-Scope for Phase 1

Per engineering specifications, the following features are strictly deferred to future phases:
- Additional Chat Sources (Claude, Gemini Web, Perplexity).
- Additional Social Platforms (X / Twitter, Threads, Bluesky).
- Additional AI Providers (Gemini SDK, Anthropic Claude SDK).
- Automatic Posting / Direct Social Media API publishing.
- Analytics, Engagement Tracking, and View Metrics.
- User Authentication, OAuth, and Multi-Tenancy.
- Payments, Billing, and Subscription Management.
- Vector Databases, Embeddings, and RAG architectures.
- Autonomous Multi-Agent background workflows.

## 4. Technical Constraints & Design Rules

1. **Strict Types**: All interfaces and payloads must share canonical types from `@mindpost/shared`.
2. **Zero DOM Coupling**: DOM selectors must never be imported outside `apps/extension`.
3. **No Hardcoded Credentials**: All API keys, secrets, and URLs are sourced via typed environment variables.
