# Contributing to VibeCoder

Short, **current** reference for anyone hacking on this repo (interns, reviewers, you in six months).

## Prerequisites

- **Node.js 20** (see `package.json` `engines`)
- **npm** (repo uses `package-lock.json`; prefer `npm ci` for clean installs)

## First-time setup

```bash
npm ci
cp .env.example .env
# Set JWT_SECRET in production; dev works with the documented default.
```

**Ollama** (optional, for AI): install from [ollama.com](https://ollama.com), run `ollama serve`, pull `codellama` and (for RAG) `nomic-embed-text`. See [README.md](./README.md).

## Commands

| Command | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build (typecheck + lint during build) |
| `npm start` | Run production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run test:run` | Vitest, once (CI-friendly) |
| `npm run test` | Vitest watch |

## If production or `next start` acts broken

Stale `.next` after upgrades or crashes can cause missing chunk / odd 500s:

```bash
rm -rf .next && npm run build && npm start
```

## Where things live

| Topic | Doc / path |
|------|------------|
| Architecture (RAG, WebContainers, auth) | [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) |
| Local DB (SQLite, paths) | [QUICK_START_DATABASE.md](./QUICK_START_DATABASE.md), `lib/db/` |
| RAG (LanceDB, per-playground) | `lib/rag/`, `app/api/rag/` |
| Auth | `middleware.ts`, `lib/auth/`, `app/api/auth/` |
| Playground / Monaco | `app/playground/`, `modules/playground/` |

Older **Supabase** artifacts may exist under `supabase/`; the **shipping** path is SQLite + JWT unless you maintain a fork.

## Tests

- **Unit / component:** `tests/**/*.test.ts(x)`
- **API integration (no live server):** `tests/integration/**/*.test.ts` — exercise route handlers directly; use a **temp SQLite path** (`DATABASE_PATH`) so tests don’t touch your real `.vibecoder/vibecoder.db`.

Before opening a PR, run:

```bash
npm run lint && npm run test:run && npm run build
```

## Code style

- Match existing patterns in the file you edit (imports, naming).
- Prefer **`readJsonBody`** / **`jsonError`** in new or touched API routes.
- Avoid new `any`; narrow types from `unknown` or Zod if you add heavy validation.
