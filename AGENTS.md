# AGENTS.md

## Commands

- **Build/Typecheck**: `npm run check` - TypeScript check + dry-run deploy validation
- **Dev**: `npm run dev` - Local development server at http://localhost:8787
- **Deploy**: `npm run deploy` - Deploy to Cloudflare Workers
- **Test**: `vitest` - Run tests with vitest
- **Single test**: `vitest run <test-file>` - Run a specific test file
- **Types**: `npm run cf-typegen` - Generate Cloudflare Worker type definitions

## Architecture

Cloudflare Workers-based LLM chat application with streaming responses via Server-Sent Events (SSE).

- **Backend**: `src/index.ts` - Main Worker entry point with routing and chat handler
- **Types**: `src/types.ts` - TypeScript interfaces for Env and ChatMessage
- **Frontend**: `public/` - Static HTML/CSS/JS chat UI
- **AI**: Cloudflare Workers AI binding (configured in wrangler.jsonc)

## Code Style

- **Language**: TypeScript (strict mode enabled)
- **Target**: ES2021 + ES2022 modules
- **Formatting**: Tabs (configured in tsconfig.json)
- **Comments**: JSDoc for functions and interfaces
- **Error handling**: Try-catch with console.error logging; return JSON error responses with status codes
- **Imports**: Absolute imports preferred, use named imports
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces, UPPER_SNAKE_CASE for constants
- **Dependencies**: Minimal; @cloudflare/workers-types for typings, vitest for testing
