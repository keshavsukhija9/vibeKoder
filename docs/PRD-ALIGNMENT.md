# PRD Alignment Report

**VibeCoder vs [PRD-VibeCoder.md](PRD-VibeCoder.md)**  
*Status: not fully aligned; several items are partial or out of scope.*

---

## Summary

| Category | Fully aligned | Partial | Not in scope / planned |
|----------|----------------|---------|-------------------------|
| **5.1 Execution** | 4 | 1 | 1 (Python) |
| **5.2 RAG** | 5 | 1 | 0 |
| **5.3 AI & streaming** | 4 | 2 | 0 |
| **5.4 Editor** | 4 | 0 | 0 |
| **5.5 AST** | 2 | 2 | 1 |
| **NFR (performance, etc.)** | — | several | — |

---

## 1. Where it’s fully aligned

- **FR-EX-01, 03, 05:** Node.js in browser via WebContainers, shell commands, all execution client-side.
- **FR-RAG-01, 03, 04, 05, 06:** LanceDB indexing, &lt;100ms search, RAG in prompts, incremental update (wired in `/api/rag/index` for single-file), serverless to disk.
- **FR-AI-02, 03:** Completions in Monaco, Ollama integration.
- **FR-ED-01–04:** Monaco, syntax highlighting, responsive UI, file tree + tabs + resizable panels.
- **FR-AST-02, 03:** Dependency graph, cycle detection, surfaced in UI (Settings → Check dependency structure).
- **NFR security/privacy:** No code or queries sent to external APIs; WebContainers sandbox; LanceDB on disk under `.vibecoder/`.
- **Tech stack:** Next.js, TypeScript, Tailwind, Framer Motion, Monaco, WebContainers, LanceDB, Ollama. Persistence is SQLite (PRD doesn’t mandate a specific DB).

---

## 2. Partial alignment (gaps vs PRD)

| PRD ref | Requirement | Current state | Gap |
|---------|-------------|---------------|-----|
| **FR-EX-02** | Python runtime in browser | Not implemented | Python execution in WebContainer not supported. |
| **FR-EX-04** | Local dev servers (Vite, **Flask**) | Vite/Node only | Flask/Python dev server not in place. |
| **FR-RAG-02** | Repos with **10,000+ files** | Chunking + limits | Max chunks per file (e.g. 50), scaling to 10k+ not validated. |
| **FR-AI-01** | Stream via **WebSocket** | HTTP streaming | Real-time streaming works via **HTTP ReadableStream**, not WebSocket (PRD §7.3 says “WebSocket-based”). |
| **FR-AI-04** | Completions aware of project APIs/structure | RAG + current file | RAG gives context; full “internal APIs, module structure” awareness is partial. |
| **FR-AI-05** | Multi-turn conversational AI, codebase context | Chat API exists | Chat exists; deep codebase-grounded multi-turn is partial. |
| **FR-AST-01** | Parse into **AST** | Regex-based parsing | **Design:** Lightweight regex-based dependency extraction; UI shows "regex-limitation" warning. Full AST (Babel/TS) optional later. |
| **FR-AST-04** | Scatter-gather from multiple local sources | Not implemented | No dedicated orchestrator for concurrent local data pulls. |
| **NFR-PERF-*** | RAG &lt;100ms, first-token &lt;500ms, boot &lt;5s, memory | Not formally measured | Behavior is in the right direction; no benchmark suite vs PRD targets. |
| **§7.4** | “Streaming Protocol: WebSockets” | HTTP streaming | Protocol is HTTP streaming, not WebSocket. |

---

## 3. Not in scope / planned (roadmap)

- **FR-EX-02:** Python runtime (PRD High; marked roadmap in IMPLEMENTATION-STATUS).
- **FR-AST-04:** Scatter-gather orchestrator (PRD High; planned).
- **§11 Acceptance – Python:** “A Node.js **and Python** process can be started” — Python not implemented.
- **§11 Acceptance – 10k-file RAG:** “10,000-file codebase … RAG retrieval … below 100ms” — not verified at that scale.

---

## 4. Conclusion

- **Functionally:** Most critical PRD items are implemented (Node.js in browser, RAG with LanceDB, streaming completions into Monaco, Ollama, AST-like dependency/cycle analysis, editor behavior, local-only execution).
- **Not fully aligned:**  
  - **Protocol:** Streaming is HTTP-based, not WebSocket.  
  - **Python:** No browser Python runtime or Flask server.  
  - **AST:** Regex-based dependency extraction, not full AST.  
  - **Scale:** 10k-file RAG and performance targets are not verified.  
  - **Orchestration:** No scatter-gather layer.

**Addressed in implementation:**

- **Streaming:** HTTP streaming is the chosen implementation; PRD intent (“real-time”) is met. Content-Type is `text/event-stream`.
- **AST:** Regex-based dependency extraction is documented; UI warns users. Full AST remains a possible future upgrade.
- **Config:** LLM model and embed model are configurable via `VIBECODER_LLM_MODEL` and `VIBECODER_EMBED_MODEL`.

**Remaining for strict PRD alignment (optional):**

1. Add Python support in WebContainers and Flask-style dev server (or move to later phase).
2. Add benchmarks for RAG &lt;100ms, first-token, WebContainer boot; tune to NFR targets.
3. Implement scatter-gather (FR-AST-04) if required for v1.

---

*Last updated: March 2026. Cross-check with [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) and [AUDIT-PRD.md](AUDIT-PRD.md).*
