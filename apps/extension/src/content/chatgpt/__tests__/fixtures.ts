/**
 * Representative HTML fixtures modeled after real-world ChatGPT DOM structures.
 */

export const STANDARD_CHATGPT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>PostgreSQL Connection Pooling in Next.js - ChatGPT</title>
</head>
<body>
  <div id="__next">
    <main class="flex-1 overflow-hidden">
      <div data-testid="conversation-turn-list">
        <!-- Turn 1: User Message -->
        <article data-testid="conversation-turn-1" data-message-author-role="user" class="conversation-turn">
          <div class="user-turn-wrapper">
            <div class="user-avatar"><span>User</span></div>
            <div class="whitespace-pre-wrap text-message">
              How do I properly configure connection pooling with Prisma in Next.js serverless functions?
            </div>
            <div role="toolbar" class="select-none">
              <button aria-label="Edit message"><svg><path d="M0 0"/></svg>Edit</button>
            </div>
          </div>
        </article>

        <!-- Turn 2: Assistant Message -->
        <article data-testid="conversation-turn-2" data-message-author-role="assistant" class="conversation-turn">
          <div class="assistant-turn-wrapper">
            <div class="agent-avatar"><svg></svg></div>
            <div class="markdown prose w-full">
              <p>To configure Prisma connection pooling in serverless Next.js, follow these essential patterns:</p>
              <ol>
                <li>Instantiate a single PrismaClient on <code>globalThis</code> to prevent connection exhaustion.</li>
                <li>Use PgBouncer or Supabase connection pooling for high-concurrency lambda multiplexing.</li>
                <li>Set strict connection timeouts to release idle connections quickly.</li>
              </ol>
              <p>Here is an example client setup:</p>
              <pre><code>import { PrismaClient } from '@prisma/client';\nconst prisma = globalThis.prisma || new PrismaClient();</code></pre>
            </div>
            <div class="action-bar" role="toolbar">
              <button data-testid="copy-turn-action-button" aria-label="Copy">Copy</button>
              <button aria-label="Good response"><svg></svg></button>
              <button aria-label="Bad response"><svg></svg></button>
              <span class="sr-only">Feedback submitted</span>
            </div>
          </div>
        </article>
      </div>
    </main>
  </div>
</body>
</html>
`;

export const MULTI_TURN_CHATGPT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>TypeScript Generics Tutorial - ChatGPT</title>
</head>
<body>
  <main>
    <article data-testid="conversation-turn-1" data-message-author-role="user">
      <div class="whitespace-pre-wrap">What is the difference between type and interface in TypeScript?</div>
    </article>
    <article data-testid="conversation-turn-2" data-message-author-role="assistant">
      <div class="markdown"><p>Interfaces are extendable and better for object models, while types can represent unions and primitives.</p></div>
    </article>
    <article data-testid="conversation-turn-3" data-message-author-role="user">
      <div class="whitespace-pre-wrap">Can you show an example of a mapped type?</div>
    </article>
    <article data-testid="conversation-turn-4" data-message-author-role="assistant">
      <div class="markdown"><p>Here is a mapped type example: <code>type Readonly&lt;T&gt; = { readonly [P in keyof T]: T[P] };</code></p></div>
    </article>
  </main>
</body>
</html>
`;

export const NOISY_CHATGPT_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Architecture Discussion - ChatGPT</title>
</head>
<body>
  <main>
    <article data-testid="conversation-turn-1" data-message-author-role="user">
      <div class="whitespace-pre-wrap">
        How do we scale microservices without distributed monoliths?
      </div>
      <button class="action-btn">Edit</button>
    </article>
    <article data-testid="conversation-turn-2" data-message-author-role="assistant">
      <div class="markdown">
        <p>Design around bounded contexts and asynchronous event-driven messaging.</p>
      </div>
      <div class="toolbar" role="toolbar">
        <button aria-label="Copy">Copy</button>
        <button aria-label="Read aloud">Listen</button>
        <span class="sr-only">Screen reader notice</span>
        <svg class="icon"><path /></svg>
      </div>
    </article>
  </main>
</body>
</html>
`;

export const FALLBACK_SELECTORS_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Legacy Structure | OpenAI</title>
</head>
<body>
  <div>
    <div data-message-author-role="user" class="conversation-turn">
      <div class="user-text">Tell me about event loops.</div>
    </div>
    <div data-message-author-role="assistant" class="conversation-turn">
      <div class="agent-text">The event loop continuously monitors the call stack and callback queue.</div>
    </div>
  </div>
</body>
</html>
`;

export const EMPTY_PAGE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <title>New chat - ChatGPT</title>
</head>
<body>
  <main>
    <div class="empty-welcome">
      <h1>What can I help with today?</h1>
    </div>
  </main>
</body>
</html>
`;
