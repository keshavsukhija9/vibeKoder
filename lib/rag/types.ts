/**
 * VibeCoder RAG (Retrieval-Augmented Generation) – PRD §5.2, §7.2
 *
 * Types for local codebase indexing and retrieval using LanceDB.
 * Implementation is planned; these types define the contract for the RAG pipeline.
 */

export interface CodeChunk {
  /** Unique chunk id (e.g. file path + range). */
  id: string;
  /** Source file path relative to project root. */
  filePath: string;
  /** Raw code content. */
  content: string;
  /** Optional language for filtering. */
  language?: string;
  /** Start line (1-based) in file. */
  startLine?: number;
  /** End line (1-based) in file. */
  endLine?: number;
}

export interface RAGSearchResult extends CodeChunk {
  /** Similarity score (higher = more relevant). */
  score: number;
}

export interface RAGCodebaseContext {
  /** Retrieved code snippets to inject into LLM prompt. */
  chunks: RAGSearchResult[];
  /** Optional metadata (e.g. index version, latency ms). */
  metadata?: {
    retrievalMs?: number;
    totalChunks?: number;
  };
}

export interface RAGIndexOptions {
  /** Max files to index (e.g. 10_000 per PRD). */
  maxFiles?: number;
  /** Chunk size in characters or lines. */
  chunkSize?: number;
  /** Persist to disk (serverless mode, PRD FR-RAG-06). */
  persistToDisk?: boolean;
}

export interface RAGIndexer {
  /** Index a set of file paths and contents. */
  index(files: { path: string; content: string }[]): Promise<void>;
  /** Incremental update when a file changes (FR-RAG-05). */
  update(path: string, content: string): Promise<void>;
  /** Remove a file from the index. */
  remove(path: string): Promise<void>;
}

export interface RAGRetriever {
  /** Search for relevant code chunks by query. Target < 100ms (NFR-PERF-01). */
  search(query: string, options?: { topK?: number }): Promise<RAGSearchResult[]>;
}
