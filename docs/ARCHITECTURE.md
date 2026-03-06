# VibeCoder – System Architecture

This document describes the system architecture as defined in the [PRD](PRD-VibeCoder.md). It aligns the codebase structure with the three core pillars: Browser-Native Runtime, Local Vector Intelligence (RAG), and Real-Time Streaming Interface.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VibeCoder (Browser)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │  Monaco Editor       │  │  File Explorer       │  │  Terminal (xterm)   │ │
│  │  • Syntax highlight │  │  • Tree navigation   │  │  • Shell in browser  │ │
│  │  • AI autocomplete   │  │  • Multi-tab        │  │  • npm/pip install   │ │
│  │  • Split-pane        │  │  • Resizable panels │  │  • Dev servers       │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘ │
│             │                        │                        │             │
│             └────────────────────────┼────────────────────────┘             │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Application (Next.js + React)                     │   │
│  │  • Routing, auth, dashboard, playground                               │   │
│  │  • Tailwind + Framer Motion (UI/animations)                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌──────────────────────────────────┼──────────────────────────────────┐  │
│  │  Local services (client or API routes)                               │  │
│  │  • Code completion API (Ollama)  • RAG context (LanceDB – roadmap)     │  │
│  │  • Chat API (Ollama)             • AST / dependency graph (roadmap)   │  │
│  └──────────────────────────────────┼──────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │              StackBlitz WebContainers (in-browser runtime)            │   │
│  │  • Node.js process  • npm install  • Vite/Express dev servers        │   │
│  │  • Python (roadmap) • pip install  • No code sent to external servers│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Local only: Ollama (LLM), optional LanceDB (vector store on disk)          │
│  No cloud execution; no source code or queries leave the machine.          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Pillars (per PRD)

### 2.1 Browser-Native Runtime (WebContainers)

- **Location:** `modules/webcontainers/`
- **Role:** Boot Node.js (and future Python) inside the browser; run shell commands, dev servers (Vite, Flask, etc.).
- **Privacy:** All execution is client-side; no code is sent to external servers (FR-EX-05).

### 2.2 Local Vector Intelligence (LanceDB RAG)

- **Location:** `lib/rag/` (placeholder / roadmap)
- **Role:** Index codebase into a local vector store; at inference time, retrieve top-K code chunks and inject into LLM prompt (FR-RAG-01–FR-RAG-06).
- **Target:** Sub-100ms retrieval for repos up to 10,000 files; incremental index updates.

### 2.3 Real-Time Streaming Interface (Monaco + AI)

- **Location:** `modules/playground/` (editor, hooks), `app/api/code-completion/`
- **Role:** Monaco Editor with inline AI completions; optional streaming via Ollama (FR-AI-01, FR-AI-02).
- **Stack:** Monaco, optional WebSocket or streaming HTTP for token-by-token delivery.

---

## 3. Technology Stack (PRD §7.4)

| Layer              | Technology           | Purpose / Location                          |
|--------------------|----------------------|---------------------------------------------|
| Frontend           | Next.js + TypeScript | `app/`, routing, SSR                         |
| Code Editor        | Monaco Editor        | `modules/playground/`, `editor-config`       |
| UI Styling         | Tailwind + Framer Motion | Design system, animations                 |
| Local Runtime      | WebContainers        | `modules/webcontainers/`                    |
| Vector DB (RAG)    | LanceDB (roadmap)    | `lib/rag/`                                  |
| LLM                | Ollama               | `app/api/code-completion/`, `app/api/chat/` |
| Streaming          | HTTP stream / WS     | Code completion streaming (roadmap)          |
| Code Intelligence  | AST (roadmap)        | `lib/ast/` – dependency graph, circular deps|

---

## 4. Key Directories

| Path | Purpose |
|------|---------|
| `app/` | Next.js App Router: layout, pages, API routes (code-completion, chat, template). |
| `modules/playground/` | Editor UI, file explorer, AI suggestion hook, editor config. |
| `modules/webcontainers/` | WebContainer boot, preview, terminal, file sync. |
| `lib/` | Shared utilities; `lib/rag/` and `lib/ast/` for RAG and AST (PRD-aligned placeholders). |
| `components/` | Reusable UI (ShadCN, etc.). |
| `docs/` | PRD, architecture, implementation status. |

---

## 5. Data Flow (Simplified)

1. **User opens playground** → Load template → WebContainer boots → Files written to container.
2. **User edits in Monaco** → Content synced to state and (on save) to WebContainer FS.
3. **User triggers AI completion** → Request to `/api/code-completion` with file content and cursor; optional RAG context (when implemented); Ollama returns suggestion → Injected into Monaco inline completions.
4. **RAG (roadmap):** On index build or file change → Chunk + embed → LanceDB; on completion request → Similarity search → Top-K chunks added to prompt.

For more detail, see [PRD-VibeCoder.md](PRD-VibeCoder.md) and [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md).
