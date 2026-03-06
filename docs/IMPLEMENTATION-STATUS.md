# VibeCoder – PRD Implementation Status

This document maps [PRD-VibeCoder.md](PRD-VibeCoder.md) requirements to the current codebase. Use it to track progress and plan work.

**Legend:** ✅ Done | 🔶 Partial | 📋 Planned (roadmap)

**Full alignment report:** See [PRD-ALIGNMENT.md](PRD-ALIGNMENT.md) for a gap analysis (what is fully aligned vs partial vs not in scope).

---

## 5. Functional Requirements

### 5.1 Browser-Native Execution Engine

| ID | Requirement | Status | Notes / Location |
|----|-------------|--------|-------------------|
| FR-EX-01 | Boot full Node.js runtime in browser via WebContainers | ✅ | `modules/webcontainers/`, `useWebContainer.ts` |
| FR-EX-02 | Support Python runtime in browser sandbox | 📋 | PRD scope; WebContainers support TBD |
| FR-EX-03 | Execute shell commands (npm install, pip install) in browser | ✅ | Terminal in playground; WebContainer shell |
| FR-EX-04 | Spin up local dev servers (Vite, Flask) in WebContainer | 🔶 | Vite/Node dev servers used; Flask/Python planned |
| FR-EX-05 | All code execution client-side; no code to external servers | ✅ | Ollama local; WebContainers in-browser |

### 5.2 Local RAG Pipeline

| ID | Requirement | Status | Notes / Location |
|----|-------------|--------|-------------------|
| FR-RAG-01 | Index entire codebase into local LanceDB | ✅ | `lib/rag/server.ts`, `app/api/rag/index/route.ts`; UI: Settings → Index codebase for AI |
| FR-RAG-02 | Support repos with 10,000+ files | 🔶 | Chunking in place; max chunks per file 50; scale with disk |
| FR-RAG-03 | Vector search &lt; 100ms | ✅ | LanceDB vectorSearch; `app/api/rag/search/route.ts` |
| FR-RAG-04 | Enrich LLM prompts with RAG-retrieved context | ✅ | Code-completion route calls `searchCodebase()` and injects into prompt |
| FR-RAG-05 | Incremental index updates on file change | ✅ | `updateFileInIndex()` in `lib/rag/server.ts` |
| FR-RAG-06 | LanceDB serverless, persist to disk | ✅ | DB path `.vibecoder/lancedb` (env `VIBECODER_LANCEDB_PATH`) |

### 5.3 AI Code Completion & Streaming

| ID | Requirement | Status | Notes / Location |
|----|-------------|--------|-------------------|
| FR-AI-01 | Stream AI completions in real-time (e.g. WebSocket) | ✅ | `useAISuggestion` uses `/api/code-completion/stream`, tokens streamed into state |
| FR-AI-02 | Inject completions into Monaco autocomplete | ✅ | `playground-editor.tsx`, inline completion provider |
| FR-AI-03 | Integrate local LLM (Ollama) | ✅ | `app/api/code-completion/route.ts`, `app/api/chat/route.ts` |
| FR-AI-04 | Completions aware of project APIs, structure, naming | 🔶 | Context from current file; RAG will improve |
| FR-AI-05 | Multi-turn conversational AI with codebase context | 🔶 | Chat API exists; codebase context optional/planned |

### 5.4 Code Editor (Monaco)

| ID | Requirement | Status | Notes / Location |
|----|-------------|--------|-------------------|
| FR-ED-01 | Monaco Editor, VS Code–compatible | ✅ | `@monaco-editor/react`, `editor-config.ts` |
| FR-ED-02 | Syntax highlighting (TS, JS, Python, etc.) | ✅ | `editor-config.ts`, `getEditorLanguage()` |
| FR-ED-03 | Editor responsive during indexing / LLM | ✅ | Async completion; no blocking UI |
| FR-ED-04 | File tree, multi-tab, split-pane | ✅ | Explorer, tabs, `ResizablePanelGroup` |

### 5.5 Codebase Intelligence & AST

| ID | Requirement | Status | Notes / Location |
|----|-------------|--------|-------------------|
| FR-AST-01 | Parse codebase into AST | ✅ | Regex-based import/require extraction in `lib/ast/parse.ts` |
| FR-AST-02 | Model codebase as dependency graph | ✅ | `lib/ast/index.ts` builds `DependencyGraph` from files |
| FR-AST-03 | Detect circular dependencies, flag risks | ✅ | `lib/ast/cycles.ts` + UI: Settings → Check dependency structure |
| FR-AST-04 | Scatter-gather from multiple local sources | 📋 | Orchestration layer planned |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| ID | Metric | Target | Status |
|----|--------|--------|--------|
| NFR-PERF-01 | RAG retrieval (10k-file repo) | &lt; 100ms | 📋 Pending RAG |
| NFR-PERF-02 | First-token-to-display | &lt; 500ms | 🔶 Streaming improves this |
| NFR-PERF-03 | Keystroke-to-render | &lt; 16ms | ✅ Monaco default |
| NFR-PERF-04 | WebContainer boot | &lt; 5s | 🔶 Depends on host |
| NFR-PERF-05 | Indexing memory | &lt; 256MB | 📋 With disk-backed LanceDB |

### 6.2 Security & Privacy

- ✅ All compute local (Ollama, WebContainers); no source code or queries sent to external APIs in current flow.
- ✅ WebContainer sandbox provides isolation.
- 📋 LanceDB storage location to be user-controlled when implemented.

### 6.3 Reliability & Availability

- 🔶 Offline: App load requires network; post-load Ollama and editor work offline if Ollama is local.
- ✅ Indexing/LLM failures do not block editor (graceful degradation in API and UI).

### 6.4 Scalability

- 📋 RAG and AST scale targets (10k+ files, scatter-gather) planned with `lib/rag/` and `lib/ast/`.

### 6.5 Usability

- ✅ TypeScript, Tailwind; Framer Motion added for animations (PRD).
- ✅ No install; browser-based.

---

## 7. Codebase Locations (Quick Reference)

| Area | Path |
|------|------|
| App shell, metadata | `app/layout.tsx` |
| Playground page | `app/playground/[id]/page.tsx` |
| Code completion API | `app/api/code-completion/route.ts`, `app/api/code-completion/stream/route.ts` |
| Chat API | `app/api/chat/route.ts` |
| Monaco + AI suggestions | `modules/playground/components/playground-editor.tsx`, `hooks/useAISuggestion.tsx` |
| Editor config (language, theme) | `modules/playground/lib/editor-config.ts` |
| WebContainers | `modules/webcontainers/` |
| RAG (placeholder) | `lib/rag/` |
| AST (placeholder) | `lib/ast/` |
| PRD & architecture | `docs/PRD-VibeCoder.md`, `docs/ARCHITECTURE.md` |

---

*Last updated: March 2026. Update this file as implementation progresses.*
