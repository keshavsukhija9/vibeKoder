# VibeCoder – System Architecture

This document describes the system architecture as defined in the [PRD](PRD-VibeCoder.md). It aligns the codebase with the pillars: **browser-native runtime**, **local RAG (LanceDB)**, **streaming AI completions**, and **AST-based checks**.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VibeCoder (Browser)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │  Monaco Editor       │  │  File Explorer       │  │  Terminal (xterm)   │ │
│  │  • Syntax highlight │  │  • Tree navigation   │  │  • Shell in browser    │ │
│  │  • AI autocomplete   │  │  • Multi-tab        │  │  • npm install / dev   │ │
│  │  • Inline suggest    │  │  • Resizable panels │  │  • Dev servers         │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘ │
│             │                        │                        │             │
│             └────────────────────────┼────────────────────────┘             │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Application (Next.js + React)                     │   │
│  │  • Routing, auth (JWT + SQLite), dashboard, playground                │   │
│  │  • Tailwind + theme (UI)                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌──────────────────────────────────┼──────────────────────────────────┐  │
│  │  Next.js API routes (Node)                                         │  │
│  │  • Code completion + streaming (Ollama)  • RAG index/search (LanceDB) │  │
│  │  • Chat (Ollama)  • AST analyze  • Auth  • Templates                 │  │
│  └──────────────────────────────────┼──────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              StackBlitz WebContainers (in-browser runtime)          │   │
│  │  • Node.js • npm install • Vite/Express/etc. dev servers             │   │
│  │  • Python: PRD roadmap (not shipped in this repo)                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Local machine: Ollama (LLM + embeddings), SQLite (app data), LanceDB on disk   │
│  RAG indices are scoped per playground id; no cloud execution required.       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Pillars (per PRD)

### 2.1 Browser-Native Runtime (WebContainers)

- **Location:** `modules/webcontainers/`
- **Role:** Boot Node.js in the browser; shell, file mounts, dev servers.
- **Privacy:** Execution is client-side (FR-EX-05).

### 2.2 Local Vector Intelligence (LanceDB RAG)

- **Location:** `lib/rag/` (`server.ts`, `chunk.ts`, `embed.ts`, playground-scoped tables).
- **Role:** Index codebase chunks per `playgroundId`; vector search; inject top-K chunks into completion (and optional server-side RAG when `playgroundId` is sent).
- **Persistence:** Default `.vibecoder/lancedb/` (override with `VIBECODER_LANCEDB_PATH`).

### 2.3 Real-Time Streaming Interface (Monaco + AI)

- **Location:** `modules/playground/`, `app/api/code-completion/`, `app/api/code-completion/stream/`
- **Role:** Inline completions; **streaming** completion via chunked HTTP response from Ollama (FR-AI-01).

### 2.4 Code intelligence (AST)

- **Location:** `lib/ast/`, worker from playground for cycle detection; `app/api/ast/analyze/`.
- **Role:** Dependency / cycle analysis over in-memory file payloads from the editor.

---

## 3. Technology Stack (PRD §7.4)

| Layer              | Technology           | Purpose / Location                          |
|--------------------|----------------------|---------------------------------------------|
| Frontend           | Next.js + TypeScript | `app/`, routing, SSR                         |
| Code Editor        | Monaco Editor        | `modules/playground/`, `editor-config`      |
| UI Styling         | Tailwind + ShadCN     | `components/ui`                             |
| Local Runtime      | WebContainers        | `modules/webcontainers/`                    |
| Vector DB (RAG)    | LanceDB               | `lib/rag/`                                  |
| App persistence    | SQLite (better-sqlite3)| `lib/db/`                                   |
| LLM                | Ollama               | `lib/ollama.ts`, `app/api/code-completion/`, `app/api/chat/` |
| Streaming          | HTTP streaming       | `app/api/code-completion/stream/`           |
| Code Intelligence  | Custom AST pipeline  | `lib/ast/`                                  |

---

## 4. Key Directories

| Path | Purpose |
|------|---------|
| `app/` | App Router: pages, API routes. |
| `modules/playground/` | Editor, explorer, AI hooks. |
| `modules/webcontainers/` | WebContainer boot, preview, terminal. |
| `lib/` | `db`, `auth`, `rag`, `ast`, `ai`, etc. |
| `components/` | Shared UI. |
| `docs/` | PRD, architecture, implementation status. |

---

## 5. Data Flow (Simplified)

1. **Playground** → Load template (demo or SQLite-backed) → WebContainer boots → Files mounted.
2. **Edit in Monaco** → State + optional WebContainer `writeFile`.
3. **AI completion** → `POST` `/api/code-completion/stream` (or non-stream) → Optional LanceDB search scoped by `playgroundId` → Ollama → Stream or JSON suggestion → Monaco inline UI.
4. **RAG** → User triggers “Index codebase for AI” → `POST` `/api/rag/index` with `playgroundId` + files → Embeddings (Ollama) → LanceDB table for that playground.
Middleware uses **Edge-safe JWT verify**; API routes use **jose** on Node where needed.

For requirement-level detail, see [PRD-VibeCoder.md](PRD-VibeCoder.md) and [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).
