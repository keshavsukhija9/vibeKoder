/**
 * Code chunking for RAG – split source files into overlapping chunks.
 * PRD FR-RAG-02: support for 10,000+ files; chunk size tuned for embedding context.
 */

const DEFAULT_CHUNK_LINES = 40;
const OVERLAP_LINES = 8;

export interface CodeChunkInput {
  path: string;
  content: string;
  language?: string;
}

export interface ChunkResult {
  id: string;
  filePath: string;
  content: string;
  language?: string;
  startLine: number;
  endLine: number;
}

export interface ChunkFileOptions {
  maxChunks?: number;
}

/**
 * Chunk a single file by line ranges with overlap.
 */
export function chunkFile(
  file: CodeChunkInput,
  chunkLines = DEFAULT_CHUNK_LINES,
  overlapLines = OVERLAP_LINES,
  options?: ChunkFileOptions
): ChunkResult[] {
  const lines = file.content.split("\n");
  const chunks: ChunkResult[] = [];
  let start = 0;

  while (start < lines.length) {
    const end = Math.min(start + chunkLines, lines.length);
    const content = lines.slice(start, end).join("\n").trim();
    if (content.length > 0) {
      chunks.push({
        id: `${file.path}:${start + 1}-${end}`,
        filePath: file.path,
        content,
        language: file.language,
        startLine: start + 1,
        endLine: end,
      });
    }
    start += chunkLines - overlapLines;
    if (end >= lines.length) break;
  }

  if (options?.maxChunks != null) {
    return chunks.slice(0, options.maxChunks);
  }
  return chunks;
}

/**
 * Chunk multiple files; optionally limit total chunks per file for very large repos.
 */
export function chunkFiles(
  files: CodeChunkInput[],
  maxChunksPerFile = 50
): ChunkResult[] {
  const all: ChunkResult[] = [];
  for (const file of files) {
    const lang = file.language ?? inferLanguage(file.path);
    const fileChunks = chunkFile({ ...file, language: lang });
    const limited = fileChunks.slice(0, maxChunksPerFile);
    all.push(...limited);
  }
  return all;
}

function inferLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", json: "json", md: "markdown", css: "css", html: "html",
  };
  return map[ext] ?? "plaintext";
}
