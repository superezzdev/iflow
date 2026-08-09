# MindPost - ChatGPT DOM Parser Design & Isolation Strategy

## 1. Overview & Core Rules

ChatGPT's frontend DOM evolves frequently. To maintain long-term reliability without breaking the rest of the application:
1. **Parser Isolation (Rule 9)**: The parser logic is strictly isolated inside `apps/extension/src/parsers/chatgpt.parser.ts`.
2. **Decoupling Contract (Rule 10)**: The parser implements `IChatParser` from `@mindpost/shared` and outputs a clean `CapturedConversation` domain object. No DOM elements or selectors leak outside this boundary.

## 2. Parser Architecture

```
                 +-------------------------------+
                 |       Browser Page DOM        |
                 +---------------+---------------+
                                 |
                                 v
                 +-------------------------------+
                 |         ChatGPTParser         |
                 | (Fallback Selector Array &    |
                 |  Role Heuristics Evaluation)  |
                 +---------------+---------------+
                                 |
                     Normalizes to standard
                                 |
                                 v
                 +-------------------------------+
                 |     CapturedConversation      |
                 |  (Pure TypeScript interface)  |
                 +---------------+---------------+
                                 |
                 +---------------+---------------+
                 |  Extension UI & Backend API   |
                 +-------------------------------+
```

## 3. Selector Fallback Matrix

The parser evaluates selectors in priority order:

| Target Element | Primary Selector | Fallback Selector 1 | Fallback Selector 2 |
| :--- | :--- | :--- | :--- |
| **Conversation Turn** | `article[data-testid^="conversation-turn-"]` | `div[data-message-author-role]` | `article` |
| **User Message** | `div[data-message-author-role="user"]` | `div[class*="user"]` | `[data-testid="user-message"]` |
| **Assistant Message** | `div[data-message-author-role="assistant"]` | `div[class*="agent"]` | `div.markdown` |
| **Conversation Title** | `document.title` | `h1` | `nav li a[class*="active"]` |

## 4. Error Handling & Resilience

If the parser encounters an unrecognized DOM layout, it returns a structured `ParserResult` error:
- `NO_MESSAGES_FOUND`: No conversation nodes detected in active view.
- `DOM_STRUCTURE_CHANGED`: Detected container turns but failed text extraction.
- `UNSUPPORTED_PAGE`: Current URL is not a supported ChatGPT domain.
- `PARSER_FAILED`: Unexpected runtime exception.
