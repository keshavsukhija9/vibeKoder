# PRD Audit — What Actually Exists (Verified)

Audit date: March 2026. Every row verified against the cited file and line numbers.

---

## RAG Pipeline

| Feature | Status | Proof |
|--------|--------|--------|
| `chunkFiles()` exists | **Really Works** | `lib/rag/chunk.ts` lines 59–71: `export function chunkFiles(files, maxChunksPerFile = 50)`; calls `chunkFile()` with default args. |
| 40-line chunks, 8-line overlap | **Really Works** | `lib/rag/chunk.ts` lines 6–7: `const DEFAULT_CHUNK_LINES = 40;` and `const OVERLAP_LINES = 8;`. Lines 37–38: `const end = Math.min(start + chunkLines, ...)` and `start += chunkLines - overlapLines`; `chunkFile()` uses these as defaults (lines 28–29). |
| `getEmbedding()` real fetch to Ollama | **Really Works** | `lib/rag/embed.ts` lines 10–22: `fetch(OLLAMA_EMBED_URL, { method: "POST", ... body: JSON.stringify({ model: EMBED_MODEL, input: text }) })` with `OLLAMA_EMBED_URL = "http://localhost:11434/api/embed"`. |
| Embed model configurable | **Partial** | Model is hardcoded: `lib/rag/embed.ts` line 7: `const EMBED_MODEL = "nomic-embed-text";` — no env or parameter. |
| `getEmbeddings()` batching | **Really Works** | `lib/rag/embed.ts` lines 24–42: `for (let i = 0; i < texts.length; i += BATCH_SIZE)` (line 8: `BATCH_SIZE = 10`), single fetch per batch with `input: batch`. |
| `indexFiles()` exists | **Really Works** | `lib/rag/server.ts` lines 35–62: `export async function indexFiles(files...)`, calls `chunkFiles`, `getEmbeddings`, `db.createTable(TABLE_NAME, rows)`. |
| `searchCodebase()` exists | **Really Works** | `lib/rag/server.ts` lines 64–93: `export async function searchCodebase(query, topK)`, `getEmbedding(query)`, `table.vectorSearch(vector).limit(topK).toArray()`. |
| `updateFileInIndex()` exists | **Really Works** | `lib/rag/server.ts` implements it; `app/api/rag/index/route.ts` calls it when indexing a single file and table exists (incremental update). |
| `searchCodebase()` returns retrievalMs | **Partial** | `searchCodebase()` returns `RAGSearchResult[]` only — no retrievalMs. `app/api/rag/search/route.ts` lines 20–22 and 31 compute and return `retrievalMs` in response metadata. So retrievalMs exists in the API response, not in the server function. |
| DB path .vibecoder/lancedb | **Really Works** | `lib/rag/server.ts` line 15: `path.join(process.cwd(), ".vibecoder", "lancedb")`. |
| VIBECODER_LANCEDB_PATH wired | **Really Works** | `lib/rag/server.ts` line 15: `process.env.VIBECODER_LANCEDB_PATH \|\| path.join(...)`. |
| POST /api/rag/index exists, calls indexFiles | **Really Works** | `app/api/rag/index/route.ts` lines 9–20: POST handler, `const { chunksIndexed } = await indexFiles(files)`. |
| RAG index body validation | **Partial** | `app/api/rag/index/route.ts` lines 12–17: only `Array.isArray(files) && files.length === 0` → 400. No check that each element has `path` and `content`. |
| POST /api/rag/search exists, returns retrievalMs | **Really Works** | `app/api/rag/search/route.ts` lines 8–32: POST, `const start = Date.now()`, `searchCodebase(query.trim(), topK)`, `retrievalMs = Date.now() - start`, response includes `metadata: { retrievalMs, count }`. |
| Code-completion calls searchCodebase before prompt | **Really Works** | `app/api/code-completion/route.ts` lines 55–67: `if (!ragContext?.length) { try { const query = ...; const ragChunks = await searchCodebase(query, 5); ... ragContext = ragChunks.map(...) } catch { } }` then line 69: `buildPrompt(context, suggestionType, ragContext)`. |
| RAG context injected into prompt | **Really Works** | `app/api/code-completion/route.ts` lines 136–141 and 148: `projectContextSection` built from `codebaseContext.map((c) => \`// ${c.filePath}\n${c.content}\`)`, interpolated in template as `${projectContextSection}Current file context:`. |

