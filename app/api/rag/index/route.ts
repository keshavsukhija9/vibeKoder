/**
 * POST /api/rag/index – Index codebase files into LanceDB (RAG).
 * PRD FR-RAG-01, FR-RAG-02. Requires Ollama with nomic-embed-text.
 */

import { NextRequest, NextResponse } from "next/server";
import { indexFiles, tableExists, updateFileInIndex } from "@/lib/rag/server";
import { jsonError, readJsonBody } from "@/lib/api-errors";

export async function POST(request: NextRequest) {
  try {
    const parsed = await readJsonBody<{ files?: unknown[] }>(request);
    if (parsed.errorResponse) return parsed.errorResponse;
    const body = parsed.body;
    const files = body.files;
    if (!Array.isArray(files) || files.length === 0) {
      return jsonError(400, "Missing or invalid 'files' array");
    }
    const invalid = files.some(
      (f: unknown) =>
        typeof f !== "object" ||
        f === null ||
        typeof (f as Record<string, unknown>).path !== "string" ||
        typeof (f as Record<string, unknown>).content !== "string"
    );
    if (invalid) {
      return jsonError(400, "Each file must have a string path and string content");
    }
    const validFiles = files as { path: string; content: string }[];
    if (validFiles.length === 1 && (await tableExists())) {
      await updateFileInIndex(validFiles[0].path, validFiles[0].content);
      return NextResponse.json({ ok: true, updated: true });
    }
    const { chunksIndexed } = await indexFiles(validFiles);
    return NextResponse.json({ ok: true, chunksIndexed });
  } catch (err) {
    console.error("RAG index error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(500, "Indexing failed", message);
  }
}
