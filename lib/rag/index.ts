/**
 * VibeCoder RAG module – PRD §5.2 (Local RAG Pipeline), §7.2 (LanceDB)
 *
 * Placeholder implementation. When LanceDB (or another vector store) is integrated:
 * - Implement index() / update() / remove() with chunking and embedding
 * - Implement search() with vector similarity, target < 100ms for 10k-file repos
 * - Persist to disk (serverless mode) per FR-RAG-06
 */

import type { RAGCodebaseContext, RAGSearchResult } from "./types";

/**
 * Stub: returns empty codebase context until RAG is implemented.
 * The code-completion and chat APIs accept codebaseContext and inject it into prompts.
 */
export async function getCodebaseContext(
  _query: string,
  _options?: { topK?: number }
): Promise<RAGCodebaseContext> {
  return {
    chunks: [],
    metadata: { totalChunks: 0 },
  };
}

/**
 * Stub: build or update index from file list (for future use by playground/worker).
 */
export async function indexCodebase(
  _files: { path: string; content: string }[]
): Promise<void> {
  // TODO: chunk files, embed, write to LanceDB (lib/rag/backend or worker)
}

/**
 * Stub: incremental update when a file changes (FR-RAG-05).
 */
export async function updateFileInIndex(
  _path: string,
  _content: string
): Promise<void> {
  // TODO: re-chunk and update vector store
}

export type { RAGCodebaseContext, RAGSearchResult, CodeChunk } from "./types";
