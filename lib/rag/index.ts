/**
 * VibeCoder RAG – LanceDB-backed indexing and search (`lib/rag/server.ts`).
 * API routes may import from `@/lib/rag/server` or this barrel (server-only).
 */

export type {
  CodeChunk,
  RAGSearchResult,
  RAGCodebaseContext,
  RAGIndexOptions,
  RAGIndexer,
  RAGRetriever,
} from "./types";

export { playgroundScopeKey, playgroundTableName, playgroundHashesPath } from "./playground-scope";
export { requirePlaygroundForRag } from "./require-playground";

export {
  hashContent,
  tableExists,
  indexFiles,
  searchCodebase,
  updateFileInIndex,
  type LanceDbRow,
} from "./server";

import type { RAGCodebaseContext } from "./types";
import { indexFiles, searchCodebase } from "./server";

/** Retrieve chunks for a query (e.g. to build LLM context). */
export async function getCodebaseContext(
  playgroundId: string,
  query: string,
  options?: { topK?: number }
): Promise<RAGCodebaseContext> {
  const topK = options?.topK ?? 6;
  const start = Date.now();
  const chunks = await searchCodebase(playgroundId, query, topK);
  return {
    chunks,
    metadata: {
      totalChunks: chunks.length,
      retrievalMs: Date.now() - start,
    },
  };
}

/** Full re-index from a file list (alias for `indexFiles`). */
export async function indexCodebase(
  playgroundId: string,
  files: { path: string; content: string }[]
): ReturnType<typeof indexFiles> {
  return indexFiles(playgroundId, files);
}