---

## Streaming

| Feature | Status | Proof |
|--------|--------|--------|
| useAISuggestion streams (ReadableStream) | **Really Works** | `modules/playground/hooks/useAISuggestion.tsx` lines 63–84: `if (useStream)` branch, `fetch("/api/code-completion/stream")`, `res.body.getReader()`, `while (true) { const { done, value } = await reader.read(); ... accumulated += decoder.decode(value, { stream: true }); setState(..., suggestion: accumulated, ...) }`. |
| No await response.json() for stream path | **Really Works** | Stream path never calls `response.json()`; only the non-stream fallback (lines 97–105) uses `await response.json()`. |
| app/api/code-completion/stream/route.ts exists | **Really Works** | File exists; POST handler at lines 59–131. |
| Stream uses ReadableStream | **Really Works** | `app/api/code-completion/stream/route.ts` lines 90–118: `new ReadableStream({ async start(controller) { ... controller.enqueue(encoder.encode(obj.response)); ... controller.close(); } })`. No TransformStream. |
| Stream Content-Type | **Partial** | Lines 120–123: `"Content-Type": "text/plain; charset=utf-8"` — not `text/event-stream`. |
| acceptSuggestion called with (editor, monaco) | **Really Works** | `app/playground/[id]/page.tsx` line 615: `onAcceptSuggestion={(editor, monaco)=>aiSuggestions.acceptSuggestion(editor, monaco)}`. `modules/playground/components/playground-editor.tsx` line 223: inside `acceptCurrentSuggestion()`, `onAcceptSuggestion(editor, monaco)`. Tab triggers `acceptCurrentSuggestion()` (lines 352–377). |

---

## AST & Dependency Graph

| Feature | Status | Proof |
|--------|--------|--------|
| getDependencies() implementation | **Partial** | `lib/ast/parse.ts` lines 58–65: uses regex only — `IMPORT_RE` and `REQUIRE_RE` (lines 9–16), `extractSpecifiers(content)` with regex exec. No @babel/parser or TypeScript compiler API. |
| findCycles() DFS with back-edge detection | **Really Works** | `lib/ast/cycles.ts` lines 11–57: `visited`, `stack`, `path`, `pathIndex`; `visit()` recurses on unvisited deps; `else if (stack.has(depKey))` (line 36) detects back edge and records cycle (lines 37–42). |
| POST /api/ast/analyze exists | **Really Works** | `app/api/ast/analyze/route.ts` lines 8–23: POST, `getStructuralRisks(files)`, returns `{ cycles, warnings, hasCycles: cycles.length > 0 }`. |

---

## UI Connections

| Feature | Status | Proof |
|--------|--------|--------|
| "Index codebase for AI" wired to POST /api/rag/index | **Really Works** | `app/playground/[id]/page.tsx` lines 487–492: `DropdownMenuItem onClick={handleIndexForAI}`. Lines 298–306: `handleIndexForAI` does `fetch("/api/rag/index", { method: "POST", body: JSON.stringify({ files }) })` with `files = flattenTemplateToFiles(templateData)`. |
| "Check dependency structure" wired to POST /api/ast/analyze | **Really Works** | `app/playground/[id]/page.tsx` lines 493–499: `DropdownMenuItem onClick={handleCheckStructure}`. Lines 318–340: `handleCheckStructure` does `fetch("/api/ast/analyze", { method: "POST", body: JSON.stringify({ files }) })`, then `setStructureResult`, `setStructureDialogOpen(true)`. |
| Settings gear opens panel | **Really Works** | Lines 475–506: `DropdownMenuTrigger` wraps `Button` with Settings icon; `DropdownMenuContent` contains the menu items (Show/Hide Preview, Index codebase, Check structure, Close All). So it opens a dropdown menu, not a sidebar panel. |

---

## Summary

- **Really Works:** Implemented and wired; proof by file + line or exact code.
- **Partial:** Works but with a caveat (e.g. hardcoded value, weaker validation, different Content-Type).
- **Stub / Missing:** Not used or not present (none in this audit; all checked items exist and are used where stated).
